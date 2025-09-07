"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import {
  Plus, Save, MapPin, Users, Map as MapIcon, Target,
  Eye, Edit2, Trash2, UserPlus, UserMinus, CheckCircle,
  Clock, AlertCircle, XCircle, Navigation, Zap, Phone
} from "lucide-react"
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import AppLayout from "@/layouts/app-layout"

import { Head, router } from "@inertiajs/react"
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Types matching backend models
interface Point {
  lat: number
  lng: number
}

interface Terrain {
  id: number
  name: string
  description: string
  points: Point[]
  surface: number
  radius: number
  projet_id: number
  statut_tech: "en_cours" | "en_revision" | "valide" | "termine"
  statut_final: "en_cours" | "en_revision" | "valide" | "termine"
  salarie_ids: number[]
  created_at?: string
  updated_at?: string
  // Frontend computed properties
  projet_name?: string
}

interface Salarie {
  id: number
  nom: string
  prenom: string
  poste?: string
  email: string
  telephone?: string
  salaire_mensuel?: number
  date_embauche?: string
  statut: "actif" | "inactif"
  emplacement?: string
  terrain_ids?: number[]
  projet_ids?: number[]
}

interface Projet {
  id: number
  nom: string
  description: string
  budget_total?: number
  budget_utilise?: number
  date_debut: string
  date_fin: string
  statut: string
  client?: string
  lieu_realisation?: string
  responsable_id?: number
  type_projet?: string
  latitude?: number
  longitude?: number
  radius?: number
  terrain_ids?: number[]
}

// Custom hook for map click events with right-click support
const MapClickHandler = ({
  isDrawingMode,
  onMapClick,
  onMapRightClick,
}: {
  isDrawingMode: boolean
  onMapClick: (lat: number, lng: number) => void
  onMapRightClick: () => void
}) => {
  useMapEvents({
    click: (e) => {
      if (isDrawingMode) {
        onMapClick(e.latlng.lat, e.latlng.lng)
      }
    },
    contextmenu: (e) => {
      if (isDrawingMode) {
        L.DomEvent.preventDefault(e)
        L.DomEvent.stopPropagation(e)
        onMapRightClick()
      }
    },
  })
  return null
}

// Custom icon generator
const createDrawingIcon = (index: number) => {
  return L.divIcon({
    className: 'custom-drawing-icon',
    html: `<div style="
      width: 20px;
      height: 20px;
      background-color: #22c55e;
      border: 2px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      font-size: 10px;
      font-weight: bold;
      color: white;
    ">${index + 1}</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

// Helper function to extract error message from various error formats
const extractErrorMessage = (errors: any): string => {
  if (typeof errors === 'string') {
    return errors
  }
  
  if (errors && typeof errors === 'object') {
    // Handle Laravel validation errors format
    if (errors.message) {
      return errors.message
    }
    
    // Handle validation errors object
    if (errors.errors) {
      const errorMessages = Object.values(errors.errors).flat()
      return errorMessages.join(', ')
    }
    
    // Handle direct errors object (field: [messages])
    const allMessages = Object.values(errors).flat().filter(msg => typeof msg === 'string')
    if (allMessages.length > 0) {
      return allMessages.join(', ')
    }
    
    // Fallback to JSON string
    try {
      return JSON.stringify(errors)
    } catch {
      return 'Erreur inconnue'
    }
  }
  
  return 'Erreur inconnue'
}

const breadcrumbs = [
  {
    title: "Dashboard Suivi & Contrôle des Travaux",
    href: "/suivi-controle/terrains",
  },
]

export default function TerrainsManagement() {
  // States
  const [salaries, setSalaries] = useState<Salarie[]>([])
  const [terrains, setTerrains] = useState<Terrain[]>([])
  const [projects, setProjects] = useState<Projet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string[]}>({})

  const [selectedSalarie, setSelectedSalarie] = useState<number | null>(null)
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false)
  const [currentPoints, setCurrentPoints] = useState<Point[]>([])
  const [showCreatePopup, setShowCreatePopup] = useState<boolean>(false)
  const [showEditPopup, setShowEditPopup] = useState<boolean>(false)
  const [showSalariesPopup, setShowSalariesPopup] = useState<boolean>(false)
  const [selectedTerrain, setSelectedTerrain] = useState<Terrain | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [assigningStates, setAssigningStates] = useState<{[key: string]: boolean}>({})

  const mapRef = useRef<L.Map>(null)

  const [terrainFormData, setTerrainFormData] = useState({
    name: "",
    description: "",
    radius: "",
    projet_id: "",
    salarie_ids: [] as number[]
  })

  // Load data from API - FIXED VERSION with no dependencies to prevent infinite loops
  const fetchAllData = useCallback(async () => {
    setError(null)
    try {
      const response = await fetch("/suivi-controle/fetch-data")
      if (!response.ok) {
        throw new Error(`Erreur réseau: ${response.status}`)
      }
      const data = await response.json()
      
      // Destructure with default values
      const { terrains = [], projets = [], salaries = [] } = data

      // Add project names to terrains
      const terrainsWithProjects = terrains.map((terrain: any) => {
        const projet = projets.find((p: any) => p.id === terrain.projet_id)
        return { 
          ...terrain, 
          projet_name: projet?.nom || "Projet inconnu",
          surface: Number(terrain.surface) || 0,
          radius: Number(terrain.radius) || 0,
          salarie_ids: terrain.salarie_ids || []
        }
      })

      console.log('Data fetched successfully:', {
        terrains: terrainsWithProjects.length,
        projets: projets.length,
        salaries: salaries.length
      })

      setTerrains(terrainsWithProjects)
      setProjects(projets)
      setSalaries(salaries)
      
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err)
      setError("Erreur lors du chargement des données. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }, []) // Empty dependency array to prevent infinite loops

  useEffect(() => { fetchAllData() }, [fetchAllData])
  
  // Check if any popup is open
  const isAnyPopupOpen = showCreatePopup || showEditPopup || showSalariesPopup

  // Focus terrain on map
  const focusTerrainOnMap = (terrain: Terrain) => {
    if (mapRef.current && terrain.points.length > 0) {
      // Calculate bounds of the terrain polygon
      const bounds = L.latLngBounds(terrain.points.map(p => [p.lat, p.lng]))
      mapRef.current.fitBounds(bounds, { padding: [20, 20] })
    }
  }

  // Handlers
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (!isDrawingMode) return

    const newPoint: Point = { lat, lng }
    setCurrentPoints(prev => [...prev, newPoint])
  }, [isDrawingMode])

  const handleMapRightClick = useCallback(() => {
    if (isDrawingMode && currentPoints.length >= 4) {
      setIsDrawingMode(false)
      setShowCreatePopup(true)
    }
  }, [isDrawingMode, currentPoints])

  const startDrawing = () => {
    setIsDrawingMode(true)
    setCurrentPoints([])
    setShowCreatePopup(false)
    setShowEditPopup(false)
    setShowSalariesPopup(false)
    setError(null)
    setValidationErrors({})
  }

  const cancelDrawing = () => {
    setIsDrawingMode(false)
    setCurrentPoints([])
  }

  const clearDrawingAfterSave = () => {
    setCurrentPoints([])
    setIsDrawingMode(false)
    setTerrainFormData({
      name: "",
      description: "",
      radius: "",
      projet_id: "",
      salarie_ids: []
    })
    setValidationErrors({})
  }

  const handleCreateTerrain = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setValidationErrors({})

    const payload = {
      name: terrainFormData.name,
      description: terrainFormData.description,
      points: currentPoints,
      surface: calculatePolygonArea(currentPoints),
      radius: parseInt(terrainFormData.radius),
      projet_id: parseInt(terrainFormData.projet_id),
      salarie_ids: terrainFormData.salarie_ids,
    }

    console.log('Creating terrain with payload:', payload)

    router.post('/suivi-controle/terrain', payload, {
      onSuccess: (page) => {
        console.log('Terrain created successfully', page)
        fetchAllData()
        setShowCreatePopup(false)
        clearDrawingAfterSave()
      },
      onError: (errors) => {
        console.error('Create terrain error:', errors)
        
        // Handle different types of errors
        if (errors && typeof errors === 'object') {
          // Check if it's validation errors
          const hasValidationErrors = Object.keys(errors).some(key => 
            Array.isArray(errors[key]) && errors[key].length > 0
          )
          
          if (hasValidationErrors) {
            setValidationErrors(errors)
            setError("Veuillez corriger les erreurs de saisie")
          } else {
            setError(extractErrorMessage(errors))
          }
        } else {
          setError(extractErrorMessage(errors))
        }
      },
      onFinish: () => {
        setIsSubmitting(false)
      }
    })
  }

  const handleUpdateTerrain = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedTerrain) return
    setIsSubmitting(true)
    setError(null)
    setValidationErrors({})

    const payload = {
      name: terrainFormData.name,
      description: terrainFormData.description,
      points: currentPoints,
      surface: calculatePolygonArea(currentPoints),
      radius: parseInt(terrainFormData.radius),
      salarie_ids: terrainFormData.salarie_ids,
    }

    console.log('Updating terrain with payload:', payload)

    router.put(`/suivi-controle/terrain/${selectedTerrain.id}`, payload, {
      onSuccess: (page) => {
        console.log('Terrain updated successfully', page)
        fetchAllData()
        setShowEditPopup(false)
        setSelectedTerrain(null)
        clearDrawingAfterSave()
      },
      onError: (errors) => {
        console.error('Update terrain error:', errors)
        
        // Handle different types of errors
        if (errors && typeof errors === 'object') {
          // Check if it's validation errors
          const hasValidationErrors = Object.keys(errors).some(key => 
            Array.isArray(errors[key]) && errors[key].length > 0
          )
          
          if (hasValidationErrors) {
            setValidationErrors(errors)
            setError("Veuillez corriger les erreurs de saisie")
          } else {
            setError(extractErrorMessage(errors))
          }
        } else {
          setError(extractErrorMessage(errors))
        }
      },
      onFinish: () => {
        setIsSubmitting(false)
      }
    })
  }

  const handleCreateCancel = () => {
    setShowCreatePopup(false)
    setShowEditPopup(false)
    setSelectedTerrain(null)
    clearDrawingAfterSave()
    setIsSubmitting(false)
    setError(null)
    setValidationErrors({})
  }

  const handleEditTerrain = (terrain: Terrain) => {
    setSelectedTerrain(terrain)
    setTerrainFormData({
      name: terrain.name,
      description: terrain.description,
      radius: terrain.radius.toString(),
      projet_id: terrain.projet_id.toString(),
      salarie_ids: terrain.salarie_ids || []
    })
    setCurrentPoints(terrain.points)
    setShowEditPopup(true)
    setError(null)
    setValidationErrors({})
  }

  const handleDeleteTerrain = (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce terrain ?")) return

    setError(null)
    console.log('Deleting terrain:', id)

    router.delete(`/suivi-controle/terrain/${id}`, {
      onSuccess: (page) => {
        console.log('Terrain deleted successfully', page)
        fetchAllData() // Refetch data after successful deletion
      },
      onError: (errors) => {
        console.error('Delete terrain error:', errors)
        setError(extractErrorMessage(errors))
      },
    })
  }

  // ----------------- SALARIE ASSIGNMENT -----------------
  // Open salaries modal
  const showSalariesModal = (terrain: Terrain) => {
    setSelectedTerrain(terrain)
    setShowSalariesPopup(true)
    setError(null)
  }

  // FIXED: Toggle assign/unassign salarie to terrain with proper state management
  const toggleSalarieAssignment = async (salarieId: number, terrainId: number) => {
    const assignKey = `${salarieId}-${terrainId}`;
    setAssigningStates(prev => ({ ...prev, [assignKey]: true }));
    setError(null);

    console.log('Toggling salarie assignment:', { salarieId, terrainId });

    // Find current assignment state
    const currentTerrain = terrains.find(t => t.id === terrainId);
    const isCurrentlyAssigned = (currentTerrain?.salarie_ids || []).includes(salarieId);

    try {
      await new Promise((resolve, reject) => {
        router.post('/suivi-controle/terrain/affect-grant', 
          { salarie_id: salarieId, terrain_id: terrainId },
          {
            onSuccess: (page) => {
              console.log('Salarie assignment toggled successfully');
              
              // IMMEDIATE STATE UPDATE - Update local state before refetching
              if (isCurrentlyAssigned) {
                // Remove from terrain
                setTerrains(prev => prev.map(t => 
                  t.id === terrainId 
                    ? { ...t, salarie_ids: t.salarie_ids.filter(id => id !== salarieId) }
                    : t
                ));
                // Update salarie state
                setSalaries(prev => prev.map(s => 
                  s.id === salarieId 
                    ? { ...s, terrain_ids: (s.terrain_ids || []).filter(id => id !== terrainId) }
                    : s
                ));
              } else {
                // Add to terrain
                setTerrains(prev => prev.map(t => 
                  t.id === terrainId 
                    ? { ...t, salarie_ids: [...(t.salarie_ids || []), salarieId] }
                    : t
                ));
                // Update salarie state
                setSalaries(prev => prev.map(s => 
                  s.id === salarieId 
                    ? { ...s, terrain_ids: [...(s.terrain_ids || []), terrainId] }
                    : s
                ));
              }
              
              // Update selected terrain if it's the one being modified
              if (selectedTerrain && selectedTerrain.id === terrainId) {
                setSelectedTerrain(prev => prev ? {
                  ...prev,
                  salarie_ids: isCurrentlyAssigned 
                    ? prev.salarie_ids.filter(id => id !== salarieId)
                    : [...prev.salarie_ids, salarieId]
                } : null);
              }
              
              // Fetch fresh data to ensure synchronization
              fetchAllData();
              resolve(page);
            },
            onError: (errors) => {
              console.error('Assignment error:', errors);
              setError("Erreur lors de l'affectation");
              reject(errors);
            }
          }
        );
      });

    } catch (errors) {
      console.error('Assignment promise error:', errors);
    } finally {
      setAssigningStates(prev => ({ ...prev, [assignKey]: false }));
    }
  };

  // Helper function to get field error
  const getFieldError = (fieldName: string): string | null => {
    if (validationErrors[fieldName] && validationErrors[fieldName].length > 0) {
      return validationErrors[fieldName][0]
    }
    return null
  }

  // Utility functions
  const calculatePolygonArea = (points: Point[]): number => {
    if (points.length < 3) return 0

    let area = 0
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length
      area += points[i].lat * points[j].lng
      area -= points[j].lat * points[i].lng
    }
    area = Math.abs(area) / 2

    return Math.round(area * 111320 * 111320)
  }

  const getStatusBadge = (statut: string) => {
    const statusConfig = {
      en_cours: { bg: "bg-blue-100", text: "text-blue-800", icon: Clock, label: "En cours" },
      en_revision: { bg: "bg-yellow-100", text: "text-yellow-800", icon: AlertCircle, label: "En révision" },
      valide: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle, label: "Validé" },
      termine: { bg: "bg-gray-100", text: "text-gray-800", icon: XCircle, label: "Terminé" }
    }

    const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig.en_cours
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  const getPolygonColor = (statut: string) => {
    switch (statut) {
      case 'en_cours': return { color: '#3b82f6', fillColor: '#3b82f6' }
      case 'valide': return { color: '#10b981', fillColor: '#10b981' }
      case 'en_revision': return { color: '#f59e0b', fillColor: '#f59e0b' }
      default: return { color: '#6b7280', fillColor: '#6b7280' }
    }
  }

  const selectedSalarieData = salaries.find(s => s.id === selectedSalarie)
  const terrainsActifs = terrains.filter(t => t.statut_tech === "en_cours" || t.statut_tech === "en_revision")

  // Filter terrains based on selected salarie
  const filteredTerrains = selectedSalarie === null
    ? terrains
    : terrains.filter(t => (t.salarie_ids || []).includes(selectedSalarie))

  // FIXED: Function to get project names for a salarie based on actual project IDs
  const getSalarieProjectNames = (salarie: Salarie): string[] => {
    return projects
      .filter(p => (salarie.projet_ids || []).includes(p.id))
      .map(p => p.nom)
  }

  // FIXED: Function to get terrain names for a salarie based on terrain IDs
  const getSalarieTerrainNames = (salarie: Salarie): string[] => {
    return terrains
      .filter(t => (salarie.terrain_ids || []).includes(t.id))
      .map(t => t.name);
  }

  // FIXED: Function to return availability (terrain + project names) for a salarie
  const getSalarieDisponibilite = (salarie: Salarie): JSX.Element => {
    const salarieProjetIds = salarie.projet_ids || [];
    const salarieTerrainIds = salarie.terrain_ids || [];
    
    if (salarieProjetIds.length === 0 && salarieTerrainIds.length === 0) {
      return <div className="text-sm text-gray-500">Disponible</div>;
    }

    // Group terrains by their associated projects
    const terrainsGroupedByProject: { [projectId: number]: string[] } = {};
    
    salarieTerrainIds.forEach(terrainId => {
      const terrain = terrains.find(t => t.id === terrainId);
      if (terrain) {
        const projectId = terrain.projet_id;
        if (!terrainsGroupedByProject[projectId]) {
          terrainsGroupedByProject[projectId] = [];
        }
        terrainsGroupedByProject[projectId].push(terrain.name);
      }
    });

    return (
      <div className="space-y-2">
        {salarieProjetIds.map((projectId) => {
          const project = projects.find(p => p.id === projectId);
          const projectTerrains = terrainsGroupedByProject[projectId] || [];
          
          return (
            <div key={projectId} className="text-sm text-gray-600">
              <div className="font-semibold">Projet: {project?.nom || 'Projet inconnu'}</div>
              <div>Terrains: {projectTerrains.length > 0 ? projectTerrains.join(", ") : "Aucun terrain"}</div>
            </div>
          );
        })}
      </div>
    );
  };

  // Function for edit terrain popup - shows project and terrain counts
  const getSalarieProjectTerrainCounts = (salarie: Salarie): string => {
    const terrainCount = (salarie.terrain_ids || []).length
    const projectCount = (salarie.projet_ids || []).length
    
    const parts = []
    if (projectCount > 0) parts.push(`${projectCount} projet${projectCount > 1 ? 's' : ''}`)
    if (terrainCount > 0) parts.push(`${terrainCount} terrain${terrainCount > 1 ? 's' : ''}`)
    
    return parts.length > 0 ? parts.join(', ') : 'Disponible'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
   <AppLayout breadcrumbs={breadcrumbs}>
      
    <div className="min-h-screen bg-gray-50 p-6">
        <Head title="Dashboard Suivi & Contrôle des Travaux" />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900 font-bold"
            >
              ×
            </button>
          </div>
        )}
        

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Salariés</p>
                <p className="text-2xl font-bold text-gray-900">{salaries.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Terrains</p>
                <p className="text-2xl font-bold text-gray-900">{terrains.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Terrains Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{terrainsActifs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Projets</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className={`bg-white rounded-lg shadow-md border border-gray-100 p-6 transition-opacity duration-300 ${
          isAnyPopupOpen ? 'opacity-75' : 'opacity-100'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Carte</h2>
            <div className="flex gap-3">
              <select
                value={selectedSalarie === null ? "" : selectedSalarie.toString()}
                onChange={(e) => {
                  const value = e.target.value
                  setSelectedSalarie(value === "" ? null : Number(value))
                  if (isDrawingMode) {
                    cancelDrawing()
                  }
                }}
                className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                disabled={isDrawingMode}
              >
                <option value="">Tous les terrains</option>
                {salaries.map(salarie => (
                  <option key={salarie.id} value={salarie.id}>
                    {salarie.nom} {salarie.prenom}
                  </option>
                ))}
              </select>

              {!isDrawingMode ? (
                <button
                  onClick={startDrawing}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  disabled={isAnyPopupOpen}
                >
                  <Plus className="w-4 h-4" />
                  Nouveau Terrain
                </button>
              ) : (
                <button
                  onClick={cancelDrawing}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Annuler
                </button>
              )}
            </div>
          </div>

          {/* React Leaflet Map */}
          <div className={`w-full relative rounded-lg border-2 overflow-hidden ${
            isDrawingMode ? 'border-green-500' : 'border-gray-300'
          }`}>
            <MapContainer
              center={[33.5731, -7.5898]}
              zoom={13}
              style={{ height: '500px', width: '100%' }}
              ref={mapRef}
              key={`map-${selectedSalarie}-${filteredTerrains.length}`}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapClickHandler
                isDrawingMode={isDrawingMode}
                onMapClick={handleMapClick}
                onMapRightClick={handleMapRightClick}
              />

              {/* Display terrain polygons */}
              {filteredTerrains.map(terrain => {
                const colors = getPolygonColor(terrain.statut_tech)
                return (
                  <Polygon
                    key={`polygon-${terrain.id}-${selectedSalarie}`}
                    positions={terrain.points.map(p => [p.lat, p.lng])}
                    pathOptions={{
                      ...colors,
                      weight: 2,
                      opacity: 0.8,
                      fillOpacity: 0.3
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-sm">#{terrain.id} - {terrain.name}</h3>
                        <p className="text-xs text-gray-600 mb-2">{terrain.description}</p>
                        <div className="space-y-1 text-xs">
                          <div><strong>Projet:</strong> {terrain.projet_name}</div>
                          <div><strong>Surface:</strong> {terrain.surface?.toLocaleString()} m²</div>
                          <div><strong>Salariés:</strong> {(terrain.salarie_ids || []).length}</div>
                          <div><strong>Points:</strong> {terrain.points.length}</div>
                          <div className="mt-2">
                            {getStatusBadge(terrain.statut_tech)}
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Polygon>
                )
              })}

              {/* Current drawing points */}
              {isDrawingMode && currentPoints.map((point, index) => (
                <Marker
                  key={`drawing-${index}`}
                  position={[point.lat, point.lng]}
                  icon={createDrawingIcon(index)}
                />
              ))}

              {/* Current drawing polygon preview */}
              {isDrawingMode && currentPoints.length > 2 && (
                <Polygon
                  positions={currentPoints.map(p => [p.lat, p.lng])}
                  pathOptions={{
                    color: '#22c55e',
                    fillColor: '#22c55e',
                    weight: 2,
                    opacity: 0.8,
                    fillOpacity: 0.2,
                    dashArray: '5, 5'
                  }}
                />
              )}
            </MapContainer>

            {/* Drawing mode indicator */}
            {isDrawingMode && (
              <div className="absolute top-4 right-4 z-[1000] bg-green-100 px-3 py-2 rounded-lg text-sm shadow-lg">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Mode Dessin Actif</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Points: {currentPoints.length} | Clic droit pour terminer (min 4 points)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Terrains Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Liste des Terrains
              {selectedSalarie && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  - Terrains assignés à {selectedSalarieData?.nom} {selectedSalarieData?.prenom}
                </span>
              )}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom Terrain</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Surface (m²)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salariés</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTerrains.map((terrain) => (
                  <tr 
                    key={terrain.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => focusTerrainOnMap(terrain)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{terrain.name}</div>
                      <div className="text-sm text-gray-500">{terrain.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{terrain.projet_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{terrain.surface?.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          showSalariesModal(terrain)
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        {(terrain.salarie_ids || []).length}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(terrain.statut_tech)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditTerrain(terrain)
                          }}
                          className="inline-flex items-center p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteTerrain(terrain.id)
                          }}
                          className="inline-flex items-center p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTerrains.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <MapIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun terrain</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedSalarie
                    ? "Ce salarié n'a aucun terrain assigné."
                    : "Commencez par créer votre premier terrain sur la carte."
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Create/Edit Terrain Popup */}
        {(showCreatePopup || showEditPopup) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {showCreatePopup ? "Créer un terrain" : "Modifier le terrain"}
              </h3>

              <form onSubmit={showCreatePopup ? handleCreateTerrain : handleUpdateTerrain} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom du terrain *</label>
                    <input
                      type="text"
                      value={terrainFormData.name}
                      onChange={(e) => setTerrainFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                        getFieldError('name') ? 'border-red-300' : ''
                      }`}
                      placeholder="Nom du terrain"
                      required
                      disabled={isSubmitting}
                    />
                    {getFieldError('name') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rayon (mètres) *</label>
                    <input
                      type="number"
                      value={terrainFormData.radius}
                      onChange={(e) => setTerrainFormData(prev => ({ ...prev, radius: e.target.value }))}
                      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                        getFieldError('radius') ? 'border-red-300' : ''
                      }`}
                      placeholder="Rayon en mètres"
                      required
                      disabled={isSubmitting}
                    />
                    {getFieldError('radius') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('radius')}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={terrainFormData.description}
                      onChange={(e) => setTerrainFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                        getFieldError('description') ? 'border-red-300' : ''
                      }`}
                      placeholder="Description du terrain"
                      disabled={isSubmitting}
                    />
                    {getFieldError('description') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('description')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Projet *</label>
                    <select
                      value={terrainFormData.projet_id}
                      onChange={(e) => setTerrainFormData(prev => ({ ...prev, projet_id: e.target.value }))}
                      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                        getFieldError('projet_id') ? 'border-red-300' : ''
                      }`}
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Sélectionner un projet</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.nom}
                        </option>
                      ))}
                    </select>
                    {getFieldError('projet_id') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('projet_id')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Surface calculée automatiquement</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-600">{currentPoints.length} points définis</p>
                      <p className="text-lg font-semibold text-green-600">
                        Surface: {calculatePolygonArea(currentPoints).toLocaleString()} m²
                      </p>
                      {currentPoints.length > 0 && (
                        <div className="mt-2 max-h-20 overflow-y-auto">
                          {currentPoints.map((point, index) => (
                            <div key={index} className="text-xs text-gray-400 font-mono">
                              P{index + 1}: {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {getFieldError('points') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('points')}</p>
                    )}
                  </div>
                </div>

                {/* Salaries Assignment - Updated to show project/terrain counts */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Salariés assignés</label>
                  <div className="border rounded-md max-h-60 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Salarié</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email & Téléphone</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Projet</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {salaries.filter(s => s.emplacement === 'terrain').map(salarie => (
                          <tr key={salarie.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm">{salarie.nom} {salarie.prenom}</td>
                            <td className="px-4 py-2">
                              <div className="text-xs text-gray-400">{salarie.email}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {salarie.telephone}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-500">
                              {getSalarieProjectTerrainCounts(salarie)}
                            </td>
                            <td className="px-4 py-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const isSelected = terrainFormData.salarie_ids.includes(salarie.id)
                                  setTerrainFormData(prev => ({
                                    ...prev,
                                    salarie_ids: isSelected
                                      ? prev.salarie_ids.filter(id => id !== salarie.id)
                                      : [...prev.salarie_ids, salarie.id]
                                  }))
                                }}
                                className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                                  terrainFormData.salarie_ids.includes(salarie.id)
                                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                                    : "bg-green-100 text-green-700 hover:bg-green-200"
                                }`}
                              >
                                {terrainFormData.salarie_ids.includes(salarie.id) ? (
                                  <>
                                    <UserMinus className="w-3 h-3" />
                                    Retirer
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="w-3 h-3" />
                                    Affecter
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {getFieldError('salarie_ids') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('salarie_ids')}</p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCreateCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || currentPoints.length < 4}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Enregistrement...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Save className="w-4 h-4" />
                        <span>{showCreatePopup ? "Créer" : "Modifier"}</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enhanced Salaries Assignment Popup - Updated to show terrain and project names */}
        {showSalariesPopup && selectedTerrain && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[80vh] overflow-y-auto m-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Salariés - Terrain #{selectedTerrain.id} - {selectedTerrain.name}
              </h3>

              <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disponibilité</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
               <tbody className="divide-y divide-gray-200">
                  {/* Assigned salaries */}
                  {salaries
                    .filter(salarie => (selectedTerrain.salarie_ids || []).includes(salarie.id))
                    .map((salarie, index) => {
                      const assignKey = `${salarie.id}-${selectedTerrain.id}`;
                      const isAssigning = assigningStates[assignKey];

                      return (
                        <tr key={salarie.id} className="bg-green-50 hover:bg-green-100">
                          <td className="px-4 py-3 text-sm">{index + 1}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{salarie.nom} {salarie.prenom}</div>
                            <div className="text-sm text-gray-500">{salarie.statut}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Phone className="w-3 h-3" />
                              {salarie.telephone}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {getSalarieDisponibilite(salarie)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleSalarieAssignment(salarie.id, selectedTerrain.id)}
                              disabled={isAssigning}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              {isAssigning ? (
                                <>
                                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                  Traitement...
                                </>
                              ) : (
                                <>
                                  <UserMinus className="w-3 h-3" />
                                  Retirer
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                  {/* Unassigned salaries */}
                  {salaries
                    .filter(salarie => !(selectedTerrain.salarie_ids || []).includes(salarie.id) && salarie.emplacement === 'terrain')
                    .map((salarie, index) => {
                      const assignKey = `${salarie.id}-${selectedTerrain.id}`;
                      const isAssigning = assigningStates[assignKey];

                      return (
                        <tr key={salarie.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{(selectedTerrain.salarie_ids || []).length + index + 1}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{salarie.nom} {salarie.prenom}</div>
                            <div className="text-sm text-gray-500">{salarie.statut}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Phone className="w-3 h-3" />
                              {salarie.telephone}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {getSalarieDisponibilite(salarie)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleSalarieAssignment(salarie.id, selectedTerrain.id)}
                              disabled={isAssigning}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              {isAssigning ? (
                                <>
                                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                  Traitement...
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-3 h-3" />
                                  Affecter
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>

              </table>



              </div>

              <div className="flex justify-end pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowSalariesPopup(false)
                    setSelectedTerrain(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
    </AppLayout>
  )
}