import React, { useState, useRef, useCallback, useEffect } from "react"
import {
  Plus, Save, MapPin, Users, Map as MapIcon, Target,
  Eye, Edit2, Trash2, UserPlus, UserMinus, CheckCircle,
  Clock, AlertCircle, XCircle, Navigation, Phone, Upload,
  Download, X, Bell
} from "lucide-react"
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import JSZip from 'jszip'
import { kml } from '@tmcw/togeojson'
import AppLayout from "@/layouts/app-layout"
import { Head, router, usePage } from "@inertiajs/react"
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Types
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
  user_ids: number[]  // Changed from salarie_ids to user_ids
  created_at?: string
  updated_at?: string
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
  user_ids?: number[]  // Changed from salarie_ids to user_ids
}

interface Notification {
  id: number
  salaries_ids: number[]
  statut: string
  message: string
  recorded_at: string
  created_at?: string
  updated_at?: string
}

interface MessageState {
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  id: string
}

interface ParsedKMLTerrain {
  name: string
  description: string
  points: Point[]
  properties: any
}

interface User {
  id: number
  name: string
  email: string
  role?: string
}

interface PageProps extends Record<string, any> {
  terrains: Terrain[]
  salaries: Salarie[]
  projects: Projet[]
  users: User[]
  flash: {
    success?: string
    error?: string
    info?: string
    warning?: string
  }
}

// Input sanitization
const sanitizeInput = {
  sanitizeText: (input: string): string => {
    if (!input || typeof input !== 'string') return ''
    return input
      .replace(/<[^>]*>/g, '')
      .replace(/&[a-zA-Z0-9#]+;/g, '')
      .replace(/[<>'"&]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
  },
  
  sanitizeNumber: (input: string): string => {
    if (!input || typeof input !== 'string') return ''
    return input.replace(/[^0-9.-]/g, '').trim()
  }
}

// Map click handler component
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
        L.DomEvent.preventDefault(e.originalEvent)
        L.DomEvent.stopPropagation(e)
        onMapRightClick()
      }
    },
  })
  return null
}

// Custom icon creators
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

const createTerrainLabelIcon = (terrain: Terrain) => {
  const colors = getPolygonColor(terrain.statut_tech)
  return L.divIcon({
    className: 'custom-terrain-label',
    html: `<div style="
      background-color: ${colors.fillColor};
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
      border: 1px solid white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      white-space: nowrap;
    ">${terrain.name}</div>`,
    iconSize: [40, 16],
    iconAnchor: [20, 8],
  })
}

// Utility functions
const getPolygonColor = (statut: string) => {
  switch (statut) {
    case 'en_cours': return { color: '#3b82f6', fillColor: '#3b82f6' }
    case 'valide': return { color: '#10b981', fillColor: '#10b981' }
    case 'en_revision': return { color: '#f59e0b', fillColor: '#f59e0b' }
    default: return { color: '#6b7280', fillColor: '#6b7280' }
  }
}

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

const TruncatedText = ({ text, maxLength = 50, className = "" }: { text: string, maxLength?: number, className?: string }) => {
  if (!text) return <span className={className}>-</span>
  
  if (text.length <= maxLength) {
    return <span className={className}>{text}</span>
  }
  
  return (
    <span className={`${className} cursor-help`} title={text}>
      {text.substring(0, maxLength)}...
    </span>
  )
}

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date()
  const recorded = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - recorded.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `il y a ${diffInSeconds}s`
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `il y a ${minutes}min`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `il y a ${hours}h`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `il y a ${days}j`
  }
}

const breadcrumbs = [
  {
    title: "Dashboard Suivi & Contrôle des Travaux",
    href: "/suivi-controle/terrains",
  },
]

export default function TerrainsManagement() {
  // Get data from Inertia page props
const { props } = usePage<PageProps>()

const {
  terrains = [],
  salaries = [],
  projects = [],
  users = [],
  flash = {}
} = props

  

  // Local UI states only
  const [selectedUser, setSelectedUser] = useState<number | null>(null)  // Changed from selectedSalarie
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<number | null>(null)
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false)
  const [currentPoints, setCurrentPoints] = useState<Point[]>([])
  const [showCreatePopup, setShowCreatePopup] = useState<boolean>(false)
  const [showEditPopup, setShowEditPopup] = useState<boolean>(false)
  const [showUsersPopup, setShowUsersPopup] = useState<boolean>(false)  // Changed from showSalariesPopup
  const [showNotifications, setShowNotifications] = useState<boolean>(false)
  const [showKMLData, setShowKMLData] = useState<boolean>(false)
  const [selectedTerrain, setSelectedTerrain] = useState<Terrain | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [assigningStates, setAssigningStates] = useState<{[key: string]: boolean}>({})
  const [messages, setMessages] = useState<MessageState[]>([])
  const [uploadedKMLData, setUploadedKMLData] = useState<ParsedKMLTerrain[]>([])
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [deactivatingNotifications, setDeactivatingNotifications] = useState<{[key: number]: boolean}>({})

  const mapRef = useRef<L.Map>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [terrainFormData, setTerrainFormData] = useState({
    name: "",
    description: "",
    radius: "",
    projet_id: "",
    user_ids: [] as number[]  // Changed from salarie_ids to user_ids
  })

  // Message handling
  const addMessage = useCallback((type: MessageState['type'], message: string) => {
    const id = Date.now().toString()
    const newMessage: MessageState = { type, message, id }
    setMessages(prev => [...prev, newMessage])

    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== id))
    }, 5000)
  }, [])

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }, [])

 
  // Load notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/suivi-controle/fetch-data")
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.mssgs || [])
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }
    fetchNotifications()
  }, [])

  // KML parsing functions remain the same...
  const parseKMLFile = async (file: File): Promise<ParsedKMLTerrain[]> => {
    const isKMZ = file.name.toLowerCase().endsWith('.kmz')
    const isKML = file.name.toLowerCase().endsWith('.kml')

    if (!isKMZ && !isKML) {
      throw new Error('Format de fichier non supporté. Veuillez utiliser un fichier KML ou KMZ.')
    }

    let kmlContent: string = ''

    if (isKMZ) {
      const zip = new JSZip()
      const zipData = await zip.loadAsync(file)
      
      let kmlFile = null
      for (const filename in zipData.files) {
        if (filename.toLowerCase().endsWith('.kml')) {
          kmlFile = zipData.files[filename]
          break
        }
      }

      if (!kmlFile) {
        throw new Error('Aucun fichier KML trouvé dans l\'archive KMZ.')
      }

      kmlContent = await kmlFile.async('string')
    } else {
      kmlContent = await file.text()
    }

    const parser = new DOMParser()
    const kmlDoc = parser.parseFromString(kmlContent, 'text/xml')
    
    const parserError = kmlDoc.querySelector('parsererror')
    if (parserError) {
      throw new Error('Erreur de parsing du fichier KML: ' + parserError.textContent)
    }

    const geoJSON = kml(kmlDoc) as any

    if (!geoJSON.features || geoJSON.features.length === 0) {
      throw new Error('Aucune donnée géographique trouvée dans le fichier.')
    }

    const parsedTerrains: ParsedKMLTerrain[] = []

    geoJSON.features.forEach((feature: any, index: number) => {
      if (feature.geometry && feature.geometry.type === 'Polygon') {
        const coordinates = feature.geometry.coordinates[0]
        
        if (coordinates && coordinates.length >= 4) {
          const points: Point[] = coordinates
            .slice(0, -1)
            .map(([lng, lat]: [number, number]) => ({ lat, lng }))

          const terrain: ParsedKMLTerrain = {
            name: feature.properties?.name || `Terrain ${index + 1}`,
            description: feature.properties?.description || `Terrain importé du fichier ${file.name}`,
            points,
            properties: feature.properties || {}
          }

          parsedTerrains.push(terrain)
        }
      }
    })

    return parsedTerrains
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessingFile(true)

    try {
      const parsedTerrains = await parseKMLFile(file)
      setUploadedKMLData(parsedTerrains)
      setShowKMLData(true)
      addMessage('success', `${parsedTerrains.length} terrain(s) trouvé(s) dans le fichier ${file.name}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du traitement du fichier'
      addMessage('error', errorMessage)
    } finally {
      setIsProcessingFile(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const importTerrainFromKML = (kmlTerrain: ParsedKMLTerrain) => {
    setCurrentPoints(kmlTerrain.points)
    setTerrainFormData(prev => ({
      ...prev,
      name: sanitizeInput.sanitizeText(kmlTerrain.name),
      description: sanitizeInput.sanitizeText(kmlTerrain.description),
      radius: "100"
    }))
    setShowCreatePopup(true)
    setShowKMLData(false)
    addMessage('info', `Terrain "${kmlTerrain.name}" chargé pour création`)
  }

  // Notification deactivation
  const deactivateNotification = async (notificationId: number) => {
    setDeactivatingNotifications(prev => ({ ...prev, [notificationId]: true }))
    
    try {
      await new Promise((resolve, reject) => {
        router.put(`/suivi-controle/notif/${notificationId}`, {}, {
          onSuccess: (page) => {
            setNotifications(prev => prev.filter(n => n.id !== notificationId))
            addMessage('success', 'Notification marquée comme lue')
            resolve(page)
          },
          onError: (errors) => {
            addMessage('error', 'Erreur lors de la désactivation de la notification')
            reject(errors)
          }
        })
      })
    } catch (error) {
      console.error('Notification deactivation error:', error)
    } finally {
      setDeactivatingNotifications(prev => ({ ...prev, [notificationId]: false }))
    }
  }

  // Drawing handlers
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
    setShowUsersPopup(false)  // Changed from setShowSalariesPopup
    setShowKMLData(false)
    setShowNotifications(false)
  }

  const cancelDrawing = () => {
    setIsDrawingMode(false)
    setCurrentPoints([])
  }

  // Form handlers
  const handleFormInputChange = (field: string, value: string) => {
    let sanitizedValue: string

    switch (field) {
      case 'name':
      case 'description':
        sanitizedValue = sanitizeInput.sanitizeText(value)
        break
      case 'radius':
        sanitizedValue = sanitizeInput.sanitizeNumber(value)
        break
      default:
        sanitizedValue = value
    }

    setTerrainFormData(prev => ({ ...prev, [field]: sanitizedValue }))
  }

  const handleCreateTerrain = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const payload = {
      name: sanitizeInput.sanitizeText(terrainFormData.name),
      description: sanitizeInput.sanitizeText(terrainFormData.description),
      radius: parseInt(sanitizeInput.sanitizeNumber(terrainFormData.radius)),
      projet_id: parseInt(terrainFormData.projet_id),
      user_ids: terrainFormData.user_ids,
      points: JSON.stringify(currentPoints),
      surface: calculatePolygonArea(currentPoints),
    }

    router.post('/suivi-controle/terrain', payload, {
      onSuccess: () => {
        setShowCreatePopup(false)
        setCurrentPoints([])
        setIsDrawingMode(false)
        setTerrainFormData({
          name: "",
          description: "",
          radius: "",
          projet_id: "",
          user_ids: []
        })
        addMessage('success', 'Terrain créé avec succès')
      },
      onError: (errors) => {
        console.error('Create terrain error:', errors)
        addMessage('error', 'Erreur lors de la création du terrain')
      },
      onFinish: () => {
        setIsSubmitting(false)
      }
    })
  }

  async function handleUpdateTerrain(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedTerrain) return
    setIsSubmitting(true)

    const payload = {
      name: sanitizeInput.sanitizeText(terrainFormData.name),
      description: sanitizeInput.sanitizeText(terrainFormData.description),
      radius: parseInt(sanitizeInput.sanitizeNumber(terrainFormData.radius)),
      user_ids: terrainFormData.user_ids,
      points: JSON.stringify(currentPoints),
      surface: calculatePolygonArea(currentPoints),
    }

    router.put(`/suivi-controle/terrain/${selectedTerrain.id}`, payload, {
      onSuccess: () => {
        setShowEditPopup(false)
        setSelectedTerrain(null)
        setCurrentPoints([])
        setTerrainFormData({
          name: "",
          description: "",
          radius: "",
          projet_id: "",
          user_ids: []
        })
        addMessage('success', 'Terrain modifié avec succès')
      },
      onError: (errors) => {
        console.error('Update terrain error:', errors)
        addMessage('error', 'Erreur lors de la modification du terrain')
      },
      onFinish: () => {
        setIsSubmitting(false)
      }
    })
  }

  const handleEditTerrain = (terrain: Terrain) => {
    setSelectedTerrain(terrain)
    setTerrainFormData({
      name: terrain.name,
      description: terrain.description,
      radius: terrain.radius.toString(),
      projet_id: terrain.projet_id.toString(),
      user_ids: terrain.user_ids || []
    })
    setCurrentPoints(terrain.points)
    setShowEditPopup(true)
  }

  const handleDeleteTerrain = (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce terrain ?")) return

    router.delete(`/suivi-controle/terrain/${id}`, {
      onSuccess: () => {
        addMessage('success', 'Terrain supprimé avec succès')
      },
      onError: (errors) => {
        console.error('Delete terrain error:', errors)
        addMessage('error', 'Erreur lors de la suppression du terrain')
      },
    })
  }

  // Fixed function name from showSalariesModal to showUsersModal
  const showUsersModal = (terrain: Terrain) => {
    setSelectedTerrain(terrain)
    setShowUsersPopup(true)
  }

  const toggleUserAssignment = async (userId: number, terrainId: number) => {
    const assignKey = `${userId}-${terrainId}`
    setAssigningStates(prev => ({ ...prev, [assignKey]: true }))

    router.post('/suivi-controle/terrain/affect-grant-user', 
      { user_id: userId, terrain_id: terrainId },
      {
        onSuccess: () => {
          addMessage('success', 'Affectation mise à jour')
        },
        onError: (errors) => {
          console.error('Assignment error:', errors)
          addMessage('error', "Erreur lors de l'affectation")
        },
        onFinish: () => {
          setAssigningStates(prev => ({ ...prev, [assignKey]: false }))
        }
      }
    )
  }

  // Fixed function name from getProjectAssignedSalaries to getProjectAssignedUsers
  const getProjectAssignedUsers = () => {
    if (!terrainFormData.projet_id) return []
    
    const selectedProject = projects.find(p => p.id === parseInt(terrainFormData.projet_id))
    if (!selectedProject || !selectedProject.user_ids) return []
    
    // Filter users that are assigned to the selected project
    return users.filter(user => 
      selectedProject.user_ids!.includes(user.id)
    )
  }

  // Get project responsible user (from users table)
  const getProjectResponsibleUser = () => {
    if (!terrainFormData.projet_id) return null
    
    const selectedProject = projects.find(p => p.id === parseInt(terrainFormData.projet_id))
    if (!selectedProject || !selectedProject.responsable_id) return null
    
    // Find the responsible user in users table
    return users.find(user => user.id === selectedProject.responsable_id)
  }

  const focusTerrainOnMap = (terrain: Terrain) => {
    if (mapRef.current && terrain.points.length > 0) {
      const bounds = L.latLngBounds(terrain.points.map(p => [p.lat, p.lng]))
      mapRef.current.fitBounds(bounds, { padding: [20, 20] })
    }
  }

  // Filter terrains
let filteredTerrains = Array.isArray(terrains) ? terrains : []

if (selectedUser !== null) {
  filteredTerrains = filteredTerrains.filter(t => (t.user_ids || []).includes(selectedUser))
}

if (selectedProjectFilter !== null) {
  filteredTerrains = filteredTerrains.filter(t => t.projet_id === selectedProjectFilter)
}

const terrainsActifs = filteredTerrains.filter(
  t => t.statut_tech === "en_cours" || t.statut_tech === "en_revision"
)

const selectedUserData = Array.isArray(users)
  ? users.find(u => u.id === selectedUser)
  : null

const isAnyPopupOpen = showCreatePopup || showEditPopup || showUsersPopup || showKMLData || showNotifications


  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="min-h-screen bg-white p-6">
        <Head title="Dashboard Suivi & Contrôle des Travaux" />
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with Notifications */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Suivi & Contrôle</h1>
            
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-lg transition-colors ${
                  showNotifications ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Bell className="w-6 h-6" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Messages Display */}
          <div className="fixed top-4 right-4 z-40 space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-64 max-w-96 transition-all duration-300 ${
                  message.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
                  message.type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' :
                  message.type === 'warning' ? 'bg-yellow-100 border border-yellow-400 text-yellow-700' :
                  'bg-blue-100 border border-blue-400 text-blue-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  {message.type === 'success' && <CheckCircle className="w-4 h-4" />}
                  {message.type === 'error' && <XCircle className="w-4 h-4" />}
                  {message.type === 'warning' && <AlertCircle className="w-4 h-4" />}
                  {message.type === 'info' && <AlertCircle className="w-4 h-4" />}
                  <span className="text-sm font-medium">{message.message}</span>
                </div>
                <button 
                  onClick={() => removeMessage(message.id)}
                  className="ml-3 hover:opacity-70 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Notifications Popup */}
          {showNotifications && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto m-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Notifications ({notifications.length})
                  </h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Aucune notification</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`border border-gray-200 rounded-lg p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                          deactivatingNotifications[notification.id] ? 'opacity-50' : ''
                        }`}
                        onClick={() => !deactivatingNotifications[notification.id] && deactivateNotification(notification.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                            <Users className="w-4 h-4" />
                            <span>{notification.salaries_ids.length} Nouveaux Profils à Affecter</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!deactivatingNotifications[notification.id]) {
                                deactivateNotification(notification.id)
                              }
                            }}
                            disabled={deactivatingNotifications[notification.id]}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            {deactivatingNotifications[notification.id] ? (
                              <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <div className="text-sm text-gray-700 mb-2">{notification.message}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(notification.recorded_at)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t mt-6">
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
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
                  <p className="text-sm font-medium text-gray-600">Total Profils</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
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
                  value={selectedUser === null ? "" : selectedUser.toString()}
                  onChange={(e) => {
                    const value = e.target.value
                    setSelectedUser(value === "" ? null : Number(value))
                    if (isDrawingMode) {
                      cancelDrawing()
                    }
                  }}
                  className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  disabled={isDrawingMode}
                >
                  <option value="">Tous les profils</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedProjectFilter === null ? "" : selectedProjectFilter.toString()}
                  onChange={(e) => {
                    const value = e.target.value
                    setSelectedProjectFilter(value === "" ? null : Number(value))
                    if (isDrawingMode) {
                      cancelDrawing()
                    }
                  }}
                  className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  disabled={isDrawingMode}
                >
                  <option value="">Tous les projets</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.nom}
                    </option>
                  ))}
                </select>

                {/* File Upload Button */}
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".kml,.kmz"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isDrawingMode || isProcessingFile}
                  />
                  <button
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 ${
                      isProcessingFile ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    disabled={isDrawingMode || isProcessingFile}
                  >
                    {isProcessingFile ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Traitement...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Import KMZ/KML
                      </>
                    )}
                  </button>
                </div>

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
                  const centerLat = terrain.points.reduce((sum, p) => sum + p.lat, 0) / terrain.points.length
                  const centerLng = terrain.points.reduce((sum, p) => sum + p.lng, 0) / terrain.points.length
                  
                  return (
                    <div key={`terrain-group-${terrain.id}`}>
                      <Polygon
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
                              <div><strong>Profils:</strong> {(terrain.user_ids || []).length}</div>
                              <div><strong>Points:</strong> {terrain.points.length}</div>
                              <div className="mt-2">
                                {getStatusBadge(terrain.statut_tech)}
                              </div>
                            </div>
                          </div>
                        </Popup>
                      </Polygon>
                      
                      {/* Terrain Label */}
                      <Marker
                        position={[centerLat, centerLng]}
                        icon={createTerrainLabelIcon(terrain)}
                      >
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-semibold text-sm">#{terrain.id} - {terrain.name}</h3>
                            <p className="text-xs text-gray-600 mb-2">{terrain.description}</p>
                            <div className="space-y-1 text-xs">
                              <div><strong>Projet:</strong> {terrain.projet_name}</div>
                              <div><strong>Surface:</strong> {terrain.surface?.toLocaleString()} m²</div>
                              <div><strong>Profils Assignés:</strong> {(terrain.user_ids || []).length}</div>
                              <div><strong>Statut:</strong> {getStatusBadge(terrain.statut_tech)}</div>
                            </div>
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleEditTerrain(terrain)
                                }}
                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  showUsersModal(terrain)
                                }}
                                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                              >
                                Profils ({(terrain.user_ids || []).length})
                              </button>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    </div>
                  )
                })}

                {/* Display KML data preview */}
                {uploadedKMLData.map((kmlTerrain, index) => (
                  <Polygon
                    key={`kml-preview-${index}`}
                    positions={kmlTerrain.points.map(p => [p.lat, p.lng])}
                    pathOptions={{
                      color: '#8b5cf6',
                      fillColor: '#8b5cf6',
                      weight: 3,
                      opacity: 0.9,
                      fillOpacity: 0.4,
                      dashArray: '10, 5'
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-sm text-purple-700">[KML] {kmlTerrain.name}</h3>
                        <p className="text-xs text-gray-600 mb-2">{kmlTerrain.description}</p>
                        <div className="space-y-1 text-xs">
                          <div><strong>Points:</strong> {kmlTerrain.points.length}</div>
                          <div><strong>Surface:</strong> {calculatePolygonArea(kmlTerrain.points).toLocaleString()} m²</div>
                        </div>
                        <button
                          onClick={() => importTerrainFromKML(kmlTerrain)}
                          className="mt-2 px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                        >
                          Importer ce terrain
                        </button>
                      </div>
                    </Popup>
                  </Polygon>
                ))}

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

          {/* KML Data Display Popup */}
          {showKMLData && uploadedKMLData.length > 0 && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto m-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Données KMZ/KML importées ({uploadedKMLData.length} terrain{uploadedKMLData.length > 1 ? 's' : ''})
                  </h3>
                  <button
                    onClick={() => setShowKMLData(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid gap-4">
                  {uploadedKMLData.map((kmlTerrain, index) => (
                    <div key={index} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-purple-900">{kmlTerrain.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{kmlTerrain.description}</p>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                            <div><strong>Points:</strong> {kmlTerrain.points.length}</div>
                            <div><strong>Surface:</strong> {calculatePolygonArea(kmlTerrain.points).toLocaleString()} m²</div>
                          </div>
                        </div>
                        <button
                          onClick={() => importTerrainFromKML(kmlTerrain)}
                          className="ml-4 inline-flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Importer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                  <button
                    onClick={() => setShowKMLData(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Terrains Table */}
          <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Liste des Terrains
                {(selectedUser || selectedProjectFilter) && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    - Filtré par {selectedUser ? `profil: ${selectedUserData?.name}` : ''} 
                    {selectedUser && selectedProjectFilter ? ' et ' : ''}
                    {selectedProjectFilter ? `projet: ${projects.find(p => p.id === selectedProjectFilter)?.nom}` : ''}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profils</th>
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
                        <div className="text-sm font-medium text-gray-900">
                          <TruncatedText text={terrain.name} maxLength={25} />
                        </div>
                        <div className="text-sm text-gray-500">
                          <TruncatedText text={terrain.description} maxLength={40} />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <TruncatedText text={terrain.projet_name || ""} maxLength={20} />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{terrain.surface?.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            showUsersModal(terrain)
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          {(terrain.user_ids || []).length}
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
                    {selectedUser || selectedProjectFilter
                      ? "Aucun terrain trouvé avec les filtres sélectionnés."
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
                        onChange={(e) => handleFormInputChange('name', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nom du terrain"
                        required
                        disabled={isSubmitting}
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rayon (mètres) *</label>
                      <input
                        type="number"
                        value={terrainFormData.radius}
                        onChange={(e) => handleFormInputChange('radius', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Rayon en mètres"
                        required
                        disabled={isSubmitting}
                        min="1"
                        max="10000"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={terrainFormData.description}
                        onChange={(e) => handleFormInputChange('description', e.target.value)}
                        rows={3}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Description du terrain"
                        disabled={isSubmitting}
                        maxLength={500}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Projet *</label>
                      <select
                        value={terrainFormData.projet_id}
                        onChange={(e) => setTerrainFormData(prev => ({ ...prev, projet_id: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Surface calculée</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">{currentPoints.length} points définis</p>
                        <p className="text-lg font-semibold text-green-600">
                          Surface: {calculatePolygonArea(currentPoints).toLocaleString()} m²
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Users Assignment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {terrainFormData.projet_id ? (
                        <span>
                          Profils assignés au projet:{" "}
                          <span className="text-blue-600 font-semibold">
                            {projects.find(p => p.id === parseInt(terrainFormData.projet_id))?.nom}
                          </span>
                          {(() => {
                            const responsibleUser = getProjectResponsibleUser()
                            return responsibleUser ? (
                              <span className="text-gray-600 text-sm font-normal">
                                {" "}(Responsable: {responsibleUser.name})
                              </span>
                            ) : null
                          })()}
                        </span>
                      ) : (
                        "Sélectionnez d'abord un projet pour voir les profils assignés"
                      )}
                    </label>
                    
                    {terrainFormData.projet_id ? (
                      <>
                        {(() => {
                          const responsibleUser = getProjectResponsibleUser()
                          const projectAssignedUsers = getProjectAssignedUsers()
                          
                          if (!responsibleUser && projectAssignedUsers.length === 0) {
                            return (
                              <div className="text-center py-8 text-gray-500 border rounded-md">
                                <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-sm">Aucun profil assigné à ce projet</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Assignez d'abord des profils au projet depuis la gestion des projets
                                </p>
                              </div>
                            )
                          }
                          
                          return (
                            <div className="border rounded-md max-h-60 overflow-y-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Profil</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {/* Show responsible user info (read-only) */}
                                  {responsibleUser && (
                                    <tr className="bg-blue-50">
                                      <td className="px-4 py-2 text-sm">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                          <TruncatedText
                                            text={responsibleUser.name}
                                            maxLength={20}
                                          />
                                        </div>
                                      </td>
                                      <td className="px-4 py-2">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          Responsable Projet
                                        </span>
                                      </td>
                                      <td className="px-4 py-2">
                                        <div className="text-xs text-gray-500">
                                          <TruncatedText text={responsibleUser.email} maxLength={25} />
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          {responsibleUser.role || 'Utilisateur'}
                                        </div>
                                      </td>
                                      <td className="px-4 py-2">
                                        <span className="inline-flex items-center px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">
                                          Non assignable
                                        </span>
                                      </td>
                                    </tr>
                                  )}
                                  
                                  {/* Project assigned users */}
                                  {projectAssignedUsers.map((user: User) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                      <td className="px-4 py-2 text-sm">
                                        <TruncatedText
                                          text={user.name}
                                          maxLength={20}
                                        />
                                      </td>
                                      <td className="px-4 py-2">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                          {user.role || 'Profil'}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2">
                                        <div className="text-xs text-gray-400">
                                          <TruncatedText text={user.email} maxLength={20} />
                                        </div>
                                      </td>
                                      <td className="px-4 py-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const isSelected = terrainFormData.user_ids.includes(user.id)
                                            setTerrainFormData(prev => ({
                                              ...prev,
                                              user_ids: isSelected
                                                ? prev.user_ids.filter(id => id !== user.id)
                                                : [...prev.user_ids, user.id],
                                            }))
                                          }}
                                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                                            terrainFormData.user_ids.includes(user.id)
                                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                                          }`}
                                        >
                                          {terrainFormData.user_ids.includes(user.id) ? (
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
                          )
                        })()}
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-400 border rounded-md border-dashed">
                        <Users className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                        <p className="text-sm">Sélectionnez un projet pour voir les profils disponibles</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreatePopup(false)
                        setShowEditPopup(false)
                        setSelectedTerrain(null)
                        setCurrentPoints([])
                        setTerrainFormData({
                          name: "",
                          description: "",
                          radius: "",
                          projet_id: "",
                          user_ids: []
                        })
                      }}
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

          {/* Users Assignment Popup */}
          {showUsersPopup && selectedTerrain && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[80vh] overflow-y-auto m-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Profils - Terrain #{selectedTerrain.id} - <TruncatedText text={selectedTerrain.name} maxLength={30} />
                </h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {/* Assigned users */}
                      {users
                        .filter(user => (selectedTerrain.user_ids || []).includes(user.id))
                        .map((user, index) => {
                          const assignKey = `${user.id}-${selectedTerrain.id}`
                          const isAssigning = assigningStates[assignKey]

                          return (
                            <tr key={user.id} className="bg-green-50 hover:bg-green-100">
                              <td className="px-4 py-3 text-sm">{index + 1}</td>
                              <td className="px-4 py-3">
                                <div className="text-sm font-medium text-gray-900">
                                  <TruncatedText text={user.name} maxLength={25} />
                                </div>
                                <div className="text-sm text-gray-500">{user.role || 'Utilisateur'}</div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                <TruncatedText text={user.email} maxLength={30} />
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {user.role || 'Profil'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => toggleUserAssignment(user.id, selectedTerrain.id)}
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
                          )
                        })}

                      {/* Unassigned users */}
                      {users
                        .filter(user => !(selectedTerrain.user_ids || []).includes(user.id))
                        .map((user, index) => {
                          const assignKey = `${user.id}-${selectedTerrain.id}`
                          const isAssigning = assigningStates[assignKey]

                          return (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">{(selectedTerrain.user_ids || []).length + index + 1}</td>
                              <td className="px-4 py-3">
                                <div className="text-sm font-medium text-gray-900">
                                  <TruncatedText text={user.name} maxLength={25} />
                                </div>
                                <div className="text-sm text-gray-500">{user.role || 'Utilisateur'}</div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                <TruncatedText text={user.email} maxLength={30} />
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {user.role || 'Profil'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => toggleUserAssignment(user.id, selectedTerrain.id)}
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
                          )
                        })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-4 border-t mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUsersPopup(false)
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