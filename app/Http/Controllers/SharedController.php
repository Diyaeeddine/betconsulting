<?php

namespace App\Http\Controllers;

use App\Models\Projet;
use Inertia\Inertia;
use App\Models\Document;
use App\Models\MarchePublic;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Exception;

class SharedController extends Controller
{
   public function documents(): Response
    {
        $documents = Document::where('archived', false)
            ->where('is_complementary', false)
            ->get();

        return Inertia::render('shared/documentation/Documents', [
            'documents' => $documents,
        ]);
    }

    public function storeDocument(Request $request)
{
    $request->validate([
        'type' => 'required|string',
        'file' => 'required|file|mimes:pdf,jpg,png,doc,docx,xlsx',
    ]);

    // Vérifier si un document actif (non archivé) du même type existe déjà
    $exists = Document::where('type', $request->type)
        ->where('archived', false)
        ->where('is_complementary', false)
        ->exists();

    if ($exists) {
        return redirect()->route('documents.index')
            ->with('error', 'Un document de ce type existe déjà. Veuillez l’archiver avant d’en ajouter un nouveau.');
    }

    // Stocker fichier
    $path = $request->file('file')->store('documents', 'public');

    // Déterminer la périodicité en fonction du type
    $fixedPeriodicities = Document::getFixedPeriodicities();
    $periodicite = $fixedPeriodicities[$request->type] ?? 'annuel';

    // Calculer date d’expiration
    $dateExpiration = match (strtolower($periodicite)) {
        'annuel' => now()->addYear(),
        'mensuel' => now()->addMonth(),
        'trimestriel' => now()->addMonths(3),
        'semestriel' => now()->addMonths(6),
        default => null,
    };

    // Créer le document
    Document::create([
        'type' => $request->type,
        'periodicite' => $periodicite,
        'file_path' => $path,
        'date_expiration' => $dateExpiration,
        'user_id' => Auth::id(),
        'is_complementary' => false,
    ]);

    return redirect()->route('documents.index')
        ->with('success', 'Le document ajouté avec succès');
}


    public function DocumentsArchive(): Response
    {
        $archivedDocuments = Document::where('archived', true)
            ->where('is_complementary', false)
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('shared/documentation/DocumentsArchive', [
            'archivedDocuments' => $archivedDocuments,
        ]);
    }

public function renewDocument($id, Request $request)
    {
        $oldDoc = Document::findOrFail($id);
        $oldDoc->archived = true;
        $oldDoc->save();

        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx,xlsx',
        ]);

        $path = $request->file('file')->store('documents', 'public');

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

public function renewComplementary($id, Request $request)
    {
        $oldDoc = Document::findOrFail($id);

        $oldDoc->archived = true;
        $oldDoc->save();

        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx,xlsx',
        ]);

        $path = $request->file('file')->store('documents', 'public');

        Document::create([
            'type' => $oldDoc->type,
            'periodicite' => $oldDoc->periodicite,
            'file_path' => $path,
            'date_expiration' => Document::expirationFor($oldDoc->periodicite),
            'user_id' => Auth::id(),
            'is_complementary' => true,
        ]);

        return back()->with('success', 'Document complémentaire renouvelé');
    }

public function complementaryDocuments(): Response
    {
        $docs = Document::where('archived', false)
            ->where('is_complementary', true)
            ->get();

        return Inertia::render('shared/documentation/DocumentsComplementaires', [
            'documents' => $docs,
        ]);
    }

    public function storeComplementary(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'periodicite' => 'required|string',
            'file' => 'required|file|mimes:pdf,jpg,png,doc,docx,xlsx',
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

        return redirect()->route('documents.complementaires.index')->with('success', 'Document complémentaire ajouté avec succès');
    }

    public function archivedComplementaryDocuments(): Response
    {
        $archivedDocuments = Document::where('archived', true)
            ->where('is_complementary', true)
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('shared/documentation/ArchiveDocumentsComplementaires', [
            'archivedDocuments' => $archivedDocuments,
        ]);
    }


// -----------------------------------{ - MARCHES - }--------------------------------



public function marchesPublic(){

    $marchePublics = MarchePublic::where('is_accepted', false)
    ->where(function($query) {
        $query->where('etat', '!=', 'rejetee')
              ->orWhereNull('etat');
    })
    ->get();

    return Inertia::render('shared/marches/MarchesPublics', [
        'marchePublics' => $marchePublics,
    ]);

}

public function acceptMP($id)
    {
        $marche = MarchePublic::findOrFail($id);

        $marche->update([
            'is_accepted' => true,
            'etat'        => 'en cours', 
            'etape'       => 'decision initial', 
        ]);

        return redirect()->back()->with('success', 'Le marché a été accepté avec succès');
    }


    public function rejectMP($id)
{
    $marche = MarchePublic::findOrFail($id);

    $marche->update([
        'is_accepted' => false,
        'etat'        => 'rejetee',
        'etape'       => null, 
    ]);

    return redirect()->back()->with('success', 'Le marché a été rejeté ❌');
}



public function acceptIMP(Request $request, $id)
{
    try {
        Log::info("Tentative d'acceptation du marché", [
            'marche_id' => $id,
            'user_id' => Auth::id(),
            'user_email' => Auth::user()->email ?? 'unknown'
        ]);

        $marche = MarchePublic::findOrFail($id);
        
        $marche->update([
            'etape' => 'decision admin',
            'is_accepted' => true
        ]);

        Log::info("Marché accepté avec succès", ['marche_id' => $id]);

        // Pour Inertia.js, on redirige vers la même page avec un message flash
        return redirect()->back()->with('success', 'Marché accepté avec succès');

    } catch (Exception $e) {
        Log::error("Erreur lors de l'acceptation du marché", [
            'marche_id' => $id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return redirect()->back()->with('error', 'Erreur lors de l\'acceptation du marché: ' . $e->getMessage());
    }
}

public function annulerMP(Request $request, $id)
{
    try {
        Log::info("Tentative d'annulation du marché", [
            'marche_id' => $id,
            'user_id' => Auth::id()
        ]);

        $marche = MarchePublic::findOrFail($id);
        
        $marche->update([
            'etat' => 'annulee'
        ]);

        Log::info("Marché annulé avec succès", ['marche_id' => $id]);

        return redirect()->back()->with('success', 'Marché annulé avec succès');

    } catch (Exception $e) {
        Log::error("Erreur lors de l'annulation du marché", [
            'marche_id' => $id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return redirect()->back()->with('error', 'Erreur lors de l\'annulation du marché: ' . $e->getMessage());
    }
}    
    public function marchesRejetee(){

        $marcheR= MarchePublic::where('etat','rejetee')
    ->where('is_accepted',false)
    ->get();
    
    return Inertia::render('shared/marches/Rejetee', [
        'marcheR' => $marcheR,
    ]);
    }




public function marchesEnCours(){

    $marcheP= MarchePublic::where('etat','en cours')
    ->where('is_accepted',true)
    ->get();
    
    return Inertia::render('shared/marches/EnCours', [
        'marcheP' => $marcheP,
    ]);

}


public function marchesAnnulee(){

    $marcheA= MarchePublic::where('etat','annulee')
    ->where('is_accepted',true)
    ->get();
    
    return Inertia::render('shared/marches/Annulee', [
        'marcheA' => $marcheA,
    ]);
}

}
