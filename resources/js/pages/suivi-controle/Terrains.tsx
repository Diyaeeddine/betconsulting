"use client"
import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import {
  Plus, Save, MapPin, Users, Map as MapIcon, Target,
  Eye, Edit2, Trash2, UserPlus, UserMinus, CheckCircle,
  Clock, AlertCircle, XCircle, Navigation, Zap, Phone, Upload,
  FileText, Download, X, Bell
} from "lucide-react"
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import JSZip from 'jszip'
import { kml, gpx } from '@mapbox/togeojson'
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

interface Profil {
  id: number
  nom: string
  poste: string
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
  profils?: Profil[]
}

interface RhNeed {
  profilename: string
  profileposte: string
  number: number
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
  rh_needs?: RhNeed[]
  salarie_ids?: number[]
}

interface SalariesDisponibility {
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

interface KMLData {
  type: string
  features: Array<{
    type: string
    properties: any
    geometry: {
      type: string
      coordinates: any
    }
  }>
}

interface ParsedKMLTerrain {
  name: string
  description: string
  points: Point[]
  properties: any
}

// Profils and postes data
const profilsPostes = [
  {
    value: "bureau_etudes",
    label: "Bureau d'Études Techniques (BET)",
    postes: [
      "Ingénieur structure (béton, acier, bois)",
      "Ingénieur génie civil",
      "Ingénieur électricité / électricité industrielle",
      "Ingénieur thermique / énergétique",
      "Ingénieur fluides (HVAC, plomberie, CVC)",
      "Ingénieur géotechnique",
      "Dessinateur projeteur / DAO (Autocad, Revit, Tekla)",
      "Technicien bureau d'études",
      "Chargé d'études techniques",
      "Ingénieur environnement / développement durable",
      "Ingénieur calcul de structures",
      "Architecte"
    ],
  },
  {
    value: "construction",
    label: "Construction",
    postes: [
      "Chef de chantier",
      "Conducteur de travaux",
      "Ingénieur travaux / Ingénieur chantier",
      "Conducteur d'engins",
      "Chef d'équipe",
      "Technicien travaux",
      "Manœuvre / Ouvrier spécialisé",
      "Coordinateur sécurité chantier (SST, prévention)",
      "Métreur / Économiste de la construction"
    ],
  },
  {
    value: "suivi_controle",
    label: "Suivi et Contrôle",
    postes: [
      "Contrôleur technique",
      "Chargé de suivi qualité",
      "Chargé de suivi sécurité",
      "Inspecteur de chantier",
      "Responsable HSE (Hygiène, Sécurité, Environnement)",
      "Technicien contrôle qualité",
      "Planificateur / Chargé de planning",
      "Responsable logistique chantier"
    ],
  },
  {
    value: "support_gestion",
    label: "Support et Gestion",
    postes: [
      "Responsable administratif chantier",
      "Assistant de projet",
      "Responsable achats / approvisionnement",
      "Responsable qualité",
      "Gestionnaire de contrats",
      "Chargé de communication",
      "Responsable financier / comptable chantier"
    ],
  },
]

// Input sanitization functions
const sanitizeInput = {
  // Remove HTML tags
  removeHtmlTags: (input: string): string => {
    return input.replace(/<[^>]*>/g, '').replace(/&[a-zA-Z0-9#]+;/g, '')
  },
  
  // Remove URLs and links
  removeUrls: (input: string): string => {
    const urlRegex = /(?:https?:\/\/|www\.|[a-zA-Z0-9\-]+\.(?:com|org|net|edu|gov|mil|int|co|io|ai|me|tv|ly|app|dev|tech|info|biz|name|pro|museum|aero|coop|jobs|mobi|travel|xxx|xyz|online|site|website|blog|store|shop))[^\s]*/gi
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    return input.replace(urlRegex, '').replace(emailRegex, '')
  },
  
  // Remove special characters that might be harmful
  removeSpecialChars: (input: string): string => {
    return input.replace(/[<>'"&]/g, '').replace(/javascript:/gi, '').replace(/on\w+=/gi, '')
  },
  
  // Comprehensive text sanitization
  sanitizeText: (input: string): string => {
    if (!input || typeof input !== 'string') return ''
    
    let sanitized = input.trim()
    sanitized = sanitizeInput.removeHtmlTags(sanitized)
    sanitized = sanitizeInput.removeUrls(sanitized)
    sanitized = sanitizeInput.removeSpecialChars(sanitized)
    
    // Remove multiple spaces and line breaks
    sanitized = sanitized.replace(/\s+/g, ' ').trim()
    
    return sanitized
  },
  
  // Sanitize numeric input
  sanitizeNumber: (input: string): string => {
    if (!input || typeof input !== 'string') return ''
    return input.replace(/[^0-9.-]/g, '').trim()
  }
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

// Create terrain label icon
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

// Helper function to get polygon color
const getPolygonColor = (statut: string) => {
  switch (statut) {
    case 'en_cours': return { color: '#3b82f6', fillColor: '#3b82f6' }
    case 'valide': return { color: '#10b981', fillColor: '#10b981' }
    case 'en_revision': return { color: '#f59e0b', fillColor: '#f59e0b' }
    default: return { color: '#6b7280', fillColor: '#6b7280' }
  }
}

// Text truncation component
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

// Helper function to format time ago
const formatTimeAgo = (timestamp: string): string => {
  const now = new Date()
  const recorded = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - recorded.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `il y a ${diffInSeconds}s`
     console.log(`il y a ${diffInSeconds}s`)
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
     console.log(`il y a ${minutes}min`)
    return `il y a ${minutes} min`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
     console.log(`il y a ${hours}h`)
    return `il y a ${hours}h`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    console.log(`il y a ${days}j`)
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
  // Get flash messages from Inertia page props
  const { props } = usePage()
  const flashMessages = (props as any).flash || {}

  // States
  const [salaries, setSalaries] = useState<Salarie[]>([])
  const [terrains, setTerrains] = useState<Terrain[]>([])
  const [projects, setProjects] = useState<Projet[]>([])
  const [notifications, setNotifications] = useState<SalariesDisponibility[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string[]}>({})
  const [messages, setMessages] = useState<MessageState[]>([])

  // New states for notifications and filtering
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProjectsPopup, setShowProjectsPopup] = useState(false)
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<number | null>(null)
  const [deactivatingNotifications, setDeactivatingNotifications] = useState<{[key: number]: boolean}>({})

  // New states for project salaries popup
  const [showProjectSalariesPopup, setShowProjectSalariesPopup] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Projet | null>(null)
  const [affectedSalaries, setAffectedSalaries] = useState<number[]>([])
  const [isSubmittingProjectSalaries, setIsSubmittingProjectSalaries] = useState(false)
  const [projectRhNeedsState, setProjectRhNeedsState] = useState<RhNeed[]>([])
  // New state to track original project data for comparison
  const [originalProjectData, setOriginalProjectData] = useState<{salarie_ids: number[], rh_needs: RhNeed[]} | null>(null)

  // KML/KMZ related states
  const [uploadedKMLData, setUploadedKMLData] = useState<ParsedKMLTerrain[]>([])
  const [showKMLData, setShowKMLData] = useState(false)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedTerrain, setSelectedTerrain] = useState<Terrain | null>(null)
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false)
  const [currentPoints, setCurrentPoints] = useState<Point[]>([])
  const [showCreatePopup, setShowCreatePopup] = useState<boolean>(false)
  const [showEditPopup, setShowEditPopup] = useState<boolean>(false)
  const [showSalariesPopup, setShowSalariesPopup] = useState<boolean>(false)
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

  // Message handling functions
  const addMessage = useCallback((type: MessageState['type'], message: string) => {
    const id = Date.now().toString()
    const newMessage: MessageState = { type, message, id }
    setMessages(prev => [...prev, newMessage])

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== id))
    }, 5000)
  }, [])

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }, [])

  // Handle flash messages from backend
  useEffect(() => {
    if (flashMessages.success) {
      addMessage('success', flashMessages.success)
    }
    if (flashMessages.error) {
      addMessage('error', flashMessages.error)
    }
    if (flashMessages.info) {
      addMessage('info', flashMessages.info)
    }
    if (flashMessages.warning) {
      addMessage('warning', flashMessages.warning)
    }
  }, [flashMessages, addMessage])

  // ENHANCED: Project salaries popup handlers with proper state management
  const openProjectSalariesPopup = (projet: Projet) => {
    // Get the latest project data to ensure we have current state
    const currentProject = projects.find(p => p.id === projet.id) || projet
    
    setSelectedProject(currentProject)
    // Set initial affected salaries from current project state
    const currentAffectedSalaries = currentProject.salarie_ids || []
    setAffectedSalaries([...currentAffectedSalaries])
    
    // Deep copy the RH needs to avoid mutations
    const currentRhNeeds = currentProject.rh_needs ? JSON.parse(JSON.stringify(currentProject.rh_needs)) : []
    setProjectRhNeedsState(currentRhNeeds)
    
    // Store original data for comparison and reset calculations
    setOriginalProjectData({
      salarie_ids: [...currentAffectedSalaries],
      rh_needs: JSON.parse(JSON.stringify(currentRhNeeds))
    })
    
    setShowProjectSalariesPopup(true)
    setShowNotifications(false)
    setShowProjectsPopup(false)
  }

  const handleProjectRowClick = (projet: Projet) => {
    openProjectSalariesPopup(projet)
  }

  // FIXED: Enhanced toggle function that properly handles assignment/removal
  const toggleSalarieInProject = (salarieId: number) => {
    setAffectedSalaries(prev => {
      const isCurrentlyAffected = prev.includes(salarieId)
      
      if (isCurrentlyAffected) {
        // REMOVE from affected - always allow removal
        const salarie = salaries.find(s => s.id === salarieId)
        if (salarie?.profils?.[0] && originalProjectData) {
          // Find if this salarie was originally assigned
          const wasOriginallyAssigned = originalProjectData.salarie_ids.includes(salarieId)
          
          if (wasOriginallyAssigned) {
            // If originally assigned, restore the need count when removing
            const profile = salarie.profils[0]
            setProjectRhNeedsState(prevNeeds => 
              prevNeeds.map(need => 
                need.profilename === profile.nom && need.profileposte === profile.poste
                  ? { ...need, number: need.number + 1 }
                  : need
              )
            )
          }
        }
        
        console.log(`Removing salary ${salarieId} from project`)
        return prev.filter(id => id !== salarieId)
      } else {
        // ADD to affected - check if there's available need
        const salarie = salaries.find(s => s.id === salarieId)
        if (salarie?.profils?.[0]) {
          const profile = salarie.profils[0]
          const needIndex = projectRhNeedsState.findIndex(
            need => need.profilename === profile.nom && 
                   need.profileposte === profile.poste && 
                   need.number > 0
          )
          
          if (needIndex >= 0) {
            // Decrease the need count when adding
            setProjectRhNeedsState(prevNeeds => 
              prevNeeds.map((need, idx) => 
                idx === needIndex
                  ? { ...need, number: need.number - 1 }
                  : need
              )
            )
            console.log(`Adding salary ${salarieId} to project`)
            return [...prev, salarieId]
          } else {
            // Still allow assignment even if no explicit need
            console.log(`Adding salary ${salarieId} to project (no specific need requirement)`)
            addMessage('info', 'Profil ajouté sans besoin spécifique')
            return [...prev, salarieId]
          }
        }
        return [...prev, salarieId]
      }
    })
  }

  // ENHANCED: Submit function with better error handling and state updates
  const submitProjectSalaries = async () => {
    if (!selectedProject) return

    setIsSubmittingProjectSalaries(true)

    const payload = {
      projet_id: selectedProject.id,
      name: selectedProject.nom,
      salarie_ids: affectedSalaries
    }

    console.log('Submitting project salaries:', payload)

    try {
      await new Promise((resolve, reject) => {
        router.put('/suivi-controle/ProjetSals', payload, {
          onSuccess: (page) => {
            addMessage('success', 'Affectations enregistrées avec succès')
            
            // Update local project state immediately
            setProjects(prev => prev.map(p => 
              p.id === selectedProject.id 
                ? { ...p, salarie_ids: [...affectedSalaries] }
                : p
            ))
            
            // Update local salaries state
            setSalaries(prev => prev.map(salarie => {
              const wasInProject = (originalProjectData?.salarie_ids || []).includes(salarie.id)
              const isNowInProject = affectedSalaries.includes(salarie.id)
              
              let newProjetIds = [...(salarie.projet_ids || [])]
              
              if (wasInProject && !isNowInProject) {
                // Remove from project
                newProjetIds = newProjetIds.filter(id => id !== selectedProject.id)
              } else if (!wasInProject && isNowInProject) {
                // Add to project
                if (!newProjetIds.includes(selectedProject.id)) {
                  newProjetIds.push(selectedProject.id)
                }
              }
              
              return {
                ...salarie,
                projet_ids: newProjetIds
              }
            }))
            
            setShowProjectSalariesPopup(false)
            setSelectedProject(null)
            setAffectedSalaries([])
            setOriginalProjectData(null)
            
            // Refresh data to ensure consistency
            fetchAllData()
            resolve(page)
          },
          onError: (errors) => {
            console.error('Submit project salaries error:', errors)
            const errorMsg = extractErrorMessage(errors)
            addMessage('error', errorMsg)
            reject(errors)
          }
        })
      })
    } catch (error) {
      console.error('Project salaries submission error:', error)
    } finally {
      setIsSubmittingProjectSalaries(false)
    }
  }

  const getProfileLabel = (profileName: string): string => {
    const profile = profilsPostes.find(p => p.value === profileName)
    return profile?.label || profileName
  }

  const getSalarieDisplayName = (salarie: Salarie): string => {
    if (salarie.profils && salarie.profils.length > 0) {
      const profil = salarie.profils[0]
      return `${profil.poste} - ${profil.nom}`
    }
    return `${salarie.nom} ${salarie.prenom}`
  }

  // FIXED: Calculate total remaining positions needed (not number of need types)
  const getTotalRemainingPositions = (): number => {
    if (!originalProjectData) return 0
    
    const totalOriginalNeeds = originalProjectData.rh_needs.reduce((sum, need) => sum + need.number, 0)
    const totalCurrentAssignments = affectedSalaries.length
    
    return Math.max(0, totalOriginalNeeds - totalCurrentAssignments)
  }

  // ENHANCED: Function to check if a salarie can be affected (for UI feedback)
  const canSalarieBeAffected = (salarie: Salarie): boolean => {
    // Always allow if already affected (for removal)
    if (affectedSalaries.includes(salarie.id)) {
      return true
    }
    
    // Allow assignment if there are available needs or if no specific needs requirement
    if (salarie.profils?.[0]) {
      const profile = salarie.profils[0]
      const hasAvailableNeed = projectRhNeedsState.some(
        need => need.profilename === profile.nom && 
               need.profileposte === profile.poste && 
               need.number > 0
      )
      return hasAvailableNeed || projectRhNeedsState.length === 0
    }
    
    return true // Always allow if no specific profile requirement
  }

  // Notification deactivation handler - only for X button
  const deactivateNotification = async (notificationId: number) => {
    setDeactivatingNotifications(prev => ({ ...prev, [notificationId]: true }))
    
    try {
      await new Promise((resolve, reject) => {
        router.put(`/suivi-controle/notif/${notificationId}`, {}, {
          onSuccess: (page) => {
            // Remove notification from local state
            setNotifications(prev => prev.filter(n => n.id !== notificationId))
            addMessage('success', 'Notification marquée comme lue')
            resolve(page)
          },
          onError: (errors) => {
            console.error('Deactivate notification error:', errors)
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

  // KMZ/KML parsing functions
  const parseKMLFile = async (file: File): Promise<ParsedKMLTerrain[]> => {
    const isKMZ = file.name.toLowerCase().endsWith('.kmz')
    const isKML = file.name.toLowerCase().endsWith('.kml')

    if (!isKMZ && !isKML) {
      throw new Error('Format de fichier non supporté. Veuillez utiliser un fichier KML ou KMZ.')
    }

    let kmlContent: string = ''

    try {
      if (isKMZ) {
        // Handle KMZ (zipped KML)
        const zip = new JSZip()
        const zipData = await zip.loadAsync(file)
        
        // Find KML file in the zip
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
        // Handle KML directly
        kmlContent = await file.text()
      }

      // Parse KML content
      const parser = new DOMParser()
      const kmlDoc = parser.parseFromString(kmlContent, 'text/xml')
      
      // Check for parsing errors
      const parserError = kmlDoc.querySelector('parsererror')
      if (parserError) {
        throw new Error('Erreur de parsing du fichier KML: ' + parserError.textContent)
      }

      // Convert to GeoJSON using @mapbox/togeojson
      const geoJSON = kml(kmlDoc) as KMLData

      if (!geoJSON.features || geoJSON.features.length === 0) {
        throw new Error('Aucune donnée géographique trouvée dans le fichier.')
      }

      // Parse features and convert to terrain format
      const parsedTerrains: ParsedKMLTerrain[] = []

      geoJSON.features.forEach((feature, index) => {
        if (feature.geometry && feature.geometry.type === 'Polygon') {
          const coordinates = feature.geometry.coordinates[0] // First ring of the polygon
          
          if (coordinates && coordinates.length >= 4) {
            const points: Point[] = coordinates
              .slice(0, -1) // Remove last point (same as first)
              .map(([lng, lat]: [number, number]) => ({ lat, lng }))

            const terrain: ParsedKMLTerrain = {
              name: feature.properties?.name || `Terrain ${index + 1}`,
              description: feature.properties?.description || `Terrain importé du fichier ${file.name}`,
              points,
              properties: feature.properties || {}
            }

            parsedTerrains.push(terrain)
          }
        } else if (feature.geometry && feature.geometry.type === 'Point') {
          // Handle point features as circular terrains
          const [lng, lat] = feature.geometry.coordinates
          const radius = 50 // Default radius for point features
          
          // Create a simple square around the point
          const points: Point[] = [
            { lat: lat + 0.0005, lng: lng - 0.0005 },
            { lat: lat + 0.0005, lng: lng + 0.0005 },
            { lat: lat - 0.0005, lng: lng + 0.0005 },
            { lat: lat - 0.0005, lng: lng - 0.0005 }
          ]

          const terrain: ParsedKMLTerrain = {
            name: feature.properties?.name || `Point ${index + 1}`,
            description: feature.properties?.description || `Point importé du fichier ${file.name}`,
            points,
            properties: { ...feature.properties, originalType: 'Point', centerLat: lat, centerLng: lng }
          }

          parsedTerrains.push(terrain)
        }
      })

      if (parsedTerrains.length === 0) {
        throw new Error('Aucun terrain utilisable trouvé dans le fichier. Seuls les polygones et points sont supportés.')
      }

      return parsedTerrains
    } catch (error) {
      console.error('Error parsing KML/KMZ file:', error)
      throw error
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessingFile(true)
    setError(null)

    try {
      const parsedTerrains = await parseKMLFile(file)
      setUploadedKMLData(parsedTerrains)
      setShowKMLData(true)
      addMessage('success', `${parsedTerrains.length} terrain(s) trouvé(s) dans le fichier ${file.name}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du traitement du fichier'
      addMessage('error', errorMessage)
      setError(errorMessage)
    } finally {
      setIsProcessingFile(false)
      // Reset file input
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
      radius: "100" // Default radius
    }))
    setShowCreatePopup(true)
    setShowKMLData(false)
    addMessage('info', `Terrain "${kmlTerrain.name}" chargé pour création`)
  }

  const clearKMLData = () => {
    setUploadedKMLData([])
    setShowKMLData(false)
  }

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
      const { terrains = [], projets = [], salaries = [], mssgs = [] } = data

      // Add project names to terrains and ensure proper salarie_ids array
      const terrainsWithProjects = terrains.map((terrain: any) => {
        const projet = projets.find((p: any) => p.id === terrain.projet_id)
        return { 
          ...terrain, 
          projet_name: projet?.nom || "Projet inconnu",
          surface: Number(terrain.surface) || 0,
          radius: Number(terrain.radius) || 0,
          salarie_ids: Array.isArray(terrain.salarie_ids) ? terrain.salarie_ids : []
        }
      })

      // Ensure salaries have proper arrays for terrain_ids and projet_ids
      const salariesWithIds = salaries.map((salarie: any) => ({
        ...salarie,
        terrain_ids: Array.isArray(salarie.terrain_ids) ? salarie.terrain_ids : [],
        projet_ids: Array.isArray(salarie.projet_ids) ? salarie.projet_ids : [],
        profils: Array.isArray(salarie.profils) ? salarie.profils : [],
        salarie_ids: Array.isArray(salarie.salarie_ids) ? salarie.salarie_ids : []
      }))

      // Process projects with rh_needs and salarie_ids
      const projectsWithNeeds = projets.map((projet: any) => ({
        ...projet,
        rh_needs: Array.isArray(projet.rh_needs) ? projet.rh_needs : [],
        salarie_ids: Array.isArray(projet.salarie_ids) ? projet.salarie_ids : []
      }))

      console.log('Data fetched successfully:', {
        terrains: terrainsWithProjects.length,
        projets: projectsWithNeeds.length,
        salaries: salariesWithIds.length,
        notifications: mssgs.length
      })

      setTerrains(terrainsWithProjects)
      setProjects(projectsWithNeeds)
      setSalaries(salariesWithIds)
      setNotifications(mssgs)
      
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err)
      setError("Erreur lors du chargement des données. Veuillez réessayer.")
      addMessage('error', 'Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }, [addMessage]) // Only addMessage as dependency

  useEffect(() => { fetchAllData() }, [fetchAllData])

  // Check if any popup is open
  const isAnyPopupOpen = showCreatePopup || showEditPopup || showSalariesPopup || showKMLData || showNotifications || showProjectSalariesPopup || showProjectsPopup

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
    setShowKMLData(false)
    setShowNotifications(false)
    setShowProjectSalariesPopup(false)
    setShowProjectsPopup(false)
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

  // Secure form handlers with input sanitization
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
    setError(null)
    setValidationErrors({})

    // Final sanitization before submission
    const sanitizedData = {
      name: sanitizeInput.sanitizeText(terrainFormData.name),
      description: sanitizeInput.sanitizeText(terrainFormData.description),
      radius: parseInt(sanitizeInput.sanitizeNumber(terrainFormData.radius)),
      projet_id: parseInt(terrainFormData.projet_id),
      salarie_ids: terrainFormData.salarie_ids,
    }

    const payload = {
      ...sanitizedData,
      points: currentPoints,
      surface: calculatePolygonArea(currentPoints),
    }

    console.log('Creating terrain with payload:', payload)

    router.post('/suivi-controle/terrain', payload, {
      onSuccess: (page) => {
        console.log('Terrain created successfully', page)
        fetchAllData()
        setShowCreatePopup(false)
        clearDrawingAfterSave()
        addMessage('success', 'Terrain créé avec succès')
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
            addMessage('error', 'Erreur de validation des données')
          } else {
            const errorMsg = extractErrorMessage(errors)
            setError(errorMsg)
            addMessage('error', errorMsg)
          }
        } else {
          const errorMsg = extractErrorMessage(errors)
          setError(errorMsg)
          addMessage('error', errorMsg)
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

    // Final sanitization before submission
    const sanitizedData = {
      name: sanitizeInput.sanitizeText(terrainFormData.name),
      description: sanitizeInput.sanitizeText(terrainFormData.description),
      radius: parseInt(sanitizeInput.sanitizeNumber(terrainFormData.radius)),
      salarie_ids: terrainFormData.salarie_ids,
    }

    const payload = {
      ...sanitizedData,
      points: currentPoints,
      surface: calculatePolygonArea(currentPoints),
    }

    console.log('Updating terrain with payload:', payload)

    router.put(`/suivi-controle/terrain/${selectedTerrain.id}`, payload, {
      onSuccess: (page) => {
        console.log('Terrain updated successfully', page)
        fetchAllData()
        setShowEditPopup(false)
        setSelectedTerrain(null)
        clearDrawingAfterSave()
        addMessage('success', 'Terrain modifié avec succès')
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
            addMessage('error', 'Erreur de validation des données')
          } else {
            const errorMsg = extractErrorMessage(errors)
            setError(errorMsg)
            addMessage('error', errorMsg)
          }
        } else {
          const errorMsg = extractErrorMessage(errors)
          setError(errorMsg)
          addMessage('error', errorMsg)
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
        addMessage('success', 'Terrain supprimé avec succès')
      },
      onError: (errors) => {
        console.error('Delete terrain error:', errors)
        const errorMsg = extractErrorMessage(errors)
        setError(errorMsg)
        addMessage('error', errorMsg)
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
                addMessage('success', 'Salarié retiré du terrain')
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
                addMessage('success', 'Salarié affecté au terrain')
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
              const errorMsg = "Erreur lors de l'affectation"
              setError(errorMsg);
              addMessage('error', errorMsg);
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

  const terrainsActifs = terrains.filter(t => t.statut_tech === "en_cours" || t.statut_tech === "en_revision")

  // Filter terrains based on selected project only (removed salarie filtering)
  let filteredTerrains = terrains
  
  if (selectedProjectFilter !== null) {
    filteredTerrains = filteredTerrains.filter(t => t.projet_id === selectedProjectFilter)
  }

  // FIXED: Function to get proper project and terrain information for salaries popup - SAME AS TERRAIN POPUP
  const getSalarieAvailabilityDisplay = (salarie: Salarie): JSX.Element => {
    const salarieProjects = projects.filter(p => (salarie.projet_ids || []).includes(p.id))
    const salarieTerrains = terrains.filter(t => (salarie.terrain_ids || []).includes(t.id))

    if (salarieProjects.length === 0 && salarieTerrains.length === 0) {
      return <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
    }

    return (
      <div className="space-y-1 text-sm">
        {salarieProjects.map(project => {
          // Find terrains for this project that the salarie is assigned to
          const projectTerrains = salarieTerrains.filter(t => t.projet_id === project.id)
          
          return (
            <div key={project.id} className="text-gray-600">
              <div className="font-medium text-blue-700">{project.nom}</div>
              {projectTerrains.length > 0 ? (
                <div className="ml-2 text-xs">
                  <span className="text-green-600">Terrains:</span> {projectTerrains.map(t => t.name).join(', ')}
                </div>
              ) : (
                <div className="ml-2 text-xs text-orange-600">Projet assigné - Aucun terrain</div>
              )}
            </div>
          )
        })}
        
        {/* Show terrains that don't belong to assigned projects */}
        {(() => {
          const orphanTerrains = salarieTerrains.filter(t => 
            !salarieProjects.some(p => p.id === t.projet_id)
          )
          
          if (orphanTerrains.length > 0) {
            return (
              <div className="text-gray-600">
                <div className="font-medium text-orange-600">Terrains sans projet assigné:</div>
                <div className="ml-2 text-xs">
                  {orphanTerrains.map(t => `${t.name} (${t.projet_name})`).join(', ')}
                </div>
              </div>
            )
          }
          return null
        })()}
      </div>
    )
  }

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
          {/* Header with Notifications */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Suivi & Contrôle</h1>
            
            {/* Notifications Button */}
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
                      className={`border border-gray-200 rounded-lg p-4 transition-colors ${
                        deactivatingNotifications[notification.id] ? 'opacity-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-semibold text-gray-800">
                          {notification.sender} :
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!deactivatingNotifications[notification.id]) {
                              deactivateNotification(notification.id);
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

                      <div className="text-sm text-gray-700 mb-4">{notification.message}</div>

                      <div className="flex justify-end text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        <span><strong>{formatTimeAgo(notification.recorded_at)}</strong></span>
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
                  <p className="text-sm font-medium text-gray-600">Profiles Disponibles</p>
                  <p className="text-2xl font-bold text-gray-900">{salaries.filter(s => s.emplacement === 'terrain').length}</p>
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

            <div 
              className="bg-white rounded-lg p-6 shadow-md border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setShowProjectsPopup(true)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projets</p>
                  <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Popup - UPDATED to show as TABLE */}
          {showProjectsPopup && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-7xl max-h-[80vh] overflow-y-auto m-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Liste des Projets ({projects.length})
                  </h3>
                  <button
                    onClick={() => setShowProjectsPopup(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom Projet</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Début</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Fin</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Besoins RH</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profils Affectés</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {projects.map((project) => (
                        <tr 
                          key={project.id} 
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleProjectRowClick(project)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              <TruncatedText text={project.nom} maxLength={30} />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 max-w-xs">
                              <TruncatedText text={project.description} maxLength={60} />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(project.statut)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(project.date_debut).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(project.date_fin).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {(project.rh_needs || []).reduce((sum, need) => sum + need.number, 0)} postes
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {(project.salarie_ids || []).length} affectés
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {projects.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-500">
                      <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun projet</h3>
                      <p className="mt-1 text-sm text-gray-500">Aucun projet trouvé dans le système.</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t mt-6">
                  <button
                    onClick={() => setShowProjectsPopup(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Map Section - Updated without profile filter */}
          <div className={`bg-white rounded-lg shadow-md border border-gray-100 p-6 transition-opacity duration-300 ${
            isAnyPopupOpen ? 'opacity-75' : 'opacity-100'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Carte</h2>
              <div className="flex gap-3">
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

            {/* React Leaflet Map - Centered on Morocco */}
            <div className={`w-full relative rounded-lg border-2 overflow-hidden ${
              isDrawingMode ? 'border-green-500' : 'border-gray-300'
            }`}>
              <MapContainer
                center={[31.7917, -7.0926]}
                zoom={6}
                style={{ height: '500px', width: '100%' }}
                ref={mapRef}
                key={`map-${selectedProjectFilter}-${filteredTerrains.length}`}
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
                  // Calculate center point for label
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
                              <div><strong>Profils:</strong> {(terrain.salarie_ids || []).length}</div>
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
                              <div><strong>Profils Assignés:</strong> {(terrain.salarie_ids || []).length}</div>
                              <div><strong>Statut:</strong> {getStatusBadge(terrain.statut_tech)}</div>
                            </div>
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={() => handleEditTerrain(terrain)}
                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => showSalariesModal(terrain)}
                                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                              >
                                Profils ({(terrain.salarie_ids || []).length})
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

          {/* FIXED: Project Salaries Popup - Updated with correct availability display and fixed RH calculation */}
          {showProjectSalariesPopup && selectedProject && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-7xl max-h-[90vh] overflow-y-auto m-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Affectation Profils - Projet: <TruncatedText text={selectedProject.nom} maxLength={30} />
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (Profils affectés: {affectedSalaries.length})
                    </span>
                  </h3>
                  <button
                    onClick={() => setShowProjectSalariesPopup(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Project Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner un projet</label>
                  <select
                    value={selectedProject.id}
                    onChange={(e) => {
                      const projectId = parseInt(e.target.value)
                      const project = projects.find(p => p.id === projectId)
                      if (project) {
                        openProjectSalariesPopup(project)
                      }
                    }}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.nom}
                      </option>
                    ))}
                  </select>
                </div>

              

                {/* Two Tables Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* ALL Salaries Table - FIXED with same display as terrain salaries */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">
                      Tous les Salariés ({affectedSalaries.length} affectés sur {salaries.length})
                    </h4>
                    <div className="border rounded-md max-h-96 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Disponibilité</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {salaries
                            .filter(s => s.emplacement === 'terrain')
                            .map((salarie, index) => {
                              const isAffected = affectedSalaries.includes(salarie.id)
                              const canAffect = canSalarieBeAffected(salarie)

                              return (
                                <tr key={salarie.id} className={isAffected ? "bg-green-50 border-l-4 border-green-400" : "hover:bg-gray-50"}>
                                  <td className="px-3 py-3 text-sm font-medium">{index + 1}</td>
                                  <td className="px-3 py-3">
                                    <div className="text-sm font-medium text-gray-900">
                                      <TruncatedText text={`${salarie.nom} ${salarie.prenom}`} maxLength={20} />
                                    </div>
                                    <div className="text-xs text-gray-500">{salarie.statut}</div>
                                    {salarie.profils?.[0] && (
                                      <div className="text-xs text-blue-600">
                                        {salarie.profils[0].poste}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-3 py-3">
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                      <Phone className="w-3 h-3" />
                                      {salarie.telephone}
                                    </div>
                                  </td>
                                  <td className="px-3 py-3 text-sm max-w-xs">
                                    {getSalarieAvailabilityDisplay(salarie)}
                                  </td>
                                  <td className="px-3 py-3">
                                    <button
                                      onClick={() => toggleSalarieInProject(salarie.id)}
                                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                                        isAffected
                                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                                          : canAffect
                                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                                          : "bg-gray-100 text-gray-400"
                                      }`}
                                    >
                                      {isAffected ? (
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
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* FIXED: RH Needs Table - Shows only original needs, removed restant column */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">
                      Besoins RH ({getTotalRemainingPositions()} postes restants)
                    </h4>
                    <div className="border rounded-md max-h-96 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Profil</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Poste</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {(originalProjectData?.rh_needs || []).map((originalNeed, index) => {
                            const currentNeed = projectRhNeedsState.find(
                              need => need.profilename === originalNeed.profilename && 
                                      need.profileposte === originalNeed.profileposte
                            ) || { ...originalNeed, number: 0 }
                            
                            const isCompleted = currentNeed.number === 0

                            return (
                              <tr key={index} className={isCompleted ? "bg-green-50" : "hover:bg-gray-50"}>
                                <td className="px-4 py-2 text-xs">
                                  <TruncatedText text={getProfileLabel(originalNeed.profilename)} maxLength={25} />
                                </td>
                                <td className="px-4 py-2 text-xs">
                                  <TruncatedText text={originalNeed.profileposte} maxLength={30} />
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {originalNeed.number}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                  <button
                    onClick={() => setShowProjectSalariesPopup(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={isSubmittingProjectSalaries}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={submitProjectSalaries}
                    disabled={isSubmittingProjectSalaries}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmittingProjectSalaries ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Enregistrement...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Save className="w-4 h-4" />
                        <span>Enregistrer ({affectedSalaries.length})</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* KML Data Display Popup */}
          {showKMLData && uploadedKMLData.length > 0 && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto m-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Données KMZ/KML importées ({uploadedKMLData.length} terrain{uploadedKMLData.length > 1 ? 's' : ''})
                  </h3>
                  <button
                    onClick={clearKMLData}
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
                          {kmlTerrain.properties && Object.keys(kmlTerrain.properties).length > 0 && (
                            <div className="mt-2">
                              <strong className="text-sm">Propriétés:</strong>
                              <div className="text-xs text-gray-600 mt-1">
                                {Object.entries(kmlTerrain.properties)
                                  .filter(([key]) => !['name', 'description'].includes(key))
                                  .map(([key, value]) => (
                                    <div key={key}>{key}: {String(value)}</div>
                                  ))
                                }
                              </div>
                            </div>
                          )}
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
                    onClick={clearKMLData}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Terrains Table - Updated with text truncation and removed profile filter display */}
          <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Liste des Terrains
                {selectedProjectFilter && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    - Filtré par projet: {projects.find(p => p.id === selectedProjectFilter)?.nom}
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
                    {selectedProjectFilter
                      ? "Aucun terrain trouvé avec les filtres sélectionnés."
                      : "Commencez par créer votre premier terrain sur la carte."
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Create/Edit Terrain Popup - Updated with secure inputs */}
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
                        className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                          getFieldError('name') ? 'border-red-300' : ''
                        }`}
                        placeholder="Nom du terrain (texte seulement)"
                        required
                        disabled={isSubmitting}
                        maxLength={100}
                      />
                      {getFieldError('name') && (
                        <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">Caractères restants: {100 - terrainFormData.name.length}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rayon (mètres) *</label>
                      <input
                        type="number"
                        value={terrainFormData.radius}
                        onChange={(e) => handleFormInputChange('radius', e.target.value)}
                        className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                          getFieldError('radius') ? 'border-red-300' : ''
                        }`}
                        placeholder="Rayon en mètres (chiffres seulement)"
                        required
                        disabled={isSubmitting}
                        min="1"
                        max="10000"
                      />
                      {getFieldError('radius') && (
                        <p className="mt-1 text-sm text-red-600">{getFieldError('radius')}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={terrainFormData.description}
                        onChange={(e) => handleFormInputChange('description', e.target.value)}
                        rows={3}
                        className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                          getFieldError('description') ? 'border-red-300' : ''
                        }`}
                        placeholder="Description du terrain (texte seulement)"
                        disabled={isSubmitting}
                        maxLength={500}
                      />
                      {getFieldError('description') && (
                        <p className="mt-1 text-sm text-red-600">{getFieldError('description')}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">Caractères restants: {500 - terrainFormData.description.length}</p>
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
                    <label className="block text-sm font-medium text-gray-700 mb-3">Profils assignés</label>
                    <div className="border rounded-md max-h-60 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Salarié</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email & Téléphone</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Disponibilité</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {salaries
                          .filter(s => s.emplacement === 'terrain')
                          .map(salarie => (
                            <tr key={salarie.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm">
                                <TruncatedText text={`${salarie.nom} ${salarie.prenom}`} maxLength={20} />
                              </td>
                              <td className="px-4 py-2">
                                <div className="text-xs text-gray-400">
                                  <TruncatedText text={salarie.email} maxLength={25} />
                                </div>
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

          {/* Enhanced Salaries Assignment Popup - UPDATED with specific format */}
          {showSalariesPopup && selectedTerrain && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-7xl max-h-[80vh] overflow-y-auto m-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Profils - Terrain #{selectedTerrain.id} - <TruncatedText text={selectedTerrain.name} maxLength={30} />
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
                      {/* ALL salaries including assigned and unassigned */}
                      {salaries
                        .filter(salarie => salarie.emplacement === 'terrain')
                        .map((salarie, index) => {
                          const assignKey = `${salarie.id}-${selectedTerrain.id}`;
                          const isAssigning = assigningStates[assignKey];
                          const isAssigned = (selectedTerrain.salarie_ids || []).includes(salarie.id);

                          return (
                            <tr key={salarie.id} className={isAssigned ? "bg-green-50 hover:bg-green-100" : "hover:bg-gray-50"}>
                              <td className="px-4 py-3 text-sm font-medium">{index + 1}</td>
                              <td className="px-4 py-3">
                                <div className="text-sm font-medium text-gray-900">
                                  <TruncatedText text={`${salarie.nom} ${salarie.prenom}`} maxLength={25} />
                                </div>
                                <div className="text-sm text-gray-500">{salarie.statut}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Phone className="w-3 h-3" />
                                  {salarie.telephone}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                                {getSalarieAvailabilityDisplay(salarie)}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => toggleSalarieAssignment(salarie.id, selectedTerrain.id)}
                                  disabled={isAssigning}
                                  className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded transition-colors disabled:opacity-50 ${
                                    isAssigned
                                      ? "bg-red-600 text-white hover:bg-red-700"
                                      : "bg-green-600 text-white hover:bg-green-700"
                                  }`}
                                >
                                  {isAssigning ? (
                                    <>
                                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                      Traitement...
                                    </>
                                  ) : isAssigned ? (
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