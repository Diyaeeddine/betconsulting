import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Clock, Fuel, LucideMapPin as MapPinCheckInside, MessageCircle, Navigation, Package, Phone, Send, Truck, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBqaAsQ8r3L9quGIANXqYGlXm3RiJbHjYU';

// Données statiques conservées comme fallback
const trackingPoints = [
    {
        id: 1,
        title: 'Projet Construction Centre Ville',
        address: 'Avenue Mohammed V, Rabat',
        position: { lat: 34.0209, lng: -6.8416 },
        status: 'execution',
        distance: '45km',
        estimatedTime: '3 semaines',
        projectManager: {
            name: 'Ahmed Benali',
            phone: '+212 6 12 34 56 78',
        },
        currentVehicle: {
            type: 'truck',
            name: 'Camion Mercedes',
            loadPercentage: 71,
            capacity: '2000 Kg',
            currentLoad: '1420 Kg',
        },
        vehicles: [
            { type: 'Camion', count: 2, status: 'active', model: 'Mercedes Actros', capacity: '2000 Kg' },
            { type: 'Voiture', count: 1, status: 'active', model: 'Toyota Hilux', capacity: '500 Kg' },
            { type: 'Engin', count: 1, status: 'maintenance', model: 'Caterpillar 320', capacity: 'N/A' },
        ],
        employees: [
            { name: 'Hassan Alami', role: 'Chef de chantier' },
            { name: 'Youssef Tazi', role: 'Ingénieur' },
            { name: 'Omar Fassi', role: 'Ouvrier spécialisé' },
            { name: 'Karim Benali', role: 'Conducteur' },
        ],
        fuel: {
            current: 75,
            estimatedTime: '2h 15min',
        },
        timeline: [
            {
                status: 'Programmation',
                time: '10 Nov, 8:20',
                description: 'Projet planifié et ressources allouées.',
                completed: true,
                delay: undefined,
                pourcentage: 100,
                valide_par: 'Ahmed Benali',
            },
            {
                status: 'Confirmation',
                time: '10 Nov, 10:40',
                description: 'Projet confirmé, équipe assignée.',
                completed: true,
                delay: undefined,
                pourcentage: 100,
                valide_par: 'Youssef Tazi',
            },
            {
                status: 'Préparation',
                time: '10 Nov, 12:30',
                description: 'Matériaux et équipements préparés.',
                completed: true,
                delay: undefined,
                pourcentage: 100,
                valide_par: 'Omar Fassi',
            },
            {
                status: 'En Route',
                time: '10 Nov, 14:30',
                description: 'Équipe en déplacement vers le site.',
                completed: true,
                delay: undefined,
                pourcentage: 100,
                valide_par: 'Hassan Alami',
            },
            {
                status: 'Pause Technique',
                time: '10 Nov, 16:00',
                description: 'Pause technique pour vérifications.',
                completed: true,
                delay: undefined,
                pourcentage: 100,
                valide_par: 'Ahmed Benali',
            },
            {
                status: 'Arrivée sur Site',
                time: '10 Nov, 16:30',
                description: 'Équipe arrivée sur le site de travail.',
                completed: true,
                delay: undefined,
                pourcentage: 100,
                valide_par: 'Youssef Tazi',
            },
            {
                status: 'Exécution',
                time: 'Maintenant',
                description: "Travaux en cours d'exécution.",
                completed: false,
                current: true,
                delay: '1h en retard',
                pourcentage: 50,
                valide_par: 'Non validé',
            },
            {
                status: 'Retour',
                time: '12 Nov, 17:00',
                description: "Retour de l'équipe à la base.",
                completed: false,
                delay: undefined,
                pourcentage: 0,
                valide_par: 'En attente',
            },
            {
                status: 'Clôture',
                time: '12 Nov, 18:00',
                description: 'Rapport final et archivage.',
                completed: false,
                delay: undefined,
                pourcentage: 0,
                valide_par: 'En attente',
            },
        ],
    },
    {
        id: 2,
        position: { lat: 34.0531, lng: -6.8315 },
        title: 'Projet Rénovation Agdal',
        address: 'Rue Patrice Lumumba, Agdal',
        status: 'en-route',
        distance: '32km',
        estimatedTime: '2 semaines',
        projectManager: {
            name: 'Youssef Alami',
            phone: '+212 6 87 65 43 21',
        },
        currentVehicle: {
            type: 'car',
            name: 'Toyota Hilux',
            loadPercentage: 45,
            capacity: '500 Kg',
            currentLoad: '225 Kg',
        },
        vehicles: [
            { type: 'Voiture', count: 2, status: 'active', model: 'Toyota Hilux', capacity: '500 Kg' },
            { type: 'Camion', count: 1, status: 'active', model: 'Isuzu NPR', capacity: '1500 Kg' },
        ],
        employees: [
            { name: 'Bahae Bennani', role: 'Architecte' },
            { name: 'Fatima Zahra', role: 'Ingénieur' },
            { name: 'Mohamed Alaoui', role: 'Ouvrier' },
        ],
        fuel: {
            current: 60,
            estimatedTime: '1h 45min',
        },
        timeline: [
            {
                status: 'Programmation',
                time: 'Nov 10, 10:00',
                description: 'Projet planifié.',
                completed: true,
                delay: undefined,
                pourcentage: 100,
                valide_par: 'Ahmed Benali',
            },
            {
                status: 'Confirmation',
                time: 'Nov 10, 10:05',
                description: 'Projet confirmé.',
                completed: true,
                delay: undefined,
                pourcentage: 100,
                valide_par: 'Youssef Alami',
            },
            {
                status: 'Préparation',
                time: 'Nov 10, 11:00',
                description: 'Préparation terminée.',
                completed: true,
                delay: undefined,
                pourcentage: 100,
                valide_par: 'Omar Fassi',
            },
            {
                status: 'En Route',
                time: 'Maintenant',
                description: 'Équipe en déplacement.',
                completed: false,
                current: true,
                delay: '20min en retard',
                pourcentage: 30,
                valide_par: 'En cours',
            },
            {
                status: 'Pause Technique',
                time: 'Nov 11, 14:00',
                description: 'Pause technique prévue.',
                completed: false,
                delay: undefined,
                pourcentage: 0,
                valide_par: 'En attente',
            },
            {
                status: 'Arrivée sur Site',
                time: 'Nov 11, 15:00',
                description: 'Arrivée prévue sur site.',
                completed: false,
                delay: undefined,
                pourcentage: 0,
                valide_par: 'En attente',
            },
            {
                status: 'Exécution',
                time: 'Nov 11, 15:30',
                description: 'Début des travaux prévu.',
                completed: false,
                delay: undefined,
                pourcentage: 0,
                valide_par: 'En attente',
            },
            {
                status: 'Retour',
                time: 'Nov 12, 17:00',
                description: 'Retour prévu.',
                completed: false,
                delay: undefined,
                pourcentage: 0,
                valide_par: 'En attente',
            },
            {
                status: 'Clôture',
                time: 'Nov 12, 18:00',
                description: 'Clôture prévue.',
                completed: false,
                delay: undefined,
                pourcentage: 0,
                valide_par: 'En attente',
            },
        ],
    },
    {
        id: 3,
        position: { lat: 33.9716, lng: -6.8498 },
        title: 'Projet Infrastructure Temara',
        address: 'Avenue des FAR, Temara',
        status: 'preparation',
        distance: '28km',
        estimatedTime: '4 semaines',
        projectManager: {
            name: 'Omar Fassi',
            phone: '+212 6 11 22 33 44',
        },
        currentVehicle: {
            type: 'machinery',
            name: 'Caterpillar 320',
            loadPercentage: 100,
            capacity: 'Excavatrice',
            currentLoad: 'En préparation',
        },
        vehicles: [
            { type: 'Engin', count: 3, status: 'preparation', model: 'Caterpillar 320', capacity: 'Excavatrice' },
            { type: 'Camion', count: 2, status: 'preparation', model: 'Volvo FH', capacity: '3000 Kg' },
        ],
        employees: [
            { name: 'Laila Bennani', role: 'Chef de projet' },
            { name: 'Saad Alami', role: 'Ingénieur civil' },
        ],
        fuel: {
            current: 90,
            estimatedTime: '4h 30min',
        },
        timeline: [
            {
                status: 'Programmation',
                time: 'Nov 10, 2:00 PM',
                description: 'Projet en cours de planification.',
                completed: true,
                delay: undefined,
                pourcentage: 100,
                valide_par: 'Omar Fassi',
            },
            {
                status: 'Confirmation',
                time: 'Nov 11, 9:00 AM',
                description: 'Projet confirmé par le client.',
                completed: true,
                delay: undefined,
                pourcentage: 100,
                valide_par: 'Laila Bennani',
            },
            {
                status: 'Préparation',
                time: 'Maintenant',
                description: 'Préparation des ressources en cours.',
                completed: false,
                current: true,
                delay: undefined,
                pourcentage: 60,
                valide_par: 'En cours',
            },
            {
                status: 'En Route',
                time: 'Nov 12, 8:00 AM',
                description: 'Départ prévu vers le site.',
                completed: false,
                delay: undefined,
                pourcentage: 0,
                valide_par: 'En attente',
            },
            {
                status: 'Pause Technique',
                time: 'Nov 12, 10:00 AM',
                description: 'Pause technique prévue.',
                completed: false,
                delay: undefined,
                pourcentage: 0,
                valide_par: 'En attente',
            },
            {
                status: 'Arrivée sur Site',
                time: 'Nov 12, 11:00 AM',
                description: 'Arrivée prévue sur site.',
                completed: false,
                delay: undefined,
                pourcentage: 0,
                valide_par: 'En attente',
            },
            {
                status: 'Exécution',
                time: 'Nov 12, 12:00 PM',
                description: 'Début des travaux prévu.',
                completed: false,
                delay: undefined,
                pourcentage: 0,
                valide_par: 'En attente',
            },
            {
                status: 'Retour',
                time: 'Nov 15, 17:00',
                description: 'Retour prévu.',
                completed: false,
                delay: undefined,
                pourcentage: 0,
                valide_par: 'En attente',
            },
            {
                status: 'Clôture',
                time: 'Nov 15, 18:00',
                description: 'Clôture prévue.',
                completed: false,
                delay: undefined,
                pourcentage: 0,
                valide_par: 'En attente',
            },
        ],
    },
    {
        id: 4,
        position: { lat: 34.0142, lng: -6.7591 },
        title: 'Projet Maintenance Salé',
        address: 'Avenue Hassan II, Salé',
        status: 'pause-technique',
        distance: '15km',
        estimatedTime: '1 semaine',
        projectManager: {
            name: 'Hassan Tazi',
            phone: '+212 6 55 44 33 22',
        },
        currentVehicle: {
            type: 'other',
            name: 'Véhicule Spécialisé',
            loadPercentage: 30,
            capacity: 'Équipement',
            currentLoad: 'Outils maintenance',
        },
        vehicles: [
            { type: 'Voiture', count: 1, status: 'active', model: 'Ford Transit', capacity: '800 Kg' },
            { type: 'Autre', count: 1, status: 'maintenance', model: 'Véhicule Spécialisé', capacity: 'Équipement' },
        ],
        employees: [
            { name: 'Nadia Alaoui', role: 'Technicienne' },
            { name: 'Khalid Bennani', role: 'Mécanicien' },
        ],
        fuel: {
            current: 45,
            estimatedTime: '1h 20min',
        },
        timeline: [
            {
                status: 'Programmation',
                time: 'Nov 10, 11:30 AM',
                description: 'Maintenance programmée.',
                completed: true,
                delay: undefined,
                pourcentage: 100,
                valide_par: 'Hassan Tazi',
            },
            {
                status: 'Confirmation',
                time: 'Nov 10, 11:35 AM',
                description: 'Intervention confirmée.',
                completed: true,
                delay: undefined,
                pourcentage: 100,
                valide_par: 'Nadia Alaoui',
            },
            {
                status: 'Préparation',
                time: 'Nov 10, 12:00 PM',
                description: 'Outils et pièces préparés.',
                completed: true,
                delay: undefined,
                pourcentage: 100,
                valide_par: 'Khalid Bennani',
            },
            {
                status: 'En Route',
                time: 'Nov 10, 13:00 PM',
                description: 'Équipe en route vers le site.',
                completed: true,
                delay: undefined,
                pourcentage: 100,
                valide_par: 'Hassan Tazi',
            },
            {
                status: 'Pause Technique',
                time: 'Maintenant',
                description: 'Pause technique pour diagnostic approfondi.',
                completed: false,
                current: true,
                delay: undefined,
                pourcentage: 25,
                valide_par: 'En cours',
            },
            {
                status: 'Arrivée sur Site',
                time: 'Nov 10, 15:00 PM',
                description: 'Arrivée prévue sur site.',
                completed: false,
                delay: undefined,
                pourcentage: 0,
                valide_par: 'En attente',
            },
            {
                status: 'Exécution',
                time: 'Nov 10, 15:30 PM',
                description: 'Début de la maintenance.',
                completed: false,
                delay: undefined,
                pourcentage: 0,
                valide_par: 'En attente',
            },
            {
                status: 'Retour',
                time: 'Nov 10, 17:00 PM',
                description: 'Retour prévu.',
                completed: false,
                delay: undefined,
                pourcentage: 0,
                valide_par: 'En attente',
            },
            {
                status: 'Clôture',
                time: 'Nov 10, 17:30 PM',
                description: "Clôture de l'intervention.",
                completed: false,
                delay: undefined,
                pourcentage: 0,
                valide_par: 'En attente',
            },
        ],
    },
];

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
`;

const descriptions = {
    'en-route': 'Équipe en déplacement vers le site.',
    execution: "Travaux en cours d'exécution.",
    'pause-technique': 'Pause technique pour vérifications.',
    preparation: 'Préparation des ressources en cours.',
    completed: 'Projet terminé avec succès.',
};

// Interface props pour recevoir les données dynamiques
interface TrackingPageProps {
    dynamicTrackingPoints?: any[];
}

export default function TrackingPage({ dynamicTrackingPoints = [] }: TrackingPageProps) {
    // Utiliser les données dynamiques si disponibles, sinon les données statiques
    const activeTrackingPoints = dynamicTrackingPoints.length > 0 ? dynamicTrackingPoints : trackingPoints;

    const [selectedPoint, setSelectedPoint] = useState<(typeof trackingPoints)[0] | null>(activeTrackingPoints[1] || activeTrackingPoints[0] || null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<any | null>(null);
    const markersRef = useRef<any[]>([]);

    useEffect(() => {
        if (selectedPoint) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 500);
            return () => clearTimeout(timer);
        }
    }, [selectedPoint]);

    useEffect(() => {
        const loadGoogleMaps = () => {
            if (window.google && window.google.maps) {
                initializeMap();
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`;
            script.async = true;
            script.defer = true;
            script.onload = initializeMap;
            document.head.appendChild(script);
        };

        const initializeMap = () => {
            if (!mapRef.current) return;

            // Initialize map centered on Rabat
            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: 33.89, lng: -6.8416 },
                zoom: 11,
                mapTypeControl: false,
                styles: [
                    {
                        featureType: 'poi',
                        elementType: 'labels',
                        stylers: [{ visibility: 'off' }],
                    },
                    {
                        featureType: 'water',
                        elementType: 'geometry',
                        stylers: [{ color: '#e3f2fd' }],
                    },
                    {
                        featureType: 'landscape',
                        elementType: 'geometry',
                        stylers: [{ color: '#f5f5f5' }],
                    },
                    {
                        featureType: 'road',
                        elementType: 'geometry',
                        stylers: [{ color: '#ffffff' }],
                    },
                ],
            });

            googleMapRef.current = map;

            // Clear existing markers
            markersRef.current.forEach((marker) => marker.setMap(null));
            markersRef.current = [];

            // Add markers for each tracking point (utilise activeTrackingPoints au lieu de trackingPoints statique)
            activeTrackingPoints.forEach((point) => {
                if (!point.position || typeof point.position.lat !== 'number' || typeof point.position.lng !== 'number') {
                    console.error('Invalid coordinates for point:', point);
                    return;
                }

                const marker = new window.google.maps.Marker({
                    position: new window.google.maps.LatLng(point.position.lat, point.position.lng),
                    map: map,
                    title: point.title,
                    label: {
                        text: point.id.toString(),
                        color: 'white',
                        fontWeight: 'bold',
                    },
                    icon: {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 15,
                        fillColor: getMarkerColor(point.status),
                        fillOpacity: 1,
                        strokeColor: 'white',
                        strokeWeight: 2,
                    },
                    animation: window.google.maps.Animation.DROP,
                });

                // Add click listener
                marker.addListener('click', () => {
                    setSelectedPoint(point);
                });

                markersRef.current.push(marker);
            });

            const validPoints = activeTrackingPoints.filter(
                (point) =>
                    point.position &&
                    typeof point.position.lat === 'number' &&
                    typeof point.position.lng === 'number' &&
                    !isNaN(point.position.lat) &&
                    !isNaN(point.position.lng),
            );

            if (validPoints.length > 1) {
                const routePath = new window.google.maps.Polyline({
                    path: validPoints.map((point) => new window.google.maps.LatLng(point.position.lat, point.position.lng)),
                    geodesic: true,
                    strokeColor: '#3b82f6',
                    strokeOpacity: 0.8,
                    strokeWeight: 4,
                });

                routePath.setMap(map);
            }

            setMapLoaded(true);
        };

        loadGoogleMaps();
    }, [activeTrackingPoints]); // Ajout de la dépendance

    const getMarkerColor = (status: string) => {
        const colors = {
            completed: '#22c55e',
            execution: '#eab308',
            'en-route': '#3b82f6',
            preparation: '#9ca3af',
            'pause-technique': '#f59e0b',
        };
        return colors[status as keyof typeof colors] || '#9ca3af';
    };

    const getStatusBadgeColor = (status: string) => {
        const colors = {
            completed: 'border-green-500',
            execution: 'border-blue-500',
            'en-route': 'border-yellow-500',
            preparation: 'border-gray-300',
            'pause-technique': 'border-red-500',
        };
        return colors[status as keyof typeof colors] || 'border-gray-300';
    };

    const getStatusDescription = (status: string): string => {
        return descriptions[status as keyof typeof descriptions] || 'Statut inconnu';
    };

    // Fonction pour déterminer la couleur du point selon le statut et le pourcentage
    const getTimelinePointColor = (event: any) => {
        if (event.pourcentage === 100) {
            // Validé (pourcentage = 100) -> vert
            return 'bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-200';
        } else if (event.pourcentage > 0 && event.pourcentage < 100) {
            // En attente/en cours (0 < pourcentage < 100) -> jaune
            return 'bg-gradient-to-br from-yellow-400 to-amber-500 animate-pulse shadow-lg shadow-yellow-200';
        } else {
            // Rejeté ou pas commencé (pourcentage = 0) -> gris
            return 'bg-gray-200 border-gray-300';
        }
    };

    const VehicleVisualization = ({ vehicle }: { vehicle: any }) => {
        const getVehicleIcon = (type: string) => {
            switch (type) {
                case 'truck':
                    return (
                        <div className="relative">
                            <div className="absolute top-2 left-8 h-8 w-16 overflow-hidden rounded-sm bg-gray-300">
                                <div
                                    className="flex h-full items-center justify-center bg-green-500 text-xs font-bold text-white transition-all duration-1000 ease-out"
                                    style={{ width: `${vehicle.loadPercentage}%` }}
                                >
                                    {vehicle.loadPercentage > 20 && `${vehicle.loadPercentage}%`}
                                </div>
                            </div>
                        </div>
                    );
                case 'car':
                    return (
                        <div className="relative">
                            <div className="relative h-12 w-24 overflow-hidden rounded-lg bg-blue-500">
                                <div className="absolute top-1 right-1 bottom-1 left-1 rounded-md bg-blue-600"></div>
                                <div className="absolute top-2 left-2 h-2 w-4 rounded-sm bg-blue-300"></div>
                                <div className="absolute top-2 right-2 h-2 w-4 rounded-sm bg-blue-300"></div>
                                <div className="absolute bottom-0 left-2 h-3 w-3 rounded-full bg-gray-800"></div>
                                <div className="absolute right-2 bottom-0 h-3 w-3 rounded-full bg-gray-800"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div
                                        className="rounded bg-green-500 px-1 text-xs font-bold text-white transition-all duration-1000"
                                        style={{ opacity: vehicle.loadPercentage > 0 ? 1 : 0.3 }}
                                    >
                                        {vehicle.loadPercentage}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                case 'machinery':
                    return (
                        <div className="relative">
                            <div className="relative h-16 w-28 overflow-hidden rounded-lg bg-yellow-500">
                                <div className="absolute top-1 right-1 bottom-1 left-1 rounded-md bg-yellow-600"></div>
                                <div className="absolute top-2 left-2 h-3 w-6 rounded-sm bg-yellow-400"></div>
                                <div className="absolute bottom-1 left-1 h-4 w-4 rounded-full bg-gray-800"></div>
                                <div className="absolute right-1 bottom-1 h-4 w-4 rounded-full bg-gray-800"></div>
                                <div className="absolute top-0 right-2 h-6 w-8 rounded-b-lg bg-yellow-400"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="rounded bg-yellow-800 px-1 text-xs font-bold text-white">
                                        {vehicle.loadPercentage === 0 ? 'PREP' : `${vehicle.loadPercentage}%`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                case 'other':
                    return (
                        <div className="relative">
                            <div className="relative h-14 w-26 overflow-hidden rounded-lg bg-purple-500">
                                <div className="absolute top-1 right-1 bottom-1 left-1 rounded-md bg-purple-600"></div>
                                <div className="absolute top-2 left-2 h-2 w-5 rounded-sm bg-purple-300"></div>
                                <div className="absolute bottom-1 left-2 h-3 w-3 rounded-full bg-gray-800"></div>
                                <div className="absolute right-2 bottom-1 h-3 w-3 rounded-full bg-gray-800"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="rounded bg-purple-800 px-1 text-xs font-bold text-white transition-all duration-1000">
                                        {vehicle.loadPercentage}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                default:
                    return <Truck className="h-16 w-16 text-gray-500" />;
            }
        };

        return (
            <div className="space-y-3 text-center">
                <div className="flex justify-center">{getVehicleIcon(vehicle.type)}</div>
                <div>
                    <p className="font-semibold text-gray-900">{vehicle.name}</p>
                    <p className="text-sm text-gray-600">{vehicle.capacity}</p>
                    <p className="text-xs text-gray-500">{vehicle.currentLoad}</p>
                </div>
            </div>
        );
    };

    return (
        <AppLayout>
            <style dangerouslySetInnerHTML={{ __html: customStyles }} />

            <div className="relative h-screen w-full overflow-hidden">
                {/* Distance indicator - Top left overlay */}
                {selectedPoint && (
                    <div className={`absolute top-6 left-6 z-30 ${isAnimating ? 'fade-in-animation' : ''}`}>
                        <Card className="hover:shadow-3xl border-0 bg-white/95 shadow-2xl backdrop-blur-xl transition-all duration-300">
                            <CardContent className="p-4">
                                <div>
                                    <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">Temps estimé d'achèvement</p>
                                    <p className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-xl font-bold text-transparent">
                                        {selectedPoint.distance} / {selectedPoint.estimatedTime}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Full-screen map container */}
                <div className="absolute inset-0">
                    <div ref={mapRef} className="h-full w-full" />
                    {!mapLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                            <div className="text-center">
                                <div className="relative">
                                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                                    <div className="absolute inset-0 animate-pulse rounded-full bg-blue-100 opacity-20"></div>
                                </div>
                                <p className="text-lg font-medium text-blue-800">Chargement de la carte...</p>
                                <p className="mt-1 text-sm text-blue-600">Connexion aux services Google Maps</p>
                            </div>
                        </div>
                    )}
                </div>

                {selectedPoint && (
                    <div
                        className={`absolute bottom-0 left-1/2 z-20 -translate-x-1/2 transform rounded-lg bg-white/20 p-6 backdrop-blur-md ${isAnimating ? 'slide-in-animation' : ''}`}
                    >
                        {/* Your content here */}

                        <div
                            className="hide-scrollbar custom-scroll flex h-[50vh] w-[80vw] gap-4 overflow-y-auto rounded-2xl bg-white/95 p-6 shadow-2xl backdrop-blur-xl"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {/* First column - Project Timeline */}
                            <div className="flex-1 space-y-4">
                                <Card className="hover:shadow-3xl border-0 bg-white/95 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:bg-white">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                                            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2">
                                                <Package className="h-5 w-5 text-white" />
                                            </div>
                                            Étapes du Projet
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {selectedPoint.timeline.map((event: any, index: number) => (
                                            <div
                                                key={index}
                                                className="group flex items-start gap-4 rounded-lg p-3 transition-all duration-200 hover:bg-gray-50/50"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className={`h-4 w-4 rounded-full border-2 transition-all duration-1500 group-hover:scale-125 ${getTimelinePointColor(event)}`}
                                                    />
                                                    {index < selectedPoint.timeline.length - 1 && (
                                                        <div
                                                            className={`mt-2 h-10 w-0.5 transition-all duration-300 ${
                                                                event.pourcentage === 100 ? 'bg-green-300' : 'bg-gray-200'
                                                            }`}
                                                        />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    {/* Description en gras en premier */}
                                                    <p className="mb-2 text-base font-bold text-gray-900">{event.description}</p>

                                                    {/* Date de validation */}
                                                    <p className="mb-1 text-sm font-medium text-gray-700">Date: {event.time}</p>

                                                    {/* Validé par qui */}
                                                    <p className="mb-2 text-sm font-medium text-blue-600">Validé par: {event.valide_par}</p>

                                                    {/* Status */}
                                                    <div className="mb-2 flex items-center gap-3">
                                                        <p className="text-sm font-semibold text-gray-900">{event.status}</p>
                                                        {event.delay && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
                                                            >
                                                                {event.delay}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {/* Pourcentage si disponible */}
                                                    {event.pourcentage !== undefined && (
                                                        <p className="mt-1 text-xs font-medium text-gray-500">Progression: {event.pourcentage}%</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Second column - Current Vehicle Load Information */}
                            <div className="flex-1 space-y-4">
                                <Card className="hover:shadow-3xl border-0 bg-white/95 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:bg-white">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                                            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2">
                                                <Truck className="h-5 w-5 text-white" />
                                            </div>
                                            Charge actuelle du véhicule
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Vehicle load content using currentVehicle data */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium text-gray-600">Charge actuelle</span>
                                                <span className="font-bold text-gray-900">{selectedPoint.currentVehicle.currentLoad}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium text-gray-600">Capacité max</span>
                                                <span className="font-bold text-gray-900">{selectedPoint.currentVehicle.capacity}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium text-gray-600">Véhicule</span>
                                                <span className="font-bold text-gray-900">{selectedPoint.currentVehicle.name}</span>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner">
                                                <div
                                                    className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 transition-all duration-1000 ease-out"
                                                    style={{ width: `${selectedPoint.currentVehicle.loadPercentage}%` }}
                                                >
                                                    <div className="absolute inset-0 animate-pulse bg-white/30"></div>
                                                </div>
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xs font-bold text-gray-800 drop-shadow-sm">
                                                    {selectedPoint.currentVehicle.loadPercentage}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                                            <div className="relative z-10 flex items-center justify-center">
                                                <div className="text-center">
                                                    <Truck className="mx-auto mb-3 h-16 w-16 text-gray-400" />
                                                    <div className="mb-1 text-3xl font-bold text-green-600">
                                                        {selectedPoint.currentVehicle.loadPercentage}%
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-500">Capacité utilisée</div>
                                                </div>
                                            </div>
                                            <div
                                                className="absolute bottom-0 left-0 bg-gradient-to-t from-green-500/30 via-emerald-500/20 to-transparent transition-all duration-1000 ease-out"
                                                style={{
                                                    width: '100%',
                                                    height: `${selectedPoint.currentVehicle.loadPercentage}%`,
                                                    borderRadius: '0 0 0.75rem 0.75rem',
                                                }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-2 gap-3">
                                    <Card className="border-0 bg-white/95 shadow-xl backdrop-blur-lg transition-all duration-300 hover:bg-white">
                                        <CardContent className="p-4 text-center">
                                            <Fuel className="mx-auto mb-2 h-8 w-8 text-emerald-600" />
                                            <p className="text-sm font-semibold text-emerald-600">Carburant</p>
                                            <p className="text-lg font-bold text-emerald-600">{selectedPoint.fuel.current}%</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-0 bg-white/95 shadow-xl backdrop-blur-lg transition-all duration-300 hover:bg-white">
                                        <CardContent className="p-4 text-center">
                                            <Clock className="mx-auto mb-2 h-8 w-8 text-emerald-600" />
                                            <p className="text-sm font-semibold text-emerald-600">Temps restant</p>
                                            <p className="text-lg font-bold text-emerald-600">{selectedPoint.fuel.estimatedTime}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Third column - Project Details + Chat */}
                            <div className="flex-1 space-y-4">
                                <Card className="hover:shadow-3xl border-0 bg-white/95 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:bg-white">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                                            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2">
                                                <Navigation className="h-5 w-5 text-white" />
                                            </div>
                                            Détails du Projet
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="hide-scrollbar custom-scroll max-h-80 space-y-5" style={{ overflowY: 'auto' }}>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-none text-blue-700">
                                                    <MapPinCheckInside className="h-10 w-8" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-l font-bold text-gray-900">{selectedPoint.title}</p>
                                                    <p className="text-sm font-medium text-gray-600">{selectedPoint.address}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3 border-t border-gray-200 pt-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-gray-600">Durée estimée</span>
                                                    <span className="text-grey-600 font-bold">{selectedPoint.estimatedTime}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-gray-600">Statut</span>
                                                    <Badge variant="outline" className={`font-medium ${getStatusBadgeColor(selectedPoint.status)}`}>
                                                        {getStatusDescription(selectedPoint.status)}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-200 pt-4">
                                                <div className="rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 p-4 text-center">
                                                    <p className="mb-2 text-sm text-gray-600">Chef de Projet</p>
                                                    <p className="font-bold text-gray-900">{selectedPoint.projectManager.name}</p>
                                                    <Button
                                                        size="sm"
                                                        className="mt-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 px-4 py-2 text-white shadow-lg transition-all duration-300 hover:bg-purple-600 hover:shadow-xl"
                                                    >
                                                        <Phone className="mr-2 h-4 w-4" />
                                                        Appeler
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-200 pt-4">
                                                <p className="mb-3 text-sm font-semibold text-gray-900">
                                                    Salariés affectés au projet ({selectedPoint.employees?.length || 0})
                                                </p>
                                                <div className="hide-scrollbar custom-scroll max-h-32 space-y-2" style={{ overflowY: 'auto' }}>
                                                    {selectedPoint.employees?.map((employee: any, index: number) => (
                                                        <div
                                                            key={index}
                                                            className="rounded-4 flex cursor-pointer items-center justify-between p-2 text-xs transition-all duration-200 hover:scale-105 hover:bg-indigo-50"
                                                            onClick={() => setSelectedEmployee(employee)}
                                                        >
                                                            <span className="font-medium text-gray-900">
                                                                {employee.prenom || employee.name?.split(' ')[0]}{' '}
                                                                {employee.nom || employee.name?.split(' ')[1] || ''}
                                                            </span>
                                                            <span className="text-gray-600">{employee.role}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="hover:shadow-3xl border-0 bg-white/95 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:bg-white">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                                            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2">
                                                <MessageCircle className="h-4 w-4 text-white" />
                                            </div>
                                            Communication Projet
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="hide-scrollbar custom-scroll max-h-32 space-y-2" style={{ overflowY: 'auto' }}>
                                            <div className="flex items-start gap-2">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600">
                                                    <User className="h-3 w-3 text-white" />
                                                </div>
                                                <div className="flex-1 rounded-lg bg-blue-50 p-2">
                                                    <p className="text-xs text-gray-800">Équipe arrivée sur site, début des travaux.</p>
                                                    <p className="mt-1 text-xs text-gray-500">Il y a 5 min</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start justify-end gap-2">
                                                <div className="max-w-xs rounded-lg bg-blue-50 p-2">
                                                    <p className="text-xs text-gray-800">Parfait, tenez-moi informé des progrès!</p>
                                                    <p className="mt-1 text-xs text-gray-500">Il y a 3 min</p>
                                                </div>
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600">
                                                    <User className="h-3 w-3 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Tapez votre message..."
                                                className="flex-1 border-gray-200 text-sm focus:border-purple-500"
                                            />
                                            <Button
                                                size="sm"
                                                className="bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:bg-purple-600"
                                            >
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}

                {selectedEmployee && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <Card className="slide-in-animation w-full max-w-md border-0 bg-white shadow-2xl">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-lg font-bold text-white">
                                            {selectedEmployee.prenom?.[0] || selectedEmployee.name?.split(' ')[0]?.[0]}
                                            {selectedEmployee.nom?.[0] || selectedEmployee.name?.split(' ')[1]?.[0] || ''}
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-gray-900">
                                                {selectedEmployee.prenom || selectedEmployee.name?.split(' ')[0]}{' '}
                                                {selectedEmployee.nom || selectedEmployee.name?.split(' ')[1] || ''}
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
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                        <span className="font-medium text-gray-700">Nom complet</span>
                                        <span className="text-gray-900">
                                            {selectedEmployee.prenom || selectedEmployee.name?.split(' ')[0]}{' '}
                                            {selectedEmployee.nom || selectedEmployee.name?.split(' ')[1] || ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                        <span className="font-medium text-gray-700">Poste</span>
                                        <span className="text-gray-900">{selectedEmployee.role}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                        <span className="font-medium text-gray-700">Email</span>
                                        <span className="text-sm text-gray-900">{selectedEmployee.email}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                        <span className="font-medium text-gray-700">Téléphone</span>
                                        <span className="text-gray-900">{selectedEmployee.telephone}</span>
                                    </div>
                                    {selectedEmployee.salaire_mensuel && (
                                        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                            <span className="font-medium text-gray-700">Salaire mensuel</span>
                                            <span className="text-gray-900">{selectedEmployee.salaire_mensuel} MAD</span>
                                        </div>
                                    )}
                                    {selectedEmployee.date_embauche && (
                                        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                            <span className="font-medium text-gray-700">Date d'embauche</span>
                                            <span className="text-gray-900">
                                                {new Date(selectedEmployee.date_embauche).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                    )}
                                    {selectedEmployee.statut && (
                                        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                            <span className="font-medium text-gray-700">Statut</span>
                                            <Badge variant={selectedEmployee.statut === 'actif' ? 'default' : 'secondary'}>
                                                {selectedEmployee.statut}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <Button className="flex-1 bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:bg-green-600">
                                        <Phone className="mr-2 h-4 w-4" />
                                        Appeler
                                    </Button>
                                    <Button variant="outline" className="flex-1 bg-transparent">
                                        <MessageCircle className="mr-2 h-4 w-4" />
                                        Message
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
