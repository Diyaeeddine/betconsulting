import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Eye, Car, Calendar, DollarSign, User } from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Dashboard Ressources Humaines & Gestion des Compétences',
        href: '/ressources-humaines/dashboard',
    },
    {
        title: 'Gestion des Véhicules',
        href: '/ressources-humaines/vehicules',
    },
];

interface Salarie {
    id: number;
    nom: string;
    prenom?: string;
}

interface Vehicule {
    id: number;
    modele: string;
    matricule: string;
    marque: string;
    type: 'camion' | 'voiture' | 'engine' | 'autre';
    etat: 'disponible' | 'en_panne' | 'en_mission';
    cout_location_jour?: number;
    date_affectation?: string;
    date_disponibilite?: string;
    duree_affectation?: number;
    salarie_id?: number;
    duree_location?: number;
    statut?: 'achete' | 'loue';
    date_achat?: string;
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
    vehicules: Vehicule[];
    salaries: Salarie[];
}

const TYPES_VEHICULES = [
    { value: 'camion', label: 'Camion' },
    { value: 'voiture', label: 'Voiture' },
    { value: 'engine', label: 'Engine' },
    { value: 'autre', label: 'Autre' }
];

export default function Vehicules({ vehicules, salaries }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingVehicule, setEditingVehicule] = useState<Vehicule | null>(null);
    const [deletingVehicule, setDeletingVehicule] = useState<Vehicule | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        modele: '',
        matricule: '',
        marque: '',
        type: '',
        etat: 'disponible' ,
        cout_location_jour: '',
        date_affectation: '',
        date_disponibilite: '',
        duree_affectation: '',
        salarie_id: '',
        duree_location: '',
        statut: '',
        date_achat: '',
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
        setEditingVehicule(null);
        setShowModal(true);
    };

    const openEditModal = (vehicule: Vehicule) => {
        setData({
            modele: vehicule.modele || '',
            matricule: vehicule.matricule || '',
            marque: vehicule.marque || '',
            type: vehicule.type || '',
            etat: vehicule.etat || 'disponible',
            cout_location_jour: vehicule.cout_location_jour?.toString() || '',
            date_affectation: vehicule.date_affectation || '',
            date_disponibilite: vehicule.date_disponibilite || '',
            duree_affectation: vehicule.duree_affectation?.toString() || '',
            salarie_id: vehicule.salarie_id?.toString() || '',
            duree_location: vehicule.duree_location?.toString() || '',
            statut: vehicule.statut || '',
            date_achat: vehicule.date_achat || '',
            type_paiement: vehicule.type_paiement || '',
            montant_achat: vehicule.montant_achat?.toString() || '',
            montant_credit_total: vehicule.montant_credit_total?.toString() || '',
            montant_credit_mensuel: vehicule.montant_credit_mensuel?.toString() || '',
            duree_credit_mois: vehicule.duree_credit_mois?.toString() || '',
            date_debut_credit: vehicule.date_debut_credit || '',
            date_debut_location: vehicule.date_debut_location || '',
            date_fin_location: vehicule.date_fin_location || '',
            cout_location: vehicule.cout_location?.toString() || '',
        });
        setEditingVehicule(vehicule);
        setShowModal(true);
    };

    const openDeleteModal = (vehicule: Vehicule) => {
        setDeletingVehicule(vehicule);
        setShowDeleteModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = {
            modele: data.modele.trim(),
            matricule: data.matricule.trim(),
            marque: data.marque.trim(),
            type: data.type,
            etat: data.etat,
            cout_location_jour: data.cout_location_jour ? parseFloat(data.cout_location_jour) : null,
            date_affectation: data.date_affectation || null,
            date_disponibilite: data.date_disponibilite || null,
            duree_affectation: data.duree_affectation ? parseInt(data.duree_affectation, 10) : null,
            salarie_id: data.salarie_id ? parseInt(data.salarie_id, 10) : null,
            duree_location: data.duree_location ? parseInt(data.duree_location, 10) : null,
            statut: data.statut || null,
            date_achat: data.date_achat || null,
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
        
        if (editingVehicule) {
            put(`/ressources-humaines/vehicules/${editingVehicule.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingVehicule(null);
                    reset();
                },
                onError: (errors) => {
                    console.error('Erreur lors de la mise à jour:', errors);
                }
            });
        } else {
            post('/ressources-humaines/vehicules', {
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
        if (deletingVehicule) {
            router.delete(`/ressources-humaines/vehicules/${deletingVehicule.id}`, {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setDeletingVehicule(null);
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
            <Head title="Gestion des Véhicules - Ressources Humaines" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestion des Véhicules</h1>
                        <p className="text-gray-600 mt-1">Gérez tous les véhicules de l'entreprise</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        Nouveau Véhicule
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Car className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Véhicules</p>
                                <p className="text-2xl font-bold text-gray-900">{vehicules.length}</p>
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
                                    {vehicules.filter(v => v.etat === 'disponible').length}
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
                                    {vehicules.filter(v => v.etat === 'en_mission').length}
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
                                    {vehicules.filter(v => v.etat === 'en_panne').length}
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
                                        Véhicule
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Matricule
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
                                {vehicules.map((vehicule) => (
                                    <tr key={vehicule.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {vehicule.marque} {vehicule.modele}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {TYPES_VEHICULES.find(t => t.value === vehicule.type)?.label || vehicule.type}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                            {vehicule.matricule}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {TYPES_VEHICULES.find(t => t.value === vehicule.type)?.label || vehicule.type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getEtatBadge(vehicule.etat)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {vehicule.statut ? getStatutBadge(vehicule.statut) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {vehicule.salarie ? `${vehicule.salarie.nom} ${vehicule.salarie.prenom || ''}`.trim() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>
                                                {vehicule.statut === 'achete' && vehicule.montant_achat ? (
                                                    <div>
                                                        <div className="font-medium text-purple-600">
                                                            Achat: {formatCurrency(vehicule.montant_achat)}
                                                        </div>
                                                        {vehicule.type_paiement === 'credit' && vehicule.montant_credit_mensuel && (
                                                            <div className="text-xs text-gray-500">
                                                                {formatCurrency(vehicule.montant_credit_mensuel)}/mois
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : vehicule.statut === 'loue' && vehicule.cout_location_jour ? (
                                                    <div className="text-orange-600 font-medium">
                                                        Location: {formatCurrency(vehicule.cout_location_jour)}/jour
                                                    </div>
                                                ) : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(vehicule)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100 transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(vehicule)}
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

                    {vehicules.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-500">
                                <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun véhicule</h3>
                                <p className="mt-1 text-sm text-gray-500">Commencez par ajouter un nouveau véhicule.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto m-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingVehicule ? 'Modifier le véhicule' : 'Nouveau véhicule'}
                            </h3>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Informations de base */}
                                <div className="border-b pb-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Informations de base</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                                Modèle *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.modele}
                                                onChange={(e) => setData('modele', e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                                maxLength={255}
                                            />
                                            {errors.modele && <div className="text-red-500 text-sm mt-1">{errors.modele}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Matricule *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.matricule}
                                                onChange={(e) => setData('matricule', e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                                maxLength={255}
                                            />
                                            {errors.matricule && <div className="text-red-500 text-sm mt-1">{errors.matricule}</div>}
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
                                                {TYPES_VEHICULES.map((type) => (
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
                                    </div>
                                </div>

                                {/* Champs conditionnels selon le statut */}
                                {data.statut === 'achete' && (
                                    <div className="border-b pb-6">
                                        <h4 className="text-md font-medium text-gray-900 mb-4">Informations d'achat</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Date d'achat
                                                </label>
                                                <input
                                                    type="date"
                                                    value={data.date_achat}
                                                    onChange={(e) => setData('date_achat', e.target.value)}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                {errors.date_achat && <div className="text-red-500 text-sm mt-1">{errors.date_achat}</div>}
                                            </div>

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
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                        </div>
                                    </div>
                                )}

                                {/* Affectation salarié */}
                                <div>
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Affectation salarié</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Date d'affectation
                                            </label>
                                            <input
                                                type="date"
                                                value={data.date_affectation}
                                                onChange={(e) => setData('date_affectation', e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            {errors.date_affectation && <div className="text-red-500 text-sm mt-1">{errors.date_affectation}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Date de disponibilité
                                            </label>
                                            <input
                                                type="date"
                                                value={data.date_disponibilite}
                                                onChange={(e) => setData('date_disponibilite', e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            {errors.date_disponibilite && <div className="text-red-500 text-sm mt-1">{errors.date_disponibilite}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Durée d'affectation (jours)
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={data.duree_affectation}
                                                onChange={(e) => setData('duree_affectation', e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            {errors.duree_affectation && <div className="text-red-500 text-sm mt-1">{errors.duree_affectation}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingVehicule(null);
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
                                        {processing ? 'En cours...' : editingVehicule ? 'Mettre à jour' : 'Créer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {showDeleteModal && deletingVehicule && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <Trash2 className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Supprimer le véhicule
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Cette action est irréversible.
                                    </p>
                                </div>
                            </div>
                            
                            <p className="text-gray-700 mb-6">
                                Êtes-vous sûr de vouloir supprimer le véhicule <strong>"{deletingVehicule.marque} {deletingVehicule.modele}"</strong> (Matricule: {deletingVehicule.matricule}) ?
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeletingVehicule(null);
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