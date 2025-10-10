import React, { useState, useCallback, FormEvent } from 'react';
import { router } from '@inertiajs/react';
import { Plus, Save, Calendar, Target, Eye, Edit2, Trash2, CheckCircle, Clock, AlertCircle, XCircle, Bell, X, ChevronRight, Map, BarChart3, ClipboardList } from 'lucide-react';
import AppLayout from "@/layouts/app-layout";

// Props interface for Inertia
interface PlaningsProps {
  title: string;
  plans?: Plan[];
  terrains?: Terrain[];
  projets?: Projet[];
  salaries?: Salarie[];
  mssgs?: Notification[];
  docsRequis?: DocumentRequis[];
}

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
  projet_name?: string;
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

interface DocumentRequis {
  id: number;
  nom: string;
  description: string;
  type: string;
  created_at?: string;
  updated_at?: string;
}

interface DocNeed {
  doc_req_id: number;
  file_id: string;
}

interface PlanDocument {
  doc_req_id: number;
  file_id: string;
}

interface SousPlan {
  id?: string;
  nom: string;
  description: string;
  statut: string;
  duration_days: number;
  duration_months: number;
  duration_years: number;
}

interface Plan {
  id: number;
  date_debut: string;
  date_fin: string;
  mssg: string;
  description: string;
  terrains_ids: number[];
  salarie_ids: number[];
  statut: string;
  projet_id: number;
  projet: Projet;
  plan_docs?: PlanDocument[];
  docs_ids?: number[];
  sous_plans?: SousPlan[];
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
  docs_needs?: DocNeed[];
  created_at?: string;
  updated_at?: string;
}

interface Notification {
  id: number;
  sender: string;
  receiver: string;
  message: string;
  statut: string;
  recorded_at: string;
}

interface MessageState {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  id: string;
}

interface PlanFormData {
  projet_id: string;
  plans: PlanRowData[];
  [key: string]: any; // ✅ add this
}


interface PlanRowData {
  id?: string;
  nom: string;
  description: string;
  statut: string;
  date_debut?: string; // <--- add
  date_fin?: string;
  duration_days: number;
  duration_months: number;
  duration_years: number;
  terrains_ids: number[];
  salarie_ids: number[];
  plan_docs: PlanDocument[];
  sous_plans: SousPlan[];
}

type ViewMode = 'roadmap' | 'gantt';

// Helper function to get CSRF token
const getCsrfToken = (): string => {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  return token || '';
};

// Helper function to generate consistent colors for plans
const getPlanColor = (planId: number): string => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
    '#14B8A6', '#F87171', '#A78BFA', '#34D399', '#FBBF24',
    '#8B5A2B', '#D946EF', '#F43F5E', '#22C55E', '#3B82F6'
  ];

  return colors[planId % colors.length];
};

// Helper function to get status badge and color
const getStatusConfig = (statut: string) => {
  const statusConfig = {
    'prévu': { bg: "bg-blue-100", text: "text-blue-800", color: "bg-blue-500", icon: Clock, label: "Prévu" },
    'en_cours': { bg: "bg-yellow-100", text: "text-yellow-800", color: "bg-yellow-500", icon: AlertCircle, label: "En cours" },
    'terminé': { bg: "bg-green-100", text: "text-green-800", color: "bg-green-500", icon: CheckCircle, label: "Terminé" },
    'annulé': { bg: "bg-gray-100", text: "text-gray-800", color: "bg-gray-500", icon: XCircle, label: "Annulé" }
  };

  return statusConfig[statut as keyof typeof statusConfig] || statusConfig['prévu'];
};

const getStatusBadge = (statut: string) => {
  const config = getStatusConfig(statut);
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

// Helper to calculate plan duration
const getPlanDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const recorded = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - recorded.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `il y a ${diffInSeconds}s`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `il y a ${minutes} min`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `il y a ${hours}h`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `il y a ${days}j`;
  }
};

const breadcrumbs = [
  {
    title: "Dashboard Suivi & Contrôle des Travaux",
    href: "/suivi-controle/Planing",
  },
];

export default function PlanningManagement({ title, plans: initialPlans = [], terrains: initialTerrains = [], projets: initialProjects = [], salaries: initialSalaries = [], mssgs: initialNotifications = [], docsRequis: initialDocsRequis = [] }: PlaningsProps) {
  // Core state
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [terrains, setTerrains] = useState<Terrain[]>(initialTerrains);
  const [projects, setProjects] = useState<Projet[]>(initialProjects);
  const [salaries, setSalaries] = useState<Salarie[]>(initialSalaries);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [docsRequis, setDocsRequis] = useState<DocumentRequis[]>(initialDocsRequis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageState[]>([]);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('roadmap');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<number | null>(null);

  // Popup states
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Form and selected states
  const [planFormData, setPlanFormData] = useState<PlanFormData>({
    projet_id: '',
    plans: []
  });

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deactivatingNotifications, setDeactivatingNotifications] = useState<{[key: number]: boolean}>({});

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
    setDeactivatingNotifications(prev => ({ ...prev, [notificationId]: true }));

    try {
      await fetch(`/suivi-controle/notif/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
      });

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      addMessage('success', 'Notification marquée comme lue');
    } catch (error) {
      console.error('Notification deactivation error:', error);
      addMessage('error', 'Erreur lors de la désactivation de la notification');
    } finally {
      setDeactivatingNotifications(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  // Data fetching using Inertia
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

      const { plans = [], terrains = [], projets = [], salaries = [], mssgs = [], docsRequis: docsRequisData = [] } = data;

      const processedPlans = plans.map((plan: any) => ({
        ...plan,
        date_debut: plan.date_debut || plan.date,
        date_fin: plan.date_fin || plan.date,
        terrains_ids: Array.isArray(plan.terrains_ids)
          ? plan.terrains_ids
          : (typeof plan.terrains_ids === 'string'
            ? JSON.parse(plan.terrains_ids || '[]')
            : []),
        salarie_ids: Array.isArray(plan.salarie_ids)
          ? plan.salarie_ids
          : (typeof plan.salarie_ids === 'string'
            ? JSON.parse(plan.salarie_ids || '[]')
            : []),
        plan_docs: Array.isArray(plan.plan_docs)
          ? plan.plan_docs
          : (typeof plan.plan_docs === 'string'
            ? JSON.parse(plan.plan_docs || '[]')
            : []),
        sous_plans: Array.isArray(plan.sous_plans)
          ? plan.sous_plans
          : (typeof plan.sous_plans === 'string'
            ? JSON.parse(plan.sous_plans || '[]')
            : [])
      }));

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

      const salariesWithIds = salaries.map((salarie: any) => ({
        ...salarie,
        terrain_ids: Array.isArray(salarie.terrain_ids) ? salarie.terrain_ids : [],
        projet_ids: Array.isArray(salarie.projet_ids) ? salarie.projet_ids : [],
        profils: Array.isArray(salarie.profils) ? salarie.profils : []
      }));

      const projectsWithNeeds = projets.map((projet: any) => ({
        ...projet,
        rh_needs: Array.isArray(projet.rh_needs) ? projet.rh_needs : [],
        salarie_ids: Array.isArray(projet.salarie_ids) ? projet.salarie_ids : [],
        docs_needs: Array.isArray(projet.docs_needs)
          ? projet.docs_needs
          : (typeof projet.docs_needs === 'string'
            ? JSON.parse(projet.docs_needs || '[]')
            : [])
      }));

      setPlans(processedPlans);
      setTerrains(terrainsWithProjects);
      setProjects(projectsWithNeeds);
      setSalaries(salariesWithIds);
      setNotifications(mssgs);
      setDocsRequis(docsRequisData);

    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError("Erreur lors du chargement des données. Veuillez réessayer.");
      addMessage('error', 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [addMessage]);

  // Add new plan row
  const addPlanRow = () => {
    setPlanFormData(prev => ({
      ...prev,
      plans: [...prev.plans, {
        id: `new-${Date.now()}`,
        nom: '',
        description: '',
        statut: 'prévu',
        date_debut: '',
        date_fin: '',
        duration_days: 0,
        duration_months: 0,
        duration_years: 0,
        terrains_ids: [],
        salarie_ids: [],
        plan_docs: [],
        sous_plans: []
      }]
    }));
  };

  // Remove plan row
  const removePlanRow = (index: number) => {
    setPlanFormData(prev => ({
      ...prev,
      plans: prev.plans.filter((_, i) => i !== index)
    }));
  };

  // Add sous-plan to a plan
  const addSousPlan = (planIndex: number) => {
    setPlanFormData(prev => {
      const newPlans = [...prev.plans];
      newPlans[planIndex].sous_plans.push({
        id: `sous-${Date.now()}`,
        nom: '',
        description: '',
        statut: 'prévu',
        duration_days: 0,
        duration_months: 0,
        duration_years: 0
      });
      return { ...prev, plans: newPlans };
    });
  };

  // Remove sous-plan
  const removeSousPlan = (planIndex: number, sousPlanIndex: number) => {
    setPlanFormData(prev => {
      const newPlans = [...prev.plans];
      newPlans[planIndex].sous_plans = newPlans[planIndex].sous_plans.filter((_, i) => i !== sousPlanIndex);
      return { ...prev, plans: newPlans };
    });
  };

  // Update plan field
  const updatePlanField = (planIndex: number, field: string, value: any) => {
    setPlanFormData(prev => {
      const newPlans = [...prev.plans];
      (newPlans[planIndex] as any)[field] = value;
      return { ...prev, plans: newPlans };
    });
  };

  // Update sous-plan field
  const updateSousPlanField = (planIndex: number, sousPlanIndex: number, field: string, value: any) => {
    setPlanFormData(prev => {
      const newPlans = [...prev.plans];
      (newPlans[planIndex].sous_plans[sousPlanIndex] as any)[field] = value;
      return { ...prev, plans: newPlans };
    });
  };

  // UI handlers
  const resetPlanForm = () => {
    setPlanFormData({
      projet_id: '',
      plans: []
    });
  };

  const openCreatePopup = () => {
    resetPlanForm();
    setShowCreatePopup(true);
    setError(null);
  };

  const openEditPopup = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowEditPopup(true);
    setError(null);
  };

  const openDetailsPopup = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowDetailsPopup(true);
  };

  // Form handlers using Inertia
  const handleCreatePlans = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Use Inertia router to make POST request
      router.post('/suivi-controle/plans', planFormData, {
        onSuccess: () => {
          addMessage('success', 'Plans créés avec succès');
          setShowCreatePopup(false);
          resetPlanForm();
          fetchAllData();
        },
        onError: (errors) => {
          console.error('Creation error:', errors);
          addMessage('error', 'Erreur lors de la création des plans');
        },
        onFinish: () => {
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      console.error('Submission error:', error);
      addMessage('error', 'Erreur lors de la soumission');
      setIsSubmitting(false);
    }
  };

  // Get filtered plans for display
  const getFilteredPlans = () => {
    let filtered = plans;

    if (selectedProjectFilter !== null) {
      filtered = filtered.filter(plan => plan.projet_id === selectedProjectFilter);
    }

    return filtered;
  };

  // Roadmap View Renderer
  const renderRoadmapView = () => {
    const filteredPlans = getFilteredPlans();
    const completedPlans = filteredPlans.filter(p => p.statut === 'terminé');
    const inProgressPlans = filteredPlans.filter(p => p.statut === 'en_cours');
    const plannedPlans = filteredPlans.filter(p => p.statut === 'prévu');
    const cancelledPlans = filteredPlans.filter(p => p.statut === 'annulé');

    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Project Roadmap</h2>

        <div className="relative">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            <defs>
              <linearGradient id="roadmapGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
                <stop offset="33%" style={{ stopColor: '#F59E0B', stopOpacity: 1 }} />
                <stop offset="66%" style={{ stopColor: '#10B981', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path
              d="M 80 100 Q 250 50, 400 100 T 720 100 Q 900 50, 1000 100"
              stroke="url(#roadmapGradient)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          <div className="relative grid grid-cols-4 gap-8 py-12" style={{ zIndex: 1 }}>
            {/* Completed Phase */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4 cursor-pointer hover:scale-110 transition-transform">
                {completedPlans.length}
              </div>
              <h3 className="text-lg font-bold text-green-700 mb-2">Terminé</h3>
              <p className="text-sm text-gray-600 text-center mb-4">Plans achevés avec succès</p>
              <div className="w-full space-y-2">
                {completedPlans.slice(0, 3).map(plan => (
                  <div
                    key={plan.id}
                    onClick={() => openDetailsPopup(plan)}
                    className="bg-green-50 border border-green-200 rounded-lg p-3 cursor-pointer hover:bg-green-100 transition-colors"
                  >
                    <div className="font-medium text-sm text-green-900 truncate">{plan.mssg || plan.description}</div>
                    <div className="text-xs text-green-700 mt-1">{plan.projet.nom}</div>
                  </div>
                ))}
                {completedPlans.length > 3 && (
                  <div className="text-xs text-green-600 text-center">+{completedPlans.length - 3} plus</div>
                )}
              </div>
            </div>

            {/* In Progress Phase */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4 cursor-pointer hover:scale-110 transition-transform animate-pulse">
                {inProgressPlans.length}
              </div>
              <h3 className="text-lg font-bold text-yellow-700 mb-2">En Cours</h3>
              <p className="text-sm text-gray-600 text-center mb-4">Plans en cours d'exécution</p>
              <div className="w-full space-y-2">
                {inProgressPlans.slice(0, 3).map(plan => (
                  <div
                    key={plan.id}
                    onClick={() => openDetailsPopup(plan)}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 cursor-pointer hover:bg-yellow-100 transition-colors"
                  >
                    <div className="font-medium text-sm text-yellow-900 truncate">{plan.mssg || plan.description}</div>
                    <div className="text-xs text-yellow-700 mt-1">{plan.projet.nom}</div>
                  </div>
                ))}
                {inProgressPlans.length > 3 && (
                  <div className="text-xs text-yellow-600 text-center">+{inProgressPlans.length - 3} plus</div>
                )}
              </div>
            </div>

            {/* Planned Phase */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4 cursor-pointer hover:scale-110 transition-transform">
                {plannedPlans.length}
              </div>
              <h3 className="text-lg font-bold text-blue-700 mb-2">Prévu</h3>
              <p className="text-sm text-gray-600 text-center mb-4">Plans à venir</p>
              <div className="w-full space-y-2">
                {plannedPlans.slice(0, 3).map(plan => (
                  <div
                    key={plan.id}
                    onClick={() => openDetailsPopup(plan)}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-3 cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    <div className="font-medium text-sm text-blue-900 truncate">{plan.mssg || plan.description}</div>
                    <div className="text-xs text-blue-700 mt-1">{plan.projet.nom}</div>
                  </div>
                ))}
                {plannedPlans.length > 3 && (
                  <div className="text-xs text-blue-600 text-center">+{plannedPlans.length - 3} plus</div>
                )}
              </div>
            </div>

            {/* Cancelled Phase */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4 cursor-pointer hover:scale-110 transition-transform">
                {cancelledPlans.length}
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">Annulé</h3>
              <p className="text-sm text-gray-600 text-center mb-4">Plans annulés</p>
              <div className="w-full space-y-2">
                {cancelledPlans.slice(0, 3).map(plan => (
                  <div
                    key={plan.id}
                    onClick={() => openDetailsPopup(plan)}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="font-medium text-sm text-gray-900 truncate line-through">{plan.mssg || plan.description}</div>
                    <div className="text-xs text-gray-700 mt-1">{plan.projet.nom}</div>
                  </div>
                ))}
                {cancelledPlans.length > 3 && (
                  <div className="text-xs text-gray-600 text-center">+{cancelledPlans.length - 3} plus</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Gantt View Renderer
  const renderGanttView = () => {
    const filteredPlans = getFilteredPlans();

    if (filteredPlans.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-12 text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">Aucun plan à afficher</p>
        </div>
      );
    }

    const allDates = filteredPlans.flatMap(p => [new Date(p.date_debut), new Date(p.date_fin)]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));

    const monthMarkers = [];
    let currentDate = new Date(minDate);
    while (currentDate <= maxDate) {
      monthMarkers.push({
        date: new Date(currentDate),
        label: currentDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        position: Math.ceil((currentDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Gantt Diagram</h2>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1200px] p-6">
            <div className="flex mb-6">
              <div className="w-64 flex-shrink-0"></div>
              <div className="flex-1 relative" style={{ height: '40px' }}>
                <div className="absolute inset-0 border-b-2 border-gray-300"></div>
                {monthMarkers.map((marker, index) => (
                  <div
                    key={index}
                    className="absolute top-0"
                    style={{ left: `${(marker.position / totalDays) * 100}%` }}
                  >
                    <div className="w-px h-2 bg-gray-400"></div>
                    <div className="text-xs text-gray-600 font-medium mt-1 -translate-x-1/2">
                      {marker.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              {filteredPlans.map((plan) => {
                const planStart = new Date(plan.date_debut);
                const planEnd = new Date(plan.date_fin);
                const planStartPos = Math.ceil((planStart.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
                const planDuration = Math.ceil((planEnd.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                const planWidth = (planDuration / totalDays) * 100;
                const planLeft = (planStartPos / totalDays) * 100;
                const planColor = getPlanColor(plan.id);

                const sousPlans = plan.sous_plans || [];

                return (
                  <div key={plan.id} className="border-b border-gray-100 py-2">
                    <div className="flex items-center group hover:bg-gray-50 transition-colors">
                      <div className="w-64 flex-shrink-0 pr-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openDetailsPopup(plan)}
                            className="text-left flex-1"
                          >
                            <div className="font-medium text-sm text-gray-900 truncate">
                              {plan.mssg || plan.description}
                            </div>
                            <div className="text-xs text-gray-500 truncate">{plan.projet.nom}</div>
                          </button>
                          {getStatusBadge(plan.statut)}
                        </div>
                      </div>
                      <div className="flex-1 relative" style={{ height: '40px' }}>
                        <div
                          className="absolute top-1/2 -translate-y-1/2 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow group"
                          style={{
                            left: `${planLeft}%`,
                            width: `${planWidth}%`,
                            backgroundColor: planColor,
                            height: '32px',
                            minWidth: '40px'
                          }}
                          onClick={() => openDetailsPopup(plan)}
                        >
                          <div className="h-full flex items-center px-3 text-white text-xs font-medium truncate">
                            {planDuration}j
                          </div>
                        </div>
                      </div>
                    </div>

                    {sousPlans.length > 0 && (
                      <div className="ml-8 mt-2 space-y-1">
                        {sousPlans.map((sousPlan, spIndex) => (
                          <div key={spIndex} className="flex items-center text-sm py-1">
                            <div className="w-56 flex-shrink-0 pr-4 flex items-center gap-2">
                              <ChevronRight className="w-3 h-3 text-gray-400" />
                              <div className="flex-1">
                                <div className="text-xs text-gray-700 truncate">{sousPlan.nom}</div>
                              </div>
                              {getStatusBadge(sousPlan.statut)}
                            </div>
                            <div className="flex-1 relative" style={{ height: '24px' }}>
                              <div
                                className="absolute top-1/2 -translate-y-1/2 rounded bg-opacity-60 border-2"
                                style={{
                                  left: `${planLeft + 2}%`,
                                  width: `${Math.max(planWidth / (sousPlans.length + 1), 5)}%`,
                                  backgroundColor: planColor,
                                  borderColor: planColor,
                                  height: '20px',
                                  minWidth: '30px'
                                }}
                              >
                                <div className="h-full flex items-center justify-center text-white text-xs font-medium">
                                  {sousPlan.duration_days + sousPlan.duration_months * 30 + sousPlan.duration_years * 365}j
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">

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
                  <p className="text-sm font-medium text-gray-600">Terminés</p>
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
                <div className="p-2 bg-blue-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Prévus</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {plans.filter(p => p.statut === 'prévu').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* View Controls */}
          <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="inline-flex rounded-lg border border-gray-300 p-1">
                  <button
                    onClick={() => setViewMode('roadmap')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'roadmap'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Map className="w-4 h-4 inline mr-2" />
                    Roadmap
                  </button>
                  <button
                    onClick={() => setViewMode('gantt')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'gantt'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Gantt
                  </button>
                </div>

                <select
                  value={selectedProjectFilter === null ? "" : selectedProjectFilter.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedProjectFilter(value === "" ? null : Number(value));
                  }}
                  className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tous les projets</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.nom}
                    </option>
                  ))}
                </select>

                {selectedProjectFilter !== null && (
                  <button
                    onClick={() => setSelectedProjectFilter(null)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Effacer le filtre
                  </button>
                )}
              </div>

              <button
                onClick={openCreatePopup}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Planifier
              </button>
            </div>

            {viewMode === 'roadmap' ? renderRoadmapView() : renderGanttView()}
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
              <div className="bg-white rounded-lg p-6 w-full max-w-7xl max-h-[90vh] overflow-y-auto m-4">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  {showCreatePopup ? "Planifier" : "Modifier le plan"}
                </h3>

                <form onSubmit={handleCreatePlans} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Projet *</label>
                    <select
                      value={planFormData.projet_id}
                      onChange={(e) => setPlanFormData(prev => ({ ...prev, projet_id: e.target.value }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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

                  <div className="flex justify-between items-center border-t pt-4">
                    <h4 className="text-md font-medium text-gray-900">Plans</h4>
                    <button
                      type="button"
                      onClick={addPlanRow}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter un plan
                    </button>
                  </div>

                  {planFormData.plans.map((plan, planIndex) => (
                    <div key={plan.id || planIndex} className="border rounded-lg p-4 space-y-4 bg-gray-50">
                      <div className="flex justify-between items-center">
                        <h5 className="font-medium text-gray-900">Plan #{planIndex + 1}</h5>
                        <button
                          type="button"
                          onClick={() => removePlanRow(planIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nom du Plan *</label>
                          <input
                            type="text"
                            value={plan.nom}
                            onChange={(e) => updatePlanField(planIndex, 'nom', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Statut</label>
                          <select
                            value={plan.statut}
                            onChange={(e) => updatePlanField(planIndex, 'statut', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="prévu">Prévu</option>
                            <option value="en_cours">En cours</option>
                            <option value="terminé">Terminé</option>
                            <option value="annulé">Annulé</option>
                          </select>
                        </div>

                        {/* Date début */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Date début *</label>
                          <input
                            type="date"
                            value={plan.date_debut || ''}
                            onChange={(e) => updatePlanField(planIndex, 'date_debut', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                            disabled={isSubmitting}
                          />
                        </div>

                        {/* Date fin */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Date fin *</label>
                          <input
                            type="date"
                            value={plan.date_fin || ''}
                            onChange={(e) => updatePlanField(planIndex, 'date_fin', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                            disabled={isSubmitting}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">Description</label>
                          <textarea
                            value={plan.description}
                            onChange={(e) => updatePlanField(planIndex, 'description', e.target.value)}
                            rows={2}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Durée (Jours)</label>
                          <input
                            type="number"
                            min="0"
                            value={plan.duration_days}
                            onChange={(e) => updatePlanField(planIndex, 'duration_days', parseInt(e.target.value) || 0)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Durée (Mois)</label>
                          <input
                            type="number"
                            min="0"
                            value={plan.duration_months}
                            onChange={(e) => updatePlanField(planIndex, 'duration_months', parseInt(e.target.value) || 0)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Durée (Années)</label>
                          <input
                            type="number"
                            min="0"
                            value={plan.duration_years}
                            onChange={(e) => updatePlanField(planIndex, 'duration_years', parseInt(e.target.value) || 0)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center mb-3">
                          <h6 className="text-sm font-medium text-gray-900">Sous-Plans (Tâches)</h6>
                          <button
                            type="button"
                            onClick={() => addSousPlan(planIndex)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            <Plus className="w-3 h-3" />
                            Sous-Plan
                          </button>
                        </div>

                        {plan.sous_plans.map((sousPlan, spIndex) => (
                          <div key={sousPlan.id || spIndex} className="ml-4 border-l-2 border-blue-300 pl-4 mb-3 bg-white p-3 rounded">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-medium text-gray-700">Sous-Plan N°{spIndex + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeSousPlan(planIndex, spIndex)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Nom *</label>
                                <input
                                  type="text"
                                  value={sousPlan.nom}
                                  onChange={(e) => updateSousPlanField(planIndex, spIndex, 'nom', e.target.value)}
                                  className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700">Statut</label>
                                <select
                                  value={sousPlan.statut}
                                  onChange={(e) => updateSousPlanField(planIndex, spIndex, 'statut', e.target.value)}
                                  className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="prévu">Prévu</option>
                                  <option value="en_cours">En cours</option>
                                  <option value="terminé">Terminé</option>
                                  <option value="annulé">Annulé</option>
                                </select>
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700">Description</label>
                                <textarea
                                  value={sousPlan.description}
                                  onChange={(e) => updateSousPlanField(planIndex, spIndex, 'description', e.target.value)}
                                  rows={2}
                                  className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700">Jours</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={sousPlan.duration_days}
                                  onChange={(e) => updateSousPlanField(planIndex, spIndex, 'duration_days', parseInt(e.target.value) || 0)}
                                  className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700">Mois</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={sousPlan.duration_months}
                                  onChange={(e) => updateSousPlanField(planIndex, spIndex, 'duration_months', parseInt(e.target.value) || 0)}
                                  className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700">Années</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={sousPlan.duration_years}
                                  onChange={(e) => updateSousPlanField(planIndex, spIndex, 'duration_years', parseInt(e.target.value) || 0)}
                                  className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        {plan.sous_plans.length === 0 && (
                          <p className="text-sm text-gray-500 italic ml-4">Aucun sous-plan ajouté</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {planFormData.plans.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Aucun plan ajouté. Cliquez sur "Ajouter un plan" pour commencer.</p>
                    </div>
                  )}

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
                      disabled={isSubmitting || !planFormData.projet_id || planFormData.plans.length === 0}
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
              <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[80vh] overflow-y-auto m-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Détails du Plan - {selectedPlan.mssg || selectedPlan.description}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDetailsPopup(false);
                        openEditPopup(selectedPlan);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDetailsPopup(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">Projet:</span>
                      <p className="text-gray-900">{selectedPlan.projet.nom}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Date début:</span>
                      <p className="text-gray-900">{formatDate(selectedPlan.date_debut)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Date fin:</span>
                      <p className="text-gray-900">{formatDate(selectedPlan.date_fin)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Durée:</span>
                      <p className="text-gray-900">
                        {getPlanDuration(selectedPlan.date_debut, selectedPlan.date_fin)} jours
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Statut:</span>
                      <div className="mt-1">{getStatusBadge(selectedPlan.statut)}</div>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Description:</span>
                    <p className="text-gray-900 mt-1">{selectedPlan.description || 'Aucune description'}</p>
                  </div>

                  {selectedPlan.sous_plans && selectedPlan.sous_plans.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">Sous-Plans (Tâches)</h4>
                      <div className="space-y-2">
                        {selectedPlan.sous_plans.map((sp, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-sm">{sp.nom}</span>
                              {getStatusBadge(sp.statut)}
                            </div>
                            <p className="text-xs text-gray-600">{sp.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Durée: {sp.duration_years}a {sp.duration_months}m {sp.duration_days}j
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                  <button
                    onClick={() => setShowDetailsPopup(false)}
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
  );
}