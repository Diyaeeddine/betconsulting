import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';


const breadcrumbs = [
    {
        title: 'Les Marchés',
        href: '/marches-marketing/marches',
    },
];

interface Projet {
    id: number;
    nom: string;
    description?: string;
    budget_total: string;
    statut: string;
}

interface MarchePageProps {
    projets?: Projet[];
}

export default function Marches({ projets = [] }: MarchePageProps) {
    const getStatusBadge = (statut: string) => {
        const statusStyles = {
            'En cours': 'bg-blue-100 text-blue-800 border-blue-200',
            Terminé: 'bg-green-100 text-green-800 border-green-200',
            'En attente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            Annulé: 'bg-red-100 text-red-800 border-red-200',
        };

        return statusStyles[statut as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
                <div className="mx-auto max-w-7xl px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="mb-2 text-3xl font-bold text-gray-900">Les Marchés</h1>
                            <p className="text-gray-600">Gérez et suivez tous vos projets en cours</p>
                        </div>
                        <div className="text-sm text-gray-500">
                            {projets.length} projet{projets.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 py-8">
                {projets.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">Aucun projet trouvé</h3>
                        <p className="mb-6 text-gray-500">Commencez par créer votre premier projet</p>
                        <button className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700">Nouveau Projet</button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {projets.map((projet) => (
                            <Link key={projet.id} href={route('marches.projet.show', projet.id)} className="group block">
                                <div className="h-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 group-hover:border-blue-300 hover:shadow-md">
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="flex-1">
                                            <h2 className="line-clamp-2 text-xl font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                                                {projet.nom}
                                            </h2>
                                        </div>
                                        <span
                                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(projet.statut)} ml-3 flex-shrink-0`}
                                        >
                                            {projet.statut}
                                        </span>
                                    </div>

                                    {projet.description && (
                                        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-600">{projet.description}</p>
                                    )}

                                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                                />
                                            </svg>
                                            Budget
                                        </div>
                                        <span className="font-semibold text-gray-900">{projet.budget_total} MAD</span>
                                    </div>

                                    <div className="mt-4 flex items-center justify-end text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                                        <span className="mr-1 text-sm font-medium">Voir détails</span>
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
