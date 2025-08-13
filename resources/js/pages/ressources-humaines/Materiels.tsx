import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Eye, Wrench, Calendar, DollarSign, User } from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Dashboard Ressources Humaines & Gestion des Compétences',
        href: '/ressources-humaines/dashboard',
    },
    {
        title: 'Gestion des Matériels',
        href: '/ressources-humaines/materiels',
    },
];

interface Salarie {
    id: number;
    nom: string;
    prenom?: string;
}

interface Materiel {
    id: number;
    nom: string;
    marque: string;
    type: 'electronique' | 'mecanique' | 'informatique' | 'autre';
    etat: 'disponible' | 'en_panne' | 'en_mission';
    cout_location_jour?: number;
    date_acquisition?: string;
    duree_location?: number;
    salarie_id?: number;
    statut?: 'achete' | 'loue';
    type_paiement?: 'espece' | 'credit';
    montant_achat?: number;
    montant_credit_total?: number;
    montant_credit_mensuel?: number;
    duree_credit_mois?: number;
    date_debut_credit?: string;
    date_debut_location?: string;
    date_fin_location?: string;
    cout_location?: number;
    salarie?: Salarie;
    created_at: string;
    updated_at: string;
}

interface Props {
    materiels: Materiel[];
    salaries: Salarie[];
}

// Types de matériels
const TYPES_MATERIELS = [
    { value: 'electronique', label: 'Électronique' },
    { value: 'mecanique', label: 'Mécanique' },
    { value: 'informatique', label: 'Informatique' },
    { value: 'autre', label: 'Autre' }
];

export default function Materiels({ materiels, salaries }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingMateriel, setEditingMateriel] = useState<Materiel | null>(null);
    const [deletingMateriel, setDeletingMateriel] = useState<Materiel | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nom: '',
        marque: '',
        type: '',
        etat: 'disponible' as const,
        cout_location_jour: '',
        date_acquisition: '',
        duree_location: '',
        salarie_id: '',
        statut: '',
        type_paiement: '',
        montant_achat: '',
        montant_credit_total: '',
        montant_credit_mensuel: '',
        duree_credit_mois: '',
        date_debut_credit: '',
        date_debut_location: '',
        date_fin_location: '',
        cout_location: '',
    });

    const openCreateModal = () => {
        reset();
        setEditingMateriel(null);
        setShowModal(true);
    };

    const openEditModal = (materiel: Materiel) => {
        setData({
            nom: materiel.nom || '',
            marque: materiel.marque || '',
            type: materiel.type || '',
            etat: materiel.etat || 'disponible',
            cout_location_jour: materiel.cout_location_jour?.toString() || '',
            date_acquisition: materiel.date_acquisition || '',
            duree_location: materiel.duree_location?.toString() || '',
            salarie_id: materiel.salarie_id?.toString() || '',
            statut: materiel.statut || '',
            type_paiement: materiel.type_paiement || '',
            montant_achat: materiel.montant_achat?.toString() || '',
            montant_credit_total: materiel.montant_credit_total?.toString() || '',
            montant_credit_mensuel: materiel.montant_credit_mensuel?.toString() || '',
            duree_credit_mois: materiel.duree_credit_mois?.toString() || '',
            date_debut_credit: materiel.date_debut_credit || '',
            date_debut_location: materiel.date_debut_location || '',
            date_fin_location: materiel.date_fin_location || '',
            cout_location: materiel.cout_location?.toString() || '',
        });
        setEditingMateriel(materiel);
        setShowModal(true);
    };

    const openDeleteModal = (materiel: Materiel) => {
        setDeletingMateriel(materiel);
        setShowDeleteModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Préparer les données en s'assurant que les valeurs vides sont null ou converties correctement
        const formData = {
            nom: data.nom.trim(),
            marque: data.marque.trim(),
            type: data.type,
            etat: data.etat,
            cout_location_jour: data.cout_location_jour ? parseFloat(data.cout_location_jour) : null,
            date_acquisition: data.date_acquisition || null,
            duree_location: data.duree_location ? parseInt(data.duree_location, 10) : null,
            salarie_id: data.salarie_id ? parseInt(data.salarie_id, 10) : null,
            statut: data.statut || null,
            type_paiement: data.type_paiement || null,
            montant_achat: data.montant_achat ? parseFloat(data.montant_achat) : null,
            montant_credit_total: data.montant_credit_total ? parseFloat(data.montant_credit_total) : null,
            montant_credit_mensuel: data.montant_credit_mensuel ? parseFloat(data.montant_credit_mensuel) : null,
            duree_credit_mois: data.duree_credit_mois ? parseInt(data.duree_credit_mois, 10) : null,
            date_debut_credit: data.date_debut_credit || null,
            date_debut_location: data.date_debut_location || null,
            date_fin_location: data.date_fin_location || null,
            cout_location: data.cout_location ? parseFloat(data.cout_location) : null,
        };
        
        if (editingMateriel) {
            put(`/ressources-humaines/materiels/${editingMateriel.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingMateriel(null);
                    reset();
                },
                onError: (errors) => {
                    console.error('Erreur lors de la mise à jour:', errors);
                }
            });
        } else {
            post('/ressources-humaines/materiels', {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
                onError: (errors) => {
                    console.error('Erreur lors de la création:', errors);
                }
            });
        }
    };

    const handleDelete = () => {
        if (deletingMateriel) {
            router.delete(`/ressources-humaines/materiels/${deletingMateriel.id}`, {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setDeletingMateriel(null);
                }
            });
        }
    };

    const getEtatBadge = (etat: string) => {
        const etatClasses = {
            disponible: 'bg-green-100 text-green-800 border-green-200',
            en_panne: 'bg-red-100 text-red-800 border-red-200',
            en_mission: 'bg-blue-100 text-blue-800 border-blue-200'
        };
        
        const etatLabels = {
            disponible: 'Disponible',
            en_panne: 'En Panne',
            en_mission: 'En Mission'
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${etatClasses[etat as keyof typeof etatClasses] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {etatLabels[etat as keyof typeof etatLabels] || etat}
            </span>
        );
    };

    const getStatutBadge = (statut: string) => {
        const statutClasses = {
            achete: 'bg-purple-100 text-purple-800 border-purple-200',
            loue: 'bg-orange-100 text-orange-800 border-orange-200'
        };
        
        const statutLabels = {
            achete: 'Acheté',
            loue: 'Loué'
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statutClasses[statut as keyof typeof statutClasses] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {statutLabels[statut as keyof typeof statutLabels] || statut}
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Matériels - Ressources Humaines" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestion des Matériels</h1>
                        <p className="text-gray-600 mt-1">Gérez tous les matériels de l'entreprise</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        Nouveau Matériel
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Wrench className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Matériels</p>
                                <p className="text-2xl font-bold text-gray-900">{materiels.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Eye className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Disponibles</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {materiels.filter(m => m.etat === 'disponible').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">En Mission</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {materiels.filter(m => m.etat === 'en_mission').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <DollarSign className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">En Panne</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {materiels.filter(m => m.etat === 'en_panne').length}
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
                                        Matériel
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Marque
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        État
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Salarié Affecté
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Coût/Montant
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {materiels.map((materiel) => (
                                    <tr key={materiel.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {materiel.nom}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {TYPES_MATERIELS.find(t => t.value === materiel.type)?.label || materiel.type}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {materiel.marque}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {TYPES_MATERIELS.find(t => t.value === materiel.type)?.label || materiel.type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getEtatBadge(materiel.etat)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {materiel.statut ? getStatutBadge(materiel.statut) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {materiel.salarie ? `${materiel.salarie.nom} ${materiel.salarie.prenom || ''}`.trim() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>
                                                {materiel.statut === 'achete' && materiel.montant_achat ? (
                                                    <div>
                                                        <div className="font-medium text-purple-600">
                                                            Achat: {formatCurrency(materiel.montant_achat)}
                                                        </div>
                                                        {materiel.type_paiement === 'credit' && materiel.montant_credit_mensuel && (
                                                            <div className="text-xs text-gray-500">
                                                                {formatCurrency(materiel.montant_credit_mensuel)}/mois
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : materiel.statut === 'loue' && materiel.cout_location_jour ? (
                                                    <div className="text-orange-600 font-medium">
                                                        Location: {formatCurrency(materiel.cout_location_jour)}/jour
                                                    </div>
                                                ) : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(materiel)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100 transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(materiel)}
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

                    {materiels.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-500">
                                <Wrench className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun matériel</h3>
                                <p className="mt-1 text-sm text-gray-500">Commencez par ajouter un nouveau matériel.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingMateriel ? 'Modifier le matériel' : 'Nouveau matériel'}
                            </h3>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Informations de base */}
                                <div className="border-b pb-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Informations de base</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Nom *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.nom}
                                                onChange={(e) => setData('nom', e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                                maxLength={255}
                                            />
                                            {errors.nom && <div className="text-red-500 text-sm mt-1">{errors.nom}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Marque *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.marque}
                                                onChange={(e) => setData('marque', e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                                maxLength={255}
                                            />
                                            {errors.marque && <div className="text-red-500 text-sm mt-1">{errors.marque}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Type *
                                            </label>
                                            <select
                                                value={data.type}
                                                onChange={(e) => setData('type', e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                <option value="">Sélectionner un type</option>
                                                {TYPES_MATERIELS.map((type) => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.type && <div className="text-red-500 text-sm mt-1">{errors.type}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                État *
                                            </label>
                                            <select
                                                value={data.etat}
                                                onChange={(e) => setData('etat', e.target.value as any)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                <option value="disponible">Disponible</option>
                                                <option value="en_panne">En Panne</option>
                                                <option value="en_mission">En Mission</option>
                                            </select>
                                            {errors.etat && <div className="text-red-500 text-sm mt-1">{errors.etat}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Statut *
                                            </label>
                                            <select
                                                value={data.statut}
                                                onChange={(e) => setData('statut', e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                <option value="">Sélectionner un statut</option>
                                                <option value="achete">Acheté</option>
                                                <option value="loue">Loué</option>
                                            </select>
                                            {errors.statut && <div className="text-red-500 text-sm mt-1">{errors.statut}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Date d'acquisition
                                            </label>
                                            <input
                                                type="date"
                                                value={data.date_acquisition}
                                                onChange={(e) => setData('date_acquisition', e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            {errors.date_acquisition && <div className="text-red-500 text-sm mt-1">{errors.date_acquisition}</div>}
                                        </div>
                                    </div>
                                </div>

                                {/* Champs conditionnels selon le statut */}
                                {data.statut === 'achete' && (
                                    <div className="border-b pb-6">
                                        <h4 className="text-md font-medium text-gray-900 mb-4">Informations d'achat</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Montant d'achat (€) *
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.montant_achat}
                                                    onChange={(e) => setData('montant_achat', e.target.value)}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                />
                                                {errors.montant_achat && <div className="text-red-500 text-sm mt-1">{errors.montant_achat}</div>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Type de paiement
                                                </label>
                                                <select
                                                    value={data.type_paiement}
                                                    onChange={(e) => setData('type_paiement', e.target.value)}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="">Sélectionner</option>
                                                    <option value="espece">Espèce</option>
                                                    <option value="credit">Crédit</option>
                                                </select>
                                                {errors.type_paiement && <div className="text-red-500 text-sm mt-1">{errors.type_paiement}</div>}
                                            </div>

                                            {data.type_paiement === 'credit' && (
                                                <>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Montant crédit total (€)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={data.montant_credit_total}
                                                            onChange={(e) => setData('montant_credit_total', e.target.value)}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                        {errors.montant_credit_total && <div className="text-red-500 text-sm mt-1">{errors.montant_credit_total}</div>}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Montant mensuel (€)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={data.montant_credit_mensuel}
                                                            onChange={(e) => setData('montant_credit_mensuel', e.target.value)}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                        {errors.montant_credit_mensuel && <div className="text-red-500 text-sm mt-1">{errors.montant_credit_mensuel}</div>}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Durée crédit (mois)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={data.duree_credit_mois}
                                                            onChange={(e) => setData('duree_credit_mois', e.target.value)}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                        {errors.duree_credit_mois && <div className="text-red-500 text-sm mt-1">{errors.duree_credit_mois}</div>}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Date début crédit
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={data.date_debut_credit}
                                                            onChange={(e) => setData('date_debut_credit', e.target.value)}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                        {errors.date_debut_credit && <div className="text-red-500 text-sm mt-1">{errors.date_debut_credit}</div>}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {data.statut === 'loue' && (
                                    <div className="border-b pb-6">
                                        <h4 className="text-md font-medium text-gray-900 mb-4">Informations de location</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Coût location/jour (€)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.cout_location_jour}
                                                    onChange={(e) => setData('cout_location_jour', e.target.value)}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                {errors.cout_location_jour && <div className="text-red-500 text-sm mt-1">{errors.cout_location_jour}</div>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Durée location (jours)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={data.duree_location}
                                                    onChange={(e) => setData('duree_location', e.target.value)}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                {errors.duree_location && <div className="text-red-500 text-sm mt-1">{errors.duree_location}</div>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Date début location
                                                </label>
                                                <input
                                                    type="date"
                                                    value={data.date_debut_location}
                                                    onChange={(e) => setData('date_debut_location', e.target.value)}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                {errors.date_debut_location && <div className="text-red-500 text-sm mt-1">{errors.date_debut_location}</div>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Date fin location
                                                </label>
                                                <input
                                                    type="date"
                                                    value={data.date_fin_location}
                                                    onChange={(e) => setData('date_fin_location', e.target.value)}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                {errors.date_fin_location && <div className="text-red-500 text-sm mt-1">{errors.date_fin_location}</div>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Coût total location (€)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.cout_location}
                                                    onChange={(e) => setData('cout_location', e.target.value)}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                {errors.cout_location && <div className="text-red-500 text-sm mt-1">{errors.cout_location}</div>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Affectation salarié */}
                                <div>
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Affectation salarié</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Salarié affecté
                                            </label>
                                            <select
                                                value={data.salarie_id}
                                                onChange={(e) => setData('salarie_id', e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Aucun salarié affecté</option>
                                                {salaries.map((salarie) => (
                                                    <option key={salarie.id} value={salarie.id}>
                                                        {salarie.nom} {salarie.prenom || ''}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.salarie_id && <div className="text-red-500 text-sm mt-1">{errors.salarie_id}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingMateriel(null);
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
                                        {processing ? 'En cours...' : editingMateriel ? 'Mettre à jour' : 'Créer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {showDeleteModal && deletingMateriel && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <Trash2 className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Supprimer le matériel
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Cette action est irréversible.
                                    </p>
                                </div>
                            </div>
                            
                            <p className="text-gray-700 mb-6">
                                Êtes-vous sûr de vouloir supprimer le matériel <strong>"{deletingMateriel.nom}"</strong> de marque {deletingMateriel.marque} ?
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeletingMateriel(null);
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