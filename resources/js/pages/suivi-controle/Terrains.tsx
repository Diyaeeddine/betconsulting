import React, { useState } from 'react';
import { Plus, X, Save, Edit, Eye, BarChart3 } from 'lucide-react';
import type { User, Position, TerrainProgress } from '../types/User';

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    username: 'johndoe',
    email: 'johndoe@gmail.com',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2', 
    username: 'janedoe',
    email: 'janedoe@gmail.com',
    created_at: '2024-01-20T14:15:00Z'
  },
  {
    id: '3',
    username: 'mikebrown',
    email: 'mikebrown@gmail.com', 
    created_at: '2024-02-01T09:00:00Z'
  }
];

const mockPositions: Position[] = [
  { id: '1', name: 'Position Alpha', radius: 100, isActif: true },
  { id: '2', name: 'Position Beta', radius: 150, isActif: false },
  { id: '3', name: 'Position Gamma', radius: 200, isActif: true }
];

const mockTerrainProgress: Record<string, TerrainProgress[]> = {
  '1': [
    {
      id: '1',
      terrain_name: 'Terrain Nord',
      date_creation: '2024-01-16T08:00:00Z',
      statut_tech: 'Terminé',
      statut_final: 'Validé'
    },
    {
      id: '2',
      terrain_name: 'Terrain Sud',
      date_creation: '2024-01-18T10:30:00Z',
      statut_tech: 'En cours',
      statut_final: 'En révision'
    }
  ],
  '2': [
    {
      id: '3',
      terrain_name: 'Terrain Est',
      date_creation: '2024-01-22T14:00:00Z',
      statut_tech: 'En attente',
      statut_final: 'En attente'
    }
  ],
  '3': [
    {
      id: '4',
      terrain_name: 'Terrain Ouest',
      date_creation: '2024-02-02T09:15:00Z',
      statut_tech: 'Terminé',
      statut_final: 'Rejeté'
    },
    {
      id: '5',
      terrain_name: 'Terrain Centre',
      date_creation: '2024-02-05T11:30:00Z',
      statut_tech: 'En cours',
      statut_final: 'En attente'
    }
  ]
};

interface Props {
  users?: User[];
}

export default function Users({ users = mockUsers }: Props) {
  const [showPopup, setShowPopup] = useState(false);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [showPositionsPopup, setShowPositionsPopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserPositions, setSelectedUserPositions] = useState<Position[]>([]);
  const [selectedUserProgress, setSelectedUserProgress] = useState<TerrainProgress[]>([]);
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);
  const [isTogglingPosition, setIsTogglingPosition] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call - replace with your actual API call
    setTimeout(() => {
      console.log('User created:', username.trim());
      handleCancel();
    }, 1000);
  };

  const handleCancel = () => {
    setShowPopup(false);
    setUsername('');
    setIsSubmitting(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous errors
    setPasswordError('');
    
    // Validate passwords
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

    setIsSubmitting(true);

    // Simulate API call - replace with your actual API call
    setTimeout(() => {
      console.log('Password updated for user:', selectedUser?.id);
      handlePasswordCancel();
    }, 1000);
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

  const handleViewPositions = async (user: User) => {
    setSelectedUser(user);
    setShowPositionsPopup(true);
    setIsLoadingPositions(true);

    try {
      // Simulate API call - replace with your actual fetch call
      setTimeout(() => {
        setSelectedUserPositions(mockPositions);
        setIsLoadingPositions(false);
      }, 800);
    } catch (error) {
      console.error('Network or parsing error:', error);
      setSelectedUserPositions([]);
      setIsLoadingPositions(false);
    }
  };

  const handlePositionsCancel = () => {
    setShowPositionsPopup(false);
    setSelectedUser(null);
    setSelectedUserPositions([]);
    setIsLoadingPositions(false);
    setIsTogglingPosition(null);
  };

  const handleTogglePosition = async (position: Position) => {
    setIsTogglingPosition(position.id);

    try {
      // Simulate API call - replace with your actual fetch call
      setTimeout(() => {
        setSelectedUserPositions(prev =>
          prev.map(pos =>
            pos.id === position.id
              ? { ...pos, isActif: !pos.isActif }
              : pos
          )
        );
        setIsTogglingPosition(null);
      }, 500);
    } catch (error) {
      console.error('Network or parsing error:', error);
      setIsTogglingPosition(null);
    }
  };

  const handleSelectUserForProgress = (user: User) => {
    setSelectedUser(user);
    setSelectedUserProgress(mockTerrainProgress[user.id] || []);
  };

  const getStatusBadge = (status: string, type: 'tech' | 'final') => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full";
    
    if (type === 'tech') {
      switch (status) {
        case 'Terminé':
          return `${baseClasses} bg-green-100 text-green-800`;
        case 'En cours':
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case 'En attente':
          return `${baseClasses} bg-gray-100 text-gray-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    } else {
      switch (status) {
        case 'Validé':
          return `${baseClasses} bg-green-100 text-green-800`;
        case 'En révision':
          return `${baseClasses} bg-blue-100 text-blue-800`;
        case 'Rejeté':
          return `${baseClasses} bg-red-100 text-red-800`;
        case 'En attente':
          return `${baseClasses} bg-gray-100 text-gray-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <button
              onClick={() => setShowPopup(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">Aucun utilisateur trouvé</div>
                <p className="text-gray-400">Commencez par ajouter votre premier utilisateur.</p>
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
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Positions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
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
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewPositions(user)}
                            className="inline-flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors duration-200"
                            title="Voir les positions"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleSelectUserForProgress(user)}
                            className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700 transition-colors duration-200"
                            title="Voir le progrès"
                          >
                            <BarChart3 className="w-3 h-3" />
                            <span>Progrès</span>
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
        </div>
      </div>

      {/* Terrain Progress Table at the bottom */}
      {selectedUser && (
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Terrains de {selectedUser.username}
                </h3>
              </div>
              
              {selectedUserProgress.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg mb-2">Aucun terrain trouvé</div>
                  <p className="text-gray-400">Cet utilisateur n'a pas encore de terrains assignés.</p>
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
                          Terrain name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date création
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut Tech
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut Final
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedUserProgress.map((terrain, index) => (
                        <tr key={terrain.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{terrain.terrain_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(terrain.date_creation).toLocaleDateString('fr-FR')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusBadge(terrain.statut_tech, 'tech')}>
                              {terrain.statut_tech}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusBadge(terrain.statut_final, 'final')}>
                              {terrain.statut_final}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add User Popup Modal */}
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

      {/* Password Update Popup Modal */}
      {showPasswordPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <form onSubmit={handleUpdatePassword}>
              <div className="flex justify-between items-center border-b p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Modifier le mot de passe - {selectedUser?.username}
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

      {/* User Positions Popup Modal */}
      {showPositionsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center border-b p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Positions de {selectedUser?.username}
              </h3>
              <button 
                type="button"
                onClick={handlePositionsCancel} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {isLoadingPositions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">Chargement des positions...</span>
                  </div>
                </div>
              ) : selectedUserPositions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-lg mb-2">Aucune position trouvée</div>
                  <p className="text-gray-400">Cet utilisateur n'a pas encore de positions définies.</p>
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
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Radius (m)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedUserPositions.map((position, index) => (
                        <tr key={position.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{position.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{position.radius}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleTogglePosition(position)}
                              disabled={isTogglingPosition === position.id}
                              className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                                position.isActif
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {isTogglingPosition === position.id ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                                  <span>...</span>
                                </>
                              ) : (
                                <span>{position.isActif ? 'ON' : 'OFF'}</span>
                              )}
                            </button>
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
                onClick={handlePositionsCancel} 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function handleSelectUserForProgress(user: User) {
    setSelectedUser(user);
    setSelectedUserProgress(mockTerrainProgress[user.id] || []);
  }

  function getStatusBadge(status: string, type: 'tech' | 'final') {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full";
    
    if (type === 'tech') {
      switch (status) {
        case 'Terminé':
          return `${baseClasses} bg-green-100 text-green-800`;
        case 'En cours':
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case 'En attente':
          return `${baseClasses} bg-gray-100 text-gray-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    } else {
      switch (status) {
        case 'Validé':
          return `${baseClasses} bg-green-100 text-green-800`;
        case 'En révision':
          return `${baseClasses} bg-blue-100 text-blue-800`;
        case 'Rejeté':
          return `${baseClasses} bg-red-100 text-red-800`;
        case 'En attente':
          return `${baseClasses} bg-gray-100 text-gray-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    }
  }
}