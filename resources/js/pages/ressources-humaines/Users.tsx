import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Plus, X, Save, Edit, Eye } from 'lucide-react';

// New types for projects
interface Projet {
    id: number;
    nom: string;
    statut: string;
}

// Updated User interface to include an array of projects
interface User {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    created_at: string;
    projets?: Projet[];
    // username is not a field in the User interface, but exists in your old code,
    // so we'll add it here to avoid TypeScript errors.
    username?: string; 
}

interface RessourcesHumainesUsersProps {
    users?: User[];
}

const breadcrumbs = [
    {
        title: 'Dashboard Ressources Humaines & Gestion des Compétences',
        href: '/ressources-humaines/users',
    },
];

export default function RessourcesHumainesUsers({ users = [] }: RessourcesHumainesUsersProps) {
    // State management
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [showPasswordPopup, setShowPasswordPopup] = useState<boolean>(false);
    const [showProjetPopup, setShowProjetPopup] = useState<boolean>(false); // New state for project popup
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedUserProjets, setSelectedUserProjets] = useState<Projet[]>([]); // New state for user's projects
    const [username, setUsername] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [passwordError, setPasswordError] = useState<string>('');
    const [isLoadingProjets, setIsLoadingProjets] = useState<boolean>(false); // New state for loading projects

    // User creation handlers (unchanged)
    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!username.trim()) {
            return;
        }

        setIsSubmitting(true);

        router.post('/users', {
            username: username.trim()
        }, {
            onSuccess: () => {
                handleCancel();
            },
            onError: (errors) => {
                console.error('Error creating user:', errors);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const handleCancel = () => {
        setShowPopup(false);
        setUsername('');
        setIsSubmitting(false);
    };

    // Password update handlers (unchanged)
    const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        setPasswordError('');
        
        if (!newPassword.trim() || !confirmPassword.trim()) {
            setPasswordError('Both password fields are required.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match.');
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters long.');
            return;
        }

        if (!selectedUser) return;

        setIsSubmitting(true);

        router.put(`/users/${selectedUser.id}`, {
            user_id: selectedUser.id,
            new_password: newPassword
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
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
        setIsSubmitting(false);
    };

    const openPasswordPopup = (user: User) => {
        setSelectedUser(user);
        setShowPasswordPopup(true);
    };

    // Project management handlers
    const handleViewProjets = async (user: User) => {
        setSelectedUser(user);
        setShowProjetPopup(true);
        setIsLoadingProjets(true);

        try {
            // Assuming a new API endpoint for fetching a user's projects
            const response = await fetch(`/users/${user.id}/projets`);
            const data = await response.json();

            if (response.ok) {
                setSelectedUserProjets(data.projets || []);
            } else {
                console.error('Error fetching projects:', data.error);
                setSelectedUserProjets([]);
            }
        } catch (error) {
            console.error('Network or parsing error:', error);
            setSelectedUserProjets([]);
        } finally {
            setIsLoadingProjets(false);
        }
    };

    const handleProjetsCancel = () => {
        setShowProjetPopup(false);
        setSelectedUser(null);
        setSelectedUserProjets([]);
        setIsLoadingProjets(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Ressources Humaines & Gestion des Compétences" />
            
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Salariés</h1>
                    <button
                        onClick={() => setShowPopup(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter User</span>
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
                                            Nom
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        {/* Updated column header */}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Projets
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
                                    {users.map((user, index) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{user.nom} {user.prenom}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </td>
                                            {/* Updated button to view projects */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleViewProjets(user)}
                                                    className="inline-flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors duration-200"
                                                    title="Voir les projets"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                    <span>View</span>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => openPasswordPopup(user)}
                                                    className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors duration-200"
                                                >
                                                    <Edit className="w-3 h-3" />
                                                    <span>Update</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Add User Popup Modal (unchanged) */}
                {showPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                            <form onSubmit={handleSave}>
                                <div className="flex justify-between items-center border-b p-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Ajouter un utilisateur</h3>
                                    <button 
                                        type="button"
                                        onClick={handleCancel} 
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <div className="p-6">
                                    <div>
                                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            id="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Entrez le nom d'utilisateur"
                                            required
                                            disabled={isSubmitting}
                                        />
                                        <p className="mt-2 text-sm text-gray-500">
                                            L'email sera généré automatiquement: {username.toLowerCase()}@gmail.com
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end p-6 border-t space-x-3">
                                    <button 
                                        type="button"
                                        onClick={handleCancel} 
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!username.trim() || isSubmitting}
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

                {/* Password Update Popup Modal (unchanged) */}
                {showPasswordPopup && selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                            <form onSubmit={handleUpdatePassword}>
                                <div className="flex justify-between items-center border-b p-6">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Modifier le mot de passe - {selectedUser.username}
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
                                            New password
                                        </label>
                                        <input
                                            type="password"
                                            id="newPassword"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Entrez le nouveau mot de passe"
                                            required
                                            disabled={isSubmitting}
                                            minLength={8}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm password
                                        </label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                                        disabled={!newPassword.trim() || !confirmPassword.trim() || isSubmitting}
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

                {/* New Project Popup Modal */}
                {showProjetPopup && selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                            <div className="flex justify-between items-center border-b p-6">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Projets de {selectedUser.nom} {selectedUser.prenom}
                                </h3>
                                <button 
                                    type="button"
                                    onClick={handleProjetsCancel} 
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                                {isLoadingProjets ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-gray-600">Chargement des projets...</span>
                                        </div>
                                    </div>
                                ) : selectedUserProjets.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-gray-500 text-lg mb-2">Aucun projet trouvé</div>
                                        <p className="text-gray-400">Cet utilisateur n'a pas encore de projets assignés.</p>
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
                                                        Nom du projet
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Statut
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {selectedUserProjets.map((projet, index) => (
                                                    <tr key={projet.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{projet.nom}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                                                                    projet.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                                                                    projet.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-green-100 text-green-800'
                                                                }`}
                                                            >
                                                                {projet.statut.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-end p-6 border-t">
                                <button 
                                    type="button"
                                    onClick={handleProjetsCancel} 
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