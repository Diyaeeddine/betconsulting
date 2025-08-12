import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Plus, X, Save, Edit, Eye, Lock } from 'lucide-react';

// Updated interfaces based on your data structure
interface Projet {
    id: number;
    nom: string;
    statut: string;
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
    statut: string;
    projet_id: number;
    created_at: string;
    updated_at: string;
    project: Projet;
}

interface RessourcesHumainesUsersProps {
    users?: User[];
    projects?: Projet[];
}

const breadcrumbs = [
    {
        title: 'Dashboard Ressources Humaines & Gestion des Compétences',
        href: '/ressources-humaines/users',
    },
];

export default function RessourcesHumainesUsers({ users = [], projects = [] }: RessourcesHumainesUsersProps) {
    // State management
    const [showAddPopup, setShowAddPopup] = useState<boolean>(false);
    const [showEditPopup, setShowEditPopup] = useState<boolean>(false);
    const [showPasswordPopup, setShowPasswordPopup] = useState<boolean>(false);
    const [showProjectPopup, setShowProjectPopup] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [passwordError, setPasswordError] = useState<string>('');
    const [isLoadingUser, setIsLoadingUser] = useState<boolean>(false);

    // Form states for adding user
    const [addFormData, setAddFormData] = useState({
        nom: '',
        prenom: '',
        poste: '',
        email: '',
        telephone: '',
        salaire_mensuel: '',
        date_embauche: '',
        projet_id: ''
    });

    // Form states for editing user
    const [editFormData, setEditFormData] = useState({
        nom: '',
        prenom: '',
        poste: '',
        email: '',
        telephone: '',
        salaire_mensuel: '',
        date_embauche: '',
        projet_id: ''
    });

    // Password form states
    const [passwordFormData, setPasswordFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    // Add user handlers
    const handleAddSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/users', addFormData, {
            onSuccess: () => {
                handleAddCancel();
            },
            onError: (errors) => {
                console.error('Error creating user:', errors);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const handleAddCancel = () => {
        setShowAddPopup(false);
        setAddFormData({
            nom: '',
            prenom: '',
            poste: '',
            email: '',
            telephone: '',
            salaire_mensuel: '',
            date_embauche: '',
            projet_id: ''
        });
        setIsSubmitting(false);
    };

    const handleAddInputChange = (field: string, value: string) => {
        setAddFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Edit user handlers
    const openEditPopup = async (user: User) => {
        setSelectedUser(user);
        setIsLoadingUser(true);
        setShowEditPopup(true);

        try {
            const response = await fetch(`/users/${user.id}`);
            const data = await response.json();

            if (response.ok) {
                setEditFormData({
                    nom: data.user.nom || '',
                    prenom: data.user.prenom || '',
                    poste: data.user.poste || '',
                    email: data.user.email || '',
                    telephone: data.user.telephone || '',
                    salaire_mensuel: data.user.salaire_mensuel || '',
                    date_embauche: data.user.date_embauche || '',
                    projet_id: data.user.projet_id?.toString() || ''
                });
            } else {
                console.error('Error fetching user:', data.error);
            }
        } catch (error) {
            console.error('Network or parsing error:', error);
        } finally {
            setIsLoadingUser(false);
        }
    };

    const handleEditSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedUser) return;

        setIsSubmitting(true);

        router.put(`/users/${selectedUser.id}`, editFormData, {
            onSuccess: () => {
                handleEditCancel();
            },
            onError: (errors) => {
                console.error('Error updating user:', errors);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const handleEditCancel = () => {
        setShowEditPopup(false);
        setSelectedUser(null);
        setEditFormData({
            nom: '',
            prenom: '',
            poste: '',
            email: '',
            telephone: '',
            salaire_mensuel: '',
            date_embauche: '',
            projet_id: ''
        });
        setIsSubmitting(false);
        setIsLoadingUser(false);
    };

    const handleEditInputChange = (field: string, value: string) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
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

        router.put(`/userPass/${selectedUser.id}`, {
            new_password: passwordFormData.newPassword
        }, {
            onSuccess: () => {
                handlePasswordCancel();
            },
            onError: (errors) => {
                console.error('Error updating password:', errors);
                setPasswordError('Failed to update password. Please try again.');
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const handlePasswordCancel = () => {
        setShowPasswordPopup(false);
        setSelectedUser(null);
        setPasswordFormData({
            newPassword: '',
            confirmPassword: ''
        });
        setPasswordError('');
        setIsSubmitting(false);
    };

    // Project view handlers
    const handleViewProject = (user: User) => {
        setSelectedUser(user);
        setShowProjectPopup(true);
    };

    const handleProjectCancel = () => {
        setShowProjectPopup(false);
        setSelectedUser(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Ressources Humaines & Gestion des Compétences" />
            
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Salariés</h1>
                    <button
                        onClick={() => setShowAddPopup(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter Salarié</span>
                    </button>
                </div>

                {/* Main Content */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {users.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-500 text-lg mb-4">Aucun Salarié trouvé</div>
                            <p className="text-gray-400">Commencez par ajouter votre premier Salarié.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            N°
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nom Complet
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Poste
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Projet
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Salaire
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user, index) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{user.nom} {user.prenom}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{user.poste}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleViewProject(user)}
                                                    className="inline-flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors duration-200"
                                                    title="Voir le projet"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                    <span>{user.project?.nom || 'N/A'}</span>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{user.salaire_mensuel}€</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => openEditPopup(user)}
                                                        className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors duration-200"
                                                        title="Modifier l'utilisateur"
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                        <span>Edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => openPasswordPopup(user)}
                                                        className="inline-flex items-center space-x-1 px-3 py-1 bg-orange-600 text-white text-xs font-medium rounded hover:bg-orange-700 transition-colors duration-200"
                                                        title="Modifier le mot de passe"
                                                    >
                                                        <Lock className="w-3 h-3" />
                                                        <span>Pass</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Add User Popup Modal */}
                {showAddPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                            <form onSubmit={handleAddSave}>
                                <div className="flex justify-between items-center border-b p-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Ajouter un salarié</h3>
                                    <button 
                                        type="button"
                                        onClick={handleAddCancel} 
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                                                Nom *
                                            </label>
                                            <input
                                                type="text"
                                                id="nom"
                                                value={addFormData.nom}
                                                onChange={(e) => handleAddInputChange('nom', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                placeholder="Entrez le nom"
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
                                                Prénom *
                                            </label>
                                            <input
                                                type="text"
                                                id="prenom"
                                                value={addFormData.prenom}
                                                onChange={(e) => handleAddInputChange('prenom', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                placeholder="Entrez le prénom"
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="poste" className="block text-sm font-medium text-gray-700 mb-2">
                                                Poste *
                                            </label>
                                            <input
                                                type="text"
                                                id="poste"
                                                value={addFormData.poste}
                                                onChange={(e) => handleAddInputChange('poste', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                placeholder="Entrez le poste"
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                value={addFormData.email}
                                                onChange={(e) => handleAddInputChange('email', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                placeholder="Entrez l'email"
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                                                Téléphone *
                                            </label>
                                            <input
                                                type="tel"
                                                id="telephone"
                                                value={addFormData.telephone}
                                                onChange={(e) => handleAddInputChange('telephone', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                placeholder="Entrez le téléphone"
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="salaire_mensuel" className="block text-sm font-medium text-gray-700 mb-2">
                                                Salaire mensuel *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                id="salaire_mensuel"
                                                value={addFormData.salaire_mensuel}
                                                onChange={(e) => handleAddInputChange('salaire_mensuel', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                placeholder="Entrez le salaire"
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="date_embauche" className="block text-sm font-medium text-gray-700 mb-2">
                                                Date d'embauche *
                                            </label>
                                            <input
                                                type="date"
                                                id="date_embauche"
                                                value={addFormData.date_embauche}
                                                onChange={(e) => handleAddInputChange('date_embauche', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="projet_id" className="block text-sm font-medium text-gray-700 mb-2">
                                                Projet
                                            </label>
                                            <select
                                                id="projet_id"
                                                value={addFormData.projet_id}
                                                onChange={(e) => handleAddInputChange('projet_id', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                disabled={isSubmitting}
                                            >
                                                <option value="">Sélectionner un projet</option>
                                                {projects.map((project) => (
                                                    <option key={project.id} value={project.id}>
                                                        {project.nom}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end p-6 border-t space-x-3">
                                    <button 
                                        type="button"
                                        onClick={handleAddCancel} 
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex items-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Enregistrement...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                <span>Enregistrer</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit User Popup Modal */}
                {showEditPopup && selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                            <form onSubmit={handleEditSave}>
                                <div className="flex justify-between items-center border-b p-6">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Modifier {selectedUser.nom} {selectedUser.prenom}
                                    </h3>
                                    <button 
                                        type="button"
                                        onClick={handleEditCancel} 
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                                    {isLoadingUser ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-gray-600">Chargement des données...</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="edit_nom" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Nom *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="edit_nom"
                                                    value={editFormData.nom}
                                                    onChange={(e) => handleEditInputChange('nom', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    placeholder="Entrez le nom"
                                                    required
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="edit_prenom" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Prénom *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="edit_prenom"
                                                    value={editFormData.prenom}
                                                    onChange={(e) => handleEditInputChange('prenom', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    placeholder="Entrez le prénom"
                                                    required
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="edit_poste" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Poste *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="edit_poste"
                                                    value={editFormData.poste}
                                                    onChange={(e) => handleEditInputChange('poste', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    placeholder="Entrez le poste"
                                                    required
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="edit_email" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email *
                                                </label>
                                                <input
                                                    type="email"
                                                    id="edit_email"
                                                    value={editFormData.email}
                                                    onChange={(e) => handleEditInputChange('email', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    placeholder="Entrez l'email"
                                                    required
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="edit_telephone" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Téléphone *
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="edit_telephone"
                                                    value={editFormData.telephone}
                                                    onChange={(e) => handleEditInputChange('telephone', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    placeholder="Entrez le téléphone"
                                                    required
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="edit_salaire_mensuel" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Salaire mensuel *
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    id="edit_salaire_mensuel"
                                                    value={editFormData.salaire_mensuel}
                                                    onChange={(e) => handleEditInputChange('salaire_mensuel', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    placeholder="Entrez le salaire"
                                                    required
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="edit_date_embauche" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Date d'embauche *
                                                </label>
                                                <input
                                                    type="date"
                                                    id="edit_date_embauche"
                                                    value={editFormData.date_embauche}
                                                    onChange={(e) => handleEditInputChange('date_embauche', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    required
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="edit_projet_id" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Projet
                                                </label>
                                                <select
                                                    id="edit_projet_id"
                                                    value={editFormData.projet_id}
                                                    onChange={(e) => handleEditInputChange('projet_id', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="">Sélectionner un projet</option>
                                                    {projects.map((project) => (
                                                        <option key={project.id} value={project.id}>
                                                            {project.nom}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex justify-end p-6 border-t space-x-3">
                                    <button 
                                        type="button"
                                        onClick={handleEditCancel} 
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || isLoadingUser}
                                        className="inline-flex items-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Mise à jour...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                <span>Mettre à jour</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Password Update Popup Modal */}
                {showPasswordPopup && selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                            <form onSubmit={handleUpdatePassword}>
                                <div className="flex justify-between items-center border-b p-6">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Modifier le mot de passe - {selectedUser.nom} {selectedUser.prenom}
                                    </h3>
                                    <button 
                                        type="button"
                                        onClick={handlePasswordCancel} 
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <div className="p-6 space-y-4">
                                    {passwordError && (
                                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                            <p className="text-sm text-red-600">{passwordError}</p>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                            Nouveau mot de passe
                                        </label>
                                        <input
                                            type="password"
                                            id="newPassword"
                                            value={passwordFormData.newPassword}
                                            onChange={(e) => setPasswordFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Entrez le nouveau mot de passe"
                                            required
                                            disabled={isSubmitting}
                                            minLength={8}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirmer le mot de passe
                                        </label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            value={passwordFormData.confirmPassword}
                                            onChange={(e) => setPasswordFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Confirmez le nouveau mot de passe"
                                            required
                                            disabled={isSubmitting}
                                            minLength={8}
                                        />
                                    </div>
                                    
                                    <p className="text-sm text-gray-500">
                                        Le mot de passe doit contenir au moins 8 caractères.
                                    </p>
                                </div>
                                
                                <div className="flex justify-end p-6 border-t space-x-3">
                                    <button 
                                        type="button"
                                        onClick={handlePasswordCancel} 
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!passwordFormData.newPassword.trim() || !passwordFormData.confirmPassword.trim() || isSubmitting}
                                        className="inline-flex items-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Mise à jour...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                <span>Mettre à jour</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Project View Popup Modal */}
                {showProjectPopup && selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                            <div className="flex justify-between items-center border-b p-6">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Projet de {selectedUser.nom} {selectedUser.prenom}
                                </h3>
                                <button 
                                    type="button"
                                    onClick={handleProjectCancel} 
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="p-6">
                                {selectedUser.project ? (
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 mb-1">Nom du projet</h4>
                                                <p className="text-lg font-semibold text-gray-900">{selectedUser.project.nom}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 mb-1">Statut</h4>
                                                <span
                                                    className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                                                        selectedUser.project.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                                                        selectedUser.project.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}
                                                >
                                                    {selectedUser.project.statut.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-gray-500 text-lg mb-2">Aucun projet assigné</div>
                                        <p className="text-gray-400">Ce salarié n'est actuellement assigné à aucun projet.</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-end p-6 border-t">
                                <button 
                                    type="button"
                                    onClick={handleProjectCancel} 
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
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