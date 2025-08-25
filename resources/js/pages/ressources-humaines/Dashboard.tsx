import React, { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

const breadcrumbs = [
    {
        title: 'Dashboard Ressources Humaines & Gestion des Compétences',
        href: '/ressources-humaines/dashboard',
    },
];

type Projet = {
    [key: string]: string | null;
};

export default function RessourcesHumaines() {
    const [projets, setProjets] = useState<Projet[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
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
                const allKeys = new Set<string>();
                data.forEach((proj) => Object.keys(proj).forEach((key) => allKeys.add(key)));
                setColumns(Array.from(allKeys));
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Ressources Humaines & Gestion des Compétences" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-2xl font-bold mb-4">
                    Dashboard Ressources Humaines & Gestion des Compétences
                </h1>

                {loading && <p>Chargement des projets...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {!loading && !error && projets.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300">
                            <thead className="bg-gray-100">
                                <tr>
                                    {columns.map((col, i) => (
                                        <th key={i} className="border px-4 py-2 text-left">{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {projets.map((projet, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        {columns.map((col, i) => (
                                            <td key={i} className="border px-4 py-2">
                                                {projet[col] ?? ''}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
