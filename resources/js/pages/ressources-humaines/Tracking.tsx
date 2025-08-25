import AppLayout from "@/layouts/app-layout"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navigation, Truck, Phone, Package, Clock, MessageCircle, Send, User, Fuel, LucideMapPin as MapPinCheckInside } from "lucide-react"

const GOOGLE_MAPS_API_KEY = "AIzaSyBqaAsQ8r3L9quGIANXqYGlXm3RiJbHjYU"

// Données statiques conservées comme fallback
const trackingPoints = [
  {
    id: 1,
    title: "Projet Construction Centre Ville",
    address: "Avenue Mohammed V, Rabat",
    position: { lat: 34.0209, lng: -6.8416 },
    status: "execution",
    distance: "45km",
    estimatedTime: "3 semaines",
    projectManager: {
      name: "Ahmed Benali",
      phone: "+212 6 12 34 56 78",
    },
    currentVehicle: {
      type: "truck",
      name: "Camion Mercedes",
      loadPercentage: 71,
      capacity: "2000 Kg",
      currentLoad: "1420 Kg",
    },
    vehicles: [
      { type: "Camion", count: 2, status: "active", model: "Mercedes Actros", capacity: "2000 Kg" },
      { type: "Voiture", count: 1, status: "active", model: "Toyota Hilux", capacity: "500 Kg" },
      { type: "Engin", count: 1, status: "maintenance", model: "Caterpillar 320", capacity: "N/A" },
    ],
    employees: [
      { name: "Hassan Alami", role: "Chef de chantier" },
      { name: "Youssef Tazi", role: "Ingénieur" },
      { name: "Omar Fassi", role: "Ouvrier spécialisé" },
      { name: "Karim Benali", role: "Conducteur" },
    ],
    fuel: {
      current: 75,
      estimatedTime: "2h 15min",
    },
    timeline: [
      {
        status: "Programmation",
        time: "10 Nov, 8:20",
        description: "Projet planifié et ressources allouées.",
        completed: true,
        delay: undefined,
        pourcentage: 100,
        valide_par: "Ahmed Benali",
      },
      {
        status: "Confirmation",
        time: "10 Nov, 10:40",
        description: "Projet confirmé, équipe assignée.",
        completed: true,
        delay: undefined,
        pourcentage: 100,
        valide_par: "Youssef Tazi",
      },
      {
        status: "Préparation",
        time: "10 Nov, 12:30",
        description: "Matériaux et équipements préparés.",
        completed: true,
        delay: undefined,
        pourcentage: 100,
        valide_par: "Omar Fassi",
      },
      {
        status: "En Route",
        time: "10 Nov, 14:30",
        description: "Équipe en déplacement vers le site.",
        completed: true,
        delay: undefined,
        pourcentage: 100,
        valide_par: "Hassan Alami",
      },
      {
        status: "Pause Technique",
        time: "10 Nov, 16:00",
        description: "Pause technique pour vérifications.",
        completed: true,
        delay: undefined,
        pourcentage: 100,
        valide_par: "Ahmed Benali",
      },
      {
        status: "Arrivée sur Site",
        time: "10 Nov, 16:30",
        description: "Équipe arrivée sur le site de travail.",
        completed: true,
        delay: undefined,
        pourcentage: 100,
        valide_par: "Youssef Tazi",
      },
      {
        status: "Exécution",
        time: "Maintenant",
        description: "Travaux en cours d'exécution.",
        completed: false,
        current: true,
        delay: "1h en retard",
        pourcentage: 50,
        valide_par: "Non validé",
      },
      {
        status: "Retour",
        time: "12 Nov, 17:00",
        description: "Retour de l'équipe à la base.",
        completed: false,
        delay: undefined,
        pourcentage: 0,
        valide_par: "En attente",
      },
      {
        status: "Clôture",
        time: "12 Nov, 18:00",
        description: "Rapport final et archivage.",
        completed: false,
        delay: undefined,
        pourcentage: 0,
        valide_par: "En attente",
      },
    ],
  },
  {
    id: 2,
    position: { lat: 34.0531, lng: -6.8315 },
    title: "Projet Rénovation Agdal",
    address: "Rue Patrice Lumumba, Agdal",
    status: "en-route",
    distance: "32km",
    estimatedTime: "2 semaines",
    projectManager: {
      name: "Youssef Alami",
      phone: "+212 6 87 65 43 21",
    },
    currentVehicle: {
      type: "car",
      name: "Toyota Hilux",
      loadPercentage: 45,
      capacity: "500 Kg",
      currentLoad: "225 Kg",
    },
    vehicles: [
      { type: "Voiture", count: 2, status: "active", model: "Toyota Hilux", capacity: "500 Kg" },
      { type: "Camion", count: 1, status: "active", model: "Isuzu NPR", capacity: "1500 Kg" },
    ],
    employees: [
      { name: "Bahae Bennani", role: "Architecte" },
      { name: "Fatima Zahra", role: "Ingénieur" },
      { name: "Mohamed Alaoui", role: "Ouvrier" },
    ],
    fuel: {
      current: 60,
      estimatedTime: "1h 45min",
    },
    timeline: [
      {
        status: "Programmation",
        time: "Nov 10, 10:00",
        description: "Projet planifié.",
        completed: true,
        delay: undefined,
        pourcentage: 100,
        valide_par: "Ahmed Benali",
      },
      {
        status: "Confirmation",
        time: "Nov 10, 10:05",
        description: "Projet confirmé.",
        completed: true,
        delay: undefined,
        pourcentage: 100,
        valide_par: "Youssef Alami",
      },
      {
        status: "Préparation",
        time: "Nov 10, 11:00",
        description: "Préparation terminée.",
        completed: true,
        delay: undefined,
        pourcentage: 100,
        valide_par: "Omar Fassi",
      },
      {
        status: "En Route",
        time: "Maintenant",
        description: "Équipe en déplacement.",
        completed: false,
        current: true,
        delay: "20min en retard",
        pourcentage: 30,
        valide_par: "En cours",
      },
      {
        status: "Pause Technique",
        time: "Nov 11, 14:00",
        description: "Pause technique prévue.",
        completed: false,
        delay: undefined,
        pourcentage: 0,
        valide_par: "En attente",
      },
      {
        status: "Arrivée sur Site",
        time: "Nov 11, 15:00",
        description: "Arrivée prévue sur site.",
        completed: false,
        delay: undefined,
        pourcentage: 0,
        valide_par: "En attente",
      },
      {
        status: "Exécution",
        time: "Nov 11, 15:30",
        description: "Début des travaux prévu.",
        completed: false,
        delay: undefined,
        pourcentage: 0,
        valide_par: "En attente",
      },
      {
        status: "Retour",
        time: "Nov 12, 17:00",
        description: "Retour prévu.",
        completed: false,
        delay: undefined,
        pourcentage: 0,
        valide_par: "En attente",
      },
      {
        status: "Clôture",
        time: "Nov 12, 18:00",
        description: "Clôture prévue.",
        completed: false,
        delay: undefined,
        pourcentage: 0,
        valide_par: "En attente",
      },
    ],
  },
  {
    id: 3,
    position: { lat: 33.9716, lng: -6.8498 },
    title: "Projet Infrastructure Temara",
    address: "Avenue des FAR, Temara",
    status: "preparation",
    distance: "28km",
    estimatedTime: "4 semaines",
    projectManager: {
      name: "Omar Fassi",
      phone: "+212 6 11 22 33 44",
    },
    currentVehicle: {
      type: "machinery",
      name: "Caterpillar 320",
      loadPercentage: 100,
      capacity: "Excavatrice",
      currentLoad: "En préparation",
    },
    vehicles: [
      { type: "Engin", count: 3, status: "preparation", model: "Caterpillar 320", capacity: "Excavatrice" },
      { type: "Camion", count: 2, status: "preparation", model: "Volvo FH", capacity: "3000 Kg" },
    ],
    employees: [
      { name: "Laila Bennani", role: "Chef de projet" },
      { name: "Saad Alami", role: "Ingénieur civil" },
    ],
    fuel: {
      current: 90,
      estimatedTime: "4h 30min",
    },
    timeline: [
      {
        status: "Programmation",
        time: "Nov 10, 2:00 PM",
        description: "Projet en cours de planification.",
        completed: true,
        delay: undefined,
        pourcentage: 100,
        valide_par: "Omar Fassi",
      },
      {
        status: "Confirmation",
        time: "Nov 11, 9:00 AM",
        description: "Projet confirmé par le client.",
        completed: true,
        delay: undefined,
        pourcentage: 100,
        valide_par: "Laila Bennani",
      },
      {
        status: "Préparation",
        time: "Maintenant",
        description: "Préparation des ressources en cours.",
        completed: false,
        current: true,
        delay: undefined,
        pourcentage: 60,
        valide_par: "En cours",
      },
      {
        status: "En Route",
        time: "Nov 12, 8:00 AM",
        description: "Départ prévu vers le site.",
        completed: false,
        delay: undefined,
        pourcentage: 0,
        valide_par: "En attente",
      },
      {
        status: "Pause Technique",
        time: "Nov 12, 10:00 AM",
        description: "Pause technique prévue.",
        completed: false,
        delay: undefined,
        pourcentage: 0,
        valide_par: "En attente",
      },
      {
        status: "Arrivée sur Site",
        time: "Nov 12, 11:00 AM",
        description: "Arrivée prévue sur site.",
        completed: false,
        delay: undefined,
        pourcentage: 0,
        valide_par: "En attente",
      },
      {
        status: "Exécution",
        time: "Nov 12, 12:00 PM",
        description: "Début des travaux prévu.",
        completed: false,
        delay: undefined,
        pourcentage: 0,
        valide_par: "En attente",
      },
      {
        status: "Retour",
        time: "Nov 15, 17:00",
        description: "Retour prévu.",
        completed: false,
        delay: undefined,
        pourcentage: 0,
        valide_par: "En attente",
      },
      {
        status: "Clôture",
        time: "Nov 15, 18:00",
        description: "Clôture prévue.",
        completed: false,
        delay: undefined,
        pourcentage: 0,
        valide_par: "En attente",
      },
    ],
  },
  {
    id: 4,
    position: { lat: 34.0142, lng: -6.7591 },
    title: "Projet Maintenance Salé",
    address: "Avenue Hassan II, Salé",
    status: "pause-technique",
    distance: "15km",
    estimatedTime: "1 semaine",
    projectManager: {
      name: "Hassan Tazi",
      phone: "+212 6 55 44 33 22",
    },
    currentVehicle: {
      type: "other",
      name: "Véhicule Spécialisé",
      loadPercentage: 30,
      capacity: "Équipement",
      currentLoad: "Outils maintenance",
    },
    vehicles: [
      { type: "Voiture", count: 1, status: "active", model: "Ford Transit", capacity: "800 Kg" },
      { type: "Autre", count: 1, status: "maintenance", model: "Véhicule Spécialisé", capacity: "Équipement" },
    ],
    employees: [
      { name: "Nadia Alaoui", role: "Technicienne" },
      { name: "Khalid Bennani", role: "Mécanicien" },
    ],
    fuel: {
      current: 45,
      estimatedTime: "1h 20min",
    },
    timeline: [
      {
        status: "Programmation",
        time: "Nov 10, 11:30 AM",
        description: "Maintenance programmée.",
        completed: true,
        delay: undefined,
        pourcentage: 100,
        valide_par: "Hassan Tazi",
      },
      {
        status: "Confirmation",
        time: "Nov 10, 11:35 AM",
        description: "Intervention confirmée.",
        completed: true,
        delay: undefined,
        pourcentage: 100,
        valide_par: "Nadia Alaoui",
      },
      {
        status: "Préparation",
        time: "Nov 10, 12:00 PM",
        description: "Outils et pièces préparés.",
        completed: true,
        delay: undefined,
        pourcentage: 100,
        valide_par: "Khalid Bennani",
      },
      {
        status: "En Route",
        time: "Nov 10, 13:00 PM",
        description: "Équipe en route vers le site.",
        completed: true,
        delay: undefined,
        pourcentage: 100,
        valide_par: "Hassan Tazi",
      },
      {
        status: "Pause Technique",
        time: "Maintenant",
        description: "Pause technique pour diagnostic approfondi.",
        completed: false,
        current: true,
        delay: undefined,
        pourcentage: 25,
        valide_par: "En cours",
      },
      {
        status: "Arrivée sur Site",
        time: "Nov 10, 15:00 PM",
        description: "Arrivée prévue sur site.",
        completed: false,
        delay: undefined,
        pourcentage: 0,
        valide_par: "En attente",
      },
      {
        status: "Exécution",
        time: "Nov 10, 15:30 PM",
        description: "Début de la maintenance.",
        completed: false,
        delay: undefined,
        pourcentage: 0,
        valide_par: "En attente",
      },
      {
        status: "Retour",
        time: "Nov 10, 17:00 PM",
        description: "Retour prévu.",
        completed: false,
        delay: undefined,
        pourcentage: 0,
        valide_par: "En attente",
      },
      {
        status: "Clôture",
        time: "Nov 10, 17:30 PM",
        description: "Clôture de l'intervention.",
        completed: false,
        delay: undefined,
        pourcentage: 0,
        valide_par: "En attente",
      },
    ],
  },
]

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
}

// Interface props pour recevoir les données dynamiques
interface TrackingPageProps {
  dynamicTrackingPoints?: any[]
}

export default function TrackingPage({ dynamicTrackingPoints = [] }: TrackingPageProps) {
  // Utiliser les données dynamiques si disponibles, sinon les données statiques
  const activeTrackingPoints = dynamicTrackingPoints.length > 0 ? dynamicTrackingPoints : trackingPoints
  
  const [selectedPoint, setSelectedPoint] = useState<(typeof trackingPoints)[0] | null>(activeTrackingPoints[1] || activeTrackingPoints[0] || null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any | null>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (selectedPoint) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 500)
      return () => clearTimeout(timer)
    }
  }, [selectedPoint])

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
      if (!mapRef.current) return

      // Initialize map centered on Rabat
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

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.setMap(null))
      markersRef.current = []

      // Add markers for each tracking point (utilise activeTrackingPoints au lieu de trackingPoints statique)
      activeTrackingPoints.forEach((point) => {
        if (!point.position || typeof point.position.lat !== "number" || typeof point.position.lng !== "number") {
          console.error("Invalid coordinates for point:", point)
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
            fillColor: getMarkerColor(point.status),
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
          },
          animation: window.google.maps.Animation.DROP,
        })

        // Add click listener
        marker.addListener("click", () => {
          setSelectedPoint(point)
        })

        markersRef.current.push(marker)
      })

      const validPoints = activeTrackingPoints.filter(
        (point) =>
          point.position &&
          typeof point.position.lat === "number" &&
          typeof point.position.lng === "number" &&
          !isNaN(point.position.lat) &&
          !isNaN(point.position.lng),
      )

      if (validPoints.length > 1) {
        const routePath = new window.google.maps.Polyline({
          path: validPoints.map((point) => new window.google.maps.LatLng(point.position.lat, point.position.lng)),
          geodesic: true,
          strokeColor: "#3b82f6",
          strokeOpacity: 0.8,
          strokeWeight: 4,
        })

        routePath.setMap(map)
      }

      setMapLoaded(true)
    }

    loadGoogleMaps()
  }, [activeTrackingPoints]) // Ajout de la dépendance

  const getMarkerColor = (status: string) => {
    const colors = {
      completed: "#22c55e",
      execution: "#eab308",
      "en-route": "#3b82f6",
      preparation: "#9ca3af",
      "pause-technique": "#f59e0b",
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
    }
    return colors[status as keyof typeof colors] || "border-gray-300"
  }

  const getStatusDescription = (status: string): string => {
    return descriptions[status as keyof typeof descriptions] || "Statut inconnu"
  }

  // Fonction pour déterminer la couleur du point selon le statut et le pourcentage
  const getTimelinePointColor = (event: any) => {
    if (event.pourcentage === 100) {
      // Validé (pourcentage = 100) -> vert
      return "bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-200"
    } else if (event.pourcentage > 0 && event.pourcentage < 100) {
      // En attente/en cours (0 < pourcentage < 100) -> jaune
      return "bg-gradient-to-br from-yellow-400 to-amber-500 animate-pulse shadow-lg shadow-yellow-200"
    } else {
      // Rejeté ou pas commencé (pourcentage = 0) -> gris
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
        case "machinery":
          return (
            <div className="relative">
              <div className="w-28 h-16 bg-yellow-500 rounded-lg relative overflow-hidden">
                <div className="absolute top-1 left-1 right-1 bottom-1 bg-yellow-600 rounded-md"></div>
                <div className="absolute top-2 left-2 w-6 h-3 bg-yellow-400 rounded-sm"></div>
                <div className="absolute bottom-1 left-1 w-4 h-4 bg-gray-800 rounded-full"></div>
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-gray-800 rounded-full"></div>
                <div className="absolute top-0 right-2 w-8 h-6 bg-yellow-400 rounded-b-lg"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-yellow-800 text-white text-xs font-bold px-1 rounded">
                    {vehicle.loadPercentage === 0 ? "PREP" : `${vehicle.loadPercentage}%`}
                  </div>
                </div>
              </div>
            </div>
          )
        case "other":
          return (
            <div className="relative">
              <div className="w-26 h-14 bg-purple-500 rounded-lg relative overflow-hidden">
                <div className="absolute top-1 left-1 right-1 bottom-1 bg-purple-600 rounded-md"></div>
                <div className="absolute top-2 left-2 w-5 h-2 bg-purple-300 rounded-sm"></div>
                <div className="absolute bottom-1 left-2 w-3 h-3 bg-gray-800 rounded-full"></div>
                <div className="absolute bottom-1 right-2 w-3 h-3 bg-gray-800 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-purple-800 text-white text-xs font-bold px-1 rounded transition-all duration-1000">
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

  return (
    <AppLayout>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      <div className="relative w-full h-screen overflow-hidden">
        {/* Distance indicator - Top left overlay */}
        {selectedPoint && (
          <div className={`absolute top-6 left-6 z-30 ${isAnimating ? "fade-in-animation" : ""}`}>
            <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 hover:shadow-3xl transition-all duration-300">
              <CardContent className="p-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Temps estimé d'achèvement</p>
                  <p className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {selectedPoint.distance} / {selectedPoint.estimatedTime}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Full-screen map container */}
        <div className="absolute inset-0">
          <div ref={mapRef} className="w-full h-full" />
          {!mapLoaded && (
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
        </div>

        {selectedPoint && (
<div
  className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 z-20 
              bg-white/20 backdrop-blur-md rounded-lg p-6 
              ${isAnimating ? "slide-in-animation" : ""}`}
>
  {/* Your content here */}

            <div
              className="flex gap-4 w-[80vw] h-[50vh] hide-scrollbar bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 overflow-y-auto custom-scroll"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {/* First column - Project Timeline */}
              <div className="flex-1 space-y-4">
                <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 hover:bg-white transition-all duration-300 hover:shadow-3xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      Étapes du Projet
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedPoint.timeline.map((event: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 group hover:bg-gray-50/50 rounded-lg p-3 transition-all duration-200"
                      >
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-1500 group-hover:scale-125 ${getTimelinePointColor(event)}`}
                          />
                          {index < selectedPoint.timeline.length - 1 && (
                            <div
                              className={`w-0.5 h-10 mt-2 transition-all duration-300 ${
                                event.pourcentage === 100 ? "bg-green-300" : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* Description en gras en premier */}
                          <p className="font-bold text-gray-900 text-base mb-2">{event.description}</p>
                          
                          {/* Date de validation */}
                          <p className="text-sm font-medium text-gray-700 mb-1">Date: {event.time}</p>
                          
                          {/* Validé par qui */}
                          <p className="text-sm font-medium text-blue-600 mb-2">Validé par: {event.valide_par}</p>
                          
                          {/* Status */}
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold text-gray-900 text-sm">{event.status}</p>
                            {event.delay && (
                              <Badge
                                variant="secondary"
                                className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1"
                              >
                                {event.delay}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Pourcentage si disponible */}
                          {event.pourcentage !== undefined && (
                            <p className="text-xs text-gray-500 mt-1 font-medium">
                              Progression: {event.pourcentage}%
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Second column - Current Vehicle Load Information */}
              <div className="flex-1 space-y-4">
                <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 hover:bg-white transition-all duration-300 hover:shadow-3xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                        <Truck className="w-5 h-5 text-white" />
                      </div>
                      Charge actuelle du véhicule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Vehicle load content using currentVehicle data */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">Charge actuelle</span>
                        <span className="font-bold text-gray-900">{selectedPoint.currentVehicle.currentLoad}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">Capacité max</span>
                        <span className="font-bold text-gray-900">{selectedPoint.currentVehicle.capacity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">Véhicule</span>
                        <span className="font-bold text-gray-900">{selectedPoint.currentVehicle.name}</span>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                          style={{ width: `${selectedPoint.currentVehicle.loadPercentage}%` }}
                        >
                          <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-800 drop-shadow-sm">
                          {selectedPoint.currentVehicle.loadPercentage}%
                        </span>
                      </div>
                    </div>

                    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 overflow-hidden border border-gray-200">
                      <div className="relative z-10 flex items-center justify-center">
                        <div className="text-center">
                          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                          <div className="text-3xl font-bold text-green-600 mb-1">{selectedPoint.currentVehicle.loadPercentage}%</div>
                          <div className="text-sm text-gray-500 font-medium">Capacité utilisée</div>
                        </div>
                      </div>
                      <div
                        className="absolute bottom-0 left-0 bg-gradient-to-t from-green-500/30 via-emerald-500/20 to-transparent transition-all duration-1000 ease-out"
                        style={{
                          width: "100%",  
                          height: `${selectedPoint.currentVehicle.loadPercentage}%`,
                          borderRadius: "0 0 0.75rem 0.75rem",
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-white/95 backdrop-blur-lg shadow-xl border-0 hover:bg-white transition-all duration-300">
                    <CardContent className="p-4 text-center">
                      <Fuel className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-emerald-600">Carburant</p>
                      <p className="text-lg font-bold text-emerald-600">{selectedPoint.fuel.current}%</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/95 backdrop-blur-lg shadow-xl border-0 hover:bg-white transition-all duration-300">
                    <CardContent className="p-4 text-center">
                      <Clock className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-emerald-600">Temps restant</p>
                      <p className="text-lg font-bold text-emerald-600">{selectedPoint.fuel.estimatedTime}</p>
                    </CardContent>
                  </Card>
                </div>
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
                  <CardContent
                    className="space-y-5 hide-scrollbar custom-scroll max-h-80"
                    style={{ overflowY: "auto" }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-none rounded-full flex items-center justify-center text-blue-700 ">
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
                          <Badge
                            variant="outline"
                            className={`font-medium ${getStatusBadgeColor(selectedPoint.status)}`}
                          >
                            {getStatusDescription(selectedPoint.status)}
                          </Badge>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Chef de Projet</p>
                          <p className="font-bold text-gray-900">{selectedPoint.projectManager.name}</p>
                          <Button
                            size="sm"
                            className="mt-3 bg-gradient-to-br from-green-500 to-emerald-600 hover:bg-purple-600 text-white rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
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
                                {employee.prenom || employee.name?.split(' ')[0]} {employee.nom || employee.name?.split(' ')[1] || ''}
                              </span>
                              <span className="text-gray-600">{employee.role}</span>
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
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-white" />
                        </div>
                        <div className="bg-blue-50 rounded-lg p-2 flex-1">
                          <p className="text-xs text-gray-800">Équipe arrivée sur site, début des travaux.</p>
                          <p className="text-xs text-gray-500 mt-1">Il y a 5 min</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 justify-end">
                        <div className="bg-blue-50 rounded-lg p-2 max-w-xs">
                          <p className="text-xs text-gray-800">Parfait, tenez-moi informé des progrès!</p>
                          <p className="text-xs text-gray-500 mt-1">Il y a 3 min</p>
                        </div>
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Tapez votre message..."
                        className="flex-1 text-sm border-gray-200 focus:border-purple-500"
                      />
                      <Button size="sm" className="bg-gradient-to-br from-green-500 to-emerald-600 hover:bg-purple-600 text-white">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {selectedEmployee && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="bg-white shadow-2xl border-0 max-w-md w-full slide-in-animation">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {selectedEmployee.prenom?.[0] || selectedEmployee.name?.split(' ')[0]?.[0]}
                      {selectedEmployee.nom?.[0] || selectedEmployee.name?.split(' ')[1]?.[0] || ''}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedEmployee.prenom || selectedEmployee.name?.split(' ')[0]} {selectedEmployee.nom || selectedEmployee.name?.split(' ')[1] || ''}
                      </p>
                      <p className="text-sm text-gray-600">{selectedEmployee.role}</p>
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
                    <span className="text-gray-900">
                      {selectedEmployee.prenom || selectedEmployee.name?.split(' ')[0]} {selectedEmployee.nom || selectedEmployee.name?.split(' ')[1] || ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Poste</span>
                    <span className="text-gray-900">{selectedEmployee.role}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Email</span>
                    <span className="text-gray-900 text-sm">{selectedEmployee.email}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Téléphone</span>
                    <span className="text-gray-900">{selectedEmployee.telephone}</span>
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
      </div>
    </AppLayout>
  )
}