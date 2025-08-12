import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Eye, MapPin, Calendar, DollarSign } from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Dashboard Ressources Humaines & Gestion des Compétences',
        href: '/ressources-humaines/dashboard',
    },
    {
        title: 'Gestion des Projets',
        href: '/ressources-humaines/Projets',
    },
];

interface User {
    id: number;
    name: string;
}

interface Projet {
    id: number;
    nom: string;
    description?: string;
    budget_total: number;
    budget_utilise?: number;
    date_debut?: string;
    date_fin?: string;
    statut: 'en_cours' | 'termine' | 'en_attente';
    client?: string;
    lieu_realisation?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    responsable_id: number;
    type_projet: 'suivi' | 'etude' | 'controle';
    responsable: User;
    created_at: string;
    updated_at: string;
}

interface Props {
    projets: Projet[];
    users: User[];
}

export default function Projets({ projets, users }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingProjet, setEditingProjet] = useState<Projet | null>(null);
    const [deletingProjet, setDeletingProjet] = useState<Projet | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nom: '',
        description: '',
        budget_total: '',
        budget_utilise: '',
        date_debut: '',
        date_fin: '',
        statut: 'en_attente' as const,
        client: '',
        lieu_realisation: '',
        latitude: '',
        longitude: '',
        radius: '',
        responsable_id: '',
        type_projet: 'suivi' as const,
    });

    const openCreateModal = () => {
        reset();
        setEditingProjet(null);
        setShowModal(true);
    };

    const openEditModal = (projet: Projet) => {
        setData({
            nom: projet.nom,
            description: projet.description || '',
            budget_total: projet.budget_total.toString(),
            budget_utilise: projet.budget_utilise?.toString() || '',
            date_debut: projet.date_debut || '',
            date_fin: projet.date_fin || '',
            statut: projet.statut,
            client: projet.client || '',
            lieu_realisation: projet.lieu_realisation || '',
            latitude: projet.latitude?.toString() || '',
            longitude: projet.longitude?.toString() || '',
            radius: projet.radius?.toString() || '',
            responsable_id: projet.responsable_id.toString(),
            type_projet: projet.type_projet,
        });
        setEditingProjet(projet);
        setShowModal(true);
    };

    const openDeleteModal = (projet: Projet) => {
        setDeletingProjet(projet);
        setShowDeleteModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingProjet) {
            put(`/ressources-humaines/projets/${editingProjet.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingProjet(null);
                    reset();
                }
            });
        } else {
            post('/ressources-humaines/projets', {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                }
            });
        }
    };

    const handleDelete = () => {
        if (deletingProjet) {
            router.delete(`/ressources-humaines/projets/${deletingProjet.id}`, {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setDeletingProjet(null);
                }
            });
        }
    };

    const getStatusBadge = (statut: string) => {
        const statusClasses = {
            en_cours: 'bg-blue-100 text-blue-800 border-blue-200',
            termine: 'bg-green-100 text-green-800 border-green-200',
            en_attente: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
        
        const statusLabels = {
            en_cours: 'En Cours',
            termine: 'Terminé',
            en_attente: 'En Attente'
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusClasses[statut as keyof typeof statusClasses]}`}>
                {statusLabels[statut as keyof typeof statusLabels]}
            </span>
        );
    };

    const getTypeBadge = (type: string) => {
        const typeClasses = {
            suivi: 'bg-purple-100 text-purple-800 border-purple-200',
            etude: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            controle: 'bg-orange-100 text-orange-800 border-orange-200'
        };

        const typeLabels = {
            suivi: 'Suivi',
            etude: 'Étude',
            controle: 'Contrôle'
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${typeClasses[type as keyof typeof typeClasses]}`}>
                {typeLabels[type as keyof typeof typeLabels]}
            </span>
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const getBudgetProgress = (total: number, utilise: number | null | undefined) => {
        if (!utilise || utilise === 0) return 0;
        return Math.min((utilise / total) * 100, 100);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Projets - Ressources Humaines" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestion des Projets</h1>
                        <p className="text-gray-600 mt-1">Gérez tous les projets de l'entreprise</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        Nouveau Projet
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Eye className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Projets</p>
                                <p className="text-2xl font-bold text-gray-900">{projets.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Calendar className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">En Cours</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {projets.filter(p => p.statut === 'en_cours').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <DollarSign className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Budget Total</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(projets.reduce((sum, p) => sum + p.budget_total, 0))}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <MapPin className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Terminés</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {projets.filter(p => p.statut === 'termine').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Projet
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Client
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Responsable
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Budget
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dates
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {projets.map((projet) => (
                                    <tr key={projet.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{projet.nom}</div>
                                                {projet.description && (
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {projet.description}
                                                    </div>
                                                )}
                                                {projet.lieu_realisation && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <MapPin className="w-3 h-3 text-gray-400" />
                                                        <span className="text-xs text-gray-500">{projet.lieu_realisation}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {projet.client || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {projet.responsable?.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getTypeBadge(projet.type_projet)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(projet.statut)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">
                                                    {formatCurrency(projet.budget_total)}
                                                </div>
                                                {projet.budget_utilise && (
                                                    <div className="mt-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-12 bg-gray-200 rounded-full h-1.5">
                                                                <div
                                                                    className="bg-blue-600 h-1.5 rounded-full"
                                                                    style={{
                                                                        width: `${getBudgetProgress(projet.budget_total, projet.budget_utilise)}%`
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs text-gray-500">
                                                                {formatCurrency(projet.budget_utilise)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>
                                                <div>Début: {formatDate(projet.date_debut || '')}</div>
                                                <div>Fin: {formatDate(projet.date_fin || '')}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(projet)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100 transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(projet)}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {projets.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-500">
                                <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun projet</h3>
                                <p className="mt-1 text-sm text-gray-500">Commencez par créer un nouveau projet.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingProjet ? 'Modifier le projet' : 'Nouveau projet'}
                            </h3>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Nom du projet *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.nom}
                                            onChange={(e) => setData('nom', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        {errors.nom && <div className="text-red-500 text-sm mt-1">{errors.nom}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Client
                                        </label>
                                        <input
                                            type="text"
                                            value={data.client}
                                            onChange={(e) => setData('client', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {errors.client && <div className="text-red-500 text-sm mt-1">{errors.client}</div>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Description
                                        </label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={3}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Budget total *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.budget_total}
                                            onChange={(e) => setData('budget_total', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        {errors.budget_total && <div className="text-red-500 text-sm mt-1">{errors.budget_total}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Budget utilisé
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.budget_utilise}
                                            onChange={(e) => setData('budget_utilise', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {errors.budget_utilise && <div className="text-red-500 text-sm mt-1">{errors.budget_utilise}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Date de début
                                        </label>
                                        <input
                                            type="date"
                                            value={data.date_debut}
                                            onChange={(e) => setData('date_debut', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {errors.date_debut && <div className="text-red-500 text-sm mt-1">{errors.date_debut}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Date de fin
                                        </label>
                                        <input
                                            type="date"
                                            value={data.date_fin}
                                            onChange={(e) => setData('date_fin', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {errors.date_fin && <div className="text-red-500 text-sm mt-1">{errors.date_fin}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Statut *
                                        </label>
                                        <select
                                            value={data.statut}
                                            onChange={(e) => setData('statut', e.target.value as any)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="en_attente">En Attente</option>
                                            <option value="en_cours">En Cours</option>
                                            <option value="termine">Terminé</option>
                                        </select>
                                        {errors.statut && <div className="text-red-500 text-sm mt-1">{errors.statut}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Type de projet *
                                        </label>
                                        <select
                                            value={data.type_projet}
                                            onChange={(e) => setData('type_projet', e.target.value as any)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="suivi">Suivi</option>
                                            <option value="etude">Étude</option>
                                            <option value="controle">Contrôle</option>
                                        </select>
                                        {errors.type_projet && <div className="text-red-500 text-sm mt-1">{errors.type_projet}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Responsable *
                                        </label>
                                        <select
                                            value={data.responsable_id}
                                            onChange={(e) => setData('responsable_id', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Sélectionner un responsable</option>
                                            {users.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.responsable_id && <div className="text-red-500 text-sm mt-1">{errors.responsable_id}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Lieu de réalisation
                                        </label>
                                        <input
                                            type="text"
                                            value={data.lieu_realisation}
                                            onChange={(e) => setData('lieu_realisation', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {errors.lieu_realisation && <div className="text-red-500 text-sm mt-1">{errors.lieu_realisation}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Latitude
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={data.latitude}
                                            onChange={(e) => setData('latitude', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {errors.latitude && <div className="text-red-500 text-sm mt-1">{errors.latitude}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Longitude
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={data.longitude}
                                            onChange={(e) => setData('longitude', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {errors.longitude && <div className="text-red-500 text-sm mt-1">{errors.longitude}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Rayon (km)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={data.radius}
                                            onChange={(e) => setData('radius', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {errors.radius && <div className="text-red-500 text-sm mt-1">{errors.radius}</div>}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingProjet(null);
                                            reset();
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'En cours...' : editingProjet ? 'Mettre à jour' : 'Créer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {showDeleteModal && deletingProjet && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <Trash2 className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Supprimer le projet
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Cette action est irréversible.
                                    </p>
                                </div>
                            </div>
                            
                            <p className="text-gray-700 mb-6">
                                Êtes-vous sûr de vouloir supprimer le projet <strong>"{deletingProjet.nom}"</strong> ?
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeletingProjet(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}