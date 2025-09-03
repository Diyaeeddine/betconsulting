import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import { Users, Save, X, Plus, MapPin, Type, Edit, Eye, BarChart3 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { User, Position, TerrainProgress } from '../types/User';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon for saved positions
const savedPositionIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="15" r="12" fill="#10B981" stroke="white" stroke-width="3"/>
      <path d="M15 8v14M8 15h14" stroke="white" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `),
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

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
  { id: '1', name: 'Position Alpha', latitude: 48.8566, longitude: 2.3522, radius: 100, isActif: true, user_id: '1' },
  { id: '2', name: 'Position Beta', latitude: 48.8576, longitude: 2.3532, radius: 150, isActif: false, user_id: '1' },
  { id: '3', name: 'Position Gamma', latitude: 48.8586, longitude: 2.3542, radius: 200, isActif: true, user_id: '2' }
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
  initialPositions?: Position[];
}

// Integrated MapController component
function MapController({ 
  onMapClick, 
  onPositionClick, 
  visiblePositions, 
  selectedUserPosition 
}: {
  onMapClick: (position: { latitude: number; longitude: number }) => void;
  onPositionClick: (position: Position) => void;
  visiblePositions: Position[];
  selectedUserPosition: Position | null;
}) {
  const map = useMap();

  // Pan to selected user's position when it changes
  useEffect(() => {
    if (selectedUserPosition && selectedUserPosition.latitude && selectedUserPosition.longitude) {
      map.setView([selectedUserPosition.latitude, selectedUserPosition.longitude], map.getZoom());
    }
  }, [selectedUserPosition, map]);

  // Handle map clicks to add new position
  useMapEvents({
    click: (e) => {
      onMapClick({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      });
    }
  });

  return (
    <>
      {/* Only render visible positions (filtered by selected user) */}
      {visiblePositions.map((position) => (
        position.latitude && position.longitude && (
          <div key={position.id}>
            <Marker
              position={[position.latitude, position.longitude]}
              icon={savedPositionIcon}
              eventHandlers={{
                click: () => onPositionClick(position)
              }}
            />
            <Circle
              center={[position.latitude, position.longitude]}
              radius={position.radius}
              pathOptions={{
                color: '#10B981',
                fillColor: '#10B981',
                fillOpacity: 0.2,
                weight: 2,
                dashArray: '5, 5'
              }}
            />
          </div>
        )
      ))}
    </>
  );
}

export default function Terrains({ users = mockUsers, initialPositions = mockPositions }: Props) {
  // User management states
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [showPositionsPopup, setShowPositionsPopup] = useState(false);
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Map states
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedUserPosition, setSelectedUserPosition] = useState<Position | null>(null);
  const [savedPositions, setSavedPositions] = useState<Position[]>(initialPositions);
  const [showMapPopup, setShowMapPopup] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [newRadius, setNewRadius] = useState(100);
  const [newName, setNewName] = useState('');

  // Progress states
  const [selectedUserForProgress, setSelectedUserForProgress] = useState<User | null>(null);
  const [selectedUserPositions, setSelectedUserPositions] = useState<Position[]>([]);
  const [selectedUserProgress, setSelectedUserProgress] = useState<TerrainProgress[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);
  const [isTogglingPosition, setIsTogglingPosition] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | ''>('');

  // Filter positions to show only for selected user
  const visiblePositions = selectedUser 
    ? savedPositions.filter(pos => pos.user_id && pos.user_id.toString() === selectedUser.toString())
    : [];

  // Handle user selection from dropdown
  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    setSelectedUser(userId);

    if (userId) {
      const userPositions = savedPositions.filter(pos => pos.user_id && pos.user_id.toString() === userId.toString());
      if (userPositions.length > 0) {
        setSelectedUserPosition(userPositions[0]);
      } else {
        setSelectedUserPosition(null);
      }
    } else {
      setSelectedUserPosition(null);
    }

    setShowMapPopup(false);
    setSelectedPosition(null);
  };

  // User management functions
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      console.log('User created:', username.trim());
      setShowUserPopup(false);
      setUsername('');
      setIsSubmitting(false);
    }, 1000);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);

    setTimeout(() => {
      console.log('Password updated for user:', selectedUserForProgress?.id);
      handlePasswordCancel();
    }, 1000);
  };

  const handlePasswordCancel = () => {
    setShowPasswordPopup(false);
    setSelectedUserForProgress(null);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setIsSubmitting(false);
  };

  const openPasswordPopup = (user: User) => {
    setSelectedUserForProgress(user);
    setShowPasswordPopup(true);
  };

  // Map functions
  const handleMapClick = (clickedPosition: { latitude: number; longitude: number }) => {
    if (!selectedUser) {
      setMessage({ type: 'error', text: 'Please select a user first to add a position' });
      return;
    }

    if (!selectedPosition) {
      const newPosition: Position = {
        id: Date.now().toString(),
        latitude: clickedPosition.latitude,
        longitude: clickedPosition.longitude,
        radius: 100,
        name: '',
        user_id: selectedUser,
        isActif: true,
        isNew: true
      };

      setSavedPositions(prev => [...prev, newPosition]);
      setSelectedPosition(newPosition);
      setNewRadius(100);
      setNewName('');
      setShowMapPopup(true);
    }
  };

  const handlePositionClick = (position: Position) => {
    setSelectedPosition(position);
    setNewRadius(position.radius);
    setNewName(position.name || '');
    setSelectedUser(position.user_id?.toString() || '');
    setShowMapPopup(true);
  };

  const handleSavePosition = async () => {
    if (!selectedUser) {
      setMessage({ type: 'error', text: 'Please select a user' });
      return;
    }

    if (!newName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a name for the position' });
      return;
    }

    setIsSaving(true);

    const positionData = {
      latitude: selectedPosition!.latitude,
      longitude: selectedPosition!.longitude,
      radius: newRadius,
      name: newName.trim(),
      user_id: selectedUser,
    };
    
    try {
      setTimeout(() => {
        console.log('Position saved:', positionData);
        setShowMapPopup(false);
        setSelectedPosition(null);
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving position:', error);
      setIsSaving(false);
    }
  };

  const handleCancelPosition = () => {
    if (selectedPosition?.isNew) {
      setSavedPositions(prev => prev.filter(pos => pos.id !== selectedPosition.id));
    }
    setShowMapPopup(false);
    setSelectedPosition(null);
    setNewName('');
  };

  const handleDeletePosition = () => {
    if (!selectedPosition || selectedPosition.isNew) {
      handleCancelPosition();
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      console.log('Position deleted:', selectedPosition.id);
      setShowMapPopup(false);
      setSelectedPosition(null);
      setNewName('');
      setIsSaving(false);
    }, 1000);
  };

  // Progress functions
  const handleSelectUserForProgress = (user: User) => {
    setSelectedUserForProgress(user);
    setSelectedUserProgress(mockTerrainProgress[user.id] || []);
  };

  const handleViewPositions = async (user: User) => {
    setSelectedUserForProgress(user);
    setShowPositionsPopup(true);
    setIsLoadingPositions(true);

    try {
      setTimeout(() => {
        setSelectedUserPositions(mockPositions.filter(pos => pos.user_id === user.id));
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
    setSelectedUserForProgress(null);
    setSelectedUserPositions([]);
    setIsLoadingPositions(false);
    setIsTogglingPosition(null);
  };

  const handleTogglePosition = async (position: Position) => {
    setIsTogglingPosition(position.id);

    try {
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

  // Integrated MapController component
  function InternalMapController({ 
    onMapClick, 
    onPositionClick, 
    visiblePositions, 
    selectedUserPosition 
  }: {
    onMapClick: (position: { latitude: number; longitude: number }) => void;
    onPositionClick: (position: Position) => void;
    visiblePositions: Position[];
    selectedUserPosition: Position | null;
  }) {
    const map = useMap();

    // Pan to selected user's position when it changes
    useEffect(() => {
      if (selectedUserPosition && selectedUserPosition.latitude && selectedUserPosition.longitude) {
        map.setView([selectedUserPosition.latitude, selectedUserPosition.longitude], map.getZoom());
      }
    }, [selectedUserPosition, map]);

    // Handle map clicks to add new position
    useMapEvents({
      click: (e) => {
        onMapClick({
          latitude: e.latlng.lat,
          longitude: e.latlng.lng
        });
      }
    });

    return (
      <>
        {/* Only render visible positions (filtered by selected user) */}
        {visiblePositions.map((position) => (
          position.latitude && position.longitude && (
            <div key={position.id}>
              <Marker
                position={[position.latitude, position.longitude]}
                icon={savedPositionIcon}
                eventHandlers={{
                  click: () => onPositionClick(position)
                }}
              />
              <Circle
                center={[position.latitude, position.longitude]}
                radius={position.radius}
                pathOptions={{
                  color: '#10B981',
                  fillColor: '#10B981',
                  fillOpacity: 0.2,
                  weight: 2,
                  dashArray: '5, 5'
                }}
              />
            </div>
          )
        ))}
      </>
    );
  }

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => {
        setMessage('');
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Controls */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-6 space-y-4 lg:space-y-0">
            <h1 className="text-2xl font-bold text-gray-900">Terrain Management</h1>
            
            {/* Controls Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* User Selection Dropdown */}
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-500" />
                <select
                  value={selectedUser}
                  onChange={handleUserSelect}
                  className="block w-64 px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select a user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id.toString()}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Add User Button */}
              <button
                onClick={() => setShowUserPopup(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="relative">
              {isLoading ? (
                <div className="w-full h-[600px] flex items-center justify-center bg-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
                    <span className="text-gray-600 font-medium">Loading map data...</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-[600px]">
                  <MapContainer
                    center={selectedUserPosition && selectedUserPosition.latitude && selectedUserPosition.longitude 
                      ? [selectedUserPosition.latitude, selectedUserPosition.longitude] 
                      : [48.8566, 2.3522]}
                    zoom={16}
                    style={{ height: '100%', width: '100%' }}
                    className="rounded-t-2xl"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <InternalMapController
                      onMapClick={handleMapClick}
                      onPositionClick={handlePositionClick}
                      visiblePositions={visiblePositions}
                      selectedUserPosition={selectedUserPosition}
                    />
                  </MapContainer>
                </div>
              )}

              {/* Instructions */}
              {!isLoading && (
                <div className="absolute top-4 right-4 bg-indigo-600 text-white text-sm px-4 py-3 rounded-lg shadow-lg z-[1000] max-w-xs">
                  <div className="space-y-2">
                    {selectedUser ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <Plus className="w-4 h-4" />
                          <span className="font-medium">Click anywhere to add position</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span className="font-medium">Click a green marker to edit</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">Select a user to view positions</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Statistics */}
              {!isLoading && (
                <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 backdrop-blur-sm text-gray-800 text-sm px-4 py-3 rounded-lg shadow-lg border border-gray-200 z-[1000]">
                  <div className="space-y-1">
                    {selectedUser ? (
                      <>
                        <div>User Positions: <span className="font-semibold text-green-600">{visiblePositions.length}</span></div>
                        <div className="text-xs text-gray-500">
                          {users.find(u => u.id.toString() === selectedUser)?.username}
                        </div>
                      </>
                    ) : (
                      <div>Total Positions: <span className="font-semibold text-gray-600">{savedPositions.length}</span></div>
                    )}
                  </div>
                </div>
              )}

              {/* Message display */}
              {message && (
                <div className={`absolute top-4 left-4 px-4 py-2 rounded-lg shadow-lg z-[1000] ${
                  message.type === 'success' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {message.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Users Table Section */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Users Management</h3>
            </div>
            
            {users.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">No users found</div>
                <p className="text-gray-400">Start by adding your first user.</p>
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
                        Added on
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
                            title="View positions"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleSelectUserForProgress(user)}
                            className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700 transition-colors duration-200"
                            title="View progress"
                          >
                            <BarChart3 className="w-3 h-3" />
                            <span>Progress</span>
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

      {/* Terrain Progress Table */}
      {selectedUserForProgress && (
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Terrains de {selectedUserForProgress.username}
                </h3>
              </div>
              
              {selectedUserProgress.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg mb-2">No terrain found</div>
                  <p className="text-gray-400">This user doesn't have any assigned terrains yet.</p>
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
                          Creation date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tech Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Final Status
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
      {showUserPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <form onSubmit={handleAddUser}>
              <div className="flex justify-between items-center border-b p-6">
                <h3 className="text-lg font-semibold text-gray-900">Add User</h3>
                <button 
                  type="button"
                  onClick={() => {
                    setShowUserPopup(false);
                    setUsername('');
                    setIsSubmitting(false);
                  }}
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
                    placeholder="Enter username"
                    required
                    disabled={isSubmitting}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Email will be generated automatically: {username.toLowerCase()}@gmail.com
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end p-6 border-t space-x-3">
                <button 
                  type="button"
                  onClick={() => {
                    setShowUserPopup(false);
                    setUsername('');
                    setIsSubmitting(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!username.trim() || isSubmitting}
                  className="inline-flex items-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Map Position Popup Modal */}
      {showMapPopup && selectedPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedPosition.isNew ? 'New Position' : 'Edit Position'}
                </h3>
                <button
                  onClick={handleCancelPosition}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isSaving}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Type className="w-4 h-4 inline mr-1" />
                  Position Name *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter position name"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User *
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  disabled={isSaving}
                >
                  <option value="">Select a user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id.toString()}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Radius *
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    value={newRadius}
                    onChange={(e) => setNewRadius(Number(e.target.value))}
                    min="10"
                    max="5000"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter radius"
                    disabled={isSaving}
                  />
                  <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-3 rounded-lg">
                    Metres
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Position</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Latitude: {selectedPosition.latitude?.toFixed(6)}</div>
                  <div>Longitude: {selectedPosition.longitude?.toFixed(6)}</div>
                  {selectedPosition.user_id && (
                    <div className="text-indigo-600 font-medium mt-2">
                      Assigned to: {users.find(u => u.id === selectedPosition.user_id)?.username}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-between">
              <div>
                {!selectedPosition.isNew && (
                  <button
                    onClick={handleDeletePosition}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSaving ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelPosition}
                  disabled={isSaving}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePosition}
                  disabled={!selectedUser || !newName.trim() || isSaving || newRadius < 10}
                  className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            </div>
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
                  Update Password - {selectedUserForProgress?.username}
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
                    placeholder="Enter new password"
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
                    placeholder="Confirm new password"
                    required
                    disabled={isSubmitting}
                    minLength={8}
                  />
                </div>
                
                <p className="text-sm text-gray-500">
                  Password must be at least 8 characters long.
                </p>
              </div>
              
              <div className="flex justify-end p-6 border-t space-x-3">
                <button 
                  type="button"
                  onClick={handlePasswordCancel} 
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPassword.trim() || !confirmPassword.trim() || isSubmitting}
                  className="inline-flex items-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Update</span>
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
                Positions of {selectedUserForProgress?.username}
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
                    <span className="text-gray-600">Loading positions...</span>
                  </div>
                </div>
              ) : selectedUserPositions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-lg mb-2">No positions found</div>
                  <p className="text-gray-400">This user doesn't have any defined positions yet.</p>
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}