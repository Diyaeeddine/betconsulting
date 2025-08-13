<?php

namespace App\Http\Controllers;

use App\Models\Screenshot;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ScreenshotController extends Controller
{
    private const AUTHORIZED_ROLES = [
        'marches-marketing', 'etudes-techniques', 'suivi-controle', 
        'qualite-audit', 'innovation-transition', 'financier-comptabilite',
        'logistique-generaux', 'communication-digitale', 'juridique', 
        'fournisseurs-traitants'
    ];

    private const VIEWER_ROLES = ['admin', 'ressources-humaines'];

    private function hasAnyRole($user, $roles)
    {
        foreach ($roles as $role) {
            if ($user->hasRole($role)) {
                return true;
            }
        }
        return false;
    }

    private function getUserRoles($user)
    {
        return $user->roles()->pluck('name');
    }

    private function getUserPermissions($user)
    {
        return $user->permissions()->pluck('name');
    }

    private function getMimeType($filePath)
    {
        try {
            $fullPath = Storage::disk('public')->path($filePath);
            
            if (file_exists($fullPath)) {
                // Utilise mime_content_type si disponible
                if (function_exists('mime_content_type')) {
                    $mimeType = mime_content_type($fullPath);
                    if ($mimeType) {
                        return $mimeType;
                    }
                }
                
                // Fallback avec finfo
                if (function_exists('finfo_open')) {
                    $finfo = finfo_open(FILEINFO_MIME_TYPE);
                    if ($finfo) {
                        $mimeType = finfo_file($finfo, $fullPath);
                        finfo_close($finfo);
                        if ($mimeType) {
                            return $mimeType;
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            Log::warning('Erreur lors de la détection du type MIME: ' . $e->getMessage());
        }
        
        // Fallback basé sur l'extension
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);
        switch (strtolower($extension)) {
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'png':
                return 'image/png';
            case 'gif':
                return 'image/gif';
            case 'webp':
                return 'image/webp';
            default:
                return 'image/jpeg';
        }
    }

    public function adminView()
    {
        if (!Auth::user() || !$this->hasAnyRole(Auth::user(), self::VIEWER_ROLES)) {
            abort(403, 'Accès refusé - Autorisation requise');
        }

        return Inertia::render('Screenshots/AdminView', [
            'auth' => [
                'user' => Auth::user(),
                'permissions' => $this->getUserPermissions(Auth::user()),
                'roles' => $this->getUserRoles(Auth::user()),
            ],
            'authorizedRoles' => self::AUTHORIZED_ROLES,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $user = Auth::user();

            if ($this->hasAnyRole($user, self::VIEWER_ROLES)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Les utilisateurs avec ce rôle ne capturent pas de screenshots'
                ], 403);
            }

            $userRole = $this->getUserRoles($user)->first();

            if (!in_array($userRole, self::AUTHORIZED_ROLES)) {
                Log::warning('Tentative de capture non autorisée', [
                    'user_id' => $user->id,
                    'user_role' => $userRole,
                    'ip' => $request->ip()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Service non autorisé pour les captures d\'écran'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'screenshot' => 'required|file|mimes:jpeg,jpg,png|max:10240', // 10MB max
                'timestamp' => 'nullable|date',
                'url' => 'nullable|string|max:500',
                'user_agent' => 'nullable|string|max:500',
                'viewport_size' => 'nullable|string|max:50',
                'page_title' => 'nullable|string|max:200',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('screenshot');

            if ($file->getSize() < 1000) {
                return response()->json([
                    'success' => false,
                    'message' => 'Screenshot trop petit ou invalide'
                ], 422);
            }

            $timestamp = now()->format('Y-m-d_H-i-s');
            $randomString = Str::random(8);
            $filename = "screenshot_{$userRole}_{$user->id}_{$timestamp}_{$randomString}.jpg";

            $directory = "screenshots/{$userRole}/{$user->id}/" . now()->format('Y/m');

            $path = $file->storeAs($directory, $filename, 'public');

            if (!$path) {
                throw new \Exception('Échec du stockage du fichier');
            }

            $tempPath = $file->getRealPath();
            $imageInfo = @getimagesize($tempPath);

            $screenshot = Screenshot::create([
                'user_id' => $user->id,
                'filename' => $filename,
                'file_path' => $path,
                'file_size' => $file->getSize(),
                'width' => $imageInfo ? $imageInfo[0] : null,
                'height' => $imageInfo ? $imageInfo[1] : null,
                'url' => $request->input('url', request()->fullUrl()),
                'user_agent' => $request->input('user_agent'),
                'viewport_size' => $request->input('viewport_size'),
                'page_title' => $request->input('page_title'),
                'captured_at' => $request->input('timestamp') ?
                    Carbon::parse($request->input('timestamp')) : now(),
                'ip_address' => $request->ip(),
            ]);

            $this->cleanupOldScreenshots($user->id);

            Log::info('Screenshot capturé avec succès', [
                'screenshot_id' => $screenshot->id,
                'user_id' => $user->id,
                'user_role' => $userRole,
                'filename' => $filename,
                'file_size' => $this->formatBytes($file->getSize()),
                'url' => $screenshot->url
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Screenshot sauvegardé avec succès',
                'data' => [
                    'id' => $screenshot->id,
                    'filename' => $screenshot->filename,
                    'file_size' => $this->formatBytes($screenshot->file_size),
                    'captured_at' => $screenshot->captured_at->toISOString(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la sauvegarde du screenshot', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la sauvegarde du screenshot'
            ], 500);
        }
    }

    public function adminIndex(Request $request)
    {
        try {
            if (!Auth::user() || !$this->hasAnyRole(Auth::user(), self::VIEWER_ROLES)) {
                return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
            }

            $query = Screenshot::with(['user' => function($q) {
                $q->select('id', 'name', 'email');
            }])
            ->whereHas('user', function($q) {
                $q->whereHas('roles', function($roleQuery) {
                    $roleQuery->whereIn('name', self::AUTHORIZED_ROLES);
                });
            })
            ->orderBy('captured_at', 'desc');

            if ($request->filled('role')) {
                $role = $request->get('role');
                if (in_array($role, self::AUTHORIZED_ROLES)) {
                    $userIds = User::role($role)->pluck('id');
                    $query->whereIn('user_id', $userIds);
                }
            }

            if ($request->filled('user_id')) {
                $query->where('user_id', $request->get('user_id'));
            }

            if ($request->filled('from_date')) {
                $query->where('captured_at', '>=', Carbon::parse($request->from_date)->startOfDay());
            }

            if ($request->filled('to_date')) {
                $query->where('captured_at', '<=', Carbon::parse($request->to_date)->endOfDay());
            }

            $perPage = min($request->get('per_page', 20), 100);
            $screenshots = $query->paginate($perPage);

            $screenshots->getCollection()->transform(function ($screenshot) {
                $fileExists = Storage::disk('public')->exists($screenshot->file_path);
                $userRole = $this->getUserRoles($screenshot->user)->first();

                return [
                    'id' => $screenshot->id,
                    'filename' => $screenshot->filename,
                    'file_path' => $screenshot->file_path,
                    'file_size' => $screenshot->file_size,
                    'formatted_file_size' => $this->formatBytes($screenshot->file_size),
                    'width' => $screenshot->width,
                    'height' => $screenshot->height,
                    'url' => $screenshot->url,
                    'page_title' => $screenshot->page_title,
                    'viewport_size' => $screenshot->viewport_size,
                    'captured_at' => $screenshot->captured_at->toISOString(),
                    'captured_at_human' => $screenshot->captured_at->diffForHumans(),
                    'file_exists' => $fileExists,
                    'file_url' => route('screenshots.view', ['id' => $screenshot->id]),
                    'download_url' => route('screenshots.download', ['id' => $screenshot->id]),
                    'user' => [
                        'id' => $screenshot->user->id,
                        'name' => $screenshot->user->name,
                        'email' => $screenshot->user->email,
                    ],
                    'user_role' => $userRole ?? 'Aucun rôle',
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $screenshots->items(),
                'pagination' => [
                    'current_page' => $screenshots->currentPage(),
                    'total_pages' => $screenshots->lastPage(),
                    'total_items' => $screenshots->total(),
                    'per_page' => $screenshots->perPage(),
                    'from' => $screenshots->firstItem(),
                    'to' => $screenshots->lastItem(),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur AdminIndex: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des screenshots',
                'error' => config('app.debug') ? $e->getMessage() : 'Erreur serveur'
            ], 500);
        }
    }

    public function adminStats()
    {
        if (!Auth::user() || !$this->hasAnyRole(Auth::user(), self::VIEWER_ROLES)) {
            return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
        }

        try {
            $authorizedUserIds = User::whereHas('roles', function($query) {
                $query->whereIn('name', self::AUTHORIZED_ROLES);
            })->pluck('id');

            $stats = [
                'total_screenshots' => Screenshot::whereIn('user_id', $authorizedUserIds)->count(),
                'today_screenshots' => Screenshot::whereIn('user_id', $authorizedUserIds)
                    ->whereDate('captured_at', today())->count(),
                'this_week_screenshots' => Screenshot::whereIn('user_id', $authorizedUserIds)
                    ->where('captured_at', '>=', now()->startOfWeek())->count(),
                'this_month_screenshots' => Screenshot::whereIn('user_id', $authorizedUserIds)
                    ->where('captured_at', '>=', now()->startOfMonth())->count(),
                'total_storage' => $this->formatBytes(
                    Screenshot::whereIn('user_id', $authorizedUserIds)->sum('file_size')
                ),
                'by_role' => [],
                'recent_activity' => Screenshot::with('user')
                    ->whereIn('user_id', $authorizedUserIds)
                    ->orderBy('captured_at', 'desc')
                    ->limit(10)
                    ->get()
                    ->map(function ($screenshot) {
                        $userRole = $this->getUserRoles($screenshot->user)->first();
                        return [
                            'user_name' => $screenshot->user->name,
                            'user_role' => $userRole,
                            'captured_at' => $screenshot->captured_at->diffForHumans(),
                            'url' => $screenshot->url,
                            'page_title' => $screenshot->page_title,
                        ];
                    })
            ];

            foreach (self::AUTHORIZED_ROLES as $role) {
                $userIds = User::role($role)->pluck('id');
                $stats['by_role'][$role] = [
                    'count' => Screenshot::whereIn('user_id', $userIds)->count(),
                    'today' => Screenshot::whereIn('user_id', $userIds)
                        ->whereDate('captured_at', today())->count(),
                    'this_week' => Screenshot::whereIn('user_id', $userIds)
                        ->where('captured_at', '>=', now()->startOfWeek())->count(),
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des statistiques'
            ], 500);
        }
    }

    public function getUsers(Request $request)
    {
        if (!Auth::user() || !$this->hasAnyRole(Auth::user(), self::VIEWER_ROLES)) {
            return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
        }

        try {
            $query = User::whereHas('roles', function($q) {
                $q->whereIn('name', self::AUTHORIZED_ROLES);
            })->select('id', 'name', 'email');

            if ($request->filled('role')) {
                $role = $request->get('role');
                if (in_array($role, self::AUTHORIZED_ROLES)) {
                    $query->role($role);
                }
            }

            $users = $query->orderBy('name')->get()->map(function($user) {
                $userRole = $this->getUserRoles($user)->first();
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $userRole,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $users
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur getUsers: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des utilisateurs'
            ], 500);
        }
    }

    public function viewById($id)
    {
        try {
            $screenshot = Screenshot::findOrFail($id);

            if (!$this->hasAnyRole(Auth::user(), self::VIEWER_ROLES) && $screenshot->user_id !== Auth::id()) {
                abort(403, 'Accès non autorisé');
            }

            if (!Storage::disk('public')->exists($screenshot->file_path)) {
                Log::error('Fichier screenshot introuvable: ' . $screenshot->file_path);
                abort(404, 'Fichier screenshot introuvable');
            }

            $fullPath = Storage::disk('public')->path($screenshot->file_path);
            $mimeType = $this->getMimeType($screenshot->file_path);

            return response()->file($fullPath, [
                'Content-Type' => $mimeType,
                'Cache-Control' => 'public, max-age=3600',
                'Content-Disposition' => 'inline; filename="' . $screenshot->filename . '"'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur visualisation screenshot: ' . $e->getMessage());
            abort(404, 'Screenshot introuvable');
        }
    }

    public function downloadById($id)
    {
        try {
            $screenshot = Screenshot::findOrFail($id);

            if (!$this->hasAnyRole(Auth::user(), self::VIEWER_ROLES) && $screenshot->user_id !== Auth::id()) {
                abort(403, 'Accès non autorisé');
            }

            if (!Storage::disk('public')->exists($screenshot->file_path)) {
                abort(404, 'Fichier screenshot introuvable');
            }

            $fullPath = Storage::disk('public')->path($screenshot->file_path);
            return response()->download($fullPath, $screenshot->filename);

        } catch (\Exception $e) {
            Log::error('Erreur téléchargement screenshot: ' . $e->getMessage());
            abort(404);
        }
    }

    public function serveStorage($path)
    {
        try {
            if (strpos($path, '../') !== false || strpos($path, '..\\') !== false) {
                abort(404);
            }

            $fullPath = "screenshots/{$path}";

            if (!Storage::disk('public')->exists($fullPath)) {
                abort(404, 'Image introuvable');
            }

            $pathParts = explode('/', $path);
            if (count($pathParts) >= 2) {
                $userId = intval($pathParts[1]);
                if (!$this->hasAnyRole(Auth::user(), self::VIEWER_ROLES) && Auth::id() !== $userId) {
                    abort(403, 'Accès non autorisé');
                }
            }

            $fullStoragePath = Storage::disk('public')->path($fullPath);
            $mimeType = $this->getMimeType($fullPath);

            return response()->file($fullStoragePath, [
                'Content-Type' => $mimeType,
                'Cache-Control' => 'public, max-age=3600'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur service storage screenshot: ' . $e->getMessage());
            abort(404);
        }
    }

    public function destroy(Screenshot $screenshot)
    {
        if (!Auth::user() || !$this->hasAnyRole(Auth::user(), self::VIEWER_ROLES)) {
            return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
        }

        try {
            if (Storage::disk('public')->exists($screenshot->file_path)) {
                Storage::disk('public')->delete($screenshot->file_path);
            }

            $screenshot->delete();

            Log::info('Screenshot supprimé par admin', [
                'screenshot_id' => $screenshot->id,
                'admin_id' => Auth::id(),
                'filename' => $screenshot->filename
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Screenshot supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur suppression screenshot: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression'
            ], 500);
        }
    }

    public function deleteOwn(Screenshot $screenshot)
    {
        if ($screenshot->user_id !== Auth::id() && !$this->hasAnyRole(Auth::user(), self::VIEWER_ROLES)) {
            return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
        }

        try {
            if (Storage::disk('public')->exists($screenshot->file_path)) {
                Storage::disk('public')->delete($screenshot->file_path);
            }

            $screenshot->delete();

            return response()->json([
                'success' => true,
                'message' => 'Screenshot supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur suppression propre screenshot: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression'
            ], 500);
        }
    }

    public function show(Screenshot $screenshot)
    {
        if (!$this->hasAnyRole(Auth::user(), self::VIEWER_ROLES) && $screenshot->user_id !== Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
        }

        $userRole = $this->getUserRoles($screenshot->user)->first();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $screenshot->id,
                'filename' => $screenshot->filename,
                'file_size' => $this->formatBytes($screenshot->file_size),
                'dimensions' => $screenshot->width . 'x' . $screenshot->height,
                'url' => $screenshot->url,
                'page_title' => $screenshot->page_title,
                'viewport_size' => $screenshot->viewport_size,
                'captured_at' => $screenshot->captured_at->toISOString(),
                'file_url' => route('screenshots.view', ['id' => $screenshot->id]),
                'user' => [
                    'name' => $screenshot->user->name,
                    'email' => $screenshot->user->email,
                    'role' => $userRole,
                ]
            ]
        ]);
    }

    private function cleanupOldScreenshots($userId, $keepCount = 100)
    {
        try {
            $oldScreenshots = Screenshot::where('user_id', $userId)
                ->orderBy('captured_at', 'desc')
                ->skip($keepCount)
                ->get();

            $deletedCount = 0;
            foreach ($oldScreenshots as $screenshot) {
                if (Storage::disk('public')->exists($screenshot->file_path)) {
                    Storage::disk('public')->delete($screenshot->file_path);
                }
                $screenshot->delete();
                $deletedCount++;
            }

            if ($deletedCount > 0) {
                Log::info('Nettoyage anciens screenshots', [
                    'user_id' => $userId,
                    'deleted_count' => $deletedCount
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Erreur nettoyage screenshots: ' . $e->getMessage());
        }
    }

    private function formatBytes($bytes, $precision = 2)
    {
        if (!$bytes || $bytes === 0) return '0 B';

        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}