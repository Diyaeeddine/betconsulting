import React, { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import axios from 'axios';

const breadcrumbs = [
    {
        title: 'Dashboard Ressources Humaines & Bons de Commande',
        href: '/ressources-humaines/bons-commandes',
    },
];

type BonCommande = {
    id: number;
    n_ordre?: string | null;
    reference?: string | null;
    date_heure_limite?: string | null;
    objet?: string | null;
    organisme?: string | null;
    ville_execution?: string | null;
    observation?: string | null;
    visite_lieux?: string | null;
    telechargement_dao?: string | null;
    lien_cliquer_ici?: string | null;
    type?: string | null;
    soumission_electronique?: string | null;
    chemin_fichiers?: string[] | null;
};

interface Props {
    bonsCommande: BonCommande[];
}

export default function BonsCommande({ bonsCommande: initialBonsCommande }: Props) {
    const [bonsCommande, setBonsCommande] = useState<BonCommande[]>(initialBonsCommande || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [daoFiles, setDaoFiles] = useState<{ name: string; path: string }[]>([]);
    const [showDaoFiles, setShowDaoFiles] = useState(false);
    const [currentZip, setCurrentZip] = useState<string | null>(null);
    const [loadingDao, setLoadingDao] = useState(false);

    const [filterOrganisme, setFilterOrganisme] = useState('');
    const [filterVille, setFilterVille] = useState('');
    const [filterType, setFilterType] = useState('');

    const [refreshing, setRefreshing] = useState(false);

    // initialise les données au montage, sans lancer Selenium
    useEffect(() => {
        setBonsCommande(initialBonsCommande || []);
    }, [initialBonsCommande]);

    const fetchBonsCommande = () => {
        setLoading(true);
        axios
            .get('/ressources-humaines/bons-commandes')
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : res.data?.bonsCommande;
                setBonsCommande(Array.isArray(data) ? data : []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    const organismesList = Array.from(
        new Set((bonsCommande || []).map((b) => b.organisme).filter(Boolean))
    );
    const villesList = Array.from(
        new Set((bonsCommande || []).map((b) => b.ville_execution).filter(Boolean))
    );

    const filteredBons = (bonsCommande || []).filter((b) => {
        const matchOrganisme = filterOrganisme
            ? (b.organisme || '').toLowerCase().includes(filterOrganisme.toLowerCase())
            : true;
        const matchVille = filterVille
            ? (b.ville_execution || '').toLowerCase().includes(filterVille.toLowerCase())
            : true;
        const matchType = filterType
            ? (b.type || '').toLowerCase().includes(filterType.toLowerCase())
            : true;
        return matchOrganisme && matchVille && matchType;
    });

    const handleOpenDao = (zipUrl: string) => {
        setLoadingDao(true);
        axios
            .get('/ressources-humaines/list-dao-files', { params: { zipPath: zipUrl } })
            .then((res) => {
                const files = Array.isArray(res.data) ? res.data : [];
                setDaoFiles(files);
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

    // ⚡ Bouton Actualiser : lance Selenium uniquement ici
    const handleRefresh = () => {
        setRefreshing(true);
        axios
            .get('/ressources-humaines/fetch-bons-commande')
            .then(() => {
                fetchBonsCommande();
            })
            .catch((err) => {
                console.error(err);
                setError("Erreur lors de l'actualisation");
            })
            .finally(() => setRefreshing(false));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Ressources Humaines - Bons de Commande" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Liste des Bons de Commande</h1>
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
                        <label className="block text-sm font-semibold mb-1">Organisme</label>
                        <input
                            type="text"
                            value={filterOrganisme}
                            onChange={(e) => setFilterOrganisme(e.target.value)}
                            list="organismes"
                            className="border rounded px-2 py-1 w-full"
                            placeholder="Filtrer par organisme"
                        />
                        <datalist id="organismes">
                            {organismesList.map((org, i) => (
                                <option key={i} value={org || ''} />
                            ))}
                        </datalist>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Ville</label>
                        <input
                            type="text"
                            value={filterVille}
                            onChange={(e) => setFilterVille(e.target.value)}
                            list="villes"
                            className="border rounded px-2 py-1 w-full"
                            placeholder="Filtrer par ville"
                        />
                        <datalist id="villes">
                            {villesList.map((ville, i) => (
                                <option key={i} value={ville || ''} />
                            ))}
                        </datalist>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Type</label>
                        <input
                            type="text"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="border rounded px-2 py-1 w-full"
                            placeholder="Filtrer par type"
                        />
                    </div>
                </div>

                {loading && <p>Chargement des bons de commande...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {/* Affichage des bons de commande */}
                {!loading && !error && filteredBons.length > 0 && (
                    <div className="space-y-6">
                        {filteredBons.map((bon, index) => (
                            <div key={index} className="border rounded-lg shadow-md bg-white">
                                {/* En-tête avec nouveaux champs */}
                                <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center flex-wrap gap-2">
                                    <div>
                                        <span className="font-bold">N° d'ordre :</span> {bon.n_ordre || '---'}
                                    </div>
                                    <div>
                                        <span className="font-bold">Référence :</span> {bon.reference || '---'}
                                    </div>
                                    <div>
                                        <span className="font-bold">Date/Heure limite :</span> {bon.date_heure_limite || '---'}
                                    </div>
                                </div>

                                <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                                    <p>
                                        <span className="font-bold">Organisme :</span> {bon.organisme || '---'}
                                    </p>
                                    <p>
                                        <span className="font-bold">Ville d'exécution :</span> {bon.ville_execution || '---'}
                                    </p>
                                    <p>
                                        <span className="font-bold">Observation :</span> {bon.observation || '---'}
                                    </p>
                                    <p>
                                        <span className="font-bold">Visite des lieux :</span> {bon.visite_lieux || '---'}
                                    </p>
                                    <p>
                                        <span className="font-bold">Soumission électronique :</span> {bon.soumission_electronique || '---'}
                                    </p>
                                    <p>
                                        <span className="font-bold">Objet :</span> {bon.objet || '---'}
                                    </p>
                                    <p>
                                        <span className="font-bold">Type :</span> {bon.type || '---'}
                                    </p>
                                </div>

                                <div className="p-4 border-t flex gap-2 justify-end">
                                    {bon.telechargement_dao && (
                                        <>
                                            <a
                                                href={bon.telechargement_dao}
                                                download
                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                                            >
                                                Télécharger D.A.O
                                            </a>

                                            <button
                                                onClick={() => handleOpenDao(bon.telechargement_dao!)}
                                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                                            >
                                                Ouvrir D.A.O
                                            </button>
                                        </>
                                    )}

                                    {bon.lien_cliquer_ici && (
                                        <a
                                            href={bon.lien_cliquer_ici}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                                        >
                                            Voir détails
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !error && filteredBons.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">Aucun bon de commande trouvé</p>
                        <p className="text-gray-400 text-sm mt-2">
                            {bonsCommande.length === 0
                                ? "Aucune donnée disponible. Cliquez sur 'Actualiser' pour récupérer les données."
                                : "Essayez de modifier vos filtres pour voir plus de résultats."}
                        </p>
                    </div>
                )}

                {/* Modal pour les fichiers DAO */}
                {showDaoFiles && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white p-6 rounded-lg max-h-full overflow-y-auto w-full max-w-md">
                            <h3 className="font-bold mb-4 text-lg">Fichiers D.A.O</h3>
                            {daoFiles.length > 0 ? (
                                <ul className="space-y-2">
                                    {daoFiles.map((file, i) => (
                                        <li key={i}>
                                            <button
                                                onClick={() => handleDownloadFile(file.path)}
                                                className="text-blue-600 hover:underline w-full text-left p-2 hover:bg-blue-50 rounded"
                                            >
                                                📄 {file.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">Aucun fichier trouvé dans cette archive</p>
                            )}
                            <button
                                onClick={() => setShowDaoFiles(false)}
                                className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded w-full"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading overlay pour DAO */}
                {loadingDao && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <svg
                                className="animate-spin h-12 w-12 text-white"
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
                            <span className="text-white font-bold text-lg">Chargement D.A.O...</span>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}