//import React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
  Plus, Save, MapPin, Users, Calendar, Target,
  Eye, Edit2, Trash2, UserPlus, UserMinus, CheckCircle,
  Clock, AlertCircle, XCircle, Filter, Zap, Phone,
  FileText, X, Bell, ChevronDown, ChevronRight
} from 'lucide-react';
import AppLayout from "@/layouts/app-layout"

// Types matching backend models
interface Point {
  lat: number;
  lng: number;
}

interface Terrain {
  id: number;
  name: string;
  description: string;
  points: Point[];
  surface: number;
  radius: number;
  projet_id: number;
  statut_tech: string;
  statut_final: string;
  salarie_ids: number[];
  projet?: Projet;
}

interface Profil {
  id: number;
  nom_profil: string;
  poste_profil: string;
}

interface Salarie {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  salaire_mensuel?: number;
  date_embauche?: string;
  statut: string;
  emplacement?: string;
  terrain_ids?: number[];
  projet_ids?: number[];
  profils?: Profil[];
}

interface Plan {
  id: number;
  date: string;
  mssg: string;
  description: string;
  terrains_ids: number[];
  salarie_ids: number[];
  statut: string;
  projet_id: number;
  projet: Projet;
  created_at?: string;
  updated_at?: string;
}

interface Projet {
  id: number;
  nom: string;
  description: string;
  budget_total?: string;
  budget_utilise?: string;
  date_debut: string;
  date_fin: string;
  statut: string;
  client?: string;
  lieu_realisation?: string;
  responsable_id?: number;
  type_projet?: string;
  latitude?: string;
  longitude?: string;
  radius?: string;
  terrain_ids?: number[];
  rh_needs?: any[];
  salarie_ids?: number[];
  created_at?: string;
  updated_at?: string;
}

interface MessageState {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  id: string;
}

interface PlanFormData {
  projet_id: string;
  date: string;
  mssg: string;
  description: string;
  terrains_ids: number[];
  salarie_ids: number[];
  statut: string;
}

// Helper function to get CSRF token
const getCsrfToken = (): string => {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  return token || '';
};

// Helper function to get status badge
const getStatusBadge = (statut: string) => {
  const statusConfig = {
    'prévu': { bg: "bg-blue-100", text: "text-blue-800", icon: Clock, label: "Prévu" },
    'en_cours': { bg: "bg-yellow-100", text: "text-yellow-800", icon: AlertCircle, label: "En cours" },
    'terminé': { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle, label: "Terminé" },
    'annulé': { bg: "bg-gray-100", text: "text-gray-800", icon: XCircle, label: "Annulé" }
  };

  const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig['prévu'];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// Text truncation component
const TruncatedText = ({ text, maxLength = 50, className = "" }: { 
  text: string; 
  maxLength?: number; 
  className?: string; 
}) => {
  if (!text) return <span className={className}>-</span>;
  
  if (text.length <= maxLength) {
    return <span className={className}>{text}</span>;
  }
  
  return (
    <span className={`${className} cursor-help`} title={text}>
      {text.substring(0, maxLength)}...
    </span>
  );
};

// Helper function to extract error message
const extractErrorMessage = (errors: any): string => {
  if (typeof errors === 'string') {
    return errors;
  }

  if (errors && typeof errors === 'object') {
    if (errors.message) {
      return errors.message;
    }

    if (errors.errors) {
      const errorMessages = Object.values(errors.errors).flat();
      return errorMessages.join(', ');
    }

    const allMessages = Object.values(errors).flat().filter(msg => typeof msg === 'string');
    if (allMessages.length > 0) {
      return allMessages.join(', ');
    }

    try {
      return JSON.stringify(errors);
    } catch {
      return 'Erreur inconnue';
    }
  }

  return 'Erreur inconnue';
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
const breadcrumbs = [
  {
    title: "Dashboard Suivi & Contrôle des Travaux",
    href: "/suivi-controle/Planing",
  },
]
export default function PlanningManagement() {
  // Core state
  const [plans, setPlans] = useState<Plan[]>([]);
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [projects, setProjects] = useState<Projet[]>([]);
  const [salaries, setSalaries] = useState<Salarie[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageState[]>([]);

  // Filter states
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [filterType, setFilterType] = useState<'Day' | 'Month' | 'Year'>('Day');

  // Popup states
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Form and selected states
  const [planFormData, setPlanFormData] = useState<PlanFormData>({
    projet_id: '',
    date: '',
    mssg: '',
    description: '',
    terrains_ids: [],
    salarie_ids: [],
    statut: 'prévu'
  });
  
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
    const [deactivatingNotifications, setDeactivatingNotifications] = useState<{[key: number]: boolean}>({})
  
  // Message handling
  const addMessage = useCallback((type: MessageState['type'], message: string) => {
    const id = Date.now().toString();
    const newMessage: MessageState = { type, message, id };
    setMessages(prev => [...prev, newMessage]);

    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== id));
    }, 5000);
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);
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

  // Data fetching with regular fetch - Fixed to handle JSON responses
  const fetchAllData = useCallback(async () => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await fetch("/suivi-controle/fetch-plans", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur réseau: ${response.status}`);
      }

      const data = await response.json();

      // Destructure with default values
      const { plans = [], terrains = [], projets = [], salaries = [], mssgs = [] } = data;

      // Process plans data - handle JSON strings properly
      const processedPlans = plans.map((plan: any) => ({
        ...plan,
        terrains_ids: Array.isArray(plan.terrains_ids) 
          ? plan.terrains_ids 
          : (typeof plan.terrains_ids === 'string' 
              ? JSON.parse(plan.terrains_ids || '[]')
              : []),
        salarie_ids: Array.isArray(plan.salarie_ids)
          ? plan.salarie_ids
          : (typeof plan.salarie_ids === 'string'
              ? JSON.parse(plan.salarie_ids || '[]')
              : [])
      }));

      // Add project names to terrains and ensure proper salarie_ids array
      const terrainsWithProjects = terrains.map((terrain: any) => {
        const projet = projets.find((p: any) => p.id === terrain.projet_id);
        return { 
          ...terrain, 
          projet_name: projet?.nom || "Projet inconnu",
          surface: Number(terrain.surface) || 0,
          radius: Number(terrain.radius) || 0,
          salarie_ids: Array.isArray(terrain.salarie_ids) ? terrain.salarie_ids : []
        };
      });

      // Ensure salaries have proper arrays for terrain_ids and projet_ids
      const salariesWithIds = salaries.map((salarie: any) => ({
        ...salarie,
        terrain_ids: Array.isArray(salarie.terrain_ids) ? salarie.terrain_ids : [],
        projet_ids: Array.isArray(salarie.projet_ids) ? salarie.projet_ids : [],
        profils: Array.isArray(salarie.profils) ? salarie.profils : [],
        salarie_ids: Array.isArray(salarie.salarie_ids) ? salarie.salarie_ids : []
      }));

      // Process projects with rh_needs and salarie_ids
      const projectsWithNeeds = projets.map((projet: any) => ({
        ...projet,
        rh_needs: Array.isArray(projet.rh_needs) ? projet.rh_needs : [],
        salarie_ids: Array.isArray(projet.salarie_ids) ? projet.salarie_ids : []
      }));

      console.log('Data fetched successfully:', {
        plans: processedPlans.length,
        terrains: terrainsWithProjects.length,
        projets: projectsWithNeeds.length,
        salaries: salariesWithIds.length,
        notifications: mssgs.length
      });

      setPlans(processedPlans);
      setTerrains(terrainsWithProjects);
      setProjects(projectsWithNeeds);
      setSalaries(salariesWithIds);
      setNotifications(mssgs);
      
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError("Erreur lors du chargement des données. Veuillez réessayer.");
      addMessage('error', 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [addMessage]);

  useEffect(() => { 
    fetchAllData(); 
  }, [fetchAllData]);

  // Form handlers with Inertia router - Updated to use Inertia instead of fetch
  const handleCreatePlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      ...planFormData,
      projet_id: parseInt(planFormData.projet_id),
      statut: planFormData.statut || 'prévu'
    };

    console.log('Creating plan with payload:', payload);

    router.post('/suivi-controle/plans', payload, {
      onSuccess: (page) => {
        addMessage('success', 'Plan créé avec succès');
        // Refresh data after successful creation
        fetchAllData();
        setShowCreatePopup(false);
        resetPlanForm();
        setIsSubmitting(false);
      },
      onError: (errors) => {
        console.error('Create plan error:', errors);
        const errorMsg = extractErrorMessage(errors);
        setError(errorMsg);
        addMessage('error', errorMsg);
        setIsSubmitting(false);
      },
      onFinish: () => {
        setIsSubmitting(false);
      }
    });
  };

  const handleUpdatePlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPlan) return;
    
    setIsSubmitting(true);
    setError(null);

    const payload = {
      ...planFormData,
      projet_id: parseInt(planFormData.projet_id)
    };

    console.log('Updating plan with payload:', payload);

    router.put(`/suivi-controle/plans/${selectedPlan.id}`, payload, {
      onSuccess: (page) => {
        addMessage('success', 'Plan modifié avec succès');
        // Refresh data after successful update
        fetchAllData();
        setShowEditPopup(false);
        setSelectedPlan(null);
        resetPlanForm();
        setIsSubmitting(false);
      },
      onError: (errors) => {
        console.error('Update plan error:', errors);
        const errorMsg = extractErrorMessage(errors);
        setError(errorMsg);
        addMessage('error', errorMsg);
        setIsSubmitting(false);
      },
      onFinish: () => {
        setIsSubmitting(false);
      }
    });
  };

  const handleDeletePlan = async (planId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce plan ?")) return;

    setError(null);

    router.delete(`/suivi-controle/plans/${planId}`, {
      onSuccess: (page) => {
        addMessage('success', 'Plan supprimé avec succès');
        // Refresh data after successful deletion
        fetchAllData();
      },
      onError: (errors) => {
        console.error('Delete plan error:', errors);
        const errorMsg = extractErrorMessage(errors);
        setError(errorMsg);
        addMessage('error', errorMsg);
      }
    });
  };

  // UI handlers
  const resetPlanForm = () => {
    setPlanFormData({
      projet_id: '',
      date: '',
      mssg: '',
      description: '',
      terrains_ids: [],
      salarie_ids: [],
      statut: 'prévu'
    });
  };

  const openCreatePopup = () => {
    resetPlanForm();
    setShowCreatePopup(true);
    setError(null);
  };

  const openEditPopup = (plan: Plan) => {
    setSelectedPlan(plan);
    setPlanFormData({
      projet_id: plan.projet_id.toString(),
      date: plan.date.split('T')[0],
      mssg: plan.mssg || '',
      description: plan.description || '',
      terrains_ids: plan.terrains_ids || [],
      salarie_ids: plan.salarie_ids || [],
      statut: plan.statut
    });
    setShowEditPopup(true);
    setError(null);
  };

  const openDetailsPopup = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowDetailsPopup(true);
  };

  const toggleSalarieInPlan = (salarieId: number) => {
    setPlanFormData(prev => ({
      ...prev,
      salarie_ids: prev.salarie_ids.includes(salarieId)
        ? prev.salarie_ids.filter(id => id !== salarieId)
        : [...prev.salarie_ids, salarieId]
    }));
  };

  const toggleTerrainInPlan = (terrainId: number) => {
    setPlanFormData(prev => ({
      ...prev,
      terrains_ids: prev.terrains_ids.includes(terrainId)
        ? prev.terrains_ids.filter(id => id !== terrainId)
        : [...prev.terrains_ids, terrainId]
    }));
  };

  // Filter logic
  const getFilteredPlans = () => {
    let filtered = plans;

    // Filter by project
    if (selectedProjectFilter !== null) {
      filtered = filtered.filter(plan => plan.projet_id === selectedProjectFilter);
    }

    // Filter by date
    if (selectedDate) {
      const filterDate = new Date(selectedDate);
      filtered = filtered.filter(plan => {
        const planDate = new Date(plan.date);
        
        switch (filterType) {
          case 'Day':
            return planDate.toDateString() === filterDate.toDateString();
          case 'Month':
            return planDate.getMonth() === filterDate.getMonth() && 
                   planDate.getFullYear() === filterDate.getFullYear();
          case 'Year':
            return planDate.getFullYear() === filterDate.getFullYear();
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  // Group plans by date
  const getGroupedPlans = () => {
    const filteredPlans = getFilteredPlans();
    const grouped: { [key: string]: Plan[] } = {};

    filteredPlans.forEach(plan => {
      const dateKey = plan.date.split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(plan);
    });

    // Sort dates
    const sortedDates = Object.keys(grouped).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    return sortedDates.map(date => ({
      date,
      plans: grouped[date].sort((a, b) => a.id - b.id)
    }));
  };

  const toggleDateExpansion = (date: string) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  // Get terrain and salarie details for display with project names
  const getTerrainDetails = (terrainIds: number[]) => {
    return terrainIds.map(id => {
      const terrain = terrains.find(t => t.id === id);
      const project = terrain ? projects.find(p => p.id === terrain.projet_id) : null;
      return {
        id,
        name: terrain?.name || `Terrain #${id}`,
        projectName: project?.nom || 'Projet inconnu',
        surface: terrain?.surface || 0,
        status: terrain?.statut_tech || 'Non défini'
      };
    });
  };

  const getSalarieDetails = (salarieIds: number[]) => {
    return salarieIds.map(id => {
      const salarie = salaries.find(s => s.id === id);
      const profil = salarie?.profils?.[0];
      return {
        id,
        fullName: salarie ? `${salarie.nom} ${salarie.prenom}` : `Salarié #${id}`,
        poste: profil ? `${profil.nom_profil} - ${profil.poste_profil}` : 'Poste non défini',
        email: salarie?.email || 'Email non défini',
        telephone: salarie?.telephone || 'Téléphone non défini',
        salaire: salarie?.salaire_mensuel || 0
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des plannings...</p>
        </div>
      </div>
    );
  }

  const groupedPlans = getGroupedPlans();

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Planification des Projets</h1>
          
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
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Plans</p>
                <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Plans Terminés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {plans.filter(p => p.statut === 'terminé').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">En Cours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {plans.filter(p => p.statut === 'en_cours').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Projets Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Planning Controls */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
          {/* First Line: Planifier Button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Gestion des Plannings</h2>
            <button
              onClick={openCreatePopup}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Planifier
            </button>
          </div>

          {/* Second Line: Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Projet</label>
              <select
                value={selectedProjectFilter === null ? "" : selectedProjectFilter.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedProjectFilter(value === "" ? null : Number(value));
                }}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les projets</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtrer par</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'Day' | 'Month' | 'Year')}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Day">Jour</option>
                <option value="Month">Mois</option>
                <option value="Year">Année</option>
              </select>
            </div>
          </div>

          {/* Planning Table */}
          <div className="space-y-4">
            {groupedPlans.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun planning</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Commencez par créer votre premier planning.
                </p>
              </div>
            ) : (
              groupedPlans.map(({ date, plans: datePlans }) => (
                <div key={date} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Date Header */}
                  <div 
                    className="bg-gray-50 px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleDateExpansion(date)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedDates.has(date) ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                        <h3 className="text-lg font-medium text-gray-900">
                          {formatDate(date)}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {datePlans.length} plan{datePlans.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Plans Cards */}
                  {expandedDates.has(date) && (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {datePlans.map(plan => {
                          const terrainDetails = getTerrainDetails(plan.terrains_ids);
                          const salarieDetails = getSalarieDetails(plan.salarie_ids);

                          return (
                            <div
                              key={plan.id}
                              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => openDetailsPopup(plan)}
                            >
                              {/* Card Header */}
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                                    <TruncatedText text={plan.mssg} maxLength={30} />
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    <TruncatedText text={plan.projet.nom} maxLength={25} />
                                  </p>
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditPopup(plan);
                                    }}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Modifier"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeletePlan(plan.id);
                                    }}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Card Content */}
                              <div className="space-y-2 text-xs">
                                <div>
                                  <span className="font-medium text-gray-700">Description:</span>
                                  <p className="text-gray-600 mt-1">
                                    <TruncatedText text={plan.description || 'Aucune description'} maxLength={50} />
                                  </p>
                                </div>

                                <div>
                                  <span className="font-medium text-gray-700">Terrains:</span>
                                  {terrainDetails.length > 0 ? (
                                    <div className="mt-1">
                                      {terrainDetails.slice(0, 2).map((terrain, index) => (
                                        <div key={index} className="text-gray-600">
                                          <TruncatedText text={`${terrain.name} / ${terrain.projectName}`} maxLength={35} />
                                        </div>
                                      ))}
                                      {terrainDetails.length > 2 && (
                                        <div className="text-blue-600 text-xs">
                                          +{terrainDetails.length - 2} autre{terrainDetails.length - 2 > 1 ? 's' : ''}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-gray-500 mt-1">Aucun terrain</p>
                                  )}
                                </div>

                                <div>
                                  <span className="font-medium text-gray-700">Salariés:</span>
                                  {salarieDetails.length > 0 ? (
                                    <div className="mt-1">
                                      {salarieDetails.slice(0, 2).map((salarie, index) => (
                                        <div key={index} className="text-gray-600">
                                          <TruncatedText text={`${salarie.fullName} (${salarie.poste})`} maxLength={30} />
                                        </div>
                                      ))}
                                      {salarieDetails.length > 2 && (
                                        <div className="text-blue-600 text-xs">
                                          +{salarieDetails.length - 2} autre{salarieDetails.length - 2 > 1 ? 's' : ''}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-gray-500 mt-1">Aucun salarié</p>
                                  )}
                                </div>

                                <div className="pt-2 border-t border-gray-100">
                                  {getStatusBadge(plan.statut)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
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

        {/* Create/Edit Plan Popup */}
        {(showCreatePopup || showEditPopup) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto m-4">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                {showCreatePopup ? "Créer un plan" : "Modifier le plan"}
              </h3>

              <form onSubmit={showCreatePopup ? handleCreatePlan : handleUpdatePlan} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Projet *</label>
                    <select
                      value={planFormData.projet_id}
                      onChange={(e) => setPlanFormData(prev => ({ ...prev, projet_id: e.target.value }))}
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
                    <label className="block text-sm font-medium text-gray-700">Date *</label>
                    <input
                      type="date"
                      value={planFormData.date}
                      onChange={(e) => setPlanFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <input
                      type="text"
                      value={planFormData.mssg}
                      onChange={(e) => setPlanFormData(prev => ({ ...prev, mssg: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Message du plan"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Statut</label>
                    <select
                      value={planFormData.statut}
                      onChange={(e) => setPlanFormData(prev => ({ ...prev, statut: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      disabled={isSubmitting}
                    >
                      <option value="prévu">Prévu</option>
                      <option value="en_cours">En cours</option>
                      <option value="terminé">Terminé</option>
                      <option value="annulé">Annulé</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={planFormData.description}
                      onChange={(e) => setPlanFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Description détaillée du plan"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Salaries and Terrains Selection */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Salaries Table */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Salariés ({planFormData.salarie_ids.length} sélectionnés)
                    </label>
                    <div className="border rounded-md max-h-80 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Poste</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {salaries
                            .filter(s => s.emplacement === 'terrain')
                            .map((salarie) => {
                              const isSelected = planFormData.salarie_ids.includes(salarie.id);
                              const profil = salarie.profils?.[0];

                              return (
                                <tr key={salarie.id} className={isSelected ? "bg-green-50" : "hover:bg-gray-50"}>
                                  <td className="px-3 py-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      {isSelected && <CheckCircle className="w-4 h-4 text-green-600" />}
                                      <TruncatedText text={`${salarie.nom} ${salarie.prenom}`} maxLength={20} />
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-xs text-gray-500">
                                    <TruncatedText 
                                      text={profil ? `${profil.nom_profil} - ${profil.poste_profil}` : 'Non défini'} 
                                      maxLength={25} 
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <button
                                      type="button"
                                      onClick={() => toggleSalarieInPlan(salarie.id)}
                                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                                        isSelected
                                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                                          : "bg-green-100 text-green-700 hover:bg-green-200"
                                      }`}
                                    >
                                      {isSelected ? (
                                        <>
                                          <UserMinus className="w-3 h-3" />
                                          Retirer
                                        </>
                                      ) : (
                                        <>
                                          <UserPlus className="w-3 h-3" />
                                          Ajouter
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
                  </div>

                  {/* Terrains Table */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Terrains ({planFormData.terrains_ids.length} sélectionnés)
                    </label>
                    <div className="border rounded-md max-h-80 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Terrain</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Projet</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {terrains
                            .filter(t => !planFormData.projet_id || t.projet_id.toString() === planFormData.projet_id)
                            .map((terrain) => {
                              const isSelected = planFormData.terrains_ids.includes(terrain.id);
                              const project = projects.find(p => p.id === terrain.projet_id);

                              return (
                                <tr key={terrain.id} className={isSelected ? "bg-green-50" : "hover:bg-gray-50"}>
                                  <td className="px-3 py-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      {isSelected && <CheckCircle className="w-4 h-4 text-green-600" />}
                                      <TruncatedText text={terrain.name} maxLength={20} />
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-xs text-gray-500">
                                    <TruncatedText text={project?.nom || 'Inconnu'} maxLength={25} />
                                  </td>
                                  <td className="px-3 py-2">
                                    <button
                                      type="button"
                                      onClick={() => toggleTerrainInPlan(terrain.id)}
                                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                                        isSelected
                                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                                          : "bg-green-100 text-green-700 hover:bg-green-200"
                                      }`}
                                    >
                                      {isSelected ? (
                                        <>
                                          <UserMinus className="w-3 h-3" />
                                          Retirer
                                        </>
                                      ) : (
                                        <>
                                          <UserPlus className="w-3 h-3" />
                                          Ajouter
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
                  </div>
                </div>

                {/* Preview Card */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Aperçu du plan</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Projet:</span>
                      <p className="text-gray-600">
                        {planFormData.projet_id 
                          ? projects.find(p => p.id.toString() === planFormData.projet_id)?.nom || 'Non sélectionné'
                          : 'Non sélectionné'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Date:</span>
                      <p className="text-gray-600">
                        {planFormData.date || 'Non définie'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Statut:</span>
                      <p className="text-gray-600">
                        {getStatusBadge(planFormData.statut)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Salariés:</span>
                      <div className="text-gray-600">
                        {planFormData.salarie_ids.length > 0 ? (
                          <div className="space-y-1">
                            {getSalarieDetails(planFormData.salarie_ids).map((salarie, index) => (
                              <div key={index} className="text-sm">
                                {salarie.fullName} ({salarie.poste})
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-500">Aucun salarié sélectionné</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Terrains:</span>
                      <div className="text-gray-600">
                        {planFormData.terrains_ids.length > 0 ? (
                          <div className="space-y-1">
                            {getTerrainDetails(planFormData.terrains_ids).map((terrain, index) => (
                              <div key={index} className="text-sm">
                                {terrain.name} / {terrain.projectName}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-500">Aucun terrain sélectionné</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreatePopup(false);
                      setShowEditPopup(false);
                      setSelectedPlan(null);
                      resetPlanForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
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
                        <span>{showCreatePopup ? "Enregistrer" : "Modifier"}</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Plan Details Popup */}
        {showDetailsPopup && selectedPlan && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[80vh] overflow-y-auto m-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Détails du Plan - {selectedPlan.mssg}
                </h3>
                <button
                  onClick={() => setShowDetailsPopup(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Projet:</span>
                    <p className="text-gray-900">{selectedPlan.projet.nom}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Date:</span>
                    <p className="text-gray-900">{formatDate(selectedPlan.date)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Statut:</span>
                    <div className="mt-1">{getStatusBadge(selectedPlan.statut)}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Message:</span>
                    <p className="text-gray-900">{selectedPlan.mssg || 'Aucun message'}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="text-gray-900 mt-1">{selectedPlan.description || 'Aucune description'}</p>
                </div>

                {/* Terrains Table */}
                <div>
                  <span className="font-medium text-gray-700 mb-3 block">Terrains Assignés:</span>
                  {selectedPlan.terrains_ids.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projet</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Surface</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {getTerrainDetails(selectedPlan.terrains_ids).map((terrain, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{terrain.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{terrain.projectName}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{terrain.surface} m²</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  terrain.status === 'terminé' ? 'bg-green-100 text-green-800' :
                                  terrain.status === 'en_cours' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {terrain.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 bg-gray-50 p-4 rounded-lg">Aucun terrain assigné</p>
                  )}
                </div>

                {/* Salaries Table */}
                <div>
                  <span className="font-medium text-gray-700 mb-3 block">Salariés Assignés:</span>
                  {selectedPlan.salarie_ids.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poste</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {getSalarieDetails(selectedPlan.salarie_ids).map((salarie, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{salarie.fullName}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{salarie.poste}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{salarie.email}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{salarie.telephone}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 bg-gray-50 p-4 rounded-lg">Aucun salarié assigné</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                <button
                  onClick={() => setShowDetailsPopup(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    setShowDetailsPopup(false);
                    openEditPopup(selectedPlan);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Modifier ce plan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </AppLayout>
  );
}