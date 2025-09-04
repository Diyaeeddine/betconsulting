import React, { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import axios from 'axios';

const breadcrumbs = [
    {
        title: 'Dashboard Ressources Humaines - Résultats Bons de Commande',
        href: '/ressources-humaines/resultats-bon-commande-page',
    },
];

type ResultatBonCommande = {
    reference?: string | null;
    maitre_ouvrage?: string | null;
    objet?: string | null;
    adjudicataire?: string | null;
    ville?: string | null;
    budget?: string | null;
    montant?: string | null;
    date_adjudications?: string | null;
    date_ouverture?: string | null;
    date_affichage?: string | null;
    dao?: string | null;
    lien_dao?: string | null;
    chemin_fichiers?: string[] | null;
};

export default function ResultatsBonCommande() {
    const [resultats, setResultats] = useState<ResultatBonCommande[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [daoFiles, setDaoFiles] = useState<{ name: string; path: string }[]>([]);
    const [showDaoFiles, setShowDaoFiles] = useState(false);
    const [currentZip, setCurrentZip] = useState<string | null>(null);
    const [loadingDao, setLoadingDao] = useState(false);

    const [filterMaitreOuvrage, setFilterMaitreOuvrage] = useState('');
    const [filterDateOuverture, setFilterDateOuverture] = useState('');
    const [filterReference, setFilterReference] = useState('');

    const [refreshing, setRefreshing] = useState(false);

    const fetchResultats = () => {
        axios
            .get('/ressources-humaines/resultats-bon-commande')
            .then((res) => setResultats(res.data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchResultats();
    }, []);

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '---';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('fr-FR');
    };

    const formatCurrency = (amount?: string | null) => {
        if (!amount) return '---';
        const num = parseFloat(amount.replace(/\s/g, '').replace(',', '.'));
        if (isNaN(num)) return amount;
        return num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DH';
    };

    const maitreOuvrages = Array.from(new Set(resultats.map(r => r.maitre_ouvrage).filter(Boolean))) as string[];

    const filteredResultats = resultats.filter((r) => {
        const matchMaitreOuvrage = filterMaitreOuvrage
            ? (r.maitre_ouvrage || '').toLowerCase().includes(filterMaitreOuvrage.toLowerCase())
            : true;
        const matchDate = filterDateOuverture
            ? new Date(r.date_ouverture!).toISOString().split('T')[0] === filterDateOuverture
            : true;
        const matchReference = filterReference
            ? (r.reference || '').toLowerCase().includes(filterReference.toLowerCase())
            : true;
        return matchMaitreOuvrage && matchDate && matchReference;
    });

    const handleOpenDao = (zipUrl: string) => {
        setLoadingDao(true);
        axios
            .get('/ressources-humaines/list-dao-files', { params: { zipPath: zipUrl } })
            .then((res) => {
                setDaoFiles(res.data);
                setCurrentZip(zipUrl);
                setShowDaoFiles(true);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoadingDao(false));
    };

    const handleDownloadFile = (filePath: string) => {
        if (!currentZip) return;
        const params = new URLSearchParams({ zipPath: currentZip, filePath });
        window.open(`/ressources-humaines/download-dao-file?${params.toString()}`, '_blank');
    };

    const handleRefresh = () => {
        setRefreshing(true);
        axios
            .get('/ressources-humaines/fetch-resultats-bon-commande')
            .then(() => fetchResultats())
            .catch(() => setError("Erreur lors de l'actualisation"))
            .finally(() => setRefreshing(false));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Résultats Bons de Commande" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Résultats des Bons de Commande</h1>
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
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8z"
                                ></path>
                            </svg>
                        )}
                        {refreshing ? 'Actualisation...' : 'Actualiser'}
                    </button>
                </div>

                {/* Filtres */}
                <div className="bg-gray-100 p-4 rounded-lg shadow mb-4 grid grid-cols-3 gap-4">
                    
                    <div>
                        <label className="block text-sm font-semibold mb-1">Maître d'Ouvrage</label>
                        <input
                            type="text"
                            value={filterMaitreOuvrage}
                            onChange={(e) => setFilterMaitreOuvrage(e.target.value)}
                            list="maitres-ouvrage"
                            placeholder="Filtrer par maître d'ouvrage"
                            className="border rounded px-2 py-1 w-full"
                        />
                        <datalist id="maitres-ouvrage">
                            {maitreOuvrages.map((m, idx) => (
                                <option key={idx} value={m} />
                            ))}
                        </datalist>
                    </div>

                    {/* Date d'ouverture */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">Date d'ouverture</label>
                        <input
                            type="date"
                            className="border rounded px-2 py-1 w-full"
                            value={filterDateOuverture}
                            onChange={(e) => setFilterDateOuverture(e.target.value)}
                        />
                    </div>

                    {/* Référence */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">Référence</label>
                        <input
                            type="text"
                            placeholder="Filtrer par référence"
                            className="border rounded px-2 py-1 w-full"
                            value={filterReference}
                            onChange={(e) => setFilterReference(e.target.value)}
                        />
                    </div>
                </div>

                {loading && <p>Chargement des résultats...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {!loading && !error && filteredResultats.length > 0 && (
                    <div className="space-y-6">
                        {filteredResultats.map((r, index) => (
                            <div key={index} className="border rounded-lg shadow-md bg-white">
                                <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
                                    <span>Référence: {r.reference || '---'}</span>
                                    <span>Date d'ouverture: {formatDate(r.date_ouverture)}</span>
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                                    <p><strong>Maître d'Ouvrage:</strong> {r.maitre_ouvrage || '---'}</p>
                                    <p><strong>Objet:</strong> {r.objet || '---'}</p>
                                    <p><strong>Ville:</strong> {r.ville || '---'}</p>
                                    <p><strong>Budget:</strong> {formatCurrency(r.budget)}</p>
                                    <p><strong>Montant:</strong> {formatCurrency(r.montant)}</p>
                                    <p><strong>Adjudicataire:</strong> {r.adjudicataire || '---'}</p>
                                    <p><strong>Date d'Adjudication:</strong> {formatDate(r.date_adjudications)}</p>
                                    <p><strong>Date d'Affichage:</strong> {formatDate(r.date_affichage)}</p>
                                </div>

                                {r.lien_dao && (
                                    <div className="p-4 border-t flex gap-2 justify-end">
                                        <a href={r.lien_dao} download className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                                            Télécharger D.A.O
                                        </a>
                                        <button
                                            onClick={() => handleOpenDao(r.lien_dao!)}
                                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                                        >
                                            Ouvrir D.A.O
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !error && filteredResultats.length === 0 && (
                    <p className="text-gray-500 text-center py-8">Aucun résultat trouvé.</p>
                )}

                {showDaoFiles && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white p-4 rounded max-h-full overflow-y-auto w-full max-w-md">
                            <h3 className="font-bold mb-2">Fichiers D.A.O</h3>
                            <ul className="space-y-1">
                                {daoFiles.map((file, i) => (
                                    <li key={i}>
                                        <button
                                            onClick={() => handleDownloadFile(file.path)}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {file.name || file.path}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => setShowDaoFiles(false)}
                                className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                )}

                {loadingDao && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Chargement D.A.O...</span>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}