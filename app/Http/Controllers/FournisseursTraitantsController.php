<?php

namespace App\Http\Controllers;

use App\Notifications\ReferenceRejectedNotification;
use App\Models\MethodologyDocument;
use App\Models\User;
use App\Notifications\MethodologyDocumentNotification;
use App\Events\NewNotification;
use App\Models\Reference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Notifications\DatabaseNotification;
use App\Notifications\NewReferenceSubmittedNotification;





use Inertia\Inertia;

class FournisseursTraitantsController extends Controller
{
    public function index()
    {
        return Inertia::render('fournisseurs-traitants/Dashboard');
    }

    public function MethodologiePlanning()
    {
        $userId = auth()->id();

        $documents = [
            'methodologie' => MethodologyDocument::where('user_id', $userId)
                ->where('type', 'methodologie')
                ->orderBy('created_at', 'desc')
                ->get(),
            'planning' => MethodologyDocument::where('user_id', $userId)
                ->where('type', 'planning')
                ->orderBy('created_at', 'desc')
                ->get(),
            'chronogram' => MethodologyDocument::where('user_id', $userId)
                ->where('type', 'chronogram')
                ->orderBy('created_at', 'desc')
                ->get(),
            'organigramme' => MethodologyDocument::where('user_id', $userId)
                ->where('type', 'organigramme')
                ->orderBy('created_at', 'desc')
                ->get(),
            'auto_control' => MethodologyDocument::where('user_id', $userId)
                ->where('type', 'auto_control')
                ->orderBy('created_at', 'desc')
                ->get(),
        ];

        $allDocs = MethodologyDocument::where('user_id', $userId)->get();
        $stats = [
            'total' => $allDocs->count(),
            'validated' => $allDocs->where('status', 'validated')->count(),
            'pending' => $allDocs->whereIn('status', ['draft', 'submitted'])->count(),
            'completion' => $allDocs->count() > 0 
                ? round(($allDocs->where('status', 'validated')->count() / $allDocs->count()) * 100) 
                : 0,
        ];

        return Inertia::render('fournisseurs-traitants/MethodologiePlanning', [
            'documents' => $documents,
            'stats' => $stats,
        ]);
    }

    public function uploadMethodology(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:51200',
            'type' => 'required|in:methodologie,planning,chronogram,organigramme,auto_control',
        ]);

        $file = $request->file('file');
        $type = $request->type;

        DB::beginTransaction();

        try {
            $path = $file->store("methodology/{$type}", 'public');

            $document = MethodologyDocument::create([
                'user_id' => auth()->id(),
                'type' => $type,
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'status' => 'submitted',
            ]);

            Log::info('Document created successfully', [
                'document_id' => $document->id,
                'type' => $type,
                'user_id' => auth()->id(),
            ]);

            $notificationResult = $this->notifyRHUsers($document, 'submitted');

            DB::commit();

            if ($notificationResult['success']) {
                Log::info('All RH users notified successfully', [
                    'count' => $notificationResult['count']
                ]);
                return redirect()->back()->with('success', "Document téléchargé avec succès! {$notificationResult['count']} RH notifié(s).");
            } else {
                Log::warning('Document uploaded but notifications failed', [
                    'errors' => $notificationResult['errors']
                ]);
                return redirect()->back()->with('warning', 'Document téléchargé mais erreur lors de la notification des RH.');
            }

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error uploading methodology document', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
            ]);

            if (isset($path)) {
                Storage::disk('public')->delete($path);
            }

            return redirect()->back()->withErrors(['error' => 'Erreur lors du téléchargement du document: ' . $e->getMessage()]);
        }
    }

    public function downloadMethodology(MethodologyDocument $document)
    {
        if ($document->user_id !== auth()->id()) {
            abort(403);
        }

        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }

    public function deleteMethodology(MethodologyDocument $document)
    {
        if ($document->user_id !== auth()->id() || $document->status === 'validated') {
            abort(403);
        }

        Storage::disk('public')->delete($document->file_path);
        $document->delete();

        return redirect()->back()->with('success', 'Document supprimé avec succès!');
    }

    /**
     * FIXED: Using Spatie's role() method instead of where('role')
     */
    protected function notifyRHUsers(MethodologyDocument $document, string $action, ?string $comment = null): array
    {
        $result = [
            'success' => false,
            'count' => 0,
            'errors' => [],
        ];

        try {
            // CRITICAL FIX: Use Spatie's role() method
            $rhUsers = User::role('ressources-humaines')->get();

            Log::info('Looking for RH users', [
                'count' => $rhUsers->count(),
                'action' => $action,
            ]);

            if ($rhUsers->isEmpty()) {
                Log::warning('No RH users found with role ressources-humaines');
                $result['errors'][] = 'No RH users found';
                return $result;
            }

            $successCount = 0;

            foreach ($rhUsers as $rhUser) {
                try {
                    Log::info('Notifying RH user', [
                        'rh_user_id' => $rhUser->id,
                        'rh_user_email' => $rhUser->email,
                    ]);

                    // Send notification (sync mode since queue driver is 'sync')
                    $rhUser->notify(new MethodologyDocumentNotification($document, $action, $comment));

                    // Verify notification was created
                    $lastNotification = DatabaseNotification::where('notifiable_id', $rhUser->id)
                        ->where('notifiable_type', User::class)
                        ->latest()
                        ->first();

                    if ($lastNotification) {
                        Log::info('Notification created successfully', [
                            'notification_id' => $lastNotification->id,
                            'rh_user_id' => $rhUser->id,
                        ]);

                        // Try to broadcast
                        try {
                            broadcast(new NewNotification($lastNotification, $rhUser->id))->toOthers();
                        } catch (\Exception $broadcastError) {
                            Log::warning('Broadcasting failed but notification saved', [
                                'error' => $broadcastError->getMessage(),
                            ]);
                        }

                        $successCount++;
                    } else {
                        Log::error('Notification not saved to database', [
                            'rh_user_id' => $rhUser->id,
                        ]);
                        $result['errors'][] = "Notification not saved for user {$rhUser->id}";
                    }

                } catch (\Exception $e) {
                    Log::error('Error notifying RH user', [
                        'rh_user_id' => $rhUser->id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                    $result['errors'][] = "Failed for user {$rhUser->id}: {$e->getMessage()}";
                }
            }

            $result['success'] = $successCount > 0;
            $result['count'] = $successCount;

            Log::info('Notification process completed', [
                'total_rh_users' => $rhUsers->count(),
                'successful' => $successCount,
            ]);

        } catch (\Exception $e) {
            Log::error('Error in notifyRHUsers method', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            $result['errors'][] = $e->getMessage();
        }

        return $result;
    }





        public function References()
    {
        $references = Reference::where('user_id', auth()->id())
            ->orderBy('submitted_at', 'desc')
            ->get();

        return Inertia::render('fournisseurs-traitants/References', [
            'references' => $references
        ]);
    }

    /**
     * Store a new reference with detailed error logging
     */
    public function storeReference(Request $request)
{
    try {
        Log::info('Reference submission attempt', [
            'user_id' => auth()->id(),
            'data' => $request->except('document'),
            'has_file' => $request->hasFile('document')
        ]);

        $validated = $request->validate([
            'project_name' => 'required|string|max:255',
            'client_name' => 'required|string|max:255',
            'project_value' => 'required|string|max:100',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'description' => 'required|string|max:2000',
            'document' => 'required|file|mimes:pdf|max:10240',
        ]);

        if (!$request->hasFile('document')) {
            return back()->withErrors(['document' => 'Le fichier est requis.']);
        }

        $file = $request->file('document');
        $fileName = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName());
        $filePath = $file->storeAs('references', $fileName, 'public');

        Log::info('File uploaded successfully', ['path' => $filePath]);

        // Create reference
        $reference = Reference::create([
            'user_id' => auth()->id(),
            'project_name' => $validated['project_name'],
            'client_name' => $validated['client_name'],
            'project_value' => $validated['project_value'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'description' => $validated['description'],
            'document_path' => $filePath,
            'document_name' => $fileName,
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        Log::info('Reference created successfully', ['id' => $reference->id]);

        // ========================================
        // NOTIFY ALL RH USERS
        // ========================================
        $rhUsers = User::role('ressources-humaines')->get();
        
        Log::info('Notifying RH users', ['count' => $rhUsers->count()]);
        
        foreach ($rhUsers as $rhUser) {
            try {
                // Send notification
                $rhUser->notify(new NewReferenceSubmittedNotification($reference));
                
                // Get the latest notification
                $notification = $rhUser->notifications()->latest()->first();
                
                // Broadcast the notification
                if ($notification) {
                    broadcast(new NewNotification($notification, $rhUser->id))->toOthers();
                    
                    Log::info('Notification sent to RH user', [
                        'rh_user_id' => $rhUser->id,
                        'rh_user_name' => $rhUser->name,
                        'notification_id' => $notification->id
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to notify RH user', [
                    'rh_user_id' => $rhUser->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return redirect()
            ->route('fournisseurs-traitants.references')
            ->with('success', 'Référence soumise avec succès. Elle sera validée par les RH.');

    } catch (\Illuminate\Validation\ValidationException $e) {
        Log::error('Validation failed', ['errors' => $e->errors()]);
        return back()->withErrors($e->errors())->withInput();
        
    } catch (\Exception $e) {
        Log::error('Reference submission failed', [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]);
        
        return back()->withErrors(['error' => 'Une erreur est survenue: ' . $e->getMessage()]);
    }
}

    /**
     * Delete reference (only if pending)
     */
    public function deleteReference($id)
    {
        try {
            $reference = Reference::where('user_id', auth()->id())
                ->where('status', 'pending')
                ->findOrFail($id);

            // Delete the file
            if ($reference->document_path) {
                Storage::disk('public')->delete($reference->document_path);
            }

            $reference->delete();

            return redirect()
                ->route('fournisseurs-traitants.references')
                ->with('success', 'Référence supprimée avec succès.');
                
        } catch (\Exception $e) {
            Log::error('Reference deletion failed', [
                'message' => $e->getMessage(),
                'reference_id' => $id
            ]);
            
            return back()->withErrors(['error' => 'Erreur lors de la suppression.']);
        }
    }

    /**
     * Download reference document (supplier side)
     */
    public function downloadReferenceDocument($id)
    {
        $reference = Reference::where('user_id', auth()->id())
            ->findOrFail($id);

        $filePath = storage_path('app/public/' . $reference->document_path);

        if (!file_exists($filePath)) {
            abort(404, 'Document non trouvé');
        }

        return response()->download($filePath, $reference->document_name);
    }

    public function OffreTechnique()
    {
        return Inertia::render('fournisseurs-traitants/OffreTechnique');
    }

    public function AccordsST()
    {
        return Inertia::render('fournisseurs-traitants/AccordsST');
    }



    public function TeamTable()
    {
        return Inertia::render('fournisseurs-traitants/TeamTable');
    }
}
