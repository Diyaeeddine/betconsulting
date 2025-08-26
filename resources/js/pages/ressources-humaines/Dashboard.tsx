import React, { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import axios from 'axios';

const breadcrumbs = [
    {
        title: 'Dashboard Ressources Humaines & Liste des Projets ',
        href: '/ressources-humaines/dashboard',
    },
];

type Projet = {
    [key: string]: string | null;
};

type SupportItem = {
    support: string;
    date: string;
    pageColonne: string;
};

export default function RessourcesHumaines() {
    const [projets, setProjets] = useState<Projet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [daoFiles, setDaoFiles] = useState<{ name: string; path: string }[]>([]);
    const [showDaoFiles, setShowDaoFiles] = useState(false);
    const [currentZip, setCurrentZip] = useState<string | null>(null);
    const [loadingDao, setLoadingDao] = useState(false);

    useEffect(() => {
        fetch('/storage/projets.json')
            .then((res) => {
                if (!res.ok) throw new Error('Erreur chargement du fichier JSON');
                return res.json();
            })
            .then((data: Projet[]) => {
                setProjets(data);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const parseSupport = (supportString: string): SupportItem[] => {
        const cleaned = supportString.replace(/\|/g, '\n');
        const lines = cleaned.split('\n').filter((line) => line.trim() !== '');
        const items: SupportItem[] = [];

        lines.forEach((line) => {
            const parts = line.trim().split(' ');
            if (parts.length >= 3) {
                const support = parts[0] + (parts[1] === 'WEB' ? ' WEB' : '');
                const date = parts[1] === 'WEB' ? parts[2] : parts[1];
                const pageColonne = parts[1] === 'WEB' ? parts[3] : parts[2];
                items.push({ support, date, pageColonne });
            }
        });

        return items;
    };

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Ressources Humaines & Gestion des Compétences" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-2xl font-bold mb-4">Liste des Projets</h1>

                {loading && <p>Chargement des projets...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {!loading && !error && projets.length > 0 && (
                    <div className="space-y-6">
                        {projets.map((projet, index) => {
                            const supportItems = projet['Support']
                                ? parseSupport(projet['Support'])
                                : [];

                            return (
                                <div key={index} className="border rounded-lg shadow-md bg-white">
                                    <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
                                        <div>
                                            <span className="font-bold">N° ordre :</span> {index + 1}
                                        </div>
                                        <div>
                                            <span className="font-bold">Date/Heure limite :</span>{' '}
                                            {projet['Visite des lieux ']?.split('|')[0] || '---'}
                                        </div>
                                    </div>

                                    <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                                        <p>
                                            <span className="font-bold">Organisme :</span>{' '}
                                            {projet['Organisme ']}
                                        </p>
                                        <p>
                                            <span className="font-bold">Objet :</span> {projet['Objet ']}
                                        </p>
                                        <p>
                                            <span className="font-bold">Ville d'exécution :</span>{' '}
                                            {projet["Ville d'exécution "]}
                                        </p>
                                        {projet['Allotissement '] && (
                                            <p>
                                                <span className="font-bold">Allotissement :</span>{' '}
                                                {projet['Allotissement ']}
                                            </p>
                                        )}
                                        <p>
                                            <span className="font-bold">Contact :</span>{' '}
                                            {projet['Contact ']}
                                        </p>
                                        <p>
                                            <span className="font-bold">Budget :</span> {projet['Budget ']}
                                        </p>
                                        <p>
                                            <span className="font-bold">Type :</span> {projet['Type ']}
                                        </p>
                                        {projet['Obsérvation '] && (
                                            <p>
                                                <span className="font-bold">Observation :</span>{' '}
                                                {projet['Obsérvation ']}
                                            </p>
                                        )}
                                    </div>

                                    {supportItems.length > 0 && (
                                        <div className="p-4 border-t">
                                            <h3 className="font-semibold mb-2">SUPPORT DU PAGE/COLONNE</h3>
                                            <table className="w-full border border-gray-300 text-sm">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="border px-2 py-1">SUPPORT</th>
                                                        <th className="border px-2 py-1">DU</th>
                                                        <th className="border px-2 py-1">PAGE/COLONNE</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {supportItems.map((item, i) => (
                                                        <tr key={i}>
                                                            <td className="border px-2 py-1">{item.support}</td>
                                                            <td className="border px-2 py-1">{item.date}</td>
                                                            <td className="border px-2 py-1">{item.pageColonne}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {projet['Téléchargement'] && (
                                        <div className="p-4 border-t flex gap-2 justify-end">
                                            <a
                                                href={projet['Téléchargement']!} // ← correction TS
                                                download
                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                                            >
                                                Télécharger D.A.O
                                            </a>

                                            <button
                                                onClick={() =>
                                                    projet['Téléchargement'] &&
                                                    handleOpenDao(projet['Téléchargement'])
                                                }
                                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                                            >
                                                Ouvrir D.A.O
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
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
                                            {file.name}
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
