import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle, Clock, FileText, Upload } from 'lucide-react';
import { useState } from 'react';

interface Marche {
    id: number;
    reference: string;
    objet: string;
    maitre_ouvrage: string;
    date_limite_soumission: string;
    type_marche?: string;
    zone_geographique?: string;
}

interface Dossier {
    id: number;
    type_dossier: string;
    nom_dossier: string;
    date_limite?: string;
    marche_public: Marche;
}

interface Tache {
    id: number;
    nom_tache: string;
    description?: string;
    statut: string;
    priorite: string;
    date_limite?: string;
    duree_estimee?: number;
    fichiers_produits?: string[];
}

interface Affectation {
    id: number;
    tache_dossier_id: number;
    date_affectation: string;
    date_limite_assignee?: string;
    role_affectation: string;
    tache: Tache;
}

interface DetailDossierTachesProps {
    dossier: Dossier;
    affectations: Affectation[];
    highlightedTacheId?: number; // Pour mettre en évidence une tâche spécifique
}

const breadcrumbs = [
    {
        title: 'Mes tâches',
        href: '/salarie/marches/taches',
    },
];

export default function DetailDossierTaches({ dossier, affectations, highlightedTacheId }: DetailDossierTachesProps) {
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleFileUpload = (tacheId: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        Array.from(files).forEach((file) => {
            formData.append('fichiers[]', file);
        });

        router.post(`/salarie/marches/taches/${tacheId}/upload`, formData, {
            onSuccess: () => {
                showNotification('success', 'Fichier(s) téléchargé(s) avec succès');
            },
            onError: () => {
                showNotification('error', 'Erreur lors du téléchargement');
            },
        });
    };

    const handleMarquerTerminee = (tacheId: number) => {
        if (!confirm('Confirmer que cette tâche est terminée ?')) return;

        router.post(
            `/salarie/marches/taches/${tacheId}/terminer`,
            {},
            {
                onSuccess: () => showNotification('success', 'Tâche marquée comme terminée'),
                onError: () => showNotification('error', 'Erreur lors de la mise à jour'),
            },
        );
    };

    const formatDate = (date: string | null | undefined): string => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('fr-FR');
    };

    const getStatutBadge = (statut: string) => {
        const styles = {
            en_attente: 'bg-gray-100 text-gray-700',
            en_cours: 'bg-blue-100 text-blue-700',
            terminee: 'bg-green-100 text-green-700',
            validee: 'bg-emerald-100 text-emerald-700',
        };
        return styles[statut as keyof typeof styles] || 'bg-gray-100 text-gray-700';
    };

    const getPrioriteBadge = (priorite: string) => {
        const styles = {
            elevee: 'bg-red-100 text-red-700',
            moyenne: 'bg-yellow-100 text-yellow-700',
            faible: 'bg-blue-100 text-blue-700',
        };
        return styles[priorite as keyof typeof styles] || 'bg-gray-100 text-gray-700';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen bg-gray-50">
                {notification && (
                    <div
                        className={`fixed top-4 right-4 z-50 rounded-md px-4 py-3 shadow-lg ${
                            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                    >
                        {notification.message}
                    </div>
                )}

                <div className="border-b bg-white">
                    <div className="mx-auto max-w-7xl px-6 py-4">
                        <button
                            onClick={() => router.visit('/salarie/marches/taches')}
                            className="mb-3 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour aux dossiers
                        </button>

                        <div className="flex items-start justify-between">
                            <div>
                                <div className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                                    {dossier.type_dossier.replace('_', ' ').toUpperCase()}
                                </div>
                                <h1 className="text-xl font-semibold text-gray-900">{dossier.nom_dossier}</h1>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
                            <div>
                                <p className="text-xs text-gray-500">Référence AO</p>
                                <p className="text-sm font-medium">{dossier.marche_public.reference}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Maître d'ouvrage</p>
                                <p className="text-sm font-medium">{dossier.marche_public.maitre_ouvrage}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Date limite</p>
                                <p className="text-sm font-medium">{formatDate(dossier.date_limite)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-6 py-6">
                    <div className="space-y-4">
                        {affectations.map((affectation) => {
                            const tache = affectation.tache;
                            const isTerminee = ['terminee', 'validee'].includes(tache.statut);
                            const isHighlighted = highlightedTacheId === tache.id;

                            return (
                                <div
                                    key={affectation.id}
                                    id={`tache-${tache.id}`}
                                    className={`rounded-lg border bg-white p-5 transition-all ${
                                        isHighlighted ? 'shadow-lg ring-2 ring-blue-500' : ''
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-medium text-gray-900">{tache.nom_tache}</h3>
                                                <span className={`rounded-full px-2.5 py-0.5 text-xs ${getPrioriteBadge(tache.priorite)}`}>
                                                    {tache.priorite}
                                                </span>
                                                <span className={`rounded-full px-2.5 py-0.5 text-xs ${getStatutBadge(tache.statut)}`}>
                                                    {tache.statut.replace('_', ' ')}
                                                </span>
                                            </div>

                                            {tache.description && <p className="mt-2 text-sm text-gray-600">{tache.description}</p>}

                                            <div className="mt-3 flex items-center gap-6 text-sm text-gray-600">
                                                {tache.date_limite && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>Échéance: {formatDate(tache.date_limite)}</span>
                                                    </div>
                                                )}
                                                {tache.duree_estimee && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="h-4 w-4" />
                                                        <span>Durée estimée: {tache.duree_estimee}h</span>
                                                    </div>
                                                )}
                                            </div>

                                            {tache.fichiers_produits && tache.fichiers_produits.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="mb-2 text-xs font-medium text-gray-500">Fichiers déposés:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {tache.fichiers_produits.map((fichier, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-1.5">
                                                                <FileText className="h-4 w-4 text-green-600" />
                                                                <span className="text-sm text-green-700">{fichier.split('/').pop()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="ml-4 flex flex-col gap-2">
                                            {!isTerminee && (
                                                <>
                                                    <label
                                                        htmlFor={`upload-${tache.id}`}
                                                        className="flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                                                    >
                                                        <Upload className="h-4 w-4" />
                                                        Déposer fichier(s)
                                                    </label>
                                                    <input
                                                        id={`upload-${tache.id}`}
                                                        type="file"
                                                        multiple
                                                        className="hidden"
                                                        onChange={(e) => handleFileUpload(tache.id, e)}
                                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                                    />

                                                    {tache.fichiers_produits && tache.fichiers_produits.length > 0 && (
                                                        <button
                                                            onClick={() => handleMarquerTerminee(tache.id)}
                                                            className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                            Marquer terminée
                                                        </button>
                                                    )}
                                                </>
                                            )}

                                            {isTerminee && (
                                                <div className="flex items-center gap-2 rounded-md bg-green-100 px-4 py-2 text-sm text-green-700">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Tâche terminée
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}