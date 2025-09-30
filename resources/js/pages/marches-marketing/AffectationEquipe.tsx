import { router } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Clock, User, UserCheck, UserPlus } from 'lucide-react';
import { useState } from 'react';

interface Salarie {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    poste?: string;
    nom_profil?: string;
}

interface Affectation {
    id: number;
    salarie_id: number;
    tache_dossier_id: number;
    role_affectation: string;
    date_affectation: string;
    salarie: Salarie;
}

interface Tache {
    id: number;
    nom_tache: string;
    description?: string;
    priorite: string;
    statut: string;
    dossier_marche_id: number;
    affectations: Affectation[];
    dossier: {
        nom_dossier: string;
        type_dossier: string;
    };
}

interface Dossier {
    id: number;
    nom_dossier: string;
    type_dossier: string;
    marche_public: {
        id: number;
        reference: string;
        objet: string;
    };
}

interface AffectationEquipeProps {
    dossier: Dossier;
    taches: Tache[];
    salaries: Salarie[];
}

export default function AffectationEquipe({ dossier, taches, salaries }: AffectationEquipeProps) {
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [selectedTache, setSelectedTache] = useState<number | null>(null);
    const [selectedSalarie, setSelectedSalarie] = useState<number | null>(null);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleAffectation = async () => {
        if (!selectedTache || !selectedSalarie) return;

        setLoading(true);
        try {
            router.post(
                `/marches/taches/${selectedTache}/affecter`,
                {
                    salarie_id: selectedSalarie,
                    role_affectation: 'collaborateur',
                },
                {
                    onSuccess: () => {
                        showNotification('success', 'Tâche affectée avec succès');
                        setSelectedTache(null);
                        setSelectedSalarie(null);
                    },
                    onError: () => {
                        showNotification('error', "Erreur lors de l'affectation");
                    },
                    onFinish: () => setLoading(false),
                },
            );
        } catch (error) {
            setLoading(false);
            showNotification('error', 'Une erreur inattendue est survenue');
        }
    };

    const handleDesaffectation = async (affectationId: number) => {
        setLoading(true);
        try {
            router.delete(`/marches/affectations/${affectationId}`, {
                onSuccess: () => {
                    showNotification('success', 'Affectation supprimée avec succès');
                },
                onError: () => {
                    showNotification('error', 'Erreur lors de la désaffectation');
                },
                onFinish: () => setLoading(false),
            });
        } catch (error) {
            setLoading(false);
        }
    };

    const getPrioriteColor = (priorite: string) => {
        switch (priorite) {
            case 'elevee':
                return 'text-red-600 bg-red-100';
            case 'moyenne':
                return 'text-yellow-600 bg-yellow-100';
            case 'faible':
                return 'text-green-600 bg-green-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatutColor = (statut: string) => {
        switch (statut) {
            case 'terminee':
                return 'text-green-600';
            case 'en_cours':
                return 'text-blue-600';
            case 'en_attente':
                return 'text-orange-600';
            default:
                return 'text-gray-600';
        }
    };

    const tachesNonAssignees = taches.filter((t) => t.affectations.length === 0);
    const tachesAssignees = taches.filter((t) => t.affectations.length > 0);
    const salariesOccupes = [...new Set(tachesAssignees.flatMap((t) => t.affectations.map((a) => a.salarie_id)))];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Notification */}
            {notification && (
                <div
                    className={`fixed top-4 right-4 z-50 rounded-lg p-4 shadow-lg ${
                        notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}
                >
                    {notification.message}
                </div>
            )}

            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Affectation d'Équipe - {dossier.nom_dossier}</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                {dossier.marche_public.reference} - {dossier.marche_public.objet}
                            </p>
                        </div>
                        <button
                            onClick={() => router.visit(`/marches/${dossier.marche_public.id}/dossiers`)}
                            className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
                        >
                            Retour aux dossiers
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Statistics */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="flex items-center">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{tachesAssignees.length}</p>
                                <p className="text-gray-600">Tâches assignées</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="flex items-center">
                            <AlertTriangle className="h-8 w-8 text-orange-500" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{tachesNonAssignees.length}</p>
                                <p className="text-gray-600">Non assignées</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="flex items-center">
                            <User className="h-8 w-8 text-blue-500" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{salariesOccupes.length}</p>
                                <p className="text-gray-600">Salariés mobilisés</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="flex items-center">
                            <Clock className="h-8 w-8 text-purple-500" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{taches.length}</p>
                                <p className="text-gray-600">Total tâches</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Affectation rapide */}
                    <div className="rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-6">
                            <h2 className="flex items-center text-lg font-semibold text-gray-900">
                                <UserPlus className="mr-2 h-5 w-5" />
                                Nouvelle Affectation
                            </h2>
                        </div>
                        <div className="space-y-6 p-6">
                            {/* Sélection de la tâche */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Sélectionner une tâche non assignée</label>
                                <select
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                    value={selectedTache || ''}
                                    onChange={(e) => setSelectedTache(Number(e.target.value) || null)}
                                >
                                    <option value="">Choisir une tâche...</option>
                                    {tachesNonAssignees.map((tache) => (
                                        <option key={tache.id} value={tache.id}>
                                            {tache.nom_tache} ({tache.dossier.nom_dossier})
                                        </option>
                                    ))}
                                </select>
                                {tachesNonAssignees.length === 0 && (
                                    <p className="mt-1 text-sm text-gray-500">Toutes les tâches sont déjà assignées</p>
                                )}
                            </div>

                            {/* Sélection du salarié */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Sélectionner un salarié</label>
                                <select
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                    value={selectedSalarie || ''}
                                    onChange={(e) => setSelectedSalarie(Number(e.target.value) || null)}
                                >
                                    <option value="">Choisir un salarié...</option>
                                    {salaries.map((salarie) => (
                                        <option key={salarie.id} value={salarie.id}>
                                            {salarie.prenom} {salarie.nom} - {salarie.poste}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Bouton d'affectation */}
                            <button
                                onClick={handleAffectation}
                                disabled={!selectedTache || !selectedSalarie || loading}
                                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? 'Affectation en cours...' : 'Affecter la tâche'}
                            </button>
                        </div>
                    </div>

                    {/* Liste des salariés disponibles */}
                    <div className="rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900">Salariés Disponibles ({salaries.length})</h2>
                        </div>
                        <div className="p-6">
                            <div className="max-h-96 space-y-3 overflow-y-auto">
                                {salaries.map((salarie) => {
                                    const isOccupe = salariesOccupes.includes(salarie.id);
                                    const nombreTaches = tachesAssignees.filter((t) =>
                                        t.affectations.some((a) => a.salarie_id === salarie.id),
                                    ).length;

                                    return (
                                        <div
                                            key={salarie.id}
                                            className={`flex items-center justify-between rounded-lg border p-3 ${
                                                isOccupe ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div
                                                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                                            isOccupe ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                    >
                                                        <span className="text-sm font-medium">
                                                            {salarie.prenom[0]}
                                                            {salarie.nom[0]}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {salarie.prenom} {salarie.nom}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{salarie.poste}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {isOccupe ? (
                                                    <div>
                                                        <UserCheck className="mr-1 inline-block h-4 w-4 text-blue-600" />
                                                        <span className="text-sm font-medium text-blue-600">
                                                            {nombreTaches} tâche{nombreTaches > 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">Disponible</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tableau des affectations actuelles */}
                <div className="mt-8 rounded-lg bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900">Affectations Actuelles ({tachesAssignees.length})</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Tâche</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Dossier</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Priorité</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Statut</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Assigné à</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Date affectation
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {tachesAssignees.map((tache) => (
                                    <tr key={tache.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{tache.nom_tache}</div>
                                                {tache.description && (
                                                    <div className="max-w-xs truncate text-sm text-gray-500">{tache.description}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{tache.dossier.nom_dossier}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPrioriteColor(tache.priorite)}`}
                                            >
                                                {tache.priorite}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-sm font-medium ${getStatutColor(tache.statut)}`}>
                                                {tache.statut.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col space-y-1">
                                                {tache.affectations.map((affectation) => (
                                                    <div key={affectation.id} className="flex items-center space-x-2">
                                                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                                                            <span className="text-xs font-medium text-blue-600">
                                                                {affectation.salarie.prenom[0]}
                                                                {affectation.salarie.nom[0]}
                                                            </span>
                                                        </div>
                                                        <span className="text-sm text-gray-900">
                                                            {affectation.salarie.prenom} {affectation.salarie.nom}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                            {tache.affectations[0] && new Date(tache.affectations[0].date_affectation).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                            {tache.affectations.map((affectation) => (
                                                <button
                                                    key={affectation.id}
                                                    onClick={() => handleDesaffectation(affectation.id)}
                                                    className="ml-2 text-red-600 hover:text-red-900"
                                                >
                                                    Désaffecter
                                                </button>
                                            ))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {tachesAssignees.length === 0 && (
                            <div className="py-12 text-center">
                                <UserCheck className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                <h3 className="mb-2 text-lg font-medium text-gray-900">Aucune affectation</h3>
                                <p className="text-gray-500">Commencez par affecter des tâches aux membres de l'équipe.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tâches non assignées */}
                {tachesNonAssignees.length > 0 && (
                    <div className="mt-8 rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-6">
                            <h2 className="flex items-center text-lg font-semibold text-gray-900">
                                <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                                Tâches Non Assignées ({tachesNonAssignees.length})
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {tachesNonAssignees.map((tache) => (
                                    <div key={tache.id} className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="mb-1 font-medium text-gray-900">{tache.nom_tache}</h3>
                                                <p className="mb-2 text-sm text-gray-600">{tache.dossier.nom_dossier}</p>
                                                <div className="flex items-center space-x-2">
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPrioriteColor(tache.priorite)}`}
                                                    >
                                                        {tache.priorite}
                                                    </span>
                                                    <span className={`text-xs font-medium ${getStatutColor(tache.statut)}`}>
                                                        {tache.statut.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedTache(tache.id);
                                                    document.querySelector('select')?.focus();
                                                }}
                                                className="ml-3 text-orange-600 hover:text-orange-800"
                                                title="Sélectionner pour affectation"
                                            >
                                                <UserPlus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
