<?php

namespace App\Http\Controllers;

use App\Models\Entretien;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class DebugEntretienController extends Controller
{
    /**
     * Debug page to check entretien and document data
     */
    public function debugEntretien($entretienId)
    {
        try {
            $entretien = Entretien::with('salarie')->findOrFail($entretienId);
            
            $debugInfo = [
                'entretien_id' => $entretien->id,
                'salarie_id' => $entretien->salarie->id,
                'salarie_nom' => $entretien->salarie->prenom . ' ' . $entretien->salarie->nom,
                'documents_paths' => [
                    'contrat_cdi_path' => $entretien->salarie->contrat_cdi_path,
                    'cv_path' => $entretien->salarie->cv_path,
                    'diplome_path' => $entretien->salarie->diplome_path,
                    'certificat_travail_path' => $entretien->salarie->certificat_travail_path,
                ],
                'documents_exists' => [
                    'contrat_cdi' => $entretien->salarie->contrat_cdi_path ? Storage::exists($entretien->salarie->contrat_cdi_path) : false,
                    'cv' => $entretien->salarie->cv_path ? Storage::exists($entretien->salarie->cv_path) : false,
                    'diplome' => $entretien->salarie->diplome_path ? Storage::exists($entretien->salarie->diplome_path) : false,
                    'certificat_travail' => $entretien->salarie->certificat_travail_path ? Storage::exists($entretien->salarie->certificat_travail_path) : false,
                ],
                'storage_disk' => config('filesystems.default'),
                'storage_path' => storage_path('app/public'),
                'all_files_in_documents' => Storage::disk('public')->allFiles('documents'),
                'routes_available' => [
                    'download_contrat_cdi' => route('entretiens.download', ['entretien' => $entretien->id, 'type' => 'contrat_cdi']),
                    'download_cv' => route('entretiens.download', ['entretien' => $entretien->id, 'type' => 'cv']),
                    'download_diplome' => route('entretiens.download', ['entretien' => $entretien->id, 'type' => 'diplome']),
                    'download_certificat' => route('entretiens.download', ['entretien' => $entretien->id, 'type' => 'certificat_travail']),
                ],
            ];

            // Pretty print the debug info
            echo "<html><head><title>Debug Entretien #{$entretienId}</title>";
            echo "<style>
                body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
                h2 { color: #1e40af; margin-top: 30px; background: #eff6ff; padding: 10px; border-radius: 4px; }
                .section { margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 4px; border-left: 4px solid #3b82f6; }
                .key { font-weight: bold; color: #374151; display: inline-block; width: 250px; }
                .value { color: #059669; font-family: monospace; }
                .exists-yes { color: #059669; font-weight: bold; }
                .exists-no { color: #dc2626; font-weight: bold; }
                .warning { background: #fef3c7; border-left-color: #f59e0b; padding: 15px; margin: 15px 0; border-radius: 4px; }
                .success { background: #d1fae5; border-left-color: #10b981; padding: 15px; margin: 15px 0; border-radius: 4px; }
                .error { background: #fee2e2; border-left-color: #ef4444; padding: 15px; margin: 15px 0; border-radius: 4px; }
                a { color: #2563eb; text-decoration: none; }
                a:hover { text-decoration: underline; }
                .test-btn { background: #2563eb; color: white; padding: 8px 16px; border-radius: 4px; display: inline-block; margin: 5px; }
                .test-btn:hover { background: #1d4ed8; }
            </style></head><body>";
            
            echo "<div class='container'>";
            echo "<h1>🔍 Debug Information - Entretien #{$entretienId}</h1>";
            
            echo "<h2>📋 Entretien Information</h2>";
            echo "<div class='section'>";
            echo "<div><span class='key'>Entretien ID:</span> <span class='value'>{$debugInfo['entretien_id']}</span></div>";
            echo "<div><span class='key'>Salarié ID:</span> <span class='value'>{$debugInfo['salarie_id']}</span></div>";
            echo "<div><span class='key'>Salarié Nom:</span> <span class='value'>{$debugInfo['salarie_nom']}</span></div>";
            echo "</div>";

            echo "<h2>📁 Document Paths in Database</h2>";
            echo "<div class='section'>";
            foreach ($debugInfo['documents_paths'] as $key => $path) {
                $class = $path ? 'value' : 'exists-no';
                $display = $path ?: 'NULL (No document uploaded)';
                echo "<div><span class='key'>{$key}:</span> <span class='{$class}'>{$display}</span></div>";
            }
            echo "</div>";

            echo "<h2>✅ Document Files Existence Check</h2>";
            echo "<div class='section'>";
            $hasIssues = false;
            foreach ($debugInfo['documents_exists'] as $key => $exists) {
                $class = $exists ? 'exists-yes' : 'exists-no';
                $status = $exists ? '✓ EXISTS' : '✗ NOT FOUND';
                echo "<div><span class='key'>{$key}:</span> <span class='{$class}'>{$status}</span></div>";
                if (!$exists && $debugInfo['documents_paths'][$key . '_path']) {
                    $hasIssues = true;
                }
            }
            echo "</div>";

            if ($hasIssues) {
                echo "<div class='error'>";
                echo "<strong>⚠️ WARNING:</strong> Some documents are recorded in database but files don't exist in storage!";
                echo "</div>";
            }

            echo "<h2>⚙️ Storage Configuration</h2>";
            echo "<div class='section'>";
            echo "<div><span class='key'>Default Storage Disk:</span> <span class='value'>{$debugInfo['storage_disk']}</span></div>";
            echo "<div><span class='key'>Storage Path:</span> <span class='value'>{$debugInfo['storage_path']}</span></div>";
            echo "<div><span class='key'>Public URL:</span> <span class='value'>" . asset('storage') . "</span></div>";
            echo "</div>";

            $symlinkExists = is_link(public_path('storage'));
            if (!$symlinkExists) {
                echo "<div class='error'>";
                echo "<strong>⚠️ CRITICAL:</strong> Symbolic link 'public/storage' does not exist!<br>";
                echo "Run: <code>php artisan storage:link</code>";
                echo "</div>";
            } else {
                echo "<div class='success'>";
                echo "✓ Symbolic link exists at: " . public_path('storage');
                echo "</div>";
            }

            echo "<h2>📂 All Files in Documents Directory</h2>";
            echo "<div class='section'>";
            if (!empty($debugInfo['all_files_in_documents'])) {
                echo "<ul>";
                foreach ($debugInfo['all_files_in_documents'] as $file) {
                    echo "<li><span class='value'>{$file}</span></li>";
                }
                echo "</ul>";
            } else {
                echo "<span class='exists-no'>No files found in documents directory</span>";
            }
            echo "</div>";

            echo "<h2>🔗 Generated Download URLs</h2>";
            echo "<div class='section'>";
            foreach ($debugInfo['routes_available'] as $name => $url) {
                echo "<div style='margin: 10px 0;'>";
                echo "<span class='key'>{$name}:</span><br>";
                echo "<a href='{$url}' class='test-btn' target='_blank'>Test Download</a> ";
                echo "<code style='color: #6b7280;'>{$url}</code>";
                echo "</div>";
            }
            echo "</div>";

            echo "<h2>📝 Route Check</h2>";
            echo "<div class='section'>";
            $routes = \Route::getRoutes();
            $downloadRoute = $routes->getByName('entretiens.download');
            
            if ($downloadRoute) {
                echo "<div class='success'>";
                echo "✓ Route 'entretiens.download' is registered<br>";
                echo "<span class='key'>URI:</span> <span class='value'>" . $downloadRoute->uri() . "</span><br>";
                echo "<span class='key'>Methods:</span> <span class='value'>" . implode(', ', $downloadRoute->methods()) . "</span><br>";
                echo "<span class='key'>Action:</span> <span class='value'>" . $downloadRoute->getActionName() . "</span>";
                echo "</div>";
            } else {
                echo "<div class='error'>";
                echo "✗ Route 'entretiens.download' is NOT registered!<br>";
                echo "Add this to your web.php:<br>";
                echo "<code>Route::get('/ressources-humaines/entretiens/{entretien}/download/{type}', [RessourcesHumainesController::class, 'downloadDocument'])->name('entretiens.download');</code>";
                echo "</div>";
            }
            echo "</div>";

            echo "<h2>🧪 Recommendations</h2>";
            echo "<div class='section'>";
            echo "<ol>";
            
            if (!$symlinkExists) {
                echo "<li class='error'>Run <code>php artisan storage:link</code> command</li>";
            }
            
            if ($hasIssues) {
                echo "<li class='warning'>Re-upload documents that are missing from storage</li>";
            }
            
            if (!$downloadRoute) {
                echo "<li class='error'>Add the download route to your routes/web.php file</li>";
            }
            
            echo "<li>Check Laravel logs at: <code>storage/logs/laravel.log</code></li>";
            echo "<li>Verify file permissions on storage directory: <code>chmod -R 775 storage</code></li>";
            echo "<li>Check that APP_URL in .env matches your development URL</li>";
            echo "</ol>";
            echo "</div>";

            echo "</div></body></html>";

        } catch (\Exception $e) {
            echo "<html><body style='font-family: Arial; padding: 20px;'>";
            echo "<h1 style='color: red;'>Error</h1>";
            echo "<p><strong>Message:</strong> {$e->getMessage()}</p>";
            echo "<p><strong>File:</strong> {$e->getFile()}</p>";
            echo "<p><strong>Line:</strong> {$e->getLine()}</p>";
            echo "<pre>" . $e->getTraceAsString() . "</pre>";
            echo "</body></html>";
        }
    }

    /**
     * Test direct file access
     */
    public function testFileAccess($entretienId, $type)
    {
        $entretien = Entretien::with('salarie')->findOrFail($entretienId);
        $salarie = $entretien->salarie;
        
        $pathField = $type . '_path';
        $path = $salarie->$pathField;
        
        $info = [
            'requested_type' => $type,
            'path_field' => $pathField,
            'path_value' => $path,
            'file_exists' => $path ? Storage::exists($path) : false,
            'storage_disk' => Storage::getDefaultDriver(),
            'full_path' => $path ? Storage::path($path) : null,
        ];
        
        if ($path && Storage::exists($path)) {
            $info['file_size'] = Storage::size($path);
            $info['file_mime'] = Storage::mimeType($path);
            $info['file_last_modified'] = Storage::lastModified($path);
        }
        
        return response()->json($info, 200, [], JSON_PRETTY_PRINT);
    }
}