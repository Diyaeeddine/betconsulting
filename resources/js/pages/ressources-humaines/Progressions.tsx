import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Calendar, CheckCircle, Download, Edit, Eye, FileText, Plus, Trash2, TrendingUp, Upload, User } from 'lucide-react';
import React, { useState } from 'react';

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
    const [showProgressionsModal, setShowProgressionsModal] = useState(false);
    const [editingProgression, setEditingProgression] = useState<Progression | null>(null);
    const [deletingProgression, setDeletingProgression] = useState<Progression | null>(null);
    const [selectedProject, setSelectedProject] = useState<Projet | null>(null);
    const [projectProgressions, setProjectProgressions] = useState<Progression[]>([]);
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
        _method: 'POST',
    });

    // Grouper les progressions par projet
    const groupProgressionsByProject = () => {
        const grouped = progressions.reduce(
            (acc, progression) => {
                const projetId = progression.projet_id;
                if (!acc[projetId]) {
                    acc[projetId] = {
                        projet: progression.projet,
                        progressions: [],
                        totalProgressions: 0,
                        progressionMoyenne: 0,
                        derniereMiseAJour: null,
                    };
                }
                acc[projetId].progressions.push(progression);
                acc[projetId].totalProgressions++;
                return acc;
            },
            {} as Record<number, any>,
        );

        // Calculer les statistiques pour chaque projet
        Object.values(grouped).forEach((group: any) => {
            const progressions = group.progressions;
            group.progressionMoyenne = Math.round(progressions.reduce((sum: number, p: Progression) => sum + p.pourcentage, 0) / progressions.length);
            group.derniereMiseAJour = progressions.reduce(
                (latest: string, p: Progression) => (p.updated_at > latest ? p.updated_at : latest),
                progressions[0].updated_at,
            );
        });

        return grouped;
    };

    const groupedProgressions = groupProgressionsByProject();

    const showProjectProgressions = (projet: Projet) => {
        const projetProgressions = progressions.filter((p) => p.projet_id === projet.id);
        setSelectedProject(projet);
        setProjectProgressions(projetProgressions);
        setShowProgressionsModal(true);
    };

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
            _method: 'PUT',
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
                'text/plain',
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
                    },
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
                    },
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
                },
            });
        }
    };

    const editProgressionFromModal = (progression: Progression) => {
        setShowProgressionsModal(false);
        openEditModal(progression);
    };

    const deleteProgressionFromModal = (progression: Progression) => {
        setShowProgressionsModal(false);
        openDeleteModal(progression);
    };

    const getStatutBadge = (statut: string) => {
        const statutClasses = {
            en_attente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            valide: 'bg-green-100 text-green-800 border-green-200',
            rejete: 'bg-red-100 text-red-800 border-red-200',
        };

        const statutLabels = {
            en_attente: 'En Attente',
            valide: 'Validé',
            rejete: 'Rejeté',
        };

        return (
            <span
                className={`rounded-full border px-2 py-1 text-xs font-medium ${statutClasses[statut as keyof typeof statutClasses] || 'border-gray-200 bg-gray-100 text-gray-800'}`}
            >
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
            minute: '2-digit',
        });
    };

    const getProgressColor = (pourcentage: number) => {
        if (pourcentage >= 80) return 'bg-green-500';
        if (pourcentage >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getFileIcon = (fileName: string) => {
        if (!fileName) return <FileText className="h-4 w-4 text-gray-500" />;

        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf':
                return <FileText className="h-4 w-4 text-red-500" />;
            case 'doc':
            case 'docx':
                return <FileText className="h-4 w-4 text-blue-500" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <Eye className="h-4 w-4 text-green-500" />;
            default:
                return <FileText className="h-4 w-4 text-gray-500" />;
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestion des Progressions</h1>
                        <p className="mt-1 text-gray-600">Suivez et gérez les progressions de tous les projets</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white shadow-md transition-colors hover:bg-green-700"
                    >
                        <Plus className="h-4 w-4" />
                        Ajouter Progression
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Progressions</p>
                                <p className="text-2xl font-bold text-gray-900">{progressions?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-green-100 p-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Validées</p>
                                <p className="text-2xl font-bold text-gray-900">{progressions?.filter((p) => p.statut === 'valide').length || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-yellow-100 p-2">
                                <Calendar className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">En Attente</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {progressions?.filter((p) => p.statut === 'en_attente').length || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-purple-100 p-2">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Progression Moyenne</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {progressions && progressions.length > 0
                                        ? Math.round(progressions.reduce((sum, p) => sum + p.pourcentage, 0) / progressions.length)
                                        : 0}
                                    %
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table des projets */}
                <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">N°</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Projet</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Nombre de Progressions
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Progression Moyenne
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Dernière Mise à Jour
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Statut du Projet
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {Object.values(groupedProgressions).length > 0 ? (
                                    Object.values(groupedProgressions).map((group: any, index: number) => (
                                        <tr key={group.projet.id} className="transition-colors hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{group.projet.nom || 'N/A'}</div>
                                                    {group.projet.client && (
                                                        <div className="text-sm text-gray-500">Client: {group.projet.client}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                {group.totalProgressions} progression{group.totalProgressions > 1 ? 's' : ''}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-16 rounded-full bg-gray-200">
                                                        <div
                                                            className={`h-2 rounded-full ${getProgressColor(group.progressionMoyenne)}`}
                                                            style={{ width: `${Math.min(group.progressionMoyenne, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">{group.progressionMoyenne}%</span>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {formatDate(group.derniereMiseAJour)}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                                    {group.projet.statut || 'En cours'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => showProjectProgressions(group.projet)}
                                                        className="rounded p-1 text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-900"
                                                        title="Voir les progressions"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                            <div className="flex flex-col items-center py-8">
                                                <TrendingUp className="mb-4 h-12 w-12 text-gray-400" />
                                                <h3 className="text-sm font-medium text-gray-900">Aucun projet avec progressions trouvé</h3>
                                                <p className="mt-1 text-sm text-gray-500">Commencez par ajouter une nouvelle progression.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Progressions du Projet */}
                {showProgressionsModal && selectedProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
                        <div className="m-4 max-h-[90vh] w-full max-w-7xl overflow-y-auto rounded-lg bg-white p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-800">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">Progressions du projet : {selectedProject.nom}</h2>
                                        <p className="text-gray-600">
                                            {selectedProject.client && `Client: ${selectedProject.client} • `}
                                            {projectProgressions.length} progression{projectProgressions.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowProgressionsModal(false)}
                                    className="text-gray-400 transition-colors hover:text-gray-600"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {projectProgressions.length === 0 ? (
                                    <div className="py-8 text-center text-gray-500">
                                        <TrendingUp className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                        <h3 className="text-lg font-medium text-gray-900">Aucune progression trouvée</h3>
                                        <p className="mt-1 text-sm text-gray-500">Aucune progression n'a été enregistrée pour ce projet.</p>
                                    </div>
                                ) : (
                                    // Organiser les progressions en groupes de 3
                                    (() => {
                                        const groups = [];
                                        for (let i = 0; i < projectProgressions.length; i += 3) {
                                            groups.push(projectProgressions.slice(i, i + 3));
                                        }
                                        return groups.map((group, groupIndex) => (
                                            <div key={groupIndex} className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                                {group.map((progression, index) => (
                                                    <div
                                                        key={progression.id}
                                                        className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                                                    >
                                                        <div className="mb-3 flex items-start justify-between">
                                                            <h4 className="font-medium text-gray-900">Progression #{groupIndex * 3 + index + 1}</h4>
                                                            {getStatutBadge(progression.statut)}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-gray-600">Pourcentage:</span>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-1.5 w-12 rounded-full bg-gray-200">
                                                                        <div
                                                                            className={`h-1.5 rounded-full ${getProgressColor(progression.pourcentage)}`}
                                                                            style={{ width: `${Math.min(progression.pourcentage, 100)}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <span className="text-sm font-medium text-gray-900">
                                                                        {progression.pourcentage}%
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-gray-600">Date:</span>
                                                                <span className="text-sm text-gray-900">{formatDate(progression.created_at)}</span>
                                                            </div>

                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-gray-600">Validé par:</span>
                                                                <span className="text-sm text-gray-900">
                                                                    {progression.valide_par_user?.name || '-'}
                                                                </span>
                                                            </div>

                                                            <div>
                                                                <span className="mb-1 block text-sm text-gray-600">Description:</span>
                                                                <p className="break-words text-xs text-gray-900">
                                                                    {progression.description_progress}
                                                                </p>
                                                            </div>

                                                            {progression.progress && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-gray-600">Fichier:</span>
                                                                    <div className="flex items-center gap-1">
                                                                        {getFileIcon(getFileName(progression.progress))}
                                                                        <span className="max-w-20 truncate text-xs text-gray-900">
                                                                            {getFileName(progression.progress)}
                                                                        </span>
                                                                        <a
                                                                            href={`/storage/${progression.progress}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="rounded p-1 text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800"
                                                                            title="Télécharger"
                                                                        >
                                                                            <Download className="h-3 w-3" />
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="mt-3 flex justify-end space-x-2 border-t border-gray-200 pt-2">
                                                                <button
                                                                    onClick={() => editProgressionFromModal(progression)}
                                                                    className="rounded p-1 text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800"
                                                                    title="Modifier"
                                                                >
                                                                    <Edit className="h-3 w-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteProgressionFromModal(progression)}
                                                                    className="rounded p-1 text-red-600 transition-colors hover:bg-red-100 hover:text-red-800"
                                                                    title="Supprimer"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ));
                                    })()
                                )}
                            </div>

                            <div className="mt-6 flex justify-end border-t pt-4">
                                <button
                                    onClick={() => setShowProgressionsModal(false)}
                                    className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Créer/Modifier Progression */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
                        <div className="m-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6">
                            <h3 className="mb-4 text-lg font-medium text-gray-900">
                                {editingProgression ? 'Modifier la progression' : 'Nouvelle progression'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Projet *</label>
                                        <select
                                            value={data.projet_id}
                                            onChange={(e) => setData('projet_id', e.target.value)}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500"
                                            required
                                        >
                                            <option value="">Sélectionner un projet</option>
                                            {projets?.map((projet) => (
                                                <option key={projet.id} value={projet.id}>
                                                    {projet.nom} {projet.client && `(${projet.client})`}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.projet_id && <div className="mt-1 text-sm text-red-500">{errors.projet_id}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Pourcentage *</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            value={data.pourcentage}
                                            onChange={(e) => setData('pourcentage', e.target.value)}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500"
                                            required
                                        />
                                        {errors.pourcentage && <div className="mt-1 text-sm text-red-500">{errors.pourcentage}</div>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Description de la progression *</label>
                                        <textarea
                                            value={data.description_progress}
                                            onChange={(e) => setData('description_progress', e.target.value)}
                                            rows={3}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500"
                                            required
                                            placeholder="Décrivez les progrès réalisés..."
                                        />
                                        {errors.description_progress && (
                                            <div className="mt-1 text-sm text-red-500">{errors.description_progress}</div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Statut *</label>
                                        <select
                                            value={data.statut}
                                            onChange={(e) => setData('statut', e.target.value as any)}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500"
                                            required
                                        >
                                            <option value="en_attente">En Attente</option>
                                            <option value="valide">Validé</option>
                                            <option value="rejete">Rejeté</option>
                                        </select>
                                        {errors.statut && <div className="mt-1 text-sm text-red-500">{errors.statut}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Validé par</label>
                                        <select
                                            value={data.valide_par}
                                            onChange={(e) => setData('valide_par', e.target.value)}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500"
                                        >
                                            <option value="">Sélectionner un validateur</option>
                                            {users?.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.valide_par && <div className="mt-1 text-sm text-red-500">{errors.valide_par}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date de validation</label>
                                        <input
                                            type="date"
                                            value={data.date_validation}
                                            onChange={(e) => setData('date_validation', e.target.value)}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500"
                                        />
                                        {errors.date_validation && <div className="mt-1 text-sm text-red-500">{errors.date_validation}</div>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Fichier de progression</label>

                                        {/* File upload area */}
                                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-green-500">
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
                                                        <span className="font-medium text-green-600 hover:text-green-500">Cliquez pour uploader</span>{' '}
                                                        ou glissez-déposez
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-500">PDF, Word, Excel, Images (max. 10MB)</p>
                                                </div>
                                            </label>
                                        </div>

                                        {/* Upload error */}
                                        {uploadError && (
                                            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                                                <p className="text-sm text-red-600">{uploadError}</p>
                                            </div>
                                        )}

                                        {/* File preview */}
                                        {selectedFile && !uploadError && (
                                            <div className="mt-3 rounded-lg border bg-gray-50 p-3">
                                                <div className="flex items-center gap-3">
                                                    {getFileIcon(selectedFile.name)}
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-gray-900">{selectedFile.name}</p>
                                                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
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
                                                        className="rounded p-1 text-red-500 hover:bg-red-100 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Image preview */}
                                        {filePreview && !uploadError && (
                                            <div className="mt-3">
                                                <img src={filePreview} alt="Preview" className="h-32 max-w-full rounded-lg border object-cover" />
                                            </div>
                                        )}

                                        {/* Current file (for edit mode) */}
                                        {editingProgression && editingProgression.progress && !selectedFile && (
                                            <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                                <div className="flex items-center gap-3">
                                                    {getFileIcon(getFileName(editingProgression.progress))}
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-blue-900">
                                                            Fichier actuel : {getFileName(editingProgression.progress)}
                                                        </p>
                                                    </div>
                                                    <a
                                                        href={`/storage/${editingProgression.progress}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="rounded p-1 text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800"
                                                        title="Télécharger le fichier actuel"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </div>
                                                <p className="mt-2 text-xs text-blue-600">Sélectionnez un nouveau fichier pour le remplacer</p>
                                            </div>
                                        )}

                                        {errors.progress_file && <div className="mt-1 text-sm text-red-500">{errors.progress_file}</div>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Commentaire</label>
                                        <textarea
                                            value={data.commentaire}
                                            onChange={(e) => setData('commentaire', e.target.value)}
                                            rows={3}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500"
                                            placeholder="Commentaires additionnels..."
                                        />
                                        {errors.commentaire && <div className="mt-1 text-sm text-red-500">{errors.commentaire}</div>}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 border-t pt-4">
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
                                        className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing || !!uploadError}
                                        className="rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
                        <div className="m-4 w-full max-w-md rounded-lg bg-white p-6">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                                    <Trash2 className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Supprimer la progression</h3>
                                    <p className="text-sm text-gray-500">Cette action est irréversible.</p>
                                </div>
                            </div>

                            <p className="mb-6 text-gray-700">
                                Êtes-vous sûr de vouloir supprimer cette progression du projet{' '}
                                <strong>"{deletingProgression.projet?.nom || 'N/A'}"</strong> ?
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeletingProgression(null);
                                    }}
                                    className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
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
