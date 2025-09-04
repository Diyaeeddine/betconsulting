import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polyline, useMap, useMapEvents } from 'react-leaflet';
import { Users, Save, X, MapPin, Type, Edit, Eye, BarChart3 } from 'lucide-react';
import { router } from "@inertiajs/react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
// @ts-ignore - Leaflet type issue with _getIconUrl
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon for saved terrains
const savedTerrainIcon = new L.Icon({
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

interface Salarie {
  id: string;
  username: string;
  email: string;
  telephone: string;
  created_at: string;
  emplacement: string;
}

interface Terrain {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActif: boolean;
  salarie_ids: string[];
  statut_tech: string;
  statut_final: string;
  date_creation?: string;
}

interface Position {
  id: string;
  salarie_id: string;
  lat: number;
  lng: number;
  recorded_at: string;
  speed?: number;
}

interface TechData {
  tech: Salarie;
  terrains: Terrain[];
}

interface TechInfo {
  salarie: Salarie;
  terrains: Terrain[];
  positions: Position[];
}

// Map Controller Component
function MapController({ 
  onMapClick, 
  onTerrainClick, 
  visibleTerrains, 
  selectedUserTerrain,
  trajectoryData,
  selectedUser
}: {
  onMapClick: (terrain: { latitude: number; longitude: number }) => void;
  onTerrainClick: (terrain: Terrain) => void;
  visibleTerrains: Terrain[];
  selectedUserTerrain: Terrain | null;
  trajectoryData: Position[];
  selectedUser: string;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedUserTerrain && selectedUserTerrain.latitude && selectedUserTerrain.longitude) {
      map.setView([selectedUserTerrain.latitude, selectedUserTerrain.longitude], map.getZoom());
    }
  }, [selectedUserTerrain, map]);

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
      '1': '#3B82F6', // Blue 
      '2': '#10B981', // Green   
      '3': '#F59E0B'  // Orange
    };
    return colors[userId as keyof typeof colors] || '#6B7280';
  };

  return (
    <>
      {/* Render saved terrains */}
      {visibleTerrains.map((terrain) => (
        terrain.latitude && terrain.longitude && (
          <div key={terrain.id}>
            <Marker
              position={[terrain.latitude, terrain.longitude]}
              icon={savedTerrainIcon}
              eventHandlers={{
                click: () => onTerrainClick(terrain)
              }}
            />
            <Circle
              center={[terrain.latitude, terrain.longitude]}
              radius={terrain.radius}
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

export default function Terrains() {
  // State for techs and terrains data
  const [techsData, setTechsData] = useState<TechData[]>([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [selectedTechInfo, setSelectedTechInfo] = useState<TechInfo | null>(null);
  const [selectedUserTerrain, setSelectedUserTerrain] = useState<Terrain | null>(null);

  // Map states
  const [showMapPopup, setShowMapPopup] = useState(false);
  const [selectedTerrain, setSelectedTerrain] = useState<Terrain | null>(null);
  const [newRadius, setNewRadius] = useState(100);
  const [newName, setNewName] = useState('');

  // Progress and terrain states
  const [selectedUserForProgress, setSelectedUserForProgress] = useState<Salarie | null>(null);
  const [showTerrainsPopup, setShowTerrainsPopup] = useState(false);
  const [showProgressPopup, setShowProgressPopup] = useState(false);
  const [selectedUserTerrains, setSelectedUserTerrains] = useState<Terrain[]>([]);
  const [selectedUserProgress, setSelectedUserProgress] = useState<Terrain[]>([]);
  const [editingTerrain, setEditingTerrain] = useState<string | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingTerrains, setIsLoadingTerrains] = useState(false);
  const [isTogglingTerrain, setIsTogglingTerrain] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | ''>('');

  // API calls using fetch for JSON responses
  const fetchTechs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/suivi-controle/getTechs');
      if (!response.ok) throw new Error('Failed to fetch techs');
      const data: TechData[] = await response.json();
      setTechsData(data);
    } catch (error) {
      console.error('Error fetching techs:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des techniciens' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTechInfo = async (techId: string): Promise<TechInfo | null> => {
    try {
      const response = await fetch(`/suivi-controle/getTechInfo/${techId}`);
      if (!response.ok) throw new Error('Failed to fetch tech info');
      const data: TechInfo = await response.json();
      setSelectedTechInfo(data);
      
      // Set first terrain as selected for map view
      if (data.terrains && data.terrains.length > 0) {
        setSelectedUserTerrain(data.terrains[0]);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching tech info:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des informations du technicien' });
      return null;
    }
  };

  const affectGrantTech = async (salarieId: string, terrainId: string) => {
    try {
      setIsTogglingTerrain(terrainId);
      const response = await fetch('/suivi-controle/affectGrantTech', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          salarie_id: salarieId,
          terrain_id: terrainId
        })
      });

      if (!response.ok) throw new Error('Failed to update terrain assignment');
      const data = await response.json();
      
      setMessage({ type: 'success', text: data.message });
      
      // Refresh tech data
      await fetchTechs();
      if (selectedTech) {
        await fetchTechInfo(selectedTech);
      }
    } catch (error) {
      console.error('Error updating terrain assignment:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour de l\'affectation' });
    } finally {
      setIsTogglingTerrain(null);
    }
  };

  const updateStatutTerr = async () => {
    try {
      setIsSaving(true);
      
      const terrainsToUpdate = selectedUserProgress.map(terrain => ({
        id: terrain.id,
        statut_tech: terrain.statut_tech,
        statut_final: terrain.statut_final
      }));

      const response = await fetch('/suivi-controle/updateStatutTerr', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          terrains: terrainsToUpdate
        })
      });

      if (!response.ok) throw new Error('Failed to update terrain statuses');
      const data = await response.json();
      
      setMessage({ type: 'success', text: data.message });
      
      // Refresh data
      await fetchTechs();
      if (selectedTech) {
        await fetchTechInfo(selectedTech);
      }
    } catch (error) {
      console.error('Error updating terrain statuses:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour des statuts' });
    } finally {
      setIsSaving(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchTechs();
  }, []);

  // Filter terrains to show only for selected tech
  const visibleTerrains = selectedTechInfo ? selectedTechInfo.terrains : [];

  // Get trajectory data for selected tech
  const trajectoryData = selectedTechInfo ? selectedTechInfo.positions : [];

  // Handle tech selection from dropdown
  const handleTechSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const techId = e.target.value;
    setSelectedTech(techId);

    if (techId) {
      const techInfo = await fetchTechInfo(techId);
      if (techInfo && techInfo.terrains.length > 0) {
        setSelectedUserTerrain(techInfo.terrains[0]);
      } else {
        setSelectedUserTerrain(null);
      }
    } else {
      setSelectedTechInfo(null);
      setSelectedUserTerrain(null);
    }

    setShowMapPopup(false);
    setSelectedTerrain(null);
  };

  // Map functions
  const handleMapClick = (clickedPosition: { latitude: number; longitude: number }) => {
    if (!selectedTech) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un technicien d\'abord' });
      return;
    }

    if (!selectedTerrain) {
      const newTerrain: Terrain = {
        id: Date.now().toString(),
        latitude: clickedPosition.latitude,
        longitude: clickedPosition.longitude,
        radius: 100,
        name: '',
        salarie_ids: [selectedTech],
        isActif: true,
        statut_tech: 'en_cours',
        statut_final: 'en_cours'
      };

      setSelectedTerrain(newTerrain);
      setNewRadius(100);
      setNewName('');
      setShowMapPopup(true);
    }
  };

  const handleTerrainClick = (terrain: Terrain) => {
    setSelectedTerrain(terrain);
    setNewRadius(terrain.radius);
    setNewName(terrain.name || '');
    setShowMapPopup(true);
  };

  const handleSaveTerrain = async () => {
    if (!selectedTech) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un technicien' });
      return;
    }

    if (!newName.trim()) {
      setMessage({ type: 'error', text: 'Veuillez entrer un nom pour le terrain' });
      return;
    }

    setIsSaving(true);

    // Here you would call your terrain creation/update API
    setTimeout(async () => {
      setShowMapPopup(false);
      setSelectedTerrain(null);
      setIsSaving(false);
      setMessage({ type: 'success', text: 'Terrain sauvegardé avec succès' });
      
      // Refresh data
      await fetchTechs();
      if (selectedTech) {
        await fetchTechInfo(selectedTech);
      }
    }, 1000);
  };

  const handleCancelTerrain = () => {
    setShowMapPopup(false);
    setSelectedTerrain(null);
    setNewName('');
  };

  // Progress and terrain functions
  const handleViewTerrains = async (tech: Salarie) => {
    setSelectedUserForProgress(tech);
    setShowTerrainsPopup(true);
    setIsLoadingTerrains(true);

    try {
      const techInfo = await fetchTechInfo(tech.id);
      if (techInfo) {
        setSelectedUserTerrains(techInfo.terrains);
      }
    } catch (error) {
      console.error('Error loading terrains:', error);
    } finally {
      setIsLoadingTerrains(false);
    }
  };

  const handleViewProgress = async (tech: Salarie) => {
    setSelectedUserForProgress(tech);
    setShowProgressPopup(true);
    setIsLoadingTerrains(true);

    try {
      const techInfo = await fetchTechInfo(tech.id);
      if (techInfo) {
        setSelectedUserProgress(techInfo.terrains);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setIsLoadingTerrains(false);
    }
  };

  const handleToggleTerrain = async (terrain: Terrain) => {
    if (!selectedUserForProgress) return;
    
    await affectGrantTech(selectedUserForProgress.id, terrain.id);
    
    // Refresh terrain list
    const techInfo = await fetchTechInfo(selectedUserForProgress.id);
    if (techInfo) {
      setSelectedUserTerrains(techInfo.terrains);
    }
  };

  const handleUpdateTerrainStatus = (terrainId: string, field: 'statut_tech' | 'statut_final', newStatus: string) => {
    setSelectedUserProgress(prev =>
      prev.map(terrain =>
        terrain.id === terrainId
          ? { ...terrain, [field]: newStatus }
          : terrain
      )
    );
  };

  const handleSaveTerrains = async () => {
    await updateStatutTerr();
    setShowProgressPopup(false);
    setSelectedUserForProgress(null);
    setSelectedUserProgress([]);
  };

  const handleClosePopups = () => {
    setShowTerrainsPopup(false);
    setShowProgressPopup(false);
    setSelectedUserForProgress(null);
    setSelectedUserTerrains([]);
    setSelectedUserProgress([]);
    setIsLoadingTerrains(false);
    setIsTogglingTerrain(null);
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

  const formatTime = (timestamp: string) => {
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

  // Calculate totals
  const totalTerrains = techsData.reduce((acc, tech) => acc + tech.terrains.length, 0);
  const totalActiveTerrains = techsData.reduce((acc, tech) => 
    acc + tech.terrains.filter(t => t.isActif).length, 0
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Terrains</h1>
            <p className="text-gray-600 mt-1">Gérez les terrains et positions des techniciens</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Techniciens</p>
                <p className="text-2xl font-bold text-gray-900">{techsData.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Terrains</p>
                <p className="text-2xl font-bold text-gray-900">{totalTerrains}</p>
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
                <p className="text-2xl font-bold text-gray-900">{totalActiveTerrains}</p>
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
                  {selectedTech ? techsData.find(t => t.tech.id === selectedTech)?.tech.username : 'Aucun'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Carte Interactive</h3>
              
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-500" />
                <select
                  value={selectedTech}
                  onChange={handleTechSelect}
                  className="block w-64 px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="">Sélectionner un technicien...</option>
                  {techsData.map((tech) => (
                    <option key={tech.tech.id} value={tech.tech.id}>
                      {tech.tech.username}
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
                  center={selectedUserTerrain && selectedUserTerrain.latitude && selectedUserTerrain.longitude 
                    ? [selectedUserTerrain.latitude, selectedUserTerrain.longitude] 
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
                    onTerrainClick={handleTerrainClick}
                    visibleTerrains={visibleTerrains}
                    selectedUserTerrain={selectedUserTerrain}
                    trajectoryData={trajectoryData}
                    selectedUser={selectedTech}
                  />
                </MapContainer>
              </div>
            )}

            {/* Map Instructions */}
            {!isLoading && (
              <div className="absolute top-4 right-4 bg-white bg-opacity-95 backdrop-blur-sm text-gray-800 text-sm px-4 py-3 rounded-lg shadow-lg border border-gray-200 z-[1000] max-w-xs">
                <div className="space-y-2">
                  {selectedTech ? (
                    <>
                      <div className="flex items-center space-x-2 text-green-600">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">Cliquer pour ajouter un terrain</span>
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
                      <span className="font-medium">Sélectionner un technicien</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Statistics */}
            {!isLoading && (
              <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 backdrop-blur-sm text-gray-800 text-sm px-4 py-3 rounded-lg shadow-lg border border-gray-200 z-[1000]">
                <div className="space-y-1">
                  {selectedTech ? (
                    <>
                      <div>Terrains technicien: <span className="font-semibold text-green-600">{visibleTerrains.length}</span></div>
                      <div>Points de trajectoire: <span className="font-semibold text-blue-600">{trajectoryData.length}</span></div>
                      <div className="text-xs text-gray-500">
                        {techsData.find(t => t.tech.id === selectedTech)?.tech.username}
                      </div>
                    </>
                  ) : (
                    <div>Terrains totaux: <span className="font-semibold text-gray-600">{totalTerrains}</span></div>
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

        {/* Technicians Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Techniciens</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N°</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terrains</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progrès</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {techsData.map((techData, index) => (
                  <tr key={techData.tech.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{techData.tech.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{techData.tech.telephone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewTerrains(techData.tech)}
                        className="inline-flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors duration-200"
                        title="Voir les terrains"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Voir ({techData.terrains.length})</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewProgress(techData.tech)}
                        className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700 transition-colors duration-200"
                        title="Voir le progrès"
                      >
                        <BarChart3 className="w-3 h-3" />
                        <span>Progrès ({techData.terrains.length})</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {techsData.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900">Aucun technicien</h3>
              <p className="text-sm text-gray-500">Les techniciens apparaîtront ici.</p>
            </div>
          )}
        </div>

        {/* Terrain Edit Popup */}
        {showMapPopup && selectedTerrain && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Modifier Terrain
                  </h3>
                  <button
                    onClick={handleCancelTerrain}
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
                    Nom du Terrain *
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Entrez le nom du terrain"
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
                    <div>Latitude: {selectedTerrain.latitude?.toFixed(6)}</div>
                    <div>Longitude: {selectedTerrain.longitude?.toFixed(6)}</div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-between">
                <button
                  onClick={handleCancelTerrain}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveTerrain}
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

        {/* User Terrains Popup */}
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
                <h4 className="text-md font-medium text-gray-900 mb-4">Terrains Affectés</h4>
                {isLoadingTerrains ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600">Chargement...</span>
                    </div>
                  </div>
                ) : selectedUserTerrains.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-gray-500 text-lg mb-2">Aucun terrain trouvé</div>
                    <p className="text-gray-400">Ce technicien n'a pas encore de terrains affectés.</p>
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
                        {selectedUserTerrains.map((terrain) => (
                          <tr key={terrain.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{terrain.name}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs text-gray-500">
                                {terrain.latitude?.toFixed(4)}, {terrain.longitude?.toFixed(4)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500">{terrain.radius}m</div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleToggleTerrain(terrain)}
                                disabled={isTogglingTerrain === terrain.id}
                                className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                  terrain.isActif
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                } disabled:opacity-50`}
                              >
                                {isTogglingTerrain === terrain.id ? 'Chargement...' : (terrain.isActif ? 'Actif' : 'Inactif')}
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
        {showProgressPopup && selectedUserForProgress && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex justify-between items-center border-b p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Progrès des Terrains - {selectedUserForProgress.username}
                </h3>
                <button 
                  onClick={handleClosePopups} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                <h4 className="text-md font-medium text-gray-900 mb-4">Gestion des Statuts</h4>
                {isLoadingTerrains ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600">Chargement...</span>
                    </div>
                  </div>
                ) : selectedUserProgress.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-gray-500 text-lg mb-2">Aucun terrain trouvé</div>
                    <p className="text-gray-400">Ce technicien n'a pas encore de terrains assignés.</p>
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
                              <div className="text-sm font-medium text-gray-900">{terrain.name}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500">
                                {terrain.date_creation ? new Date(terrain.date_creation).toLocaleDateString('fr-FR') : '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={terrain.statut_tech}
                                onChange={(e) => handleUpdateTerrainStatus(terrain.id, 'statut_tech', e.target.value)}
                                className={`text-xs font-medium border rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getStatusBadge(terrain.statut_tech)}`}
                              >
                                <option value="validé">Validé</option>
                                <option value="terminé">Terminé</option>
                                <option value="en_cours">En cours</option>
                                <option value="en_revision">En révision</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={terrain.statut_final}
                                onChange={(e) => handleUpdateTerrainStatus(terrain.id, 'statut_final', e.target.value)}
                                className={`text-xs font-medium border rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getStatusBadge(terrain.statut_final)}`}
                              >
                                <option value="validé">Validé</option>
                                <option value="terminé">Terminé</option>
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
                  {selectedUserProgress.length} terrain(s) pour ce technicien
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
    </div>
  );
}