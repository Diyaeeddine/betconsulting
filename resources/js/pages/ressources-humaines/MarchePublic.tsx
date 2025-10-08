import React, { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import axios from 'axios';

const breadcrumbs = [
{
title: 'Dashboard Ressources Humaines & Marchés Publics',
href: '/ressources-humaines/marche-public-page',
},
];

type MarchePublic = {
id: number;
type_procedure?: string | null;
detail_procedure?: string | null;
categorie?: string | null;
date_publication?: string | null;
reference?: string | null;
objet?: string | null;
objet_complet?: string | null;
acheteur_public?: string | null;
lieu_execution?: string | null;
lieu_execution_complet?: string | null;
lien_detail_lots?: string | null;
date_limite?: string | null;
type_reponse_electronique?: string | null;
lien_consultation?: string | null;
ref_consultation_id?: string | null;
extracted_at?: string | null;
row_index?: number | null;
storage_link_csv?: string | null;
storage_link_json?: string | null;
EXTRACTED_FILES?: string[] | null;
chemin_zip?: string | null;
};

export default function MarchePublic() {
const [marchesPublics, setMarchesPublics] = useState<MarchePublic[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);


const [extractedFiles, setExtractedFiles] = useState<string[]>([]);
const [showExtractedFiles, setShowExtractedFiles] = useState(false);
const [currentMarche, setCurrentMarche] = useState<string | null>(null);

const [filterReference, setFilterReference] = useState('');
const [filterAcheteurPublic, setFilterAcheteurPublic] = useState('');
const [filterCategorie, setFilterCategorie] = useState('');
const [filterDatePublication, setFilterDatePublication] = useState('');
const [filterTypeProcedure, setFilterTypeProcedure] = useState('');

// État pour le bouton d'actualisation
const [refreshing, setRefreshing] = useState(false);

const fetchMarchesPublics = () => {
    axios
        .get('/ressources-humaines/marches-publics-data')
        .then((res) => setMarchesPublics(res.data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
};

useEffect(() => {
    fetchMarchesPublics();
}, []);

const formatDate = (dateString?: string | null): string => {
    if (!dateString) return '---';
    try {
        return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
        return dateString;
    }
};

const formatDateTime = (dateString?: string | null): string => {
    if (!dateString) return '---';
    try {
        return new Date(dateString).toLocaleString('fr-FR');
    } catch {
        return dateString;
    }
};

// Listes pour les filtres
const acheteursPublics = Array.from(new Set(marchesPublics.map((mp) => mp.acheteur_public).filter(Boolean)));
const categories = Array.from(new Set(marchesPublics.map((mp) => mp.categorie).filter(Boolean)));
const typesProcedure = Array.from(new Set(marchesPublics.map((mp) => mp.type_procedure).filter(Boolean)));

const filteredMarchesPublics = marchesPublics.filter((mp) => {
    const matchReference = filterReference
        ? (mp.reference || '').toLowerCase().includes(filterReference.toLowerCase())
        : true;

    const matchAcheteurPublic = filterAcheteurPublic
        ? (mp.acheteur_public || '').toLowerCase().includes(filterAcheteurPublic.toLowerCase())
        : true;

    const matchCategorie = filterCategorie
        ? (mp.categorie || '').toLowerCase().includes(filterCategorie.toLowerCase())
        : true;

    const matchDatePublication = filterDatePublication
        ? mp.date_publication === filterDatePublication
        : true;

    const matchTypeProcedure = filterTypeProcedure
        ? (mp.type_procedure || '').toLowerCase().includes(filterTypeProcedure.toLowerCase())
        : true;

    return matchReference && matchAcheteurPublic && matchCategorie && matchDatePublication && matchTypeProcedure;
});

const handleShowExtractedFiles = (files: string[], marcheReference: string) => {
    // Parser le JSON si c'est une chaîne, sinon utiliser directement
    let parsedFiles = files;
    if (typeof files === 'string') {
        try {
            parsedFiles = JSON.parse(files);
        } catch (error) {
            console.error('Erreur lors du parsing JSON:', error);
            parsedFiles = [];
        }
    }
    setExtractedFiles(parsedFiles);
    setCurrentMarche(marcheReference);
    setShowExtractedFiles(true);
};

const handleOpenFile = (filePath: string) => {
    // Nettoyer le chemin et construire l'URL de téléchargement
    const cleanPath = filePath.replace(/^\/+/, '');
    
    // Essayer d'abord via une route de téléchargement sécurisée
    const downloadUrl = `/ressources-humaines/download-file?path=${encodeURIComponent(filePath)}`;
    
    console.log('Tentative d\'ouverture du fichier:', filePath);
    console.log('URL de téléchargement:', downloadUrl);
    
    // Ouvrir le fichier via la route de téléchargement
    window.open(downloadUrl, '_blank');
};

const handleRefresh = () => {
    setRefreshing(true);
    axios
        .get('/ressources-humaines/fetch-marche-public')
        .then(() => {
            fetchMarchesPublics();
        })
        .catch((err) => {
            console.error(err);
            setError("Erreur lors de l'actualisation");
        })
        .finally(() => setRefreshing(false));
};

const getStatusBadgeColor = (typeProcedure?: string | null) => {
    switch (typeProcedure?.toLowerCase()) {
        case 'appel d\'offres ouvert':
            return 'bg-green-100 text-green-800';
        case 'appel d\'offres restreint':
            return 'bg-orange-100 text-orange-800';
        case 'concours':
            return 'bg-blue-100 text-blue-800';
        case 'consultation':
            return 'bg-purple-100 text-purple-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

return (
    <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Dashboard Ressources Humaines - Marchés Publics" />
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Marchés Publics</h1>
                <button
                    onClick={handleRefresh}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded shadow flex items-center gap-2"
                    disabled={refreshing}
                >
                    {refreshing && (
                        <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                            />
                        </svg>
                    )}
                    {refreshing ? 'Actualisation...' : 'Actualiser les marchés'}
                </button>
            </div>

            {/* Filtres */}
            <div className="bg-gray-100 p-4 rounded-lg shadow mb-4 grid grid-cols-5 gap-4">
                <div>
                    <label className="block text-sm font-semibold mb-1">Référence</label>
                    <input
                        type="text"
                        value={filterReference}
                        onChange={(e) => setFilterReference(e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                        placeholder="Filtrer par référence"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Acheteur Public</label>
                    <input
                        type="text"
                        value={filterAcheteurPublic}
                        onChange={(e) => setFilterAcheteurPublic(e.target.value)}
                        list="acheteurs-publics"
                        className="border rounded px-2 py-1 w-full"
                        placeholder="Filtrer par acheteur"
                    />
                    <datalist id="acheteurs-publics">
                        {acheteursPublics.map((ap, i) => (
                            <option key={i} value={ap || ''} />
                        ))}
                    </datalist>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Catégorie</label>
                    <input
                        type="text"
                        value={filterCategorie}
                        onChange={(e) => setFilterCategorie(e.target.value)}
                        list="categories"
                        className="border rounded px-2 py-1 w-full"
                        placeholder="Filtrer par catégorie"
                    />
                    <datalist id="categories">
                        {categories.map((cat, i) => (
                            <option key={i} value={cat || ''} />
                        ))}
                    </datalist>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Date Publication</label>
                    <input
                        type="date"
                        value={filterDatePublication}
                        onChange={(e) => setFilterDatePublication(e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Type Procédure</label>
                    <input
                        type="text"
                        value={filterTypeProcedure}
                        onChange={(e) => setFilterTypeProcedure(e.target.value)}
                        list="types-procedure"
                        className="border rounded px-2 py-1 w-full"
                        placeholder="Filtrer par type"
                    />
                    <datalist id="types-procedure">
                        {typesProcedure.map((tp, i) => (
                            <option key={i} value={tp || ''} />
                        ))}
                    </datalist>
                </div>
            </div>

            {loading && <p>Chargement des marchés publics...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && filteredMarchesPublics.length > 0 && (
                <div className="space-y-6">
                    {filteredMarchesPublics.map((marche, index) => (
                        <div key={index} className="border rounded-lg shadow-md bg-white">
                            <div className="bg-indigo-600 text-white px-4 py-2 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold">Référence :</span> 
                                    <span>{marche.reference || '---'}</span>
                                    {marche.type_procedure && (
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(marche.type_procedure)}`}>
                                            {marche.type_procedure}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <span className="font-bold">Date Publication :</span> {formatDate(marche.date_publication)}
                                </div>
                            </div>

                            <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                                <p>
                                    <span className="font-bold">Acheteur Public :</span> {marche.acheteur_public || '---'}
                                </p>
                                <p>
                                    <span className="font-bold">Catégorie :</span> {marche.categorie || '---'}
                                </p>
                                <p>
                                    <span className="font-bold">Objet :</span> {marche.objet || '---'}
                                </p>
                                <p>
                                    <span className="font-bold">Lieu Exécution :</span> {marche.lieu_execution || '---'}
                                </p>
                                <p>
                                    <span className="font-bold">Date Limite :</span> {formatDateTime(marche.date_limite)}
                                </p>
                                <p>
                                    <span className="font-bold">Type Réponse :</span> {marche.type_reponse_electronique || '---'}
                                </p>
                            </div>

                            {marche.objet_complet && marche.objet_complet !== marche.objet && (
                                <div className="p-4 border-t">
                                    <h3 className="font-semibold mb-2">Objet Complet</h3>
                                    <p className="text-sm">{marche.objet_complet}</p>
                                </div>
                            )}

                            {marche.lieu_execution_complet && marche.lieu_execution_complet !== marche.lieu_execution && (
                                <div className="p-4 border-t">
                                    <h3 className="font-semibold mb-2">Lieu d'Exécution Complet</h3>
                                    <p className="text-sm">{marche.lieu_execution_complet}</p>
                                </div>
                            )}

                            <div className="p-4 border-t flex gap-2 justify-end flex-wrap">
                                {marche.lien_consultation && (
                                    <a
                                        href={marche.lien_consultation}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                    >
                                        Consulter
                                    </a>
                                )}

                                {marche.EXTRACTED_FILES && marche.EXTRACTED_FILES.length > 0 && (
                                    <button
                                        onClick={() => handleShowExtractedFiles(marche.EXTRACTED_FILES!, marche.reference || 'N/A')}
                                        className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
                                    >
                                        Ouvrir dossier
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && !error && filteredMarchesPublics.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500">Aucun marché public trouvé avec les filtres actuels.</p>
                </div>
            )}

            {/* Modal pour afficher les fichiers extraits */}
            {showExtractedFiles && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full m-4 max-h-96 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                Fichiers Extraits - {currentMarche}
                            </h3>
                            <button
                                onClick={() => setShowExtractedFiles(false)}
                                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                        <div className="space-y-2">
                            {Array.isArray(extractedFiles) && extractedFiles.map((file, index) => (
                                <div 
                                    key={index}
                                    className="flex justify-between items-center p-2 border rounded hover:bg-gray-50"
                                >
                                    <span className="text-sm truncate flex-1">{file}</span>
                                    <button
                                        onClick={() => handleOpenFile(file)}
                                        className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                                    >
                                        Ouvrir
                                    </button>
                                </div>
                            ))}
                            {(!Array.isArray(extractedFiles) || extractedFiles.length === 0) && (
                                <p className="text-gray-500 text-center py-4">Aucun fichier extrait disponible</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    </AppLayout>
);
}