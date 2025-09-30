'use client';

import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Eye, Lock, Plus, Save, Shield, UserCheck, Users, UserX } from 'lucide-react';
import type React from 'react';
import { ReactNode, useState } from 'react';

interface Projet {
    type_projet: ReactNode;
    id: number;
    nom: string;
    statut: string;
    date_fin?: string;
    salarie_ids?: number[];
}
interface Vehicule {
    id: number;
    user_id: number;
    type: string;
    modele: string;
    immatriculation: string;
    created_at: string;
    updated_at: string;
}

interface User {
    id: number;
    nom: string;
    prenom: string;
    poste: string;
    email: string;
    telephone: string;
    salaire_mensuel: string;
    date_embauche: string;
    statut: 'actif' | 'inactif';
    projet_id: number;
    created_at: string;
    updated_at: string;
    project: Projet;
    projects_count: number;
    vehicule?: Vehicule | null;
    profil: string;
    profil_string: string;
}

interface RessourcesHumainesUsersProps {
    users?: User[];
    projects?: Projet[];
}

const profilsPostes = [
    {
        value: 'bureau_etudes',
        label: "Bureau d'Études Techniques (BET)",
        postes: [
            'Ingénieur structure (béton, acier, bois)',
            'Ingénieur génie civil',
            'Ingénieur électricité / électricité industrielle',
            'Ingénieur thermique / énergétique',
            'Ingénieur fluides (HVAC, plomberie, CVC)',
            'Ingénieur géotechnique',
            'Dessinateur projeteur / DAO (Autocad, Revit, Tekla)',
            "Technicien bureau d'études",
            "Chargé d'études techniques",
            'Ingénieur environnement / développement durable',
            'Ingénieur calcul de structures',
            'Architecte',
        ],
    },
    {
        value: 'construction',
        label: 'Construction',
        postes: [
            'Chef de chantier',
            'Conducteur de travaux',
            'Ingénieur travaux / Ingénieur chantier',
            "Conducteur d'engins",
            "Chef d'équipe",
            'Technicien travaux',
            'Manœuvre / Ouvrier spécialisé',
            'Coordinateur sécurité chantier (SST, prévention)',
            'Métreur / Économiste de la construction',
        ],
    },
    {
        value: 'suivi_controle',
        label: 'Service de Suivi & Contrôle des Travaux',
        postes: [
            'Contrôleur technique',
            'Chargé de suivi qualité',
            'Chargé de suivi sécurité',
            'Inspecteur de chantier',
            'Responsable HSE (Hygiène, Sécurité, Environnement)',
            'Technicien contrôle qualité',
            'Planificateur / Chargé de planning',
            'Responsable logistique chantier',
        ],
    },
    {
        value: 'support_gestion',
        label: 'Support et Gestion',
        postes: [
            'Responsable administratif chantier',
            'Assistant de projet',
            'Responsable achats / approvisionnement',
            'Responsable qualité',
            'Gestionnaire de contrats',
            'Chargé de communication',
            'Responsable financier / comptable chantier',
        ],
    },
    {
        value: 'administration',
        label: 'Service administration',
        postes: [],
    },
    {
        value: 'marche_marketing',
        label: 'Service marché marketing',
        postes: [],
    },
];

const breadcrumbs = [
    {
        title: 'Dashboard Ressources Humaines & Gestion des Compétences',
        href: '/ressources-humaines/users',
    },
];

export default function RessourcesHumainesUsers({ users = [], projects = [] }: RessourcesHumainesUsersProps) {
    const [showAddPopup, setShowAddPopup] = useState<boolean>(false);
    const [showPasswordPopup, setShowPasswordPopup] = useState<boolean>(false);
    const [showProjectPopup, setShowProjectPopup] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [passwordError, setPasswordError] = useState<string>('');

    const [userProjects, setUserProjects] = useState<Projet[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [projectsError, setProjectsError] = useState<string | null>(null);

    const [addFormData, setAddFormData] = useState({
        nom: '',
        prenom: '',
        nom_profil: '',
        poste_profil: '',
        email: '',
        telephone: '',
        salaire_mensuel: '',
        date_embauche: '',
        emplacement: '',
    });

    const [passwordFormData, setPasswordFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });

    // Add user handlers
    const handleAddSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
      setIsSubmitting(true);
      
        router.post('/users', addFormData, {
            onStart: () => {
           
            },
            onSuccess: (page: any) => {
         
                const created = page?.props?.flash?.created;
                
                handleAddCancel();
            },
            onError: (errors: any) => {
                // Validation/other errors come here
                console.error('[CREATE USER] Validation/Server errors:', errors);
            },
            onFinish: () => {
                console.log('[CREATE USER] Request finished');
                setIsSubmitting(false);
            },
        });
    };

    const handleAddCancel = () => {
        setShowAddPopup(false);
        setAddFormData({
            nom: '',
            prenom: '',
            nom_profil: '',
            poste_profil: '',
            email: '',
            telephone: '',
            salaire_mensuel: '',
            date_embauche: '',
            emplacement: '',
        });
        setIsSubmitting(false);
    };

    const handleAddInputChange = (field: string, value: string) => {
        setAddFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Password update handlers
    const openPasswordPopup = (user: User) => {
        setSelectedUser(user);
        setShowPasswordPopup(true);
    };

    const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setPasswordError('');

        if (!passwordFormData.newPassword.trim() || !passwordFormData.confirmPassword.trim()) {
            setPasswordError('Both password fields are required.');
            return;
        }

        if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
            setPasswordError('Passwords do not match.');
            return;
        }

        if (passwordFormData.newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters long.');
            return;
        }

        if (!selectedUser) return;

        setIsSubmitting(true);

        router.put(
            `/userPass/${selectedUser.id}`,
            {
                new_password: passwordFormData.newPassword,
                new_password_confirmation: passwordFormData.confirmPassword, // ✅ match Laravel
            },
            {
                onSuccess: () => {
                    handlePasswordCancel();
                },
                onError: (errors) => {
                    console.error('Error updating password:', errors);
                    setPasswordError('Failed to update password. Please try again.');
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            },
        );
    };

    const handlePasswordCancel = () => {
        setShowPasswordPopup(false);
        setSelectedUser(null);
        setPasswordFormData({
            newPassword: '',
            confirmPassword: '',
        });
        setPasswordError('');
        setIsSubmitting(false);
    };

    // Enable/Disable user handler
    const handleToggleUserStatus = (user: User) => {
        router.put(
            `/users/${user.id}`,
            {},
            {
                onSuccess: () => {
                    // Success handled by Inertia
                },
                onError: (errors) => {
                    console.error('Error updating user status:', errors);
                },
            },
        );
    };

    // Fetch projects for user and sort enabled first
    const fetchUserProjects = async (userId: number) => {
        setLoadingProjects(true);
        setProjectsError(null);

        try {
            const response = await fetch(`/users/projets`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error(`Error fetching projects: ${response.statusText}`);
            }

            let data: Projet[] = await response.json();

            // Sort projects so those where user is enabled appear first
            data.sort((a, b) => {
                const aEnabled = a.salarie_ids?.includes(userId) ? 0 : 1;
                const bEnabled = b.salarie_ids?.includes(userId) ? 0 : 1;
                return aEnabled - bEnabled;
            });

            setUserProjects(data);
        } catch (error: any) {
            setProjectsError(error.message || 'Failed to fetch projects');
            setUserProjects([]);
        } finally {
            setLoadingProjects(false);
        }
    };

    const handleViewProject = async (user: User) => {
        setSelectedUser(user);
        await fetchUserProjects(user.id);
        setShowProjectPopup(true);
    };

    const handleProjectCancel = () => {
        setShowProjectPopup(false);
        setSelectedUser(null);
    };

    // Toggle user enable/disable in project
    const toggleUserProjectStatus = async (userId: number, projetId: number, isEnabled: boolean) => {
        setIsSubmitting(true);
        try {
            await router.put(
                `/userProjet/${userId}`,
                {
                    projet_id: projetId,
                    enable: !isEnabled,
                },
                {
                    onSuccess: () => {
                        fetchUserProjects(userId);
                    },
                    onError: (err) => {
                        console.error('Error updating project user status', err);
                    },
                    onFinish: () => {
                        setIsSubmitting(false);
                    },
                },
            );
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
        }
    };

    function getRemainingTime(dateFin: string | undefined) {
        if (!dateFin) return '';
        const endDate = new Date(dateFin);
        const now = new Date();
        if (endDate < now) return 'Projet terminé';

        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return `${diffDays} jours`;
    }

    const getSelectedProfilPostes = () => {
        const selectedProfil = profilsPostes.find((p) => p.value === addFormData.nom_profil);
        return selectedProfil ? selectedProfil.postes : [];
    };

    const getStatusBadge = (statut: string) => {
        const statusClasses = {
            actif: 'bg-green-100 text-green-800 border-green-200',
            inactif: 'bg-red-100 text-red-800 border-red-200',
        };

        return (
            <span className={`rounded-full border px-2 py-1 text-xs font-medium ${statusClasses[statut as keyof typeof statusClasses]}`}>
                {statut === 'actif' ? 'Actif' : 'Inactif'}
            </span>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Ressources Humaines & Gestion des Compétences" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestion des Salariés</h1>
                        <p className="mt-1 text-gray-600">Gérez tous les salariés de l'entreprise</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowAddPopup(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-md transition-colors hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            Nouveau Salarié
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Salariés</p>
                                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-green-100 p-2">
                                <UserCheck className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Actifs</p>
                                <p className="text-2xl font-bold text-gray-900">{users.filter((u) => u.statut === 'actif').length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-red-100 p-2">
                                <UserX className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Inactifs</p>
                                <p className="text-2xl font-bold text-gray-900">{users.filter((u) => u.statut === 'inactif').length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-purple-100 p-2">
                                <Shield className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avec Projets</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {users.filter((u) => u.projects_count && u.projects_count > 0).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">N°</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Nom Complet</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Poste</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Véhicules</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Salaire</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Statut</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Projets</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {users.map((user, index) => (
                                    <tr key={user.id} className="transition-colors hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.nom} {user.prenom}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{user.profil_string}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {user.vehicule ? `${user.vehicule.type} - ${user.vehicule.modele}` : '--'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{user.salaire_mensuel} DH</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.statut)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleViewProject(user)}
                                                className="inline-flex items-center space-x-1 rounded bg-green-600 px-3 py-1 text-xs font-medium text-white transition-colors duration-200 hover:bg-green-700"
                                                title="Voir le projet"
                                            >
                                                <Eye className="h-3 w-3" />
                                                <span>{user.projects_count ?? 0}</span>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleToggleUserStatus(user)}
                                                    className={`inline-flex items-center space-x-1 rounded px-3 py-1 text-xs font-medium text-white transition-colors duration-200 ${user.statut === 'actif' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                                                    title={user.statut === 'actif' ? 'Désactiver' : 'Activer'}
                                                >
                                                    {user.statut === 'actif' ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                                                </button>
                                                <button
                                                    onClick={() => openPasswordPopup(user)}
                                                    className="inline-flex items-center space-x-1 rounded bg-orange-600 px-3 py-1 text-xs font-medium text-white transition-colors duration-200 hover:bg-orange-700"
                                                    title="Modifier le mot de passe"
                                                >
                                                    <Lock className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {users.length === 0 && (
                        <div className="py-12 text-center">
                            <div className="text-gray-500">
                                <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun salarié</h3>
                                <p className="mt-1 text-sm text-gray-500">Commencez par ajouter votre premier salarié.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Add User Popup Modal */}
                {showAddPopup && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-600">
                        <div className="m-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6">
                            <h3 className="mb-4 text-lg font-medium text-gray-900">Ajouter un salarié</h3>

                            <form onSubmit={handleAddSave} className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Nom *</label>
                                        <input
                                            type="text"
                                            value={addFormData.nom}
                                            onChange={(e) => handleAddInputChange('nom', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            placeholder="Entrez le nom"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Prénom *</label>
                                        <input
                                            type="text"
                                            value={addFormData.prenom}
                                            onChange={(e) => handleAddInputChange('prenom', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            placeholder="Entrez le prénom"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Profil *</label>
                                        <select
                                            value={addFormData.nom_profil}
                                            onChange={(e) => {
                                                handleAddInputChange('nom_profil', e.target.value);
                                                handleAddInputChange('poste_profil', '');
                                            }}
                                            className="w-full rounded-lg border border-gray-200 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            required
                                            disabled={isSubmitting}
                                        >
                                            <option value="">Sélectionner un profil</option>
                                            {profilsPostes.map((profil) => (
                                                <option key={profil.value} value={profil.value}>
                                                    {profil.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Poste *</label>
                                        <div className="mt-2 space-y-2">
                                            {getSelectedProfilPostes().map((poste, index) => (
                                                <label
                                                    key={index}
                                                    className="flex cursor-pointer items-center rounded-lg border border-gray-200 p-3 transition-all hover:bg-gray-50"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="poste_profil"
                                                        value={poste}
                                                        checked={addFormData.poste_profil === poste}
                                                        onChange={(e) => handleAddInputChange('poste_profil', e.target.value)}
                                                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        disabled={isSubmitting}
                                                        required
                                                    />
                                                    <span className="ml-3 text-sm text-gray-700">{poste}</span>
                                                </label>
                                            ))}

                                            {addFormData.nom_profil &&
                                                addFormData.nom_profil != 'marche_marketing' &&
                                                addFormData.nom_profil != 'administration' &&
                                                getSelectedProfilPostes().length === 0 && (
                                                    <p className="text-sm text-gray-500">Aucun poste disponible pour ce profil</p>
                                                )}

                                            {!addFormData.nom_profil && <p className="text-sm text-gray-500">Sélectionnez d'abord un profil</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Email *</label>
                                        <input
                                            type="email"
                                            value={addFormData.email}
                                            onChange={(e) => handleAddInputChange('email', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            placeholder="Entrez l'email"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Téléphone *</label>
                                        <input
                                            type="tel"
                                            value={addFormData.telephone}
                                            onChange={(e) => handleAddInputChange('telephone', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            placeholder="Entrez le téléphone"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Salaire mensuel *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={addFormData.salaire_mensuel}
                                            onChange={(e) => handleAddInputChange('salaire_mensuel', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            placeholder="Entrez le salaire"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Date d'embauche *</label>
                                        <input
                                            type="date"
                                            value={addFormData.date_embauche}
                                            onChange={(e) => handleAddInputChange('date_embauche', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Emplacement *</label>
                                        <select
                                            value={addFormData.emplacement}
                                            onChange={(e) => handleAddInputChange('emplacement', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            required
                                            disabled={isSubmitting}
                                        >
                                            <option value="">Sélectionner un emplacement</option>
                                            <option value="Bureau">Bureau</option>
                                            <option value="Terrain">Terrain</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 border-t pt-4">
                                    <button
                                        type="button"
                                        onClick={handleAddCancel}
                                        className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                                        disabled={isSubmitting}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                <span>Enregistrement...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <Save className="h-4 w-4" />
                                                <span>Enregistrer</span>
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Password Update Popup Modal */}
                {showPasswordPopup && selectedUser && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-600">
                        <div className="m-4 w-full max-w-md rounded-lg bg-white p-6">
                            <h3 className="mb-4 text-lg font-medium text-gray-900">
                                Modifier le mot de passe - {selectedUser.nom} {selectedUser.prenom}
                            </h3>

                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                {passwordError && (
                                    <div className="rounded-md border border-red-200 bg-red-50 p-3">
                                        <p className="text-sm text-red-600">{passwordError}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        value={passwordFormData.newPassword}
                                        onChange={(e) => setPasswordFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-200 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Entrez le nouveau mot de passe"
                                        required
                                        disabled={isSubmitting}
                                        minLength={8}
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                                    <input
                                        type="password"
                                        value={passwordFormData.confirmPassword}
                                        onChange={(e) => setPasswordFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-200 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Confirmez le nouveau mot de passe"
                                        required
                                        disabled={isSubmitting}
                                        minLength={8}
                                    />
                                </div>

                                <p className="text-sm text-gray-500">Le mot de passe doit contenir au moins 8 caractères.</p>

                                <div className="flex justify-end gap-3 border-t pt-4">
                                    <button
                                        type="button"
                                        onClick={handlePasswordCancel}
                                        className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                                        disabled={isSubmitting}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!passwordFormData.newPassword.trim() || !passwordFormData.confirmPassword.trim() || isSubmitting}
                                        className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                <span>Mise à jour...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <Save className="h-4 w-4" />
                                                <span>Mettre à jour</span>
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Project View Popup Modal */}
                {showProjectPopup && selectedUser && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-600">
                        <div className="m-4 max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6">
                            <h3 className="mb-4 text-lg font-medium text-gray-900">
                                Projets de {selectedUser.nom} {selectedUser.prenom}
                            </h3>

                            {loadingProjects ? (
                                <p>Chargement des projets...</p>
                            ) : projectsError ? (
                                <p className="text-red-600">{projectsError}</p>
                            ) : userProjects.length === 0 ? (
                                <div className="py-8 text-center">
                                    <div className="mb-2 text-lg text-gray-500">Aucun projet assigné</div>
                                    <p className="text-gray-400">Ce salarié n'est actuellement assigné à aucun projet.</p>
                                </div>
                            ) : (
                                <table className="min-w-full border-collapse text-left text-sm text-gray-700">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-4 py-2 font-medium">Nom du projet</th>
                                            <th className="px-4 py-2 font-medium">Type de projet</th>
                                            <th className="px-4 py-2 font-medium">Statut</th>
                                            <th className="px-4 py-2 font-medium">Jours restant</th>
                                            <th className="px-4 py-2 font-medium">N° Salariés</th>
                                            <th className="px-4 py-2 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userProjects.map((project) => {
                                            const isEnabled = project.salarie_ids?.includes(selectedUser.id);
                                            return (
                                                <tr key={project.id} className="transition hover:bg-gray-50">
                                                    <td className="px-4 py-2">{project.nom}</td>
                                                    <td className="px-4 py-2">{project.type_projet}</td>
                                                    <td className="px-4 py-2">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                                                                project.statut === 'en_attente'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : project.statut === 'en_cours'
                                                                      ? 'bg-blue-100 text-blue-800'
                                                                      : 'bg-green-100 text-green-800'
                                                            }`}
                                                        >
                                                            {project.statut.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2">{getRemainingTime(project.date_fin)}</td>
                                                    <td className="px-4 py-2">{project.salarie_ids?.length || 0}</td>
                                                    <td className="px-4 py-2">
                                                        <button
                                                            onClick={() => toggleUserProjectStatus(selectedUser.id, project.id, !!isEnabled)}
                                                            className={`rounded-md px-3 py-1 text-sm font-medium ${
                                                                isEnabled
                                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                            }`}
                                                        >
                                                            {isEnabled ? 'Désactiver' : 'Activer'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}

                            <div className="mt-6 flex justify-end border-t pt-4">
                                <button
                                    type="button"
                                    onClick={handleProjectCancel}
                                    className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
