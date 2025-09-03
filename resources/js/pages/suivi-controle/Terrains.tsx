import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polyline, useMap, useMapEvents } from 'react-leaflet';
import { Users, Save, X, MapPin, Type, Edit, Eye, BarChart3 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { User, Position, TerrainProgress } from '../types/User';
import AppLayout from "@/layouts/app-layout"

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

// Custom marker icon for trajectory start
const trajectoryStartIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
      <circle cx="10" cy="10" r="3" fill="white"/>
    </svg>
  `),
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

// Custom marker icon for trajectory end
const trajectoryEndIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" fill="#DC2626" stroke="white" stroke-width="2"/>
      <rect x="6" y="6" width="8" height="8" fill="white"/>
    </svg>
  `),
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    username: 'Jean Dupont',
    email: 'jean.dupont@gmail.com',
    telephone: '+33 6 12 34 56 78',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2', 
    username: 'Marie Martin',
    email: 'marie.martin@gmail.com',
    telephone: '+33 6 87 65 43 21',
    created_at: '2024-01-20T14:15:00Z'
  },
  {
    id: '3',
    username: 'Pierre Dubois',
    email: 'pierre.dubois@gmail.com',
    telephone: '+33 6 45 67 89 12',
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
      statut_final: 'validé'
    },
    {
      id: '2',
      terrain_name: 'Terrain Sud',
      date_creation: '2024-01-18T10:30:00Z',
      statut_tech: 'En cours',
      statut_final: 'en_cours'
    }
  ],
  '2': [
    {
      id: '3',
      terrain_name: 'Terrain Est',
      date_creation: '2024-01-22T14:00:00Z',
      statut_tech: 'En attente',
      statut_final: 'en_revision'
    }
  ],
  '3': [
    {
      id: '4',
      terrain_name: 'Terrain Ouest',
      date_creation: '2024-02-02T09:15:00Z',
      statut_tech: 'Terminé',
      statut_final: 'terminé'
    }
  ]
};

// Enhanced mock websocket data with 5 points and 30-second intervals for each user
const mockWebsocketData: Record<string, any[]> = {
  '1': [
    // Jean Dupont - Northern trajectory
    { timestamp: '2024-01-15T08:00:00Z', lat: 48.8566, lng: 2.3522, speed: 0 },
    { timestamp: '2024-01-15T08:00:30Z', lat: 48.8570, lng: 2.3525, speed: 25 },
    { timestamp: '2024-01-15T08:01:00Z', lat: 48.8575, lng: 2.3530, speed: 40 },
    { timestamp: '2024-01-15T08:01:30Z', lat: 48.8580, lng: 2.3535, speed: 35 },
    { timestamp: '2024-01-15T08:02:00Z', lat: 48.8585, lng: 2.3540, speed: 15 }
  ],
  '2': [
    // Marie Martin - Eastern trajectory
    { timestamp: '2024-01-20T09:00:00Z', lat: 48.8586, lng: 2.3542, speed: 0 },
    { timestamp: '2024-01-20T09:00:30Z', lat: 48.8590, lng: 2.3550, speed: 30 },
    { timestamp: '2024-01-20T09:01:00Z', lat: 48.8595, lng: 2.3558, speed: 45 },
    { timestamp: '2024-01-20T09:01:30Z', lat: 48.8600, lng: 2.3566, speed: 50 },
    { timestamp: '2024-01-20T09:02:00Z', lat: 48.8605, lng: 2.3575, speed: 20 }
  ],
  '3': [
    // Pierre Dubois - Southern circular trajectory
    { timestamp: '2024-02-01T10:00:00Z', lat: 48.8550, lng: 2.3510, speed: 0 },
    { timestamp: '2024-02-01T10:00:30Z', lat: 48.8545, lng: 2.3515, speed: 20 },
    { timestamp: '2024-02-01T10:01:00Z', lat: 48.8540, lng: 2.3520, speed: 35 },
    { timestamp: '2024-02-01T10:01:30Z', lat: 48.8545, lng: 2.3525, speed: 30 },
    { timestamp: '2024-02-01T10:02:00Z', lat: 48.8552, lng: 2.3518, speed: 10 }
  ]
};

interface Props {
  users?: User[];
  initialPositions?: Position[];
}

const breadcrumbs = [
  {
    title: "Gestion des Terrains",
    href: "/terrains",
  },
];

// Map Controller Component
function MapController({ 
  onMapClick, 
  onPositionClick, 
  visiblePositions, 
  selectedUserPosition,
  trajectoryData,
  selectedUser
}: {
  onMapClick: (position: { latitude: number; longitude: number }) => void;
  onPositionClick: (position: Position) => void;
  visiblePositions: Position[];
  selectedUserPosition: Position | null;
  trajectoryData: any[];
  selectedUser: string;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedUserPosition && selectedUserPosition.latitude && selectedUserPosition.longitude) {
      map.setView([selectedUserPosition.latitude, selectedUserPosition.longitude], map.getZoom());
    }
  }, [selectedUserPosition, map]);

  useMapEvents({
    click: (e) => {
      onMapClick({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      });
    }
  });

  // Create trajectory path coordinates
  const trajectoryPath = trajectoryData.map(point => [point.lat, point.lng] as [number, number]);

  // Get trajectory color based on user
  const getTrajectoryColor = (userId: string) => {
    const colors = {
      '1': '#3B82F6', // Blue for Jean
      '2': '#10B981', // Green for Marie  
      '3': '#F59E0B'  // Orange for Pierre
    };
    return colors[userId as keyof typeof colors] || '#6B7280';
  };

  return (
    <>
      {/* Render saved positions */}
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

      {/* Render trajectory if user selected and trajectory data exists */}
      {selectedUser && trajectoryData.length > 0 && (
        <>
          {/* Trajectory polyline */}
          <Polyline
            positions={trajectoryPath}
            pathOptions={{
              color: getTrajectoryColor(selectedUser),
              weight: 4,
              opacity: 0.8,
              dashArray: '10, 5'
            }}
          />
          
          {/* Start point marker */}
          {trajectoryData.length > 0 && (
            <Marker
              position={[trajectoryData[0].lat, trajectoryData[0].lng]}
              icon={trajectoryStartIcon}
            />
          )}

          {/* End point marker */}
          {trajectoryData.length > 1 && (
            <Marker
              position={[trajectoryData[trajectoryData.length - 1].lat, trajectoryData[trajectoryData.length - 1].lng]}
              icon={trajectoryEndIcon}
            />
          )}

          {/* Intermediate trajectory points */}
          {trajectoryData.slice(1, -1).map((point, index) => (
            <Circle
              key={index}
              center={[point.lat, point.lng]}
              radius={8}
              pathOptions={{
                color: 'white',
                fillColor: getTrajectoryColor(selectedUser),
                fillOpacity: 1,
                weight: 2
              }}
            />
          ))}
        </>
      )}
    </>
  );
}

export default function Terrains({ users = mockUsers, initialPositions = mockPositions }: Props) {
  // Map states
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedUserPosition, setSelectedUserPosition] = useState<Position | null>(null);
  const [savedPositions, setSavedPositions] = useState<Position[]>(initialPositions);
  const [showMapPopup, setShowMapPopup] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [newRadius, setNewRadius] = useState(100);
  const [newName, setNewName] = useState('');

  // Progress and terrain states
  const [selectedUserForProgress, setSelectedUserForProgress] = useState<User | null>(null);
  const [showPositionsPopup, setShowPositionsPopup] = useState(false);
  const [showTerrainsPopup, setShowTerrainsPopup] = useState(false);
  const [selectedUserPositions, setSelectedUserPositions] = useState<Position[]>([]);
  const [selectedUserProgress, setSelectedUserProgress] = useState<TerrainProgress[]>([]);
  const [editingTerrain, setEditingTerrain] = useState<string | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);
  const [isTogglingPosition, setIsTogglingPosition] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | ''>('');

  // Filter positions to show only for selected user
  const visiblePositions = selectedUser 
    ? savedPositions.filter(pos => pos.user_id && pos.user_id.toString() === selectedUser.toString())
    : [];

  // Get trajectory data for selected user
  const trajectoryData = selectedUser ? (mockWebsocketData[selectedUser] || []) : [];

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

  // Map functions
  const handleMapClick = (clickedPosition: { latitude: number; longitude: number }) => {
    if (!selectedUser) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un utilisateur d\'abord' });
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
      setMessage({ type: 'error', text: 'Veuillez sélectionner un utilisateur' });
      return;
    }

    if (!newName.trim()) {
      setMessage({ type: 'error', text: 'Veuillez entrer un nom pour la position' });
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      console.log('Position saved');
      setShowMapPopup(false);
      setSelectedPosition(null);
      setIsSaving(false);
      setMessage({ type: 'success', text: 'Position sauvegardée avec succès' });
    }, 1000);
  };

  const handleCancelPosition = () => {
    if (selectedPosition?.isNew) {
      setSavedPositions(prev => prev.filter(pos => pos.id !== selectedPosition.id));
    }
    setShowMapPopup(false);
    setSelectedPosition(null);
    setNewName('');
  };

  // Progress and terrain functions
  const handleViewPositions = async (user: User) => {
    setSelectedUserForProgress(user);
    setShowPositionsPopup(true);
    setIsLoadingPositions(true);

    setTimeout(() => {
      setSelectedUserPositions(mockPositions.filter(pos => pos.user_id === user.id));
      setIsLoadingPositions(false);
    }, 800);
  };

  const handleViewProgress = async (user: User) => {
    setSelectedUserForProgress(user);
    setSelectedUserProgress(mockTerrainProgress[user.id] || []);
    setShowTerrainsPopup(true);
  };

  const handleTogglePosition = async (position: Position) => {
    setIsTogglingPosition(position.id);

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
  };

  const handleUpdateTerrainStatus = (terrainId: string, newStatus: string) => {
    setSelectedUserProgress(prev =>
      prev.map(terrain =>
        terrain.id === terrainId
          ? { ...terrain, statut_final: newStatus }
          : terrain
      )
    );
  };

  const handleSaveTerrains = async () => {
    setIsSaving(true);
    
    setTimeout(() => {
      console.log('Terrains updated');
      setIsSaving(false);
      setMessage({ type: 'success', text: 'Terrains mis à jour avec succès' });
    }, 1000);
  };

  const handleClosePopups = () => {
    setShowPositionsPopup(false);
    setShowTerrainsPopup(false);
    setSelectedUserForProgress(null);
    setSelectedUserPositions([]);
    setSelectedUserProgress([]);
    setIsLoadingPositions(false);
    setIsTogglingPosition(null);
    setEditingTerrain(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'terminé': 'bg-green-100 text-green-800 border-green-200',
      'validé': 'bg-blue-100 text-blue-800 border-blue-200',
      'en_cours': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'en_revision': 'bg-orange-100 text-orange-800 border-orange-200'
    };

    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatWebsocketTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

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
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Terrains</h1>
            <p className="text-gray-600 mt-1">Gérez les positions et terrains des utilisateurs</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Positions</p>
                <p className="text-2xl font-bold text-gray-900">{savedPositions.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Terrains Actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(mockTerrainProgress).flat().length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Sélectionné</p>
                <p className="text-lg font-bold text-gray-900">
                  {selectedUser ? users.find(u => u.id === selectedUser)?.username : 'Aucun'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Carte Interactive</h3>
              
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-500" />
                <select
                  value={selectedUser}
                  onChange={handleUserSelect}
                  className="block w-64 px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="">Sélectionner un utilisateur...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id.toString()}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="relative">
            {isLoading ? (
              <div className="w-full h-[500px] flex items-center justify-center bg-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
                  <span className="text-gray-600 font-medium">Chargement de la carte...</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-[500px]">
                <MapContainer
                  center={selectedUserPosition && selectedUserPosition.latitude && selectedUserPosition.longitude 
                    ? [selectedUserPosition.latitude, selectedUserPosition.longitude] 
                    : [48.8566, 2.3522]}
                  zoom={16}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapController
                    onMapClick={handleMapClick}
                    onPositionClick={handlePositionClick}
                    visiblePositions={visiblePositions}
                    selectedUserPosition={selectedUserPosition}
                    trajectoryData={trajectoryData}
                    selectedUser={selectedUser}
                  />
                </MapContainer>
              </div>
            )}

            {/* Map Instructions */}
            {!isLoading && (
              <div className="absolute top-4 right-4 bg-white bg-opacity-95 backdrop-blur-sm text-gray-800 text-sm px-4 py-3 rounded-lg shadow-lg border border-gray-200 z-[1000] max-w-xs">
                <div className="space-y-2">
                  {selectedUser ? (
                    <>
                      <div className="flex items-center space-x-2 text-green-600">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">Cliquer pour ajouter une position</span>
                      </div>
                      <div className="flex items-center space-x-2 text-blue-600">
                        <Edit className="w-4 h-4" />
                        <span className="font-medium">Cliquer sur un marqueur pour éditer</span>
                      </div>
                      {trajectoryData.length > 0 && (
                        <div className="flex items-center space-x-2 text-purple-600">
                          <BarChart3 className="w-4 h-4" />
                          <span className="font-medium">Trajectoire affichée ({trajectoryData.length} points)</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center space-x-2 text-orange-600">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">Sélectionner un utilisateur</span>
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
                      <div>Positions utilisateur: <span className="font-semibold text-green-600">{visiblePositions.length}</span></div>
                      <div>Points de trajectoire: <span className="font-semibold text-blue-600">{trajectoryData.length}</span></div>
                      <div className="text-xs text-gray-500">
                        {users.find(u => u.id.toString() === selectedUser)?.username}
                      </div>
                    </>
                  ) : (
                    <div>Positions totales: <span className="font-semibold text-gray-600">{savedPositions.length}</span></div>
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

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Utilisateurs</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N°</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Positions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progrès</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.telephone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewPositions(user)}
                        className="inline-flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors duration-200"
                        title="Voir les positions"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Voir ({savedPositions.filter(pos => pos.user_id === user.id).length})</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewProgress(user)}
                        className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700 transition-colors duration-200"
                        title="Voir les terrains"
                      >
                        <BarChart3 className="w-3 h-3" />
                        <span>Terrains ({mockTerrainProgress[user.id]?.length || 0})</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900">Aucun utilisateur</h3>
              <p className="text-sm text-gray-500">Les utilisateurs apparaîtront ici.</p>
            </div>
          )}
        </div>

        {/* Position Edit Popup */}
        {showMapPopup && selectedPosition && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedPosition.isNew ? 'Nouvelle Position' : 'Modifier Position'}
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

              <div className="px-6 py-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Type className="w-4 h-4 inline mr-1" />
                    Nom de la Position *
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Entrez le nom de la position"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rayon *</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={newRadius}
                      onChange={(e) => setNewRadius(Number(e.target.value))}
                      min="10"
                      max="5000"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      disabled={isSaving}
                    />
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">mètres</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Coordonnées</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Latitude: {selectedPosition.latitude?.toFixed(6)}</div>
                    <div>Longitude: {selectedPosition.longitude?.toFixed(6)}</div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-between">
                <button
                  onClick={handleCancelPosition}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSavePosition}
                  disabled={!newName.trim() || isSaving || newRadius < 10}
                  className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Positions Popup */}
        {showPositionsPopup && selectedUserForProgress && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex justify-between items-center border-b p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Positions de {selectedUserForProgress.username}
                </h3>
                <button 
                  onClick={handleClosePopups} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                <h4 className="text-md font-medium text-gray-900 mb-4">Positions Affectées</h4>
                {isLoadingPositions ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600">Chargement...</span>
                    </div>
                  </div>
                ) : selectedUserPositions.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-gray-500 text-lg mb-2">Aucune position trouvée</div>
                    <p className="text-gray-400">Cet utilisateur n'a pas encore de positions définies.</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Coordonnées</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Rayon</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedUserPositions.map((position) => (
                          <tr key={position.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{position.name}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs text-gray-500">
                                {position.latitude?.toFixed(4)}, {position.longitude?.toFixed(4)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500">{position.radius}m</div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleTogglePosition(position)}
                                disabled={isTogglingPosition === position.id}
                                className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                  position.isActif
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                } disabled:opacity-50`}
                              >
                                {isTogglingPosition === position.id ? 'Chargement...' : (position.isActif ? 'Actif' : 'Inactif')}
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
                  onClick={handleClosePopups} 
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Terrains Progress Popup */}
        {showTerrainsPopup && selectedUserForProgress && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex justify-between items-center border-b p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Terrains de {selectedUserForProgress.username}
                </h3>
                <button 
                  onClick={handleClosePopups} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                <h4 className="text-md font-medium text-gray-900 mb-4">Gestion des Terrains</h4>
                {selectedUserProgress.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-gray-500 text-lg mb-2">Aucun terrain trouvé</div>
                    <p className="text-gray-400">Cet utilisateur n'a pas encore de terrains assignés.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Nom Terrain</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date Création</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Statut Technique</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Statut Final</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedUserProgress.map((terrain) => (
                          <tr key={terrain.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{terrain.terrain_name}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500">
                                {new Date(terrain.date_creation).toLocaleDateString('fr-FR')}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                {terrain.statut_tech}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={terrain.statut_final}
                                onChange={(e) => handleUpdateTerrainStatus(terrain.id, e.target.value)}
                                className={`text-xs font-medium border rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getStatusBadge(terrain.statut_final)}`}
                              >
                                <option value="terminé">Terminé</option>
                                <option value="validé">Validé</option>
                                <option value="en_cours">En cours</option>
                                <option value="en_revision">En révision</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center p-6 border-t bg-gray-50">
                <div className="text-sm text-gray-500">
                  {selectedUserProgress.length} terrain(s) pour cet utilisateur
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={handleClosePopups} 
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={handleSaveTerrains}
                    disabled={isSaving}
                    className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSaving ? (
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
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}