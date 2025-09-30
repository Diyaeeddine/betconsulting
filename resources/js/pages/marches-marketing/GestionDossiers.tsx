import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';
import { ChevronDown, Clock, File, Plus, Trash2, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
    role_affectation: string;
    date_affectation: string;
    salarie?: Salarie;
}

interface Tache {
    id: number;
    nom_tache: string;
    description?: string;
    statut: string;
    priorite: string;
    date_limite?: string;
    affectations: Affectation[];
    fichiers_produits?: string[];
}

interface Dossier {
    id: number;
    type_dossier: string;
    nom_dossier: string;
    statut: string;
    pourcentage_avancement: number;
    date_limite?: string;
    taches: Tache[];
}

interface Marche {
    id: number;
    reference: string;
    objet: string;
    maitre_ouvrage: string;
    date_limite_soumission: string;
    dossiers: Dossier[];
}

interface GestionDossiersProps {
    marche: Marche;
    salaries: Salarie[];
}

export default function GestionDossiers({ marche, salaries }: GestionDossiersProps) {
    const [expandedDossier, setExpandedDossier] = useState<number | null>(null);
    const [showNewTaskForm, setShowNewTaskForm] = useState<number | null>(null);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [newTask, setNewTask] = useState({
        nom_tache: '',
        description: '',
        priorite: 'moyenne',
        date_limite: '',
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleCreateTask = (dossierId: number) => {
        if (!newTask.nom_tache) {
            showNotification('error', 'Le nom de la tâche est requis');
            return;
        }

        router.post(`/marches-marketing/dossiers/${dossierId}/taches`, newTask, {
            onSuccess: () => {
                showNotification('success', 'Tâche créée avec succès');
                setShowNewTaskForm(null);
                setNewTask({ nom_tache: '', description: '', priorite: 'moyenne', date_limite: '' });
            },
            onError: () => showNotification('error', 'Erreur lors de la création'),
        });
    };

    const handleAffectTask = (tacheId: number, salarieId: number) => {
        router.post(
            `/marches-marketing/taches/${tacheId}/affecter`,
            { salarie_id: salarieId, role_affectation: 'collaborateur' },
            {
                onSuccess: () => {
                    showNotification('success', 'Tâche affectée avec succès');
                    setOpenDropdown(null);
                },
                onError: () => showNotification('error', "Erreur lors de l'affectation"),
            },
        );
    };

    const handleDeleteAffectation = (affectationId: number) => {
        router.delete(`/marches-marketing/affectations/${affectationId}`, {
            onSuccess: () => showNotification('success', 'Affectation supprimée'),
            onError: () => showNotification('error', 'Erreur lors de la suppression'),
        });
    };

    const handleDeleteTask = (tacheId: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;

        router.delete(`/marches-marketing/taches/${tacheId}`, {
            onSuccess: () => showNotification('success', 'Tâche supprimée'),
            onError: () => showNotification('error', 'Erreur lors de la suppression'),
        });
    };

    const getStatutBadge = (statut: string) => {
        const styles = {
            en_attente: 'bg-gray-100 text-gray-700',
            en_cours: 'bg-blue-100 text-blue-700',
            terminee: 'bg-green-100 text-green-700',
            validee: 'bg-green-100 text-green-700',
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

    const formatDate = (date: string | null | undefined): string => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('fr-FR');
    };

    const progressionGlobale =
        marche.dossiers.length > 0 ? Math.round(marche.dossiers.reduce((acc, d) => acc + d.pourcentage_avancement, 0) / marche.dossiers.length) : 0;

    return (
        <AppLayout>
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
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">{marche.reference}</h1>
                                <p className="mt-0.5 text-sm text-gray-600">{marche.objet}</p>
                            </div>
                            <button onClick={() => router.visit('/marches/encours')} className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50">
                                Retour
                            </button>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
                            <div>
                                <p className="text-xs text-gray-500">Maître d'ouvrage</p>
                                <p className="text-sm font-medium">{marche.maitre_ouvrage}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Date limite</p>
                                <p className="text-sm font-medium">{formatDate(marche.date_limite_soumission)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Progression globale</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                                        <div className="h-full bg-blue-600 transition-all" style={{ width: `${progressionGlobale}%` }} />
                                    </div>
                                    <span className="text-sm font-medium">{progressionGlobale}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-6 py-6">
                    <div className="space-y-4">
                        {marche.dossiers.map((dossier) => (
                            <div key={dossier.id} className="rounded-lg border bg-white">
                                <div
                                    className="cursor-pointer px-5 py-4 hover:bg-gray-50"
                                    onClick={() => setExpandedDossier(expandedDossier === dossier.id ? null : dossier.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-medium text-gray-900">{dossier.nom_dossier}</h3>
                                                <span className={`rounded-full px-2 py-0.5 text-xs ${getStatutBadge(dossier.statut)}`}>
                                                    {dossier.statut.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex items-center gap-6 text-sm text-gray-600">
                                                <span>{dossier.taches?.length || 0} tâches</span>
                                                <span>
                                                    {dossier.taches?.filter((t) => ['terminee', 'validee'].includes(t.statut)).length || 0} terminées
                                                </span>
                                                <span>Échéance: {formatDate(dossier.date_limite)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200">
                                                    <div
                                                        className="h-full bg-blue-600 transition-all"
                                                        style={{ width: `${dossier.pourcentage_avancement}%` }}
                                                    />
                                                </div>
                                                <span className="mt-1 block text-xs text-gray-600">
                                                    {Math.round(dossier.pourcentage_avancement)}%
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowNewTaskForm(showNewTaskForm === dossier.id ? null : dossier.id);
                                                }}
                                                className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Nouvelle tâche
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {showNewTaskForm === dossier.id && (
                                    <div className="border-t bg-blue-50 px-5 py-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                placeholder="Nom de la tâche *"
                                                value={newTask.nom_tache}
                                                onChange={(e) => setNewTask({ ...newTask, nom_tache: e.target.value })}
                                                className="rounded-md border px-3 py-2 text-sm"
                                            />
                                            <input
                                                type="date"
                                                value={newTask.date_limite}
                                                onChange={(e) => setNewTask({ ...newTask, date_limite: e.target.value })}
                                                className="rounded-md border px-3 py-2 text-sm"
                                            />
                                            <select
                                                value={newTask.priorite}
                                                onChange={(e) => setNewTask({ ...newTask, priorite: e.target.value })}
                                                className="rounded-md border px-3 py-2 text-sm"
                                            >
                                                <option value="faible">Priorité Faible</option>
                                                <option value="moyenne">Priorité Moyenne</option>
                                                <option value="elevee">Priorité Élevée</option>
                                            </select>
                                            <input
                                                type="text"
                                                placeholder="Description"
                                                value={newTask.description}
                                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                                className="rounded-md border px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div className="mt-3 flex gap-2">
                                            <button
                                                onClick={() => handleCreateTask(dossier.id)}
                                                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                                            >
                                                Créer la tâche
                                            </button>
                                            <button
                                                onClick={() => setShowNewTaskForm(null)}
                                                className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {expandedDossier === dossier.id && (
                                    <div className="border-t">
                                        {!dossier.taches || dossier.taches.length === 0 ? (
                                            <div className="px-5 py-8 text-center text-sm text-gray-500">
                                                Aucune tâche. Cliquez sur "Nouvelle tâche" pour commencer.
                                            </div>
                                        ) : (
                                            <div className="divide-y">
                                                {dossier.taches.map((tache) => (
                                                    <div key={tache.id} className="px-5 py-3 hover:bg-gray-50">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="text-sm font-medium">{tache.nom_tache}</h4>
                                                                    <span
                                                                        className={`rounded-full px-2 py-0.5 text-xs ${getPrioriteBadge(tache.priorite)}`}
                                                                    >
                                                                        {tache.priorite}
                                                                    </span>
                                                                    <span
                                                                        className={`rounded-full px-2 py-0.5 text-xs ${getStatutBadge(tache.statut)}`}
                                                                    >
                                                                        {tache.statut.replace('_', ' ')}
                                                                    </span>
                                                                </div>
                                                                {tache.description && (
                                                                    <p className="mt-1 text-xs text-gray-600">{tache.description}</p>
                                                                )}

                                                                <div className="mt-2 flex items-center gap-2">
                                                                    {tache.affectations?.map((aff) => (
                                                                        <div
                                                                            key={aff.id}
                                                                            className="flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-xs"
                                                                        >
                                                                            <User className="h-3 w-3" />
                                                                            <span>
                                                                                {aff.salarie?.prenom} {aff.salarie?.nom}
                                                                            </span>
                                                                            <button
                                                                                onClick={() => handleDeleteAffectation(aff.id)}
                                                                                className="ml-1 text-red-600 hover:text-red-700"
                                                                            >
                                                                                <X className="h-3 w-3" />
                                                                            </button>
                                                                        </div>
                                                                    ))}

                                                                    <div className="relative" ref={openDropdown === tache.id ? dropdownRef : null}>
                                                                        <button
                                                                            onClick={() =>
                                                                                setOpenDropdown(openDropdown === tache.id ? null : tache.id)
                                                                            }
                                                                            className="flex items-center gap-1 rounded border border-dashed px-2 py-1 text-xs hover:bg-gray-50"
                                                                        >
                                                                            + Affecter
                                                                            <ChevronDown className="h-3 w-3" />
                                                                        </button>

                                                                        {openDropdown === tache.id && (
                                                                            <div className="absolute top-full left-0 z-10 mt-1 w-64 rounded-md border bg-white shadow-lg">
                                                                                <div className="max-h-60 overflow-y-auto p-1">
                                                                                    {salaries.map((salarie) => (
                                                                                        <button
                                                                                            key={salarie.id}
                                                                                            onClick={() => handleAffectTask(tache.id, salarie.id)}
                                                                                            className="w-full rounded px-3 py-2 text-left text-sm hover:bg-blue-50"
                                                                                        >
                                                                                            <div className="font-medium">
                                                                                                {salarie.prenom} {salarie.nom}
                                                                                            </div>
                                                                                            <div className="text-xs text-gray-600">
                                                                                                {salarie.poste || salarie.email}
                                                                                            </div>
                                                                                        </button>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="ml-4 flex items-center gap-3">
                                                                {tache.date_limite && (
                                                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                        <Clock className="h-3 w-3" />
                                                                        {formatDate(tache.date_limite)}
                                                                    </div>
                                                                )}

                                                                {/* Affichage des fichiers déposés */}
                                                                {tache.fichiers_produits && tache.fichiers_produits.length > 0 ? (
                                                                    <div className="flex flex-col gap-1">
                                                                        {tache.fichiers_produits.map((fichier, index) => {
                                                                            const nomFichier = fichier.split('/').pop() || fichier;
                                                                            return (
                                                                                <div
                                                                                    key={index}
                                                                                    className="flex items-center gap-1.5 rounded-md bg-green-50 px-2.5 py-1 text-xs text-green-700"
                                                                                >
                                                                                    <File className="h-3.5 w-3.5" />
                                                                                    <span
                                                                                        className="max-w-xs truncate font-medium"
                                                                                        title={nomFichier}
                                                                                    >
                                                                                        {nomFichier}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                                                                        <X className="h-3.5 w-3.5" />
                                                                        <span>Aucun fichier</span>
                                                                    </div>
                                                                )}

                                                                <button
                                                                    onClick={() => handleDeleteTask(tache.id)}
                                                                    className="rounded p-1.5 text-red-600 hover:bg-red-50"
                                                                    title="Supprimer la tâche"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {marche.dossiers.length === 0 && (
                        <div className="rounded-lg bg-white p-12 text-center">
                            <p className="text-gray-600">Aucun dossier disponible</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
