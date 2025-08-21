import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, TrendingUp, Calendar, CheckCircle, User, FileText, Upload, Download, Eye } from 'lucide-react';

const breadcrumbs = [
{
title: 'Dashboard Ressources Humaines & Gestion des Compétences',
href: '/ressources-humaines/dashboard',
},
{
title: 'Gestion des Progressions',
href: '/ressources-humaines/progressions',
},
];

interface User {
id: number;
name: string;
}

interface Projet {
id: number;
nom: string;
client?: string;
statut: string;
}

interface Progression {
id: number;
projet_id: number;
description_progress: string;
progress: string | null; 
statut: 'en_attente' | 'valide' | 'rejete';
date_validation?: string | null;
pourcentage: number;
commentaire?: string | null;
valide_par?: number | null;
projet: Projet;
valide_par_user?: User | null;
created_at: string;
updated_at: string;
}

interface Props {
progressions: Progression[];
projets: Projet[];
users: User[];
}

export default function Progressions({ progressions, projets, users }: Props) {
const [showModal, setShowModal] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [editingProgression, setEditingProgression] = useState<Progression | null>(null);
const [deletingProgression, setDeletingProgression] = useState<Progression | null>(null);
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [filePreview, setFilePreview] = useState<string | null>(null);
const [uploadError, setUploadError] = useState<string | null>(null);

type FormData = {
    projet_id: string;
    description_progress: string;
    progress_file: File | null;
    statut: 'en_attente' | 'valide' | 'rejete'; 
    date_validation: string;
    pourcentage: string;
    commentaire: string;
    valide_par: string;
    _method: string;
};

const { data, setData, post, processing, errors, reset } = useForm<FormData>({
    projet_id: '',
    description_progress: '',
    progress_file: null,
    statut: 'en_attente', 
    date_validation: '',
    pourcentage: '',
    commentaire: '',
    valide_par: '',
    _method: 'POST'
});

const openCreateModal = () => {
    reset();
    setEditingProgression(null);
    setSelectedFile(null);
    setFilePreview(null);
    setUploadError(null);
    setShowModal(true);
};

const openEditModal = (progression: Progression) => {
    setData({
        projet_id: progression.projet_id.toString(),
        description_progress: progression.description_progress,
        progress_file: null,
        statut: progression.statut,
        date_validation: progression.date_validation ? progression.date_validation.split('T')[0] : '',
        pourcentage: progression.pourcentage.toString(),
        commentaire: progression.commentaire || '',
        valide_par: progression.valide_par?.toString() || '',
        _method: 'PUT'
    });
    setEditingProgression(progression);
    setSelectedFile(null);
    setFilePreview(null);
    setUploadError(null);
    setShowModal(true);
};

const openDeleteModal = (progression: Progression) => {
    setDeletingProgression(progression);
    setShowDeleteModal(true);
};

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    
    if (file) {
        // Validation de la taille (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            setUploadError('Le fichier est trop volumineux. Taille maximum : 10MB');
            return;
        }

        // Validation du type de fichier
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'text/plain'
        ];

        if (!allowedTypes.includes(file.type)) {
            setUploadError('Type de fichier non autorisé. Types acceptés : PDF, Word, Excel, Images, TXT');
            return;
        }

        setSelectedFile(file);
        setData('progress_file', file);
        
        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFilePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    }
};

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
        // Validation côté client
        if (!data.projet_id) {
            alert('Veuillez sélectionner un projet');
            return;
        }
        
        if (!data.description_progress.trim()) {
            alert('Veuillez saisir une description');
            return;
        }
        
        if (!data.pourcentage || parseFloat(data.pourcentage) < 0 || parseFloat(data.pourcentage) > 100) {
            alert('Le pourcentage doit être entre 0 et 100');
            return;
        }

        const formData = new FormData();
        
        // Ajouter tous les champs requis
        formData.append('projet_id', data.projet_id);
        formData.append('description_progress', data.description_progress.trim());
        formData.append('statut', data.statut);
        formData.append('pourcentage', data.pourcentage);
        
        // Ajouter les champs optionnels seulement s'ils ont une valeur
        if (data.commentaire && data.commentaire.trim()) {
            formData.append('commentaire', data.commentaire.trim());
        }
        if (data.valide_par) {
            formData.append('valide_par', data.valide_par);
        }
        if (data.date_validation) {
            formData.append('date_validation', data.date_validation);
        }
        
        // Ajouter le fichier s'il existe
        if (selectedFile) {
            formData.append('progress_file', selectedFile, selectedFile.name);
        }
        
        if (editingProgression) {
            formData.append('_method', 'PUT');
            router.post(`/ressources-humaines/progressions/${editingProgression.id}`, formData, {
                forceFormData: true,
                preserveState: false,
                onSuccess: () => {
                    setShowModal(false);
                    setEditingProgression(null);
                    setSelectedFile(null);
                    setFilePreview(null);
                    setUploadError(null);
                    reset();
                },
                onError: (errors) => {
                    console.error('Erreur lors de la mise à jour:', errors);
                    if (errors.progress_file) {
                        setUploadError(errors.progress_file);
                    }
                    
                    // Afficher les autres erreurs
                    const errorMessages = Object.values(errors).flat();
                    if (errorMessages.length > 0) {
                        alert('Erreur: ' + errorMessages.join(', '));
                    }
                }
            });
        } else {
            router.post('/ressources-humaines/progressions', formData, {
                forceFormData: true,
                preserveState: false,
                onSuccess: () => {
                    setShowModal(false);
                    setSelectedFile(null);
                    setFilePreview(null);
                    setUploadError(null);
                    reset();
                },
                onError: (errors) => {
                    console.error('Erreur lors de la création:', errors);
                    if (errors.progress_file) {
                        setUploadError(errors.progress_file);
                    }
                    
                    // Afficher les autres erreurs
                    const errorMessages = Object.values(errors).flat();
                    if (errorMessages.length > 0) {
                        alert('Erreur: ' + errorMessages.join(', '));
                    }
                }
            });
        }
    } catch (error) {
        console.error('Erreur lors de la soumission:', error);
        alert('Une erreur est survenue lors de la soumission');
    }
};

const handleDelete = () => {
    if (deletingProgression) {
        router.delete(`/ressources-humaines/progressions/${deletingProgression.id}`, {
            onSuccess: () => {
                setShowDeleteModal(false);
                setDeletingProgression(null);
            }
        });
    }
};

const getStatutBadge = (statut: string) => {
    const statutClasses = {
        en_attente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        valide: 'bg-green-100 text-green-800 border-green-200',
        rejete: 'bg-red-100 text-red-800 border-red-200'
    };
    
    const statutLabels = {
        en_attente: 'En Attente',
        valide: 'Validé',
        rejete: 'Rejeté'
    };

    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statutClasses[statut as keyof typeof statutClasses] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
            {statutLabels[statut as keyof typeof statutLabels] || statut}
        </span>
    );
};

const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getProgressColor = (pourcentage: number) => {
    if (pourcentage >= 80) return 'bg-green-500';
    if (pourcentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
};

const getFileIcon = (fileName: string) => {
    if (!fileName) return <FileText className="w-4 h-4 text-gray-500" />;
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'pdf':
            return <FileText className="w-4 h-4 text-red-500" />;
        case 'doc':
        case 'docx':
            return <FileText className="w-4 h-4 text-blue-500" />;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return <Eye className="w-4 h-4 text-green-500" />;
        default:
            return <FileText className="w-4 h-4 text-gray-500" />;
    }
};

const getFileName = (filePath: string) => {
    if (!filePath) return '';
    return filePath.split('/').pop() || filePath;
};

return (
    <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Gestion des Progressions - Ressources Humaines" />
        
        <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestion des Progressions</h1>
                    <p className="text-gray-600 mt-1">Suivez et gérez les progressions de tous les projets</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
                >
                    <Plus className="w-4 h-4" />
                    Ajouter Progression
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Progressions</p>
                            <p className="text-2xl font-bold text-gray-900">{progressions?.length || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Validées</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {progressions?.filter(p => p.statut === 'valide').length || 0}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">En Attente</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {progressions?.filter(p => p.statut === 'en_attente').length || 0}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Progression Moyenne</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {progressions && progressions.length > 0 
                                    ? Math.round(progressions.reduce((sum, p) => sum + p.pourcentage, 0) / progressions.length)
                                    : 0}%
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
                                    N°
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Projet
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fichier Joint
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pourcentage
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Validé par
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ajouté le
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {progressions && progressions.length > 0 ? (
                                progressions.map((progression, index) => (
                                    <tr key={progression.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {progression.projet?.nom || 'N/A'}
                                                </div>
                                                {progression.projet?.client && (
                                                    <div className="text-sm text-gray-500">
                                                        Client: {progression.projet.client}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                            <div className="truncate" title={progression.description_progress}>
                                                {progression.description_progress}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {progression.progress ? (
                                                <div className="flex items-center gap-2">
                                                    {getFileIcon(getFileName(progression.progress))}
                                                    <div className="text-xs">
                                                        <div className="text-gray-900 truncate max-w-24" title={getFileName(progression.progress)}>
                                                            {getFileName(progression.progress)}
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={`/storage/${progression.progress}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition-colors"
                                                        title="Télécharger"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs">Aucun fichier</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${getProgressColor(progression.pourcentage)}`}
                                                        style={{ width: `${Math.min(progression.pourcentage, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {progression.pourcentage}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatutBadge(progression.statut)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {progression.valide_par_user?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(progression.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(progression)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100 transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(progression)}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                                        <div className="flex flex-col items-center py-8">
                                            <TrendingUp className="w-12 h-12 text-gray-400 mb-4" />
                                            <h3 className="text-sm font-medium text-gray-900">Aucune progression trouvée</h3>
                                            <p className="text-sm text-gray-500 mt-1">Commencez par ajouter une nouvelle progression.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Créer/Modifier Progression */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            {editingProgression ? 'Modifier la progression' : 'Nouvelle progression'}
                        </h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Projet *
                                    </label>
                                    <select
                                        value={data.projet_id}
                                        onChange={(e) => setData('projet_id', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-green-500 focus:border-green-500"
                                        required
                                    >
                                        <option value="">Sélectionner un projet</option>
                                        {projets?.map((projet) => (
                                            <option key={projet.id} value={projet.id}>
                                                {projet.nom} {projet.client && `(${projet.client})`}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.projet_id && <div className="text-red-500 text-sm mt-1">{errors.projet_id}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Pourcentage *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={data.pourcentage}
                                        onChange={(e) => setData('pourcentage', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-green-500 focus:border-green-500"
                                        required
                                    />
                                    {errors.pourcentage && <div className="text-red-500 text-sm mt-1">{errors.pourcentage}</div>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Description de la progression *
                                    </label>
                                    <textarea
                                        value={data.description_progress}
                                        onChange={(e) => setData('description_progress', e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-green-500 focus:border-green-500"
                                        required
                                        placeholder="Décrivez les progrès réalisés..."
                                    />
                                    {errors.description_progress && <div className="text-red-500 text-sm mt-1">{errors.description_progress}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Statut *
                                    </label>
                                    <select
                                        value={data.statut}
                                        onChange={(e) => setData('statut', e.target.value as any)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-green-500 focus:border-green-500"
                                        required
                                    >
                                        <option value="en_attente">En Attente</option>
                                        <option value="valide">Validé</option>
                                        <option value="rejete">Rejeté</option>
                                    </select>
                                    {errors.statut && <div className="text-red-500 text-sm mt-1">{errors.statut}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Validé par
                                    </label>
                                    <select
                                        value={data.valide_par}
                                        onChange={(e) => setData('valide_par', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="">Sélectionner un validateur</option>
                                        {users?.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.valide_par && <div className="text-red-500 text-sm mt-1">{errors.valide_par}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date de validation
                                    </label>
                                    <input
                                        type="date"
                                        value={data.date_validation}
                                        onChange={(e) => setData('date_validation', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                    {errors.date_validation && <div className="text-red-500 text-sm mt-1">{errors.date_validation}</div>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fichier de progression
                                    </label>
                                    
                                    {/* File upload area */}
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                                        <input
                                            type="file"
                                            id="file-upload"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xlsx,.xls"
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="mt-4">
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium text-green-600 hover:text-green-500">
                                                        Cliquez pour uploader
                                                    </span>{' '}
                                                    ou glissez-déposez
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    PDF, Word, Excel, Images (max. 10MB)
                                                </p>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Upload error */}
                                    {uploadError && (
                                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                            <p className="text-sm text-red-600">{uploadError}</p>
                                        </div>
                                    )}

                                    {/* File preview */}
                                    {selectedFile && !uploadError && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                                            <div className="flex items-center gap-3">
                                                {getFileIcon(selectedFile.name)}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {selectedFile.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedFile(null);
                                                        setData('progress_file', null);
                                                        setFilePreview(null);
                                                        setUploadError(null);
                                                        // Reset the file input
                                                        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                                                        if (fileInput) fileInput.value = '';
                                                    }}
                                                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Image preview */}
                                    {filePreview && !uploadError && (
                                        <div className="mt-3">
                                            <img
                                                src={filePreview}
                                                alt="Preview"
                                                className="max-w-full h-32 object-cover rounded-lg border"
                                            />
                                        </div>
                                    )}

                                    {/* Current file (for edit mode) */}
                                    {editingProgression && editingProgression.progress && !selectedFile && (
                                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex items-center gap-3">
                                                {getFileIcon(getFileName(editingProgression.progress))}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-blue-900">
                                                        Fichier actuel : {getFileName(editingProgression.progress)}
                                                    </p>
                                                </div>
                                                <a
                                                    href={`/storage/${editingProgression.progress}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition-colors"
                                                    title="Télécharger le fichier actuel"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            </div>
                                            <p className="text-xs text-blue-600 mt-2">
                                                Sélectionnez un nouveau fichier pour le remplacer
                                            </p>
                                        </div>
                                    )}

                                    {errors.progress_file && <div className="text-red-500 text-sm mt-1">{errors.progress_file}</div>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Commentaire
                                    </label>
                                    <textarea
                                        value={data.commentaire}
                                        onChange={(e) => setData('commentaire', e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder="Commentaires additionnels..."
                                    />
                                    {errors.commentaire && <div className="text-red-500 text-sm mt-1">{errors.commentaire}</div>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingProgression(null);
                                        setSelectedFile(null);
                                        setFilePreview(null);
                                        setUploadError(null);
                                        reset();
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || !!uploadError}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'En cours...' : editingProgression ? 'Mettre à jour' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && deletingProgression && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    Supprimer la progression
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Cette action est irréversible.
                                </p>
                            </div>
                        </div>
                        
                        <p className="text-gray-700 mb-6">
                            Êtes-vous sûr de vouloir supprimer cette progression du projet <strong>"{deletingProgression.projet?.nom || 'N/A'}"</strong> ?
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletingProgression(null);
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