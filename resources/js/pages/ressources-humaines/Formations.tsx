import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Eye, Calendar, Users, BookOpen, Monitor, User } from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Dashboard Ressources Humaines & Gestion des Compétences',
        href: '/ressources-humaines/dashboard',
    },
    {
        title: 'Gestion des Formations',
        href: '/ressources-humaines/formations',
    },
];

interface User {
    id: number;
    name: string;
}

interface Salarie {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    statut: string;
}

interface Participant {
    id: number;
    nom: string;
    prenom: string;
    pivot: {
        statut: string;
        progression: number;
        note?: number;
    };
}

interface Formation {
    id: number;
    titre: string;
    description?: string;
    type: 'en_ligne' | 'presentiel';
    date_debut: string;
    date_fin: string;
    duree: number;
    statut: 'planifiée' | 'en cours' | 'terminée';
    responsable_id: number;
    competences?: string;
    lien_meet?: string;
    responsable: User;
    participants_count?: number;
    participants?: Participant[];
    created_at: string;
    updated_at: string;
}

interface Props {
    formations: Formation[];
    users: User[];
    salaries: Salarie[];
}

export default function Formations({ formations, users, salaries }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingFormation, setEditingFormation] = useState<Formation | null>(null);
    const [deletingFormation, setDeletingFormation] = useState<Formation | null>(null);
    const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);

    type FormData = {
        titre: string;
        description: string;
        type: 'en_ligne' | 'presentiel';
        date_debut: string;
        date_fin: string;
        duree: string;
        statut: 'planifiée' | 'en cours' | 'terminée';
        responsable_id: string;
        competences: string;
        lien_meet: string;
        participants: number[];
    };

    const { data, setData, post, put, processing, errors, reset } = useForm<FormData>({
        titre: '',
        description: '',
        type: 'presentiel',
        date_debut: '',
        date_fin: '',
        duree: '',
        statut: 'planifiée',
        responsable_id: '',
        competences: '',
        lien_meet: '',
        participants: [],
    });

    // Fonction utilitaire pour convertir la chaîne de compétences en tableau
    const parseCompetences = (competencesStr: string | undefined): string[] => {
        if (!competencesStr || competencesStr.trim() === '') {
            return [];
        }
        return competencesStr.split(',').map(c => c.trim()).filter(c => c.length > 0);
    };

    const openCreateModal = () => {
        reset();
        setEditingFormation(null);
        setSelectedParticipants([]);
        setShowModal(true);
    };

    const openEditModal = (formation: Formation) => {
        // Fonction pour formater les dates pour les inputs datetime-local
        const formatDateTimeLocal = (dateString: string) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            // Formats: YYYY-MM-DDTHH:MM
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        setData({
            titre: formation.titre,
            description: formation.description || '',
            type: formation.type,
            date_debut: formatDateTimeLocal(formation.date_debut),
            date_fin: formatDateTimeLocal(formation.date_fin),
            duree: formation.duree ? formation.duree.toString() : '',
            statut: formation.statut,
            responsable_id: formation.responsable_id.toString(),
            competences: formation.competences || '',
            lien_meet: formation.lien_meet || '',
            participants: [],
        });
        setEditingFormation(formation);
        
        // Charger les participants existants
        const existingParticipants = formation.participants?.map(p => p.id) || [];
        setSelectedParticipants(existingParticipants);
        
        setShowModal(true);
    };

    const openDeleteModal = (formation: Formation) => {
        setDeletingFormation(formation);
        setShowDeleteModal(true);
    };

    const toggleParticipant = (salarieId: number) => {
        setSelectedParticipants(prev => {
            if (prev.includes(salarieId)) {
                return prev.filter(id => id !== salarieId);
            } else {
                return [...prev, salarieId];
            }
        });
    };

    // Synchroniser les participants sélectionnés avec le form data
    useEffect(() => {
        setData('participants', selectedParticipants);
    }, [selectedParticipants, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Préparation des données avec conversion appropriée
        const formData = {
            titre: data.titre.trim(),
            description: data.description.trim() || null,
            type: data.type,
            date_debut: data.date_debut || null,
            date_fin: data.date_fin || null,
            duree: data.duree ? parseInt(data.duree, 10) : null,
            statut: data.statut,
            responsable_id: parseInt(data.responsable_id, 10),
            competences: data.competences 
                ? data.competences.split(',').map(c => c.trim()).filter(c => c.length > 0).join(',')
                : null,
            lien_meet: data.lien_meet.trim() || null,
            participants: selectedParticipants,
        };

        // Validation côté client
        if (formData.type === 'en_ligne' && !formData.lien_meet) {
            alert('Le lien Meet est requis pour une formation en ligne.');
            return;
        }

        if (formData.duree && (isNaN(formData.duree) || formData.duree <= 0)) {
            alert('La durée doit être un nombre positif d\'heures.');
            return;
        }

        // Validation des dates
        if (formData.date_debut && formData.date_fin) {
            const dateDebut = new Date(formData.date_debut);
            const dateFin = new Date(formData.date_fin);
            if (dateFin <= dateDebut) {
                alert('La date de fin doit être postérieure à la date de début.');
                return;
            }
        }
        
        if (editingFormation) {
            put(`/ressources-humaines/formations/${editingFormation.id}`, {
                //data: formData,
                onSuccess: () => {
                    setShowModal(false);
                    setEditingFormation(null);
                    setSelectedParticipants([]);
                    reset();
                },
                onError: (errors) => {
                    console.error('Erreurs de validation:', errors);
                }
            });
        } else {
            post('/ressources-humaines/formations', {
                //data: formData,
                onSuccess: () => {
                    setShowModal(false);
                    setSelectedParticipants([]);
                    reset();
                },
                onError: (errors) => {
                    console.error('Erreurs de validation:', errors);
                }
            });
        }
    };

    const handleDelete = () => {
        if (deletingFormation) {
            router.delete(`/ressources-humaines/formations/${deletingFormation.id}`, {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setDeletingFormation(null);
                }
            });
        }
    };

    const getStatusBadge = (statut: string) => {
        const statusClasses = {
            'en cours': 'bg-blue-100 text-blue-800 border-blue-200',
            'terminée': 'bg-green-100 text-green-800 border-green-200',
            'planifiée': 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
        
        const statusLabels = {
            'en cours': 'En Cours',
            'terminée': 'Terminée',
            'planifiée': 'Planifiée'
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusClasses[statut as keyof typeof statusClasses]}`}>
                {statusLabels[statut as keyof typeof statusLabels]}
            </span>
        );
    };

    const getTypeBadge = (type: string) => {
        const typeClasses = {
            en_ligne: 'bg-purple-100 text-purple-800 border-purple-200',
            presentiel: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        };

        const typeLabels = {
            en_ligne: 'En Ligne',
            presentiel: 'Présentiel',
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${typeClasses[type as keyof typeof typeClasses]}`}>
                {typeLabels[type as keyof typeof typeLabels]}
            </span>
        );
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (hours: number) => {
        if (!hours) return '-';
        if (hours < 24) {
            return `${hours}h`;
        }
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        if (remainingHours === 0) {
            return `${days} jour${days > 1 ? 's' : ''}`;
        }
        return `${days} jour${days > 1 ? 's' : ''} ${remainingHours}h`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Formations - Ressources Humaines" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestion des Formations</h1>
                        <p className="text-gray-600 mt-1">Gérez toutes les formations de l'entreprise</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        Nouvelle Formation
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Formations</p>
                                <p className="text-2xl font-bold text-gray-900">{formations.length}</p>
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
                                    {formations.filter(f => f.statut === 'en cours').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Monitor className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">En Ligne</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formations.filter(f => f.type === 'en_ligne').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Users className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Terminées</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formations.filter(f => f.statut === 'terminée').length}
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
                                        Formation
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Responsable
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Durée
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dates
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Participants
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {formations.map((formation) => {
                                    const competencesArray = parseCompetences(formation.competences);
                                    
                                    return (
                                        <tr key={formation.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{formation.titre}</div>
                                                    {formation.description && (
                                                        <div className="text-sm text-gray-500 truncate max-w-xs">
                                                            {formation.description}
                                                        </div>
                                                    )}
                                                    {competencesArray.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {competencesArray.slice(0, 2).map((competence, index) => (
                                                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                                    {competence}
                                                                </span>
                                                            ))}
                                                            {competencesArray.length > 2 && (
                                                                <span className="text-xs text-gray-500">+{competencesArray.length - 2}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    {getTypeBadge(formation.type)}
                                                    {formation.type === 'en_ligne' && formation.lien_meet && (
                                                        <a 
                                                            href={formation.lien_meet}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-blue-600 hover:text-blue-800 truncate max-w-24"
                                                            title={formation.lien_meet}
                                                        >
                                                            Lien Meet
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-900">{formation.responsable?.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(formation.statut)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDuration(formation.duree)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div>
                                                    <div>Début: {formatDateTime(formation.date_debut)}</div>
                                                    <div>Fin: {formatDateTime(formation.date_fin)}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-900">
                                                        {formation.participants_count || 0}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(formation)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100 transition-colors"
                                                        title="Modifier"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(formation)}
                                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {formations.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-500">
                                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune formation</h3>
                                <p className="mt-1 text-sm text-gray-500">Commencez par créer une nouvelle formation.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingFormation ? 'Modifier la formation' : 'Nouvelle formation'}
                            </h3>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Titre de la formation *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.titre}
                                            onChange={(e) => setData('titre', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        {errors.titre && <div className="text-red-500 text-sm mt-1">{errors.titre}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Type de formation *
                                        </label>
                                        <select
                                            value={data.type}
                                            onChange={(e) => setData('type', e.target.value as any)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="presentiel">Présentiel</option>
                                            <option value="en_ligne">En Ligne</option>
                                        </select>
                                        {errors.type && <div className="text-red-500 text-sm mt-1">{errors.type}</div>}
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
                                            Date de début *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={data.date_debut}
                                            onChange={(e) => setData('date_debut', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        {errors.date_debut && <div className="text-red-500 text-sm mt-1">{errors.date_debut}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Date de fin *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={data.date_fin}
                                            onChange={(e) => setData('date_fin', e.target.value)}
                                            min={data.date_debut}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        {errors.date_fin && <div className="text-red-500 text-sm mt-1">{errors.date_fin}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Durée (en heures) *
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={data.duree}
                                            onChange={(e) => setData('duree', e.target.value)}
                                            placeholder="ex: 8, 16, 24"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        {errors.duree && <div className="text-red-500 text-sm mt-1">{errors.duree}</div>}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Durée en heures (ex: 8 heures = 1 jour, 16 heures = 2 jours)
                                        </p>
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
                                            <option value="planifiée">Planifiée</option>
                                            <option value="en cours">En Cours</option>
                                            <option value="terminée">Terminée</option>
                                        </select>
                                        {errors.statut && <div className="text-red-500 text-sm mt-1">{errors.statut}</div>}
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

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Compétences abordées
                                        </label>
                                        <input
                                            type="text"
                                            value={data.competences}
                                            onChange={(e) => setData('competences', e.target.value)}
                                            placeholder="Séparez les compétences par des virgules (ex: JavaScript, React, Node.js)"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {errors.competences && <div className="text-red-500 text-sm mt-1">{errors.competences}</div>}
                                        <p className="mt-1 text-sm text-gray-500">
                                            Séparez chaque compétence par une virgule
                                        </p>
                                    </div>

                                    {data.type === 'en_ligne' && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Lien de réunion (Meet/Zoom) *
                                            </label>
                                            <input
                                                type="url"
                                                value={data.lien_meet}
                                                onChange={(e) => setData('lien_meet', e.target.value)}
                                                placeholder="https://meet.google.com/xxx-xxx-xxx"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                required={data.type === 'en_ligne'}
                                            />
                                            {errors.lien_meet && <div className="text-red-500 text-sm mt-1">{errors.lien_meet}</div>}
                                        </div>
                                    )}
                                </div>

                                {/* Section Participants */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Sélectionner les participants
                                    </label>
                                    <div className="border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto">
                                        {salaries.filter(salarie => salarie.statut === 'actif').length === 0 ? (
                                            <p className="text-gray-500 text-sm">Aucun salarié actif disponible</p>
                                        ) : (
                                            <div className="grid grid-cols-5 gap-2">
                                                {salaries
                                                    .filter(salarie => salarie.statut === 'actif')
                                                    .map((salarie) => (
                                                        <button
                                                            key={salarie.id}
                                                            type="button"
                                                            onClick={() => toggleParticipant(salarie.id)}
                                                            className={`p-2 text-xs rounded-md border transition-colors text-center ${
                                                                selectedParticipants.includes(salarie.id)
                                                                    ? 'bg-green-100 text-green-800 border-green-300'
                                                                    : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            {salarie.nom} {salarie.prenom}
                                                        </button>
                                                    ))
                                                }
                                            </div>
                                        )}
                                        {selectedParticipants.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <p className="text-sm text-gray-600">
                                                    {selectedParticipants.length} participant{selectedParticipants.length > 1 ? 's' : ''} sélectionné{selectedParticipants.length > 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingFormation(null);
                                            setSelectedParticipants([]);
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
                                        {processing ? 'En cours...' : editingFormation ? 'Mettre à jour' : 'Créer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {showDeleteModal && deletingFormation && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <Trash2 className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Supprimer la formation
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Cette action est irréversible.
                                    </p>
                                </div>
                            </div>
                            
                            <p className="text-gray-700 mb-6">
                                Êtes-vous sûr de vouloir supprimer la formation <strong>"{deletingFormation.titre}"</strong> ?
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeletingFormation(null);
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