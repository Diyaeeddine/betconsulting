import AppLayout from "@/layouts/app-layout"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation, Truck, Phone, Package, Clock, MessageCircle, Send, User, Fuel, LucideMapPin as MapPinCheckInside, AlertCircle, Car } from "lucide-react"
import { router } from '@inertiajs/react'

const GOOGLE_MAPS_API_KEY = "AIzaSyBqaAsQ8r3L9quGIANXqYGlXm3RiJbHjYU"

const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  * {
    font-family: 'Inter', sans-serif !important;
  }
  
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .custom-scroll {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .custom-scroll::-webkit-scrollbar {
    display: none;
  }
  
  .slide-in-animation {
    animation: slideInFromBottom 0.5s ease-out;
  }
  
  .fade-in-animation {
    animation: fadeIn 0.3s ease-out;
  }
  
  @keyframes slideInFromBottom {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`

const descriptions = {
  "en-route": "Équipe en déplacement vers le site.",
  execution: "Travaux en cours d'exécution.",
  "pause-technique": "Pause technique pour vérifications.",
  preparation: "Préparation des ressources en cours.",
  completed: "Projet terminé avec succès.",
  "prévu": "Projet planifié et en attente",
  "en_cours": "Projet en cours d'exécution",
  "terminé": "Projet terminé avec succès",
  "termine": "Projet terminé avec succès",
  "en_attente": "Projet en attente de validation"
}

// Fallback static data for when API fails
const fallbackData = {
  plans: [],
  terrains: [],
  projets: [],
  salaries: [],
  mssgs: [],
  users: []
}

export default function TrackingPage() {
  const [apiData, setApiData] = useState<any>(fallbackData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProjet, setSelectedProjet] = useState<string>("all")
  const [selectedSalarie, setSelectedSalarie] = useState<string>("all")
  const [selectedPoint, setSelectedPoint] = useState<any>(null)
  const [trackingPoints, setTrackingPoints] = useState<any[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [responses, setResponses] = useState<any[]>([])
  const [sendingMessage, setSendingMessage] = useState(false)
  
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any | null>(null)
  const markersRef = useRef<any[]>([])

  // Fonction pour calculer le temps écoulé depuis la création d'un message
  const getTimeAgo = (createdAt: string) => {
    const now = new Date()
    const messageTime = new Date(createdAt)
    const diffInMs = now.getTime() - messageTime.getTime()
    
    const seconds = Math.floor(diffInMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `Il y a ${hours}h ${minutes % 60}min`
    } else if (minutes > 0) {
      return `Il y a ${minutes} min`
    } else {
      return `Il y a ${seconds} sec`
    }
  }

  // Fonction pour calculer le temps restant pour les véhicules
  const calculateTempsRestant = (dateDisponibilite: string | null) => {
    if (!dateDisponibilite) {
      return "Disponible"
    }
    
    const now = new Date()
    const availableDate = new Date(dateDisponibilite)
    const diffInMs = availableDate.getTime() - now.getTime()
    
    if (diffInMs <= 0) {
      return "Disponible"
    }
    
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) {
      return `${days}j ${hours}h ${minutes}min`
    } else if (hours > 0) {
      return `${hours}h ${minutes}min`
    } else {
      return `${minutes}min`
    }
  }

  // Fonction pour obtenir le véhicule d'un salarié
  const getVehicleForSalarie = (salarieId: number, data: any) => {
    // Chercher dans tous les véhicules
    for (const projet of data.projets || []) {
      const vehicle = projet.vehicules?.find((v: any) => v.salarie_id === salarieId)
      if (vehicle) {
        return vehicle
      }
    }
    return null
  }

  // Fonction pour transformer les données API en format compatible
  const transformApiDataToTrackingPoints = (data: any, projetFilter?: string, salarieFilter?: string) => {
    let projetsToShow = data.projets || []
    let plansToShow = data.plans || []
    let terrainsToShow = data.terrains || []
    
    // Filtrer par salarié si sélectionné
    if (salarieFilter && salarieFilter !== "all") {
      const salarieId = parseInt(salarieFilter)
      // Afficher tous les projets et terrains où ce salarié est impliqué
      projetsToShow = projetsToShow.filter((projet: any) => 
        projet.salarie_ids?.includes(salarieId)
      )
      terrainsToShow = terrainsToShow.filter((terrain: any) => 
        terrain.salarie_ids?.includes(salarieId)
      )
      plansToShow = plansToShow.filter((plan: any) => 
        plan.salarie_ids?.includes(salarieId)
      )
    }
    
    // Filtrer par projet si sélectionné
    if (projetFilter && projetFilter !== "all") {
      const projetId = parseInt(projetFilter)
      projetsToShow = projetsToShow.filter((projet: any) => projet.id === projetId)
    }

    const colors = ['#3b82f6', '#22c55e', '#eab308', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']
    
    return projetsToShow.map((projet: any, index: number) => {
      const projectColor = colors[index % colors.length]
      
      // Trouver le responsable
      const responsable = data.users?.find((user: any) => user.id === projet.responsable_id)
      
      // Calculer la position moyenne des terrains pour le projet
      let centerPosition = { lat: 33.9716, lng: -6.8498 } // Position par défaut (Rabat)
      if (projet.terrains && projet.terrains.length > 0) {
        const validTerrains = projet.terrains.filter((terrain: any) => 
          terrain.points && terrain.points.length > 0
        )
        
        if (validTerrains.length > 0) {
          let totalLat = 0, totalLng = 0, pointCount = 0
          
          validTerrains.forEach((terrain: any) => {
            terrain.points.forEach((point: any) => {
              if (point.lat && point.lng) {
                totalLat += point.lat
                totalLng += point.lng
                pointCount++
              }
            })
          })
          
          if (pointCount > 0) {
            centerPosition = {
              lat: totalLat / pointCount,
              lng: totalLng / pointCount
            }
          }
        }
      }

      // Transformer les plans en timeline
      let timeline = []
      if (salarieFilter && salarieFilter !== "all") {
        const salarieId = parseInt(salarieFilter)
        const salarie = data.salaries?.find((s: any) => s.id === salarieId)
        const salarieNom = salarie ? `${salarie.prenom} ${salarie.nom}` : "Salarié"
        
        // Plans de ce salarié
        const salariePlans = plansToShow.filter((plan: any) => 
          plan.salarie_ids?.includes(salarieId)
        )
        
        timeline = salariePlans.map((plan: any) => {
          const projetName = data.projets?.find((p: any) => p.id === plan.projet_id)?.nom || ''
          return {
            status: plan.statut || "prévu",
            time: new Date(plan.date_debut).toLocaleDateString('fr-FR') + " - " + new Date(plan.date_fin).toLocaleDateString('fr-FR') + ` (Créé le ${new Date(plan.created_at).toLocaleDateString('fr-FR')} à ${new Date(plan.created_at).toLocaleTimeString('fr-FR')})`,
            description: `${plan.description || plan.mssg || "Plan de projet"} - ${projetName}`,
            completed: plan.statut === "terminé",
            current: plan.statut === "en_cours",
            delay: plan.statut === "en_retard" ? "En retard" : undefined,
            pourcentage: plan.statut === "terminé" ? 100 : (plan.statut === "en_cours" ? 70 : 0),
            valide_par: "suivi-controle"
          }
        })
      } else {
        // Plans normaux du projet
        timeline = (projet.plans || []).map((plan: any) => ({
          status: plan.statut || "prévu",
          time: new Date(plan.date_debut).toLocaleDateString('fr-FR') + " - " + new Date(plan.date_fin).toLocaleDateString('fr-FR') + ` (Créé le ${new Date(plan.created_at).toLocaleDateString('fr-FR')} à ${new Date(plan.created_at).toLocaleTimeString('fr-FR')})`,
          description: plan.description || plan.mssg || "Plan de projet",
          completed: plan.statut === "terminé",
          current: plan.statut === "en_cours",
          delay: plan.statut === "en_retard" ? "En retard" : undefined,
          pourcentage: plan.statut === "terminé" ? 100 : (plan.statut === "en_cours" ? 70 : 0),
          valide_par: "suivi-controle"
        }))
      }

      // Si pas de plans, créer un timeline basique
      if (timeline.length === 0) {
        timeline.push({
          status: projet.statut || "prévu",
          time: new Date(projet.date_debut).toLocaleDateString('fr-FR'),
          description: projet.description || "Projet en cours de planification",
          completed: projet.statut === "terminé",
          current: projet.statut === "en_cours",
          delay: undefined,
          pourcentage: projet.statut === "terminé" ? 100 : 70,
          valide_par: "suivi-controle"
        })
      }

      return {
        id: projet.id,
        title: projet.nom,
        address: projet.lieu_realisation || "Adresse non spécifiée",
        position: centerPosition,
        status: projet.statut === "en_cours" ? "execution" : (projet.statut === "terminé" ? "completed" : "preparation"),
        distance: "N/A",
        estimatedTime: `${Math.ceil((new Date(projet.date_fin).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} jours`,
        projectManager: {
          name: responsable ? responsable.name : "Non assigné",
          phone: responsable?.phone || "N/A"
        },
        currentVehicle: {
          type: "truck",
          name: projet.vehicules?.[0]?.modele || "Véhicule de projet",
          loadPercentage: Math.floor(Math.random() * 100), // Simulation pour la démo
          capacity: "2000 Kg",
          currentLoad: "1420 Kg"
        },
        vehicles: projet.vehicules || [],
        employees: projet.salaries || [],
        fuel: {
          current: Math.floor(Math.random() * 100), // Simulation
          estimatedTime: "2h 15min"
        },
        timeline,
        terrains: projet.terrains || [],
        color: projectColor,
        statut: projet.statut,
        salarieFilter: salarieFilter !== "all" ? parseInt(salarieFilter) : null
      }
    })
  }

  // Fonction pour récupérer les données depuis l'API
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/suivi-controle/fetch-all-data')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setApiData(data)
      
      // Transformer et définir les points de tracking
      const points = transformApiDataToTrackingPoints(data, selectedProjet, selectedSalarie)
      setTrackingPoints(points)
      
      // Définir le point sélectionné par défaut (dernier projet)
      if (points.length > 0 && !selectedPoint) {
        const latestProject = points.reduce((latest, current) => 
          current.id > latest.id ? current : latest
        )
        setSelectedPoint(latestProject)
      }
      
      // Séparer les messages et les réponses
      const allMssgs = data.mssgs || []
      const msgsList = allMssgs.filter((msg: any) => msg.receiver === 'all').slice(-4)
      const responsesList = allMssgs.filter((msg: any) => msg.sender === 'all').slice(-4)
      
      setMessages(msgsList)
      setResponses(responsesList)
      
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err)
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
      // En cas d'erreur, utiliser des données par défaut
      setApiData(fallbackData)
      setTrackingPoints([])
    } finally {
      setLoading(false)
    }
  }

  // Effet pour charger les données au montage du composant
  useEffect(() => {
    fetchData()
  }, [])

  // Effet pour mettre à jour les tracking points quand les filtres changent
  useEffect(() => {
    if (apiData && !loading) {
      const points = transformApiDataToTrackingPoints(apiData, selectedProjet, selectedSalarie)
      setTrackingPoints(points)
      
      // Mettre à jour le point sélectionné si nécessaire
      if (selectedProjet !== "all") {
        const projet = points.find(p => p.id === parseInt(selectedProjet))
        if (projet) {
          setSelectedPoint(projet)
        }
      } else if (points.length > 0 && !selectedPoint) {
        setSelectedPoint(points[0])
      }
    }
  }, [selectedProjet, selectedSalarie, apiData])

  // Fonction pour envoyer un message avec Inertia
  const sendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return
    
    try {
      setSendingMessage(true)
      
      router.post('/suivi-controle/chat', {
        message: newMessage,
        projet_id: selectedPoint?.id || null,
        receiver: 'all'
      }, {
        onSuccess: () => {
          // Ajouter le message à la liste locale
          const sentMessage = {
            id: Date.now(),
            message: newMessage,
            sender: "suivi-controle",
            receiver: "all",
            created_at: new Date().toISOString(),
            statut: "actif"
          }
          
          setMessages(prev => [...prev.slice(-3), sentMessage])
          setNewMessage("")
        },
        onError: (errors) => {
          console.error('Erreur envoi message:', errors)
        },
        onFinish: () => {
          setSendingMessage(false)
        }
      })
      
    } catch (err) {
      console.error('Erreur envoi message:', err)
      setSendingMessage(false)
    }
  }

  // Animation effect
  useEffect(() => {
    if (selectedPoint) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 500)
      return () => clearTimeout(timer)
    }
  }, [selectedPoint])

  // Google Maps initialization
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap()
        return
      }

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`
      script.async = true
      script.defer = true
      script.onload = initializeMap
      document.head.appendChild(script)
    }

    const initializeMap = () => {
      if (!mapRef.current || trackingPoints.length === 0) return

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 33.890, lng: -6.8416 },
        zoom: 11,
        mapTypeControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#e3f2fd" }],
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }],
          },
        ],
      })

      googleMapRef.current = map
      markersRef.current.forEach((marker) => marker.setMap(null))
      markersRef.current = []

      trackingPoints.forEach((point) => {
        if (!point.position || typeof point.position.lat !== "number" || typeof point.position.lng !== "number") {
          return
        }

        const marker = new window.google.maps.Marker({
          position: new window.google.maps.LatLng(point.position.lat, point.position.lng),
          map: map,
          title: point.title,
          label: {
            text: point.id.toString(),
            color: "white",
            fontWeight: "bold",
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 15,
            fillColor: point.color || getMarkerColor(point.status),
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
          },
          animation: window.google.maps.Animation.DROP,
        })

        marker.addListener("click", () => {
          setSelectedPoint(point)
        })

        markersRef.current.push(marker)

        // Ajouter les terrains du projet
        if (point.terrains) {
          point.terrains.forEach((terrain: any) => {
            if (terrain.points && terrain.points.length > 0) {
              const terrainPath = new window.google.maps.Polygon({
                paths: terrain.points.map((p: any) => ({ lat: p.lat, lng: p.lng })),
                strokeColor: point.color || "#3b82f6",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: point.color || "#3b82f6",
                fillOpacity: 0.2,
              })
              terrainPath.setMap(map)
            }
          })
        }
      })

      setMapLoaded(true)
    }

    if (trackingPoints.length > 0) {
      loadGoogleMaps()
    }
  }, [trackingPoints])

  const getMarkerColor = (status: string) => {
    const colors = {
      completed: "#22c55e",
      execution: "#eab308",
      "en-route": "#3b82f6",
      preparation: "#9ca3af",
      "pause-technique": "#f59e0b",
      "terminé": "#22c55e",
      "en_cours": "#eab308",
      "prévu": "#9ca3af",
      "en_attente": "#f59e0b"
    }
    return colors[status as keyof typeof colors] || "#9ca3af"
  }

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      completed: "border-green-500",
      execution: "border-blue-500",
      "en-route": "border-yellow-500",
      preparation: "border-gray-300",
      "pause-technique": "border-red-500",
      "terminé": "border-green-500",
      "en_cours": "border-blue-500",
      "prévu": "border-gray-300",
      "en_attente": "border-red-500"
    }
    return colors[status as keyof typeof colors] || "border-gray-300"
  }

  const getStatusDescription = (status: string): string => {
    return descriptions[status as keyof typeof descriptions] || "Statut inconnu"
  }

  const getTimelinePointColor = (event: any) => {
    if (event.pourcentage === 100) {
      return "bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-200"
    } else if (event.pourcentage > 0 && event.pourcentage < 100) {
      return "bg-gradient-to-br from-yellow-400 to-amber-500 animate-pulse shadow-lg shadow-yellow-200"
    } else {
      return "bg-gray-200 border-gray-300"
    }
  }

  const VehicleVisualization = ({ vehicle }: { vehicle: any }) => {
    const getVehicleIcon = (type: string) => {
      switch (type) {
        case "truck":
          return (
            <div className="relative">
              <div className="absolute top-2 left-8 w-16 h-8 bg-gray-300 rounded-sm overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-1000 ease-out flex items-center justify-center text-white text-xs font-bold"
                  style={{ width: `${vehicle.loadPercentage}%` }}
                >
                  {vehicle.loadPercentage > 20 && `${vehicle.loadPercentage}%`}
                </div>
              </div>
            </div>
          )
        case "car":
          return (
            <div className="relative">
              <div className="w-24 h-12 bg-blue-500 rounded-lg relative overflow-hidden">
                <div className="absolute top-1 left-1 right-1 bottom-1 bg-blue-600 rounded-md"></div>
                <div className="absolute top-2 left-2 w-4 h-2 bg-blue-300 rounded-sm"></div>
                <div className="absolute top-2 right-2 w-4 h-2 bg-blue-300 rounded-sm"></div>
                <div className="absolute bottom-0 left-2 w-3 h-3 bg-gray-800 rounded-full"></div>
                <div className="absolute bottom-0 right-2 w-3 h-3 bg-gray-800 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="bg-green-500 text-white text-xs font-bold px-1 rounded transition-all duration-1000"
                    style={{ opacity: vehicle.loadPercentage > 0 ? 1 : 0.3 }}
                  >
                    {vehicle.loadPercentage}%
                  </div>
                </div>
              </div>
            </div>
          )
        default:
          return <Truck className="w-16 h-16 text-gray-500" />
      }
    }

    return (
      <div className="text-center space-y-3">
        <div className="flex justify-center">{getVehicleIcon(vehicle.type)}</div>
        <div>
          <p className="font-semibold text-gray-900">{vehicle.name}</p>
          <p className="text-sm text-gray-600">{vehicle.capacity}</p>
          <p className="text-xs text-gray-500">{vehicle.currentLoad}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-blue-800">Chargement des données...</p>
            <p className="text-sm text-blue-600 mt-1">Récupération des informations de suivi</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
          <div className="text-center p-8 bg-white rounded-xl shadow-lg">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-red-800 mb-2">Erreur de chargement</p>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <Button onClick={fetchData} className="bg-red-600 hover:bg-red-700 text-white">
              Réessayer
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
    
      <div className="relative w-full h-screen overflow-hidden">
        {/* Filters - Top center overlay */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30">
          <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0">
            <CardContent className="p-4">
              <div className="flex gap-4 items-center">
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-gray-500 mb-1">Projet</label>
                  <Select value={selectedProjet} onValueChange={setSelectedProjet}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Tous les projets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les projets</SelectItem>
                      {(apiData.projets || []).map((projet: any) => (
                        <SelectItem key={projet.id} value={projet.id.toString()}>
                          {projet.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-gray-500 mb-1">Profile</label>
                  <Select value={selectedSalarie} onValueChange={setSelectedSalarie}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Tous les salariés" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les Profiles</SelectItem>
                      {(apiData.salaries || []).map((salarie: any) => (
                        <SelectItem key={salarie.id} value={salarie.id.toString()}>
                          {salarie.prenom} {salarie.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distance indicator - Top left overlay */}
        {selectedPoint && (
          <div className={`absolute top-6 left-6 z-30 ${isAnimating ? "fade-in-animation" : ""}`}>
            <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 hover:shadow-3xl transition-all duration-300">
              <CardContent className="p-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Temps estimé d'achèvement</p>
                  <p className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                     {selectedPoint.estimatedTime}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Full-screen map container */}
        <div className="absolute inset-0">
          <div ref={mapRef} className="w-full h-full" />
          {!mapLoaded && trackingPoints.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
              <div className="text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                  <div className="absolute inset-0 rounded-full bg-blue-100 opacity-20 animate-pulse"></div>
                </div>
                <p className="text-lg font-medium text-blue-800">Chargement de la carte...</p>
                <p className="text-sm text-blue-600 mt-1">Connexion aux services Google Maps</p>
              </div>
            </div>
          )}
          {trackingPoints.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-600">Aucun projet trouvé</p>
                <p className="text-sm text-gray-500 mt-1">Modifiez les filtres pour voir d'autres projets</p>
              </div>
            </div>
          )}
        </div>

        {selectedPoint && (
          <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 z-20 ${isAnimating ? "slide-in-animation" : ""}`}>
            <div className="flex gap-4 w-[80vw] h-[50vh] hide-scrollbar bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 overflow-y-auto custom-scroll" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              
              {/* First column - Project Timeline */}
              <div className="flex-1 space-y-4">
                <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 hover:bg-white transition-all duration-300 hover:shadow-3xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      {selectedPoint.salarieFilter ? 
                        `Plans de ${apiData.salaries?.find((s: any) => s.id === selectedPoint.salarieFilter)?.prenom} ${apiData.salaries?.find((s: any) => s.id === selectedPoint.salarieFilter)?.nom}` : 
                        "Étapes du Projet"
                      }
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedPoint.timeline.map((event: any, index: number) => (
                      <div key={index} className="flex items-start gap-4 group hover:bg-gray-50/50 rounded-lg p-3 transition-all duration-200">
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full border-2 transition-all duration-1500 group-hover:scale-125 ${getTimelinePointColor(event)}`} />
                          {index < selectedPoint.timeline.length - 1 && (
                            <div className={`w-0.5 h-10 mt-2 transition-all duration-300 ${event.pourcentage === 100 ? "bg-green-300" : "bg-gray-200"}`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-base mb-2">{event.description}</p>
                          <p className="text-sm font-medium text-gray-700 mb-1">Date: {event.time}</p>
                          <p className="text-sm font-medium text-blue-600 mb-2">Validé par: {event.valide_par}</p>
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold text-gray-900 text-sm">{event.status}</p>
                            {event.delay && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1">
                                {event.delay}
                              </Badge>
                            )}
                          </div>
                          {event.pourcentage !== undefined && (
                            <p className="text-xs text-gray-500 mt-1 font-medium">
                              Progression: 70%
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Afficher le véhicule du salarié si filtré par salarié */}
                    {selectedPoint.salarieFilter && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-900 mb-3">Véhicule assigné</p>
                        {(() => {
                          const vehicle = getVehicleForSalarie(selectedPoint.salarieFilter, apiData)
                          return vehicle ? (
                            <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                              <p className="font-medium text-gray-900">{vehicle.marque} {vehicle.modele}</p>
                              <p className="text-sm text-gray-600">Matricule: {vehicle.matricule}</p>
                              <p className="text-sm text-gray-600">État: {vehicle.etat}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No vehicule for this profile</p>
                          )
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Second column - Vehicles */}
              <div className="flex-1 space-y-4">
                <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 hover:bg-white transition-all duration-300 hover:shadow-3xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                        <Truck className="w-5 h-5 text-white" />
                      </div>
                      Véhicules du Projet
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedPoint.vehicles && selectedPoint.vehicles.length > 0 ? (
                      <div className="space-y-4">
                        {selectedPoint.vehicles.map((vehicle: any, index: number) => (
                          <div 
                            key={index} 
                            className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 cursor-pointer hover:shadow-md transition-all duration-200"
                            onClick={() => setSelectedVehicle(vehicle)}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-semibold text-gray-900">{vehicle.marque} - {vehicle.modele}</p>
                                <p className="text-sm text-gray-600">Matricule: {vehicle.matricule}</p>
                              </div>
                              <Badge variant={vehicle.etat === 'disponible' ? 'default' : 'secondary'}>
                                {vehicle.etat}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm items-center">
                                <span className="text-gray-600 flex items-center gap-1">
                                  <Fuel className="w-4 h-4" />
                                  Carburant
                                </span>
                                <span className="font-medium">{Math.floor(Math.random() * 100)}%</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Temps restant</span>
                                <span className="font-medium">{calculateTempsRestant(vehicle.date_disponibilite)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Aucun véhicule assigné à ce projet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

               
              </div>

              {/* Third column - Project Details + Chat */}
              <div className="flex-1 space-y-4">
                <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 hover:bg-white transition-all duration-300 hover:shadow-3xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                        <Navigation className="w-5 h-5 text-white" />
                      </div>
                      Détails du Projet
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 hide-scrollbar custom-scroll max-h-80" style={{ overflowY: "auto" }}>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-none rounded-full flex items-center justify-center text-blue-700">
                          <MapPinCheckInside className="w-8 h-10" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-l">{selectedPoint.title}</p>
                          <p className="text-sm text-gray-600 font-medium">{selectedPoint.address}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Durée estimée</span>
                          <span className="font-bold text-grey-600">{selectedPoint.estimatedTime}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Statut</span>
                          <Badge variant="outline" className={`font-medium ${getStatusBadgeColor(selectedPoint.statut)}`}>
                            {getStatusDescription(selectedPoint.statut)}
                          </Badge>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Chef de Projet</p>
                          <p className="font-bold text-gray-900">{selectedPoint.projectManager.name}</p>
                          <Button size="sm" className="mt-3 bg-gradient-to-br from-green-500 to-emerald-600 hover:bg-purple-600 text-white rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300">
                            <Phone className="w-4 h-4 mr-2" />
                            Appeler
                          </Button>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-900 mb-3">
                          Salariés affectés au projet ({selectedPoint.employees?.length || 0})
                        </p>
                        <div className="space-y-2 max-h-32 hide-scrollbar custom-scroll" style={{ overflowY: "auto" }}>
                          {selectedPoint.employees?.map((employee: any, index: number) => (
                            <div
                              key={index}
                              className="flex justify-between items-center text-xs p-2 rounded-4 hover:bg-indigo-50 cursor-pointer transition-all duration-200 hover:scale-105"
                              onClick={() => setSelectedEmployee(employee)}
                            >
                              <span className="font-medium text-gray-900">
                                {employee.prenom} {employee.nom}
                              </span>
                              <span className="text-gray-600">
                                {employee.profils?.[0]?.poste_profil || employee.role || "N/A"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 hover:bg-white transition-all duration-300 hover:shadow-3xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </div>
                      Communication Projet
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="max-h-32 space-y-2 hide-scrollbar custom-scroll" style={{ overflowY: "auto" }}>
                      {/* Messages (receiver = all) */}
                      {messages.map((msg, index) => (
                        <div key={msg.id || index} className="flex items-start gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2 flex-1">
                            <p className="text-xs text-gray-800">{msg.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{getTimeAgo(msg.created_at)}</p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Responses (sender = all) */}
                      {responses.map((response, index) => (
                        <div key={`response-${response.id || index}`} className="flex items-start gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-3 h-3 text-white" />
                          </div>
                          <div className="bg-purple-50 rounded-lg p-2 flex-1">
                            <p className="text-xs text-gray-800">{response.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{getTimeAgo(response.created_at)}</p>
                          </div>
                        </div>
                      ))}
                      
                      {messages.length === 0 && responses.length === 0 && (
                        <p className="text-xs text-gray-500 text-center py-4">Aucun message récent</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Tapez votre message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1 text-sm border-gray-200 focus:border-purple-500"
                        disabled={sendingMessage}
                      />
                      <Button 
                        size="sm" 
                        onClick={sendMessage}
                        disabled={sendingMessage || !newMessage.trim()}
                        className="bg-gradient-to-br from-green-500 to-emerald-600 hover:bg-purple-600 text-white"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Employee Modal */}
        {selectedEmployee && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="bg-white shadow-2xl border-0 max-w-md w-full slide-in-animation">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {selectedEmployee.prenom?.[0]}{selectedEmployee.nom?.[0]}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedEmployee.prenom} {selectedEmployee.nom}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedEmployee.profils?.[0]?.poste_profil || selectedEmployee.role || "N/A"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEmployee(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Nom complet</span>
                    <span className="text-gray-900">{selectedEmployee.prenom} {selectedEmployee.nom}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Email</span>
                    <span className="text-gray-900 text-sm">{selectedEmployee.email || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Téléphone</span>
                    <span className="text-gray-900">{selectedEmployee.telephone || "N/A"}</span>
                  </div>
                  {selectedEmployee.salaire_mensuel && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Salaire mensuel</span>
                      <span className="text-gray-900">{selectedEmployee.salaire_mensuel} MAD</span>
                    </div>
                  )}
                  {selectedEmployee.date_embauche && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Date d'embauche</span>
                      <span className="text-gray-900">{new Date(selectedEmployee.date_embauche).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                  {selectedEmployee.statut && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Statut</span>
                      <Badge variant={selectedEmployee.statut === 'actif' ? 'default' : 'secondary'}>
                        {selectedEmployee.statut}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 bg-gradient-to-br from-green-500 to-emerald-600 hover:bg-green-600 text-white">
                    <Phone className="w-4 h-4 mr-2" />
                    Appeler
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vehicle Modal */}
        {selectedVehicle && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="bg-white shadow-2xl border-0 max-w-md w-full slide-in-animation">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedVehicle.marque} {selectedVehicle.modele}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedVehicle.type}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedVehicle(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Matricule</span>
                    <span className="text-gray-900">{selectedVehicle.matricule}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">État</span>
                    <Badge variant={selectedVehicle.etat === 'disponible' ? 'default' : 'secondary'}>
                      {selectedVehicle.etat}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Statut</span>
                    <span className="text-gray-900">{selectedVehicle.statut}</span>
                  </div>
                  {selectedVehicle.date_achat && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Date d'achat</span>
                      <span className="text-gray-900">{new Date(selectedVehicle.date_achat).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                  {selectedVehicle.montant_achat && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Montant d'achat</span>
                      <span className="text-gray-900">{selectedVehicle.montant_achat} MAD</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Temps restant</span>
                    <span className="text-gray-900">{calculateTempsRestant(selectedVehicle.date_disponibilite)}</span>
                  </div>
                  {selectedVehicle.salarie_id && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Salarié assigné</span>
                      <span className="text-gray-900">
                        {(() => {
                          const salarie = apiData.salaries?.find((s: any) => s.id === selectedVehicle.salarie_id)
                          return salarie ? `${salarie.prenom} ${salarie.nom}` : 'Non assigné'
                        })()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 bg-gradient-to-br from-blue-500 to-indigo-600 hover:bg-blue-600 text-white">
                    <Car className="w-4 h-4 mr-2" />
                    Gérer
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Fuel className="w-4 h-4 mr-2" />
                    Carburant
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  )
}