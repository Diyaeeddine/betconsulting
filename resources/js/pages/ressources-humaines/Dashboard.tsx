import React, { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

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

    // ✅ Fonction pour parser le champ "Support"
    const parseSupport = (supportString: string): SupportItem[] => {
        const cleaned = supportString.replace(/\|/g, '\n');
        const lines = cleaned.split('\n').filter((line) => line.trim() !== '');
        const items: SupportItem[] = [];

        lines.forEach((line) => {
            const parts = line.trim().split(' ');
            if (parts.length >= 3) {
                const support = parts[0] + (parts[1] === 'WEB' ? ' WEB' : '');
                const date = parts[parts[1] === 'WEB' ? 2 : 1];
                const pageColonne = parts[parts[1] === 'WEB' ? 3 : 2];
                items.push({ support, date, pageColonne });
            }
        });

        return items;
    };

    // ✅ Fonction pour télécharger, décompresser et rezipper
    const handleDownloadAndRezip = async (url: string, projectName: string) => {
    try {
        // On passe par le proxy Laravel
        const proxyUrl = `/ressources-humaines/proxy-download?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);

        if (!response.ok) throw new Error('Erreur lors du téléchargement du fichier via proxy');

        const blob = await response.blob();
        const originalZip = await JSZip.loadAsync(blob);
        const newZip = new JSZip();

        for (const [relativePath, file] of Object.entries(originalZip.files)) {
            if (!file.dir) {
                const content = await file.async('blob');
                newZip.file(relativePath, content);
            }
        }

        const finalBlob = await newZip.generateAsync({ type: 'blob' });
        const fileName = projectName
            ? `Dossier_DAO_${projectName.replace(/\s+/g, '_')}.zip`
            : 'Dossier_DAO.zip';

        saveAs(finalBlob, fileName);
        alert('Le dossier a été téléchargé et recompressé avec succès.');
    } catch (error) {
        console.error('Erreur lors du processus :', error);
        alert('Une erreur est survenue lors du téléchargement ou de la recompression.');
    }
};



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Ressources Humaines & Gestion des Compétences" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-2xl font-bold mb-4">
                    Liste des Projets
                </h1>

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
                                    {/* HEADER */}
                                    <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
                                        <div>
                                            <span className="font-bold">N° ordre :</span>{' '}
                                            {index + 1}
                                        </div>
                                        <div>
                                            <span className="font-bold">Date/Heure limite :</span>{' '}
                                            {projet['Visite des lieux ']?.split('|')[0] || '---'}
                                        </div>
                                    </div>

                                    {/* INFORMATIONS */}
                                    <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                                        <p><span className="font-bold">Organisme :</span> {projet['Organisme ']}</p>
                                        <p><span className="font-bold">Objet :</span> {projet['Objet ']}</p>
                                        <p><span className="font-bold">Ville d'exécution :</span> {projet["Ville d'exécution "]}</p>
                                        {projet['Allotissement '] && (
                                            <p><span className="font-bold">Allotissement :</span> {projet['Allotissement ']}</p>
                                        )}
                                        <p><span className="font-bold">Contact :</span> {projet['Contact ']}</p>
                                        <p><span className="font-bold">Budget :</span> {projet['Budget ']}</p>
                                        <p><span className="font-bold">Type :</span> {projet['Type ']}</p>
                                        {projet['Obsérvation '] && (
                                            <p><span className="font-bold">Observation :</span> {projet['Obsérvation ']}</p>
                                        )}
                                    </div>

                                    {/* SUPPORT */}
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

                                    {/* BOUTON TELECHARGER */}
                                    {projet['Téléchargement'] && (
                                        <div className="p-4 border-t flex justify-end">
                                            <button
                                                onClick={() =>
                                                    handleDownloadAndRezip(projet['Téléchargement']!, projet['Objet '] || '')
                                                }
                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                                            >
                                                Télécharger D.A.O
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
