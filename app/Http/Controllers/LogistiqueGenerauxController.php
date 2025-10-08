<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LogistiqueGenerauxController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('logistique-generaux/Dashboard');
    }

    public function documents(): Response
    {
        $documents = Document::where('archived', false)
            ->where('is_complementary', false)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        $fixedPeriodicities = Document::getFixedPeriodicities();
        $availableTypes = array_keys($fixedPeriodicities);

        return Inertia::render('logistique-generaux/Documents', [
            'documents' => $documents,
            'availableTypes' => $availableTypes,
            'fixedPeriodicities' => $fixedPeriodicities,
        ]);
    }

    public function storeDocument(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'file' => 'required|file|mimes:pdf,jpg,png,doc,docx,xlsx|max:10240',
        ]);

        // Check if active document of same type exists
        $exists = Document::where('type', $request->type)
            ->where('archived', false)
            ->where('is_complementary', false)
            ->exists();

        if ($exists) {
            return back()->with('error', 'Un document de ce type existe déjà. Veuillez l\'archiver avant d\'en ajouter un nouveau.');
        }

        // Store file
        $path = $request->file('file')->store('documents', 'public');

        // Get fixed periodicity
        $fixedPeriodicities = Document::getFixedPeriodicities();
        $periodicite = $fixedPeriodicities[$request->type] ?? 'annuel';

        // Calculate expiration date
        $dateExpiration = Document::expirationFor($periodicite);

        // Create document
        Document::create([
            'type' => $request->type,
            'periodicite' => $periodicite,
            'file_path' => $path,
            'date_expiration' => $dateExpiration,
            'user_id' => Auth::id(),
            'is_complementary' => false,
        ]);

        return back()->with('success', 'Document ajouté avec succès');
    }

    public function renewDocument($id, Request $request)
    {
        $oldDoc = Document::findOrFail($id);
        
        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx,xlsx|max:10240',
        ]);

        // Archive old document
        $oldDoc->archived = true;
        $oldDoc->save();

        // Store new file
        $path = $request->file('file')->store('documents', 'public');

        // Create new document
        Document::create([
            'type' => $oldDoc->type,
            'periodicite' => $oldDoc->periodicite,
            'file_path' => $path,
            'date_expiration' => Document::expirationFor($oldDoc->periodicite),
            'user_id' => Auth::id(),
            'is_complementary' => false,
        ]);

        return back()->with('success', "Document {$oldDoc->type} renouvelé avec succès");
    }

    public function deleteDocument($id)
    {
        $document = Document::findOrFail($id);
        
        // Delete file from storage
        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return back()->with('success', 'Document supprimé avec succès');
    }

    public function documentsArchive(): Response
    {
        $archivedDocuments = Document::where('archived', true)
            ->where('is_complementary', false)
            ->with('user')
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('logistique-generaux/DocumentsArchive', [
            'archivedDocuments' => $archivedDocuments,
        ]);
    }

    public function complementaryDocuments(): Response
    {
        $documents = Document::where('archived', false)
            ->where('is_complementary', true)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('logistique-generaux/DocumentsComplementaires', [
            'documents' => $documents,
        ]);
    }

    public function storeComplementary(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'periodicite' => 'required|string|in:mensuel,trimestriel,semestriel,annuel',
            'file' => 'required|file|mimes:pdf,jpg,png,doc,docx,xlsx|max:10240',
        ]);

        $path = $request->file('file')->store('documents', 'public');

        Document::create([
            'type' => $request->type,
            'periodicite' => $request->periodicite,
            'file_path' => $path,
            'date_expiration' => Document::expirationFor($request->periodicite),
            'user_id' => Auth::id(),
            'is_complementary' => true,
        ]);

        return back()->with('success', 'Document complémentaire ajouté avec succès');
    }

    public function renewComplementary($id, Request $request)
    {
        $oldDoc = Document::findOrFail($id);

        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx,xlsx|max:10240',
        ]);

        // Archive old document
        $oldDoc->archived = true;
        $oldDoc->save();

        // Store new file
        $path = $request->file('file')->store('documents', 'public');

        // Create new document
        Document::create([
            'type' => $oldDoc->type,
            'periodicite' => $oldDoc->periodicite,
            'file_path' => $path,
            'date_expiration' => Document::expirationFor($oldDoc->periodicite),
            'user_id' => Auth::id(),
            'is_complementary' => true,
        ]);

        return back()->with('success', 'Document complémentaire renouvelé avec succès');
    }

    public function archivedComplementaryDocuments(): Response
    {
        $archivedDocuments = Document::where('archived', true)
            ->where('is_complementary', true)
            ->with('user')
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('logistique-generaux/ArchiveDocumentsComplementaires', [
            'archivedDocuments' => $archivedDocuments,
        ]);
    }
}