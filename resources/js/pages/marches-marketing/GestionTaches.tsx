import { router } from '@inertiajs/react';
import { AlertCircle, Calendar, Check, Clock, Edit3, FileText, Plus, User, X } from 'lucide-react';
import { useState } from 'react';

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
    salarie: Salarie;
}

interface Tache {
    id: number;
    nom_tache: string;
    description?: string;
    priorite: string;
    statut: string;
    ordre: number;
    duree_estimee?: number;
    date_limite?: string;
    instructions?: string;
    fichiers_requis?: string[];
    affectations: Affectation[];
}

interface Dossier {
    id: number;
    nom_dossier: string;
    type_dossier: string;
    statut: string;
    pourcentage_avancement: number;
    taches: Tache[];
    marche_public: {
        id: number;
        reference: string;
        objet: string;
    };
}

interface GestionTachesProps {
    dossier: Dossier;
    salaries: Salarie[];
}

const PRIORITE_COLORS = {
    elevee: 'bg-red-100 text-red-800 border-red-200',
    moyenne: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    faible: 'bg-green-100 text-green-800 border-green-200',
};

const STATUT_COLORS = {
    en_attente: 'bg-gray-100 text-gray-800',
    en_cours: 'bg-blue-100 text-blue-800',
    terminee: 'bg-green-100 text-green-800',
    validee: 'bg-green-200 text-green-900',
};

export default function GestionTaches({ dossier, salaries }: GestionTachesProps) {
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [editingTache, setEditingTache] = useState<number | null>(null);
    const [showAffectationModal, setShowAffectationModal] = useState<number | null>(null);
    const [newTache, setNewTache] = useState({
        nom_tache: '',
        description: '',
        priorite: 'moyenne',
        duree_estimee: '',
        date_limite: '',
        instructions: '',
    });

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleAddTache = async () => {
        if (!newTache.nom_tache.trim()) return;

        setLoading(true);
        try {
            router.post(`/marches/dossiers/${dossier.id}/taches`, newTache, {
                onSuccess: () => {
                    showNotification('success', 'Tâche ajoutée avec succès');
                    setNewTache({ nom_tache: '', description: '', priorite: 'moyenne', duree_estimee: '', date_limite: '', instructions: '' });
                    setShowAddForm(false);
                },
                onError: () => {
                    showNotification('error', "Erreur lors de l'ajout de la tâche");
                },
                onFinish: () => setLoading(false),
            });
        } catch (error) {
            setLoading(false);
            showNotification('error', 'Une erreur inattendue est survenue');
        }
    };

    const handleUpdateStatut = async (tacheId: number, newStatut: string) => {
        setLoading(true);
        try {
            router.put(
                `/marches/taches/${tacheId}/statut`,
                { statut: newStatut },
                {
                    onSuccess: () => {
                        showNotification('success', 'Statut mis à jour');
                    },
                    onError: () => {
                        showNotification('error', 'Erreur lors de la mise à jour');
                    },
                    onFinish: () => setLoading(false),
                },
            );
        } catch (error) {
            setLoading(false);
        }
    };

    const handleAffecterTache = async (tacheId: number, salarieId: number) => {
        setLoading(true);
        try {
            router.post(
                `/marches/taches/${tacheId}/affecter`,
                {
                    salarie_id: salarieId,
                    role_affectation: 'collaborateur',
                },
                {
                    onSuccess: () => {
                        showNotification('success', 'Tâche affectée avec succès');
                        setShowAffectationModal(null);
                    },
                    onError: () => {
                        showNotification('error', "Erreur lors de l'affectation");
                    },
                    onFinish: () => setLoading(false),
                },
            );
        } catch (error) {
            setLoading(false);
        }
    };

    const formatDate = (date: string | null | undefined): string => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('fr-FR');
    };

    const isTaskOverdue = (dateLimit: string | undefined): boolean => {
        if (!dateLimit) return false;
        return new Date(dateLimit) < new Date();
    };

    const tachesSorted = [...dossier.taches].sort((a, b) => {
        if (a.statut === 'terminee' && b.statut !== 'terminee') return 1;
        if (a.statut !== 'terminee' && b.statut === 'terminee') return -1;
        return a.ordre - b.ordre;
    });

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
                <div className="mx-auto max-w-4xl px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{dossier.nom_dossier}</h1>
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

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-sm">
                            <span>Progression du dossier</span>
                            <span className="font-medium">{Math.round(dossier.pourcentage_avancement)}%</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-gray-200">
                            <div
                                className="h-2 rounded-full bg-blue-500 transition-all"
                                style={{ width: `${dossier.pourcentage_avancement}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-4xl px-4 py-8">
                {/* Add Task Button */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Liste des Tâches ({dossier.taches.length})</h2>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Ajouter une tâche</span>
                    </button>
                </div>

                {/* Add Task Form */}
                {showAddForm && (
                    <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-medium text-gray-900">Nouvelle Tâche</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Nom de la tâche *</label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                    value={newTache.nom_tache}
                                    onChange={(e) => setNewTache({ ...newTache, nom_tache: e.target.value })}
                                    placeholder="Nom de la tâche..."
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                    rows={3}
                                    value={newTache.description}
                                    onChange={(e) => setNewTache({ ...newTache, description: e.target.value })}
                                    placeholder="Description de la tâche..."
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Priorité</label>
                                    <select
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                        value={newTache.priorite}
                                        onChange={(e) => setNewTache({ ...newTache, priorite: e.target.value })}
                                    >
                                        <option value="faible">Faible</option>
                                        <option value="moyenne">Moyenne</option>
                                        <option value="elevee">Élevée</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Durée estimée (heures)</label>
                                    <input
                                        type="number"
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                        value={newTache.duree_estimee}
                                        onChange={(e) => setNewTache({ ...newTache, duree_estimee: e.target.value })}
                                        placeholder="8"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Date limite</label>
                                    <input
                                        type="date"
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                        value={newTache.date_limite}
                                        onChange={(e) => setNewTache({ ...newTache, date_limite: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Instructions</label>
                                <textarea
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                    rows={2}
                                    value={newTache.instructions}
                                    onChange={(e) => setNewTache({ ...newTache, instructions: e.target.value })}
                                    placeholder="Instructions spécifiques pour cette tâche..."
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleAddTache}
                                    disabled={loading || !newTache.nom_tache.trim()}
                                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Ajouter la tâche
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tasks List */}
                <div className="space-y-3">
                    {tachesSorted.map((tache) => (
                        <div
                            key={tache.id}
                            className={`rounded-lg border bg-white p-4 shadow-sm transition-all ${
                                tache.statut === 'terminee' || tache.statut === 'validee' ? 'opacity-75' : ''
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                {/* Task Content */}
                                <div className="flex-1">
                                    <div className="mb-2 flex items-center space-x-3">
                                        {/* Status Checkbox */}
                                        <button
                                            onClick={() => {
                                                const newStatut = ['terminee', 'validee'].includes(tache.statut) ? 'en_cours' : 'terminee';
                                                handleUpdateStatut(tache.id, newStatut);
                                            }}
                                            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                                                ['terminee', 'validee'].includes(tache.statut)
                                                    ? 'border-green-500 bg-green-500 text-white'
                                                    : 'border-gray-300 hover:border-green-400'
                                            }`}
                                        >
                                            {['terminee', 'validee'].includes(tache.statut) && <Check className="h-3 w-3" />}
                                        </button>

                                        {/* Task Name */}
                                        <h3
                                            className={`font-medium text-gray-900 ${
                                                ['terminee', 'validee'].includes(tache.statut) ? 'text-gray-500 line-through' : ''
                                            }`}
                                        >
                                            {tache.nom_tache}
                                        </h3>

                                        {/* Priority Badge */}
                                        <span
                                            className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${
                                                PRIORITE_COLORS[tache.priorite as keyof typeof PRIORITE_COLORS]
                                            }`}
                                        >
                                            {tache.priorite}
                                        </span>

                                        {/* Status Badge */}
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                STATUT_COLORS[tache.statut as keyof typeof STATUT_COLORS]
                                            }`}
                                        >
                                            {tache.statut.replace('_', ' ')}
                                        </span>

                                        {/* Overdue indicator */}
                                        {isTaskOverdue(tache.date_limite) && !['terminee', 'validee'].includes(tache.statut) && (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        )}
                                    </div>

                                    {/* Description */}
                                    {tache.description && <p className="mb-3 ml-8 text-sm text-gray-600">{tache.description}</p>}

                                    {/* Task Details */}
                                    <div className="ml-8 space-y-2">
                                        {/* Assignment info */}
                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                            {tache.affectations.length > 0 ? (
                                                <div className="flex items-center space-x-1">
                                                    <User className="h-3 w-3" />
                                                    <span>
                                                        Assigné à: {tache.affectations.map((a) => `${a.salarie.prenom} ${a.salarie.nom}`).join(', ')}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-1 text-orange-600">
                                                    <User className="h-3 w-3" />
                                                    <span>Non assigné</span>
                                                </div>
                                            )}

                                            {tache.duree_estimee && (
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{tache.duree_estimee}h estimées</span>
                                                </div>
                                            )}

                                            {tache.date_limite && (
                                                <div
                                                    className={`flex items-center space-x-1 ${
                                                        isTaskOverdue(tache.date_limite) ? 'text-red-600' : ''
                                                    }`}
                                                >
                                                    <Calendar className="h-3 w-3" />
                                                    <span>Échéance: {formatDate(tache.date_limite)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Instructions */}
                                        {tache.instructions && (
                                            <div className="text-xs text-gray-600">
                                                <div className="flex items-start space-x-1">
                                                    <FileText className="mt-0.5 h-3 w-3 flex-shrink-0" />
                                                    <span>{tache.instructions}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="ml-4 flex items-center space-x-2">
                                    {tache.affectations.length === 0 && (
                                        <button
                                            onClick={() => setShowAffectationModal(tache.id)}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Affecter la tâche"
                                        >
                                            <User className="h-4 w-4" />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => setEditingTache(tache.id)}
                                        className="text-gray-400 hover:text-gray-600"
                                        title="Modifier la tâche"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {dossier.taches.length === 0 && (
                    <div className="rounded-lg bg-white p-12 text-center">
                        <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                        <h3 className="mb-2 text-lg font-medium text-gray-900">Aucune tâche créée</h3>
                        <p className="mb-4 text-gray-500">Commencez par ajouter des tâches pour organiser le travail sur ce dossier.</p>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Ajouter la première tâche</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Modal d'affectation */}
            {showAffectationModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="bg-opacity-75 fixed inset-0 bg-gray-500" onClick={() => setShowAffectationModal(null)}></div>
                        <div className="relative w-full max-w-md rounded-lg bg-white">
                            <div className="p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">Affecter la tâche</h3>
                                    <button onClick={() => setShowAffectationModal(null)} className="text-gray-400 hover:text-gray-600">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {salaries.map((salarie) => (
                                        <button
                                            key={salarie.id}
                                            onClick={() => handleAffecterTache(showAffectationModal, salarie.id)}
                                            className="w-full rounded-md border p-3 text-left transition-colors hover:bg-gray-50"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                                                    <span className="text-sm font-medium text-blue-600">
                                                        {salarie.prenom[0]}
                                                        {salarie.nom[0]}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {salarie.prenom} {salarie.nom}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{salarie.poste}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {salaries.length === 0 && (
                                    <p className="py-4 text-center text-gray-500">Aucun salarié disponible pour l'affectation</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
