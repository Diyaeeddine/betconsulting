import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';
import { ChevronDown, Clock, Download, FileText, FolderPlus, Plus, Trash2, User, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Salarie {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    poste?: string;
}

interface Affectation {
    id: number;
    salarie_id: number;
    role_affectation: string;
    date_affectation: string;
    date_limite_assignee?: string;
    duree_estimee_affectation?: number;
    unite_duree_affectation?: string;
    description_affectation?: string;
    salarie?: Salarie;
}

interface Tache {
    id: number;
    nom_tache: string;
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

export default function GestionDossiers({ marche, salaries }: { marche: Marche; salaries: Salarie[] }) {
    const [expandedDossier, setExpandedDossier] = useState<number | null>(null);
    const [showNewTaskForm, setShowNewTaskForm] = useState<number | null>(null);
    const [showNewDossierForm, setShowNewDossierForm] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [newTask, setNewTask] = useState({
        nom_tache: '',
        priorite: 'moyenne',
        date_limite: '',
    });

    const [newDossier, setNewDossier] = useState({
        type_dossier: 'administratif',
        nom_dossier: '',
        description: '',
        date_limite: '',
    });

    const [affectationForm, setAffectationForm] = useState<
        Record<
            number,
            {
                date_limite_assignee: string;
                duree_estimee: string;
                unite_duree: 'heures' | 'jours';
                description_affectation: string;
            }
        >
    >({});

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const progressionGlobale = useMemo(() => {
        if (!marche.dossiers || marche.dossiers.length === 0) return 0;
        const somme = marche.dossiers.reduce((acc, d) => acc + (Number(d.pourcentage_avancement) || 0), 0);
        const moyenne = somme / marche.dossiers.length;
        return Math.round(moyenne);
    }, [marche.dossiers]);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const initAffectationForm = (tacheId: number) => {
        if (!affectationForm[tacheId]) {
            setAffectationForm((prev) => ({
                ...prev,
                [tacheId]: {
                    date_limite_assignee: '',
                    duree_estimee: '',
                    unite_duree: 'heures',
                    description_affectation: '',
                },
            }));
        }
    };

    const handleCreateDossier = () => {
        if (!newDossier.nom_dossier) {
            showNotification('error', 'Le nom du dossier est requis');
            return;
        }
        router.post(`/marches-marketing/${marche.id}/dossiers`, newDossier, {
            preserveScroll: true,
            onSuccess: () => {
                showNotification('success', 'Dossier créé avec succès');
                setShowNewDossierForm(false);
                setNewDossier({ type_dossier: 'administratif', nom_dossier: '', description: '', date_limite: '' });
            },
            onError: () => showNotification('error', 'Erreur lors de la création'),
        });
    };

    const handleCreateTask = (dossierId: number) => {
        if (!newTask.nom_tache) {
            showNotification('error', 'Le nom de la tâche est requis');
            return;
        }
        router.post(`/marches-marketing/dossiers/${dossierId}/taches`, newTask, {
            preserveScroll: true,
            onSuccess: () => {
                showNotification('success', 'Tâche créée avec succès');
                setShowNewTaskForm(null);
                setNewTask({ nom_tache: '', priorite: 'moyenne', date_limite: '' });
            },
            onError: () => showNotification('error', 'Erreur lors de la création'),
        });
    };

    const handleAffectTask = (tacheId: number, salarieId: number) => {
        const form = affectationForm[tacheId] || {
            date_limite_assignee: '',
            duree_estimee: '',
            unite_duree: 'heures',
            description_affectation: '',
        };

        router.post(
            `/marches-marketing/taches/${tacheId}/affecter`,
            {
                salarie_id: salarieId,
                role_affectation: 'collaborateur',
                date_limite_assignee: form.date_limite_assignee || undefined,
                duree_estimee: form.duree_estimee || undefined,
                unite_duree: form.unite_duree,
                description_affectation: form.description_affectation || undefined,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    showNotification('success', 'Tâche affectée avec succès');
                    setOpenDropdown(null);
                    setAffectationForm((prev) => {
                        const updated = { ...prev };
                        delete updated[tacheId];
                        return updated;
                    });
                },
                onError: () => showNotification('error', "Erreur lors de l'affectation"),
            },
        );
    };

    const handleDeleteAffectation = (affectationId: number) => {
        router.delete(`/marches-marketing/affectations/${affectationId}`, {
            preserveScroll: true,
            onSuccess: () => showNotification('success', 'Affectation supprimée'),
            onError: () => showNotification('error', 'Erreur lors de la suppression'),
        });
    };

    const handleDeleteTask = (tacheId: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;
        router.delete(`/marches-marketing/taches/${tacheId}`, {
            preserveScroll: true,
            onSuccess: () => showNotification('success', 'Tâche supprimée'),
            onError: () => showNotification('error', 'Erreur lors de la suppression'),
        });
    };

    const handleDownloadFile = (fichier: string) => {
        window.open(`/storage/${fichier}`, '_blank');
    };

    const getStatutBadge = (statut: string) => {
        const styles = {
            en_attente: 'bg-gray-100 text-gray-700',
            en_cours: 'bg-blue-100 text-blue-700',
            terminee: 'bg-green-100 text-green-700',
            termine: 'bg-green-100 text-green-700',
            validee: 'bg-green-100 text-green-700',
            valide: 'bg-green-100 text-green-700',
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

    const formaterDuree = (duree?: number, unite?: string): string => {
        if (!duree) return '-';
        return unite === 'jours' ? `${duree}j` : `${duree}h`;
    };

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
                    <div className="mb-4 flex justify-end">
                        <button
                            onClick={() => setShowNewDossierForm(!showNewDossierForm)}
                            className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                        >
                            <FolderPlus className="h-4 w-4" />
                            Créer un nouveau dossier
                        </button>
                    </div>

                    {showNewDossierForm && (
                        <div className="mb-4 rounded-lg border bg-white p-4">
                            <h3 className="mb-3 font-medium">Nouveau dossier</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    value={newDossier.type_dossier}
                                    onChange={(e) => setNewDossier({ ...newDossier, type_dossier: e.target.value })}
                                    className="rounded-md border px-3 py-2 text-sm"
                                >
                                    <option value="administratif">Administratif</option>
                                    <option value="technique">Technique</option>
                                    <option value="offre_technique">Offre Technique</option>
                                    <option value="financier">Financier</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Nom du dossier *"
                                    value={newDossier.nom_dossier}
                                    onChange={(e) => setNewDossier({ ...newDossier, nom_dossier: e.target.value })}
                                    className="rounded-md border px-3 py-2 text-sm"
                                />
                                <input
                                    type="date"
                                    value={newDossier.date_limite}
                                    onChange={(e) => setNewDossier({ ...newDossier, date_limite: e.target.value })}
                                    className="rounded-md border px-3 py-2 text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Description"
                                    value={newDossier.description}
                                    onChange={(e) => setNewDossier({ ...newDossier, description: e.target.value })}
                                    className="rounded-md border px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="mt-3 flex gap-2">
                                <button
                                    onClick={handleCreateDossier}
                                    className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                                >
                                    Créer le dossier
                                </button>
                                <button onClick={() => setShowNewDossierForm(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50">
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}

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
                                                className="col-span-2 rounded-md border px-3 py-2 text-sm"
                                            >
                                                <option value="faible">Priorité Faible</option>
                                                <option value="moyenne">Priorité Moyenne</option>
                                                <option value="elevee">Priorité Élevée</option>
                                            </select>
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

                                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                                    {tache.affectations?.map((aff) => (
                                                                        <div key={aff.id} className="group relative">
                                                                            <div className="flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-xs">
                                                                                <User className="h-3 w-3" />
                                                                                <span>
                                                                                    {aff.salarie?.prenom} {aff.salarie?.nom}
                                                                                </span>
                                                                                {(aff.duree_estimee_affectation || aff.date_limite_assignee) && (
                                                                                    <span className="ml-1 text-blue-600">
                                                                                        (
                                                                                        {aff.duree_estimee_affectation &&
                                                                                            formaterDuree(
                                                                                                aff.duree_estimee_affectation,
                                                                                                aff.unite_duree_affectation,
                                                                                            )}
                                                                                        {aff.duree_estimee_affectation &&
                                                                                            aff.date_limite_assignee &&
                                                                                            ' - '}
                                                                                        {aff.date_limite_assignee &&
                                                                                            formatDate(aff.date_limite_assignee)}
                                                                                        )
                                                                                    </span>
                                                                                )}
                                                                                <button
                                                                                    onClick={() => handleDeleteAffectation(aff.id)}
                                                                                    className="ml-1 text-red-600 hover:text-red-700"
                                                                                >
                                                                                    <X className="h-3 w-3" />
                                                                                </button>
                                                                            </div>
                                                                            {aff.description_affectation && (
                                                                                <div className="invisible absolute top-full left-0 z-10 mt-1 w-64 rounded-md border bg-white p-2 text-xs shadow-lg group-hover:visible">
                                                                                    {aff.description_affectation}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}

                                                                    <div className="relative" ref={openDropdown === tache.id ? dropdownRef : null}>
                                                                        <button
                                                                            onClick={() => {
                                                                                initAffectationForm(tache.id);
                                                                                setOpenDropdown(openDropdown === tache.id ? null : tache.id);
                                                                            }}
                                                                            className="flex items-center gap-1 rounded border border-dashed px-2 py-1 text-xs hover:bg-gray-50"
                                                                        >
                                                                            + Affecter
                                                                            <ChevronDown className="h-3 w-3" />
                                                                        </button>

                                                                        {openDropdown === tache.id && (
                                                                            <div className="absolute top-full left-0 z-10 mt-1 w-96 rounded-md border bg-white shadow-lg">
                                                                                <div className="space-y-2 border-b p-3">
                                                                                    <div>
                                                                                        <label className="mb-1 block text-xs font-medium text-gray-700">
                                                                                            Date limite
                                                                                        </label>
                                                                                        <input
                                                                                            type="date"
                                                                                            value={
                                                                                                affectationForm[tache.id]?.date_limite_assignee || ''
                                                                                            }
                                                                                            onChange={(e) =>
                                                                                                setAffectationForm((prev) => ({
                                                                                                    ...prev,
                                                                                                    [tache.id]: {
                                                                                                        ...prev[tache.id],
                                                                                                        date_limite_assignee: e.target.value,
                                                                                                    },
                                                                                                }))
                                                                                            }
                                                                                            className="w-full rounded-md border px-2 py-1.5 text-xs"
                                                                                            min={new Date().toISOString().split('T')[0]}
                                                                                        />
                                                                                    </div>
                                                                                    <div className="grid grid-cols-2 gap-2">
                                                                                        <div>
                                                                                            <label className="mb-1 block text-xs font-medium text-gray-700">
                                                                                                Durée estimée
                                                                                            </label>
                                                                                            <input
                                                                                                type="number"
                                                                                                step="0.5"
                                                                                                min="0"
                                                                                                placeholder="Durée"
                                                                                                value={affectationForm[tache.id]?.duree_estimee || ''}
                                                                                                onChange={(e) =>
                                                                                                    setAffectationForm((prev) => ({
                                                                                                        ...prev,
                                                                                                        [tache.id]: {
                                                                                                            ...prev[tache.id],
                                                                                                            duree_estimee: e.target.value,
                                                                                                        },
                                                                                                    }))
                                                                                                }
                                                                                                className="w-full rounded-md border px-2 py-1.5 text-xs"
                                                                                            />
                                                                                        </div>
                                                                                        <div>
                                                                                            <label className="mb-1 block text-xs font-medium text-gray-700">
                                                                                                Unité
                                                                                            </label>
                                                                                            <select
                                                                                                value={
                                                                                                    affectationForm[tache.id]?.unite_duree || 'heures'
                                                                                                }
                                                                                                onChange={(e) =>
                                                                                                    setAffectationForm((prev) => ({
                                                                                                        ...prev,
                                                                                                        [tache.id]: {
                                                                                                            ...prev[tache.id],
                                                                                                            unite_duree: e.target.value as
                                                                                                                | 'heures'
                                                                                                                | 'jours',
                                                                                                        },
                                                                                                    }))
                                                                                                }
                                                                                                className="w-full rounded-md border px-2 py-1.5 text-xs"
                                                                                            >
                                                                                                <option value="heures">Heures</option>
                                                                                                <option value="jours">Jours</option>
                                                                                            </select>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div>
                                                                                        <label className="mb-1 block text-xs font-medium text-gray-700">
                                                                                            Instructions / Description
                                                                                        </label>
                                                                                        <textarea
                                                                                            value={
                                                                                                affectationForm[tache.id]?.description_affectation ||
                                                                                                ''
                                                                                            }
                                                                                            onChange={(e) =>
                                                                                                setAffectationForm((prev) => ({
                                                                                                    ...prev,
                                                                                                    [tache.id]: {
                                                                                                        ...prev[tache.id],
                                                                                                        description_affectation: e.target.value,
                                                                                                    },
                                                                                                }))
                                                                                            }
                                                                                            placeholder="Instructions spécifiques pour cette affectation..."
                                                                                            className="w-full rounded-md border px-2 py-1.5 text-xs"
                                                                                            rows={2}
                                                                                        />
                                                                                    </div>
                                                                                </div>
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

                                                                {tache.fichiers_produits && tache.fichiers_produits.length > 0 ? (
                                                                    <div className="flex flex-col gap-1">
                                                                        {tache.fichiers_produits.map((fichier, index) => {
                                                                            const nomFichier = fichier.split('/').pop() || fichier;
                                                                            return (
                                                                                <button
                                                                                    key={index}
                                                                                    onClick={() => handleDownloadFile(fichier)}
                                                                                    className="flex items-center gap-1.5 rounded-md bg-green-50 px-2.5 py-1 text-xs text-green-700 transition-colors hover:bg-green-100"
                                                                                    title="Cliquer pour télécharger"
                                                                                >
                                                                                    <Download className="h-3.5 w-3.5" />
                                                                                    <span
                                                                                        className="max-w-xs truncate font-medium"
                                                                                        title={nomFichier}
                                                                                    >
                                                                                        {nomFichier}
                                                                                    </span>
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                                                                        <FileText className="h-3.5 w-3.5" />
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
