import React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Plus, Save, MapPin, Users, Calendar, Target, Eye, CreditCard as Edit2, Trash2, UserPlus, UserMinus, CheckCircle, Clock, AlertCircle, XCircle, Filter, Zap, Phone, FileText, X, Bell, ChevronDown, ChevronRight, ChevronLeft, ArrowLeft, ZoomIn, ZoomOut, CalendarDays, Download, ClipboardList } from 'lucide-react';
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

interface Document {
  nom: string;
  type: string;
  description: string;
  doc_id: number;
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
  plan_docs?: Document[];
  docs_ids?: number[];
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
  docs_needs?: Document[];
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
  date_debut: string;
  date_fin: string;
  mssg: string;
  description: string;
  terrains_ids: number[];
  salarie_ids: number[];
  statut: string;
  docs_ids: number[];
}

interface TaskFormData {
  nom: string;
  description: string;
  date_debut: string;
  date_fin: string;
  salaries_ids: number[];
  plan_id: number;
}

// Calendar view types
type CalendarView = 'yearly' | 'monthly';

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

// Calendar helper functions
const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Fixed date comparison to handle timezone issues
const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
};

const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const normalizedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const normalizedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
};

// Helper to calculate plan duration
const getPlanDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

// Helper to check if plan overlaps with month/year
const planOverlapsWithPeriod = (plan: Plan, year: number, month?: number): boolean => {
  const planStart = new Date(plan.date_debut);
  const planEnd = new Date(plan.date_fin);

  let periodStart: Date;
  let periodEnd: Date;

  if (month !== undefined) {
    // Monthly check
    periodStart = new Date(year, month, 1);
    periodEnd = new Date(year, month + 1, 0);
  } else {
    // Yearly check
    periodStart = new Date(year, 0, 1);
    periodEnd = new Date(year, 11, 31);
  }

  return planStart <= periodEnd && planEnd >= periodStart;
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

  // Enhanced calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [calendarView, setCalendarView] = useState<CalendarView>('yearly');
  const [focusedMonth, setFocusedMonth] = useState<number | null>(null);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<number | null>(null);
  const [selectedSalarieFilter, setSelectedSalarieFilter] = useState<number | null>(null);

  // Popup states
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Form and selected states
  const [planFormData, setPlanFormData] = useState<PlanFormData>({
    projet_id: '',
    date_debut: '',
    date_fin: '',
    mssg: '',
    description: '',
    terrains_ids: [],
    salarie_ids: [],
    statut: 'prévu',
    docs_ids: []
  });

  // Task form data
  const [taskFormData, setTaskFormData] = useState<TaskFormData>({
    nom: '',
    description: '',
    date_debut: '',
    date_fin: '',
    salaries_ids: [],
    plan_id: 0
  });

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deactivatingNotifications, setDeactivatingNotifications] = useState<{[key: number]: boolean}>({})

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

  // Document handling functions
  const toggleDocumentInPlan = (docId: number) => {
    setPlanFormData(prev => ({
      ...prev,
      docs_ids: prev.docs_ids.includes(docId)
        ? prev.docs_ids.filter(id => id !== docId)
        : [...prev.docs_ids, docId]
    }));
  };

  // UPDATED: Function for Create Popup - show all project docs
  const getSelectedProjectDocuments = (): { requiredDocs: Document[], deliverableDocs: Document[] } => {
    const selectedProject = projects.find(p => p.id.toString() === planFormData.projet_id);
    const docsNeeds = selectedProject?.docs_needs || [];
    
    return {
      requiredDocs: docsNeeds.filter(doc => doc.type === 'entry'),
      deliverableDocs: docsNeeds.filter(doc => doc.type === 'livrable')
    };
  };

  // NEW: Function for Edit Popup - show project docs with plan docs pre-checked
  const getProjectDocumentsForEdit = (): { requiredDocs: Document[], deliverableDocs: Document[] } => {
    const selectedProject = projects.find(p => p.id.toString() === planFormData.projet_id);
    const docsNeeds = selectedProject?.docs_needs || [];
    
    return {
      requiredDocs: docsNeeds.filter(doc => doc.type === 'entry'),
      deliverableDocs: docsNeeds.filter(doc => doc.type === 'livrable')
    };
  };

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
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        return `il y a ${minutes} min`
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `il y a ${hours}h`
    } else {
        const days = Math.floor(diffInSeconds / 86400)
        return `il y a ${days}j`
    }
  }

  // Enhanced PDF Export functionality with 14 pages
  const exportToPDF = async () => {
    try {
      addMessage('info', 'Génération du PDF en cours...');

      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF('portrait', 'mm', 'a4');

      const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
      ];
      const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

      // PAGE 1: Title Page
      pdf.setFontSize(28);
      pdf.text('BET Consulting Planning', 105, 80, { align: 'center' });

      pdf.setFontSize(16);
      pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, 105, 100, { align: 'center' });

      pdf.setFontSize(12);
      pdf.text(`Année ${currentYear}`, 105, 120, { align: 'center' });

      pdf.setFontSize(14);
      pdf.text('Statistiques Générales', 105, 150, { align: 'center' });

      pdf.setFontSize(11);
      let yPos = 170;
      const stats = [
        `Total des plans: ${plans.length}`,
        `Plans terminés: ${plans.filter(p => p.statut === 'terminé').length}`,
        `Plans en cours: ${plans.filter(p => p.statut === 'en_cours').length}`,
        `Plans prévus: ${plans.filter(p => p.statut === 'prévu').length}`,
        `Plans annulés: ${plans.filter(p => p.statut === 'annulé').length}`,
      ];

      stats.forEach(stat => {
        pdf.text(stat, 105, yPos, { align: 'center' });
        yPos += 8;
      });

      // PAGE 2: Yearly Overview
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.text(`Vue d'Année ${currentYear}`, 20, 25);

      const cellWidth = 50;
      const cellHeight = 40;
      const startX = 20;
      const startY = 40;

      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        const row = Math.floor(monthIndex / 3);
        const col = monthIndex % 3;
        const x = startX + col * (cellWidth + 10);
        const y = startY + row * (cellHeight + 10);

        pdf.setFontSize(12);
        pdf.text(monthNames[monthIndex], x + cellWidth / 2, y + 8, { align: 'center' });

        pdf.rect(x, y, cellWidth, cellHeight);

        const monthPlans = getFilteredPlansForPeriod(currentYear, monthIndex);

        pdf.setFontSize(8);
        pdf.text(`${monthPlans.length} plans`, x + cellWidth / 2, y + 15, { align: 'center' });

        let planY = y + 18;
        monthPlans.slice(0, 4).forEach((plan) => {
          const duration = getPlanDuration(plan.date_debut, plan.date_fin);
          pdf.setFillColor(59, 130, 246);
          pdf.rect(x + 2, planY, cellWidth - 4, 3, 'F');

          pdf.setFontSize(6);
          pdf.text(`${plan.mssg || plan.description || 'Plan'} (${duration}j)`, x + cellWidth / 2, planY + 2, { align: 'center' });
          planY += 4;
        });

        if (monthPlans.length > 4) {
          pdf.setFontSize(6);
          pdf.text(`+${monthPlans.length - 4} autres`, x + cellWidth / 2, planY + 1, { align: 'center' });
        }
      }

      // PAGES 3–14: Monthly Details
      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        pdf.addPage();

        const monthPlans = getFilteredPlansForPeriod(currentYear, monthIndex);

        pdf.setFontSize(18);
        pdf.text(`${monthNames[monthIndex]} ${currentYear}`, 20, 25);

        const calendarStartX = 20;
        const calendarStartY = 40;
        const cellSize = 25;

        pdf.setFontSize(10);
        for (let i = 0; i < 7; i++) {
          pdf.text(dayNames[i], calendarStartX + i * cellSize + cellSize / 2, calendarStartY - 5, { align: 'center' });
        }

        const daysInMonth = getDaysInMonth(currentYear, monthIndex);
        const firstDay = getFirstDayOfMonth(currentYear, monthIndex);
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

        let currentDay = 1;
        for (let week = 0; week < 6; week++) {
          for (let day = 0; day < 7; day++) {
            const x = calendarStartX + day * cellSize;
            const y = calendarStartY + week * cellSize;

            pdf.rect(x, y, cellSize, cellSize);

            if (week === 0 && day < adjustedFirstDay) {
              continue;
            } else if (currentDay <= daysInMonth) {
              pdf.setFontSize(9);
              pdf.text(currentDay.toString(), x + 2, y + 8);

              const dayDate = new Date(currentYear, monthIndex, currentDay);
              const dayPlans = monthPlans.filter(plan => {
                const startDate = new Date(plan.date_debut);
                const endDate = new Date(plan.date_fin);
                return isDateInRange(dayDate, startDate, endDate);
              });

              if (dayPlans.length > 0) {
                let dotX = x + 2;
                let dotY = y + cellSize - 5;

                dayPlans.slice(0, 3).forEach((plan, index) => {
                  pdf.setFillColor(59, 130, 246);
                  pdf.circle(dotX + index * 3, dotY, 1, 'F');
                });

                if (dayPlans.length > 3) {
                  pdf.setFontSize(6);
                  pdf.text(`+${dayPlans.length - 3}`, x + 12, y + cellSize - 2);
                }
              }

              currentDay++;
            }
          }

          if (currentDay > daysInMonth) break;
        }

        // Plans list at bottom
        pdf.setFontSize(14);
        pdf.text(`Plans de ${monthNames[monthIndex]} (${monthPlans.length})`, 20, 200);

        if (monthPlans.length > 0) {
          pdf.setFontSize(9);
          let listY = 210;

          for (let index = 0; index < monthPlans.length; index++) {
            const plan = monthPlans[index];
            const duration = getPlanDuration(plan.date_debut, plan.date_fin);
            const startDate = new Date(plan.date_debut).toLocaleDateString('fr-FR');
            const endDate = new Date(plan.date_fin).toLocaleDateString('fr-FR');

            pdf.setFont(undefined, 'bold');
            pdf.text(`${index + 1}. ${plan.mssg || plan.description || 'Plan'}`, 25, listY);

            pdf.setFont(undefined, 'normal');
            pdf.text(`Projet: ${plan.projet.nom}`, 30, listY + 4);
            pdf.text(`Période: ${startDate} - ${endDate} (${duration}j)`, 30, listY + 8);
            pdf.text(`Statut: ${getStatusConfig(plan.statut).label}`, 30, listY + 12);

            if (plan.salarie_ids.length > 0) {
              const salarieNames = getSalarieDetails(plan.salarie_ids).map(s => s.fullName).slice(0, 2).join(', ');
              pdf.text(`Salariés: ${salarieNames}${plan.salarie_ids.length > 2 ? ` +${plan.salarie_ids.length - 2}` : ''}`, 30, listY + 16);
            }

            if (plan.terrains_ids.length > 0) {
              const terrainNames = getTerrainDetails(plan.terrains_ids).map(t => t.name).slice(0, 2).join(', ');
              pdf.text(`Terrains: ${terrainNames}${plan.terrains_ids.length > 2 ? ` +${plan.terrains_ids.length - 2}` : ''}`, 30, listY + 20);
            }

            listY += 26;

            if (listY > 270) {
              pdf.text('(Suite sur page suivante)', 105, 280, { align: 'center' });
              break;
            }
          }
        } else {
          pdf.setFontSize(10);
          pdf.text('Aucun plan prévu pour ce mois.', 25, 215);
        }
      }

      const fileName = `BET-Consulting-Planning-${currentYear}.pdf`;
      pdf.save(fileName);

      addMessage('success', 'PDF exporté avec succès ! (14 pages générées)');
    } catch (error) {
      console.error('PDF export error:', error);
      addMessage("error", "Erreur lors de l'exportation PDF");
    }
  };

  // Data fetching with regular fetch - Updated to handle date_debut/date_fin
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

      // Process plans data - handle JSON strings properly and date fields
      const processedPlans = plans.map((plan: any) => ({
        ...plan,
        // Handle date_debut and date_fin fields
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
        docs_ids: Array.isArray(plan.docs_ids)
          ? plan.docs_ids
          : (typeof plan.docs_ids === 'string'
            ? JSON.parse(plan.docs_ids || '[]')
            : []),
        plan_docs: Array.isArray(plan.plan_docs)
          ? plan.plan_docs
          : (typeof plan.plan_docs === 'string'
            ? JSON.parse(plan.plan_docs || '[]')
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

      // Process projects with rh_needs, salarie_ids, and docs_needs
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

  // Form handlers with Inertia router - Updated for date_debut/date_fin
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

  // Task form handlers
  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    console.log('Creating task with payload:', taskFormData);

    router.post('/suivi-controle/storeTask', taskFormData, {
      onSuccess: (page) => {
        addMessage('success', 'Tâche créée avec succès');
        setShowTaskPopup(false);
        setShowDetailsPopup(false);
        resetTaskForm();
        setIsSubmitting(false);
      },
      onError: (errors) => {
        console.error('Create task error:', errors);
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

  const resetTaskForm = () => {
    setTaskFormData({
      nom: '',
      description: '',
      date_debut: '',
      date_fin: '',
      salaries_ids: [],
      plan_id: 0
    });
  };

  const openTaskPopup = (plan: Plan) => {
    setTaskFormData({
      nom: '',
      description: '',
      date_debut: plan.date_debut.split('T')[0],
      date_fin: plan.date_fin.split('T')[0],
      salaries_ids: [],
      plan_id: plan.id
    });
    setShowTaskPopup(true);
    setError(null);
  };

  const toggleSalarieInTask = (salarieId: number) => {
    setTaskFormData(prev => ({
      ...prev,
      salaries_ids: prev.salaries_ids.includes(salarieId)
        ? prev.salaries_ids.filter(id => id !== salarieId)
        : [...prev.salaries_ids, salarieId]
    }));
  };

  // UI handlers
  const resetPlanForm = () => {
    setPlanFormData({
      projet_id: '',
      date_debut: '',
      date_fin: '',
      mssg: '',
      description: '',
      terrains_ids: [],
      salarie_ids: [],
      statut: 'prévu',
      docs_ids: []
    });
  };

  const openCreatePopup = () => {
    resetPlanForm();
    setShowCreatePopup(true);
    setError(null);
  };

  // UPDATED: Edit popup - populate docs_ids based on plan_docs matching project docs_needs
  const openEditPopup = (plan: Plan) => {
    setSelectedPlan(plan);
    
    // Get the project's docs_needs
    const project = projects.find(p => p.id === plan.projet_id);
    const projectDocsNeeds = project?.docs_needs || [];
    
    // Get the plan's plan_docs 
    const planDocs = plan.plan_docs || [];
    
    // Find which docs_needs are in the plan_docs (by doc_id)
    const preCheckedDocIds = projectDocsNeeds
      .filter(projectDoc => 
        planDocs.some(planDoc => planDoc.doc_id === projectDoc.doc_id)
      )
      .map(doc => doc.doc_id);
    
    console.log('Edit Plan Flow - Project docs_needs:', projectDocsNeeds);
    console.log('Edit Plan Flow - Plan docs:', planDocs);
    console.log('Edit Plan Flow - Pre-checked doc IDs:', preCheckedDocIds);
    
    setPlanFormData({
      projet_id: plan.projet_id.toString(),
      date_debut: plan.date_debut.split('T')[0],
      date_fin: plan.date_fin.split('T')[0],
      mssg: plan.mssg || '',
      description: plan.description || '',
      terrains_ids: plan.terrains_ids || [],
      salarie_ids: plan.salarie_ids || [],
      statut: plan.statut,
      docs_ids: preCheckedDocIds // Use pre-checked docs from plan_docs
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

  // Enhanced calendar navigation
  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentYear(prevYear => {
      return direction === 'prev' ? prevYear - 1 : prevYear + 1;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // View switching functions
  const switchToMonthlyView = (month: number, year: number) => {
    setCalendarView('monthly');
    setFocusedMonth(month);
    setCurrentDate(new Date(year, month, 1));
  };

  const switchToYearlyView = () => {
    setCalendarView('yearly');
    setFocusedMonth(null);
  };

  // Enhanced filter logic for calendar
  const getFilteredPlansForPeriod = (year: number, month?: number) => {
    let filtered = plans;

    // Filter by project
    if (selectedProjectFilter !== null) {
      filtered = filtered.filter(plan => plan.projet_id === selectedProjectFilter);
    }

    // Filter by salary
    if (selectedSalarieFilter !== null) {
      filtered = filtered.filter(plan =>
        plan.salarie_ids && plan.salarie_ids.includes(selectedSalarieFilter)
      );
    }

    // Filter by time period
    filtered = filtered.filter(plan =>
      planOverlapsWithPeriod(plan, year, month)
    );

    return filtered;
  };

  // Get terrain and salarie details for display
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

  // Enhanced yearly calendar rendering
  const renderYearlyCalendar = () => {
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const yearlyPlans = getFilteredPlansForPeriod(currentYear);

    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        {/* Yearly Header */}
        <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
          <button
            onClick={() => navigateYear('prev')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6" />
            Année {currentYear}
          </h2>
          
          <button 
            onClick={() => navigateYear('next')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Yearly Grid */}
        <div className="grid grid-cols-3 gap-4 p-6">
          {monthNames.map((monthName, monthIndex) => {
            const monthPlans = getFilteredPlansForPeriod(currentYear, monthIndex);
            const daysInMonth = getDaysInMonth(currentYear, monthIndex);
            const firstDayOfMonth = getFirstDayOfMonth(currentYear, monthIndex);
            const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

            return (
              <div
                key={monthIndex}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => switchToMonthlyView(monthIndex, currentYear)}
              >
                {/* Month header */}
                <div className="bg-gray-100 px-4 py-2 border-b">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center justify-between">
                    {monthName}
                    <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded-full">
                      {monthPlans.length} plans
                    </span>
                  </h3>
                </div>

                {/* Mini calendar */}
                <div className="p-2">
                  {/* Days grid */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(day => (
                      <div key={day} className="text-xs text-center text-gray-500 py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for days before first day */}
                    {Array.from({ length: adjustedFirstDay }, (_, i) => (
                      <div key={`empty-${i}`} className="h-6"></div>
                    ))}
                    
                    {/* Days of month */}
                    {Array.from({ length: daysInMonth }, (_, dayIndex) => {
                      const day = dayIndex + 1;
                      const dayDate = new Date(currentYear, monthIndex, day);
                      const dayPlans = monthPlans.filter(plan => {
                        const startDate = new Date(plan.date_debut);
                        const endDate = new Date(plan.date_fin);
                        return isDateInRange(dayDate, startDate, endDate);
                      });

                      const isToday = isSameDay(dayDate, new Date());

                      return (
                        <div
                          key={day}
                          className={`h-6 flex items-center justify-center relative text-xs ${
                            isToday 
                              ? 'bg-blue-100 text-blue-800 font-bold rounded' 
                              : 'text-gray-700'
                          }`}
                        >
                          {day}
                          
                          {/* Plan indicators - smaller circles */}
                          {dayPlans.length > 0 && (
                            <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                              {dayPlans.slice(0, 3).map((plan, index) => (
                                <div
                                  key={plan.id}
                                  className="w-1 h-1 rounded-full opacity-80"
                                  style={{ backgroundColor: getPlanColor(plan.id) }}
                                  title={plan.mssg || plan.description || 'Plan'}
                                />
                              ))}
                              {dayPlans.length > 3 && (
                                <div className="w-1 h-1 rounded-full bg-gray-400" />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Plan summary for month */}
                <div className="px-2 pb-2">
                  <div className="space-y-1">
                    {monthPlans.slice(0, 2).map((plan) => {
                      const duration = getPlanDuration(plan.date_debut, plan.date_fin);
                      return (
                        <div
                          key={plan.id}
                          className="text-xs p-1 rounded text-white truncate"
                          style={{ backgroundColor: getPlanColor(plan.id) }}
                          title={`${plan.mssg || plan.description}: ${duration}j - ${plan.projet.nom}`}
                        >
                          {plan.mssg || plan.description || 'Plan'} ({duration}j)
                        </div>
                      );
                    })}
                    {monthPlans.length > 2 && (
                      <div className="text-xs text-gray-500 text-center py-1">
                        +{monthPlans.length - 2} autres plans
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Enhanced monthly calendar rendering
  const renderMonthlyCalendar = () => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const filteredPlans = getFilteredPlansForPeriod(currentYear, currentMonth);

    const calendarDays = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < adjustedFirstDay; i++) {
      calendarDays.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }

    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    // Separate single-day and multi-day plans
    const dayPlans = new Map<number, Plan[]>();
    const spanningPlans: { plan: Plan; segments: any[]; stackLevel: number; }[] = [];

    // Process plans
    filteredPlans.forEach(plan => {
      const startDate = new Date(plan.date_debut);
      const endDate = new Date(plan.date_fin);

      const monthStart = new Date(currentYear, currentMonth, 1);
      const monthEnd = new Date(currentYear, currentMonth + 1, 0);

      const displayStart = startDate < monthStart ? monthStart : startDate;
      const displayEnd = endDate > monthEnd ? monthEnd : endDate;

      const startDay = displayStart.getDate();
      const endDay = displayEnd.getDate();

      const isSingleDay = startDay === endDay;

      if (isSingleDay) {
        if (!dayPlans.has(startDay)) {
          dayPlans.set(startDay, []);
        }
        dayPlans.get(startDay)?.push(plan);
      } else {
        // Calculate segments for multi-day plans
        const segments = [];
        let currentSegmentStart = startDay;

        while (currentSegmentStart <= endDay) {
          const startPos = currentSegmentStart + adjustedFirstDay - 1;
          const startRow = Math.floor(startPos / 7);
          const startCol = startPos % 7;
          
          const remainingInRow = 7 - startCol;
          const remainingDays = endDay - currentSegmentStart + 1;
          const segmentDays = Math.min(remainingInRow, remainingDays);
          
          segments.push({
            startDay: currentSegmentStart,
            endDay: currentSegmentStart + segmentDays - 1,
            row: startRow,
            startCol,
            width: (segmentDays / 7) * 100,
            left: (startCol / 7) * 100
          });
          
          currentSegmentStart += segmentDays;
        }

        spanningPlans.push({ plan, segments, stackLevel: 0 });
      }
    });

    // Assign stack levels to prevent overlaps - enhanced algorithm
    spanningPlans.forEach((spanningPlan, index) => {
      let stackLevel = 0;
      let levelFound = false;

      while (!levelFound) {
        const conflicting = spanningPlans.slice(0, index).some(otherSpan => {
          if (otherSpan.stackLevel !== stackLevel) return false;

          return spanningPlan.segments.some(segment => 
            otherSpan.segments.some(otherSegment => 
              segment.row === otherSegment.row &&
              !(segment.endDay < otherSegment.startDay || segment.startDay > otherSegment.endDay)
            )
          );
        });

        if (!conflicting) {
          spanningPlan.stackLevel = stackLevel;
          levelFound = true;
        } else {
          stackLevel++;
        }
      }
    });

    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        {/* Monthly Header with Return Button */}
        <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
          <div className="flex items-center gap-4">
            <button
              onClick={switchToYearlyView}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'année
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            
            <button 
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="w-28"></div> {/* Spacer for alignment */}
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {dayNames.map(day => (
            <div key={day} className="p-3 text-center font-medium text-gray-500 text-sm border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar container with spanning bars */}
        <div className="relative">
          {/* Spanning plans overlay - thinner bars */}
          <div className="absolute inset-0 pointer-events-none z-10">
            {spanningPlans.map(({ plan, segments, stackLevel }, planIndex) => {
              const planColor = getPlanColor(plan.id);
              const duration = getPlanDuration(plan.date_debut, plan.date_fin);

              return segments.map((segment, segmentIndex) => (
                <div
                  key={`span-${plan.id}-segment-${segmentIndex}`}
                  className="absolute pointer-events-auto cursor-pointer group"
                  style={{
                    top: `${segment.row * 140 + 40 + stackLevel * 16}px`,
                    left: `${segment.left}%`,
                    width: `${segment.width}%`,
                    height: '14px',
                    backgroundColor: planColor,
                    borderRadius: '7px',
                    zIndex: 20 + stackLevel,
                    border: '1px solid rgba(255,255,255,0.4)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    opacity: '0.9'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openDetailsPopup(plan);
                  }}
                >
                  {/* Spanning bar content - showing mssg instead of description */}
                  <div className="h-full flex items-center px-2 text-white text-xs font-medium overflow-hidden">
                    <span className="truncate">
                      {segmentIndex === 0 ? `${plan.mssg || plan.description || 'Plan'} (${duration}j)` : '...'}
                    </span>
                  </div>
                  
                  {/* Simple tooltip */}
                  <div className="invisible group-hover:visible absolute top-full left-0 mt-1 p-2 bg-white border border-gray-300 rounded shadow-lg z-[100] text-sm text-gray-900">
                    {plan.mssg || plan.description || 'Plan'} - {plan.projet.nom}
                  </div>
                </div>
              ));
            })}
          </div>

          {/* Calendar grid - increased cell height for better visibility */}
          <div className="grid grid-cols-7 gap-0">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return (
                  <div key={index} className="h-36 border-r border-b last:border-r-0 bg-gray-50"></div>
                );
              }

              const currentDayDate = new Date(currentYear, currentMonth, day);
              const isToday = isSameDay(currentDayDate, new Date());
              
              const singleDayPlans = dayPlans.get(day) || [];

              return (
                <div 
                  key={day} 
                  className={`h-36 border-r border-b last:border-r-0 p-2 overflow-hidden relative ${
                    isToday ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* Day number */}
                  <div className={`text-sm font-medium mb-2 relative z-20 ${
                    isToday ? 'text-blue-600 font-bold' : 'text-gray-900'
                  }`}>
                    {day}
                  </div>

                  {/* Single day plans as circles - improved layout */}
                  <div className="flex flex-wrap gap-1 relative z-30">
                    {singleDayPlans.slice(0, 12).map((plan, planIndex) => {
                      const planColor = getPlanColor(plan.id);

                      return (
                        <div
                          key={plan.id}
                          className="relative group"
                        >
                          {/* Circle */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetailsPopup(plan);
                            }}
                            className="w-5 h-5 rounded-full cursor-pointer shadow-sm border border-white hover:scale-125 transition-all duration-200 hover:z-50 relative"
                            style={{ 
                              backgroundColor: planColor,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                          >
                            <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                              {(plan.mssg || plan.description || 'P').charAt(0).toUpperCase()}
                            </div>
                          </div>

                          {/* Simple tooltip */}
                          <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 p-2 bg-white border border-gray-300 rounded shadow-lg z-[100] text-sm text-gray-900 whitespace-nowrap">
                            {plan.mssg || plan.description || 'Plan'} - {plan.projet.nom}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Show overflow indicator */}
                    {singleDayPlans.length > 12 && (
                      <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold shadow-sm border border-white relative z-30">
                        +{singleDayPlans.length - 12}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du calendrier...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Planification</h1>
            </div>
            
            <div className="flex items-center gap-3">
              {/* PDF Export Button */}
              <button
                onClick={exportToPDF}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exporter PDF
              </button>

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

          {/* Enhanced Stats Cards */}
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

          {/* Planning Controls */}
          <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
            {/* Control Row */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                {/* Project Filter */}
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

                {/* Salary Filter */}
                <select
                  value={selectedSalarieFilter === null ? "" : selectedSalarieFilter.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedSalarieFilter(value === "" ? null : Number(value));
                  }}
                  className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tous les salariés</option>
                  {salaries
                    .filter(s => s.emplacement === 'terrain')
                    .map(salarie => (
                      <option key={salarie.id} value={salarie.id}>
                        {salarie.nom} {salarie.prenom}
                      </option>
                    ))}
                </select>

                {/* Clear Filters */}
                {(selectedProjectFilter !== null || selectedSalarieFilter !== null) && (
                  <button
                    onClick={() => {
                      setSelectedProjectFilter(null);
                      setSelectedSalarieFilter(null);
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Effacer les filtres
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

            {/* Calendar - Render based on view */}
            {calendarView === 'yearly' ? renderYearlyCalendar() : renderMonthlyCalendar()}
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

          {/* UPDATED: Create/Edit Plan Popup with Correct Document Flow */}
          {(showCreatePopup || showEditPopup) && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-7xl max-h-[90vh] overflow-y-auto m-4">
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
                        onChange={(e) => setPlanFormData(prev => ({ ...prev, projet_id: e.target.value, docs_ids: [] }))}
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date début *</label>
                      <input
                        type="date"
                        value={planFormData.date_debut}
                        onChange={(e) => setPlanFormData(prev => ({ ...prev, date_debut: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date fin *</label>
                      <input
                        type="date"
                        value={planFormData.date_fin}
                        onChange={(e) => setPlanFormData(prev => ({ ...prev, date_fin: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="md:col-span-2">
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

                  {/* Date validation */}
                  {planFormData.date_debut && planFormData.date_fin && planFormData.date_debut > planFormData.date_fin && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      <p className="text-sm">La date de fin doit être postérieure à la date de début.</p>
                    </div>
                  )}

                  {/* UPDATED: Document Tables - Different Logic for Create vs Edit */}
                  {planFormData.projet_id && (
                    <div className="space-y-6">
                      <h4 className="text-md font-medium text-gray-900">
                        {showCreatePopup ? "Documents du Projet" : "Documents du Projet (depuis docs_needs)"}
                      </h4>
                      {(() => {
                        // Use the same function for both create and edit - show project's docs_needs
                        const { requiredDocs, deliverableDocs } = showCreatePopup 
                          ? getSelectedProjectDocuments() 
                          : getProjectDocumentsForEdit();
                        
                        if (requiredDocs.length === 0 && deliverableDocs.length === 0) {
                          return (
                            <div className="bg-gray-50 rounded-lg p-8 text-center">
                              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                              <p className="text-gray-500 text-lg">No documents Yet!</p>
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Documents Requis */}
                            {requiredDocs.length > 0 && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                  Documents Requis ({planFormData.docs_ids.filter(id => requiredDocs.some(doc => doc.doc_id === id)).length} sélectionnés)
                                </label>
                                <div className="border rounded-md max-h-80 overflow-y-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-blue-50 sticky top-0">
                                      <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-blue-700 uppercase">Document</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-blue-700 uppercase">Type</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-blue-700 uppercase"></th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {requiredDocs.map((doc) => {
                                        const isSelected = planFormData.docs_ids.includes(doc.doc_id);
                                        
                                        return (
                                          <tr key={doc.doc_id} className={isSelected ? "bg-green-50" : "hover:bg-gray-50"}>
                                            <td className="px-3 py-2 text-sm">
                                              <div className="flex items-center gap-2">
                                                {isSelected && <CheckCircle className="w-4 h-4 text-green-600" />}
                                                <span className="font-medium">{doc.nom}</span>
                                              </div>
                                            </td>
                                            <td className="px-3 py-2 text-xs text-gray-600">
                                              {doc.type}
                                            </td>
                                            <td className="px-3 py-2">
                                              <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleDocumentInPlan(doc.doc_id)}
                                                disabled={isSubmitting}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                              />
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Documents Livrables */}
                            {deliverableDocs.length > 0 && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                  Documents Livrables ({planFormData.docs_ids.filter(id => deliverableDocs.some(doc => doc.doc_id === id)).length} sélectionnés)
                                </label>
                                <div className="border rounded-md max-h-80 overflow-y-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-green-50 sticky top-0">
                                      <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase">Document</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase">Type</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase"></th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {deliverableDocs.map((doc) => {
                                        const isSelected = planFormData.docs_ids.includes(doc.doc_id);
                                        
                                        return (
                                          <tr key={doc.doc_id} className={isSelected ? "bg-green-50" : "hover:bg-gray-50"}>
                                            <td className="px-3 py-2 text-sm">
                                              <div className="flex items-center gap-2">
                                                {isSelected && <CheckCircle className="w-4 h-4 text-green-600" />}
                                                <span className="font-medium">{doc.nom}</span>
                                              </div>
                                            </td>
                                            <td className="px-3 py-2 text-xs text-gray-600">
                                              {doc.type}
                                            </td>
                                            <td className="px-3 py-2">
                                              <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleDocumentInPlan(doc.doc_id)}
                                                disabled={isSubmitting}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                              />
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      
                      {/* Debug Info for Edit Mode */}
                      {showEditPopup && selectedPlan && (
                        <div className="bg-gray-100 rounded-lg p-4">
                          <h5 className="text-sm font-medium text-gray-800 mb-2">Debug Info (Edit Mode):</h5>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>Plan docs: {selectedPlan.plan_docs?.length || 0} documents</div>
                            <div>Project docs_needs: {projects.find(p => p.id.toString() === planFormData.projet_id)?.docs_needs?.length || 0} documents</div>
                            <div>Currently selected: {planFormData.docs_ids.length} documents</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Salaries and Terrains Selection */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Salaries Table with Availability */}
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
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Disponibilité</th>
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
                                    <td className="px-3 py-2 text-xs">
                                      {getSalarieAvailabilityDisplay(salarie)}
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
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
                        <span className="font-medium text-gray-700">Période:</span>
                        <p className="text-gray-600">
                          {planFormData.date_debut && planFormData.date_fin
                            ? `Du ${new Date(planFormData.date_debut).toLocaleDateString('fr-FR')} au ${new Date(planFormData.date_fin).toLocaleDateString('fr-FR')}`
                            : 'Non définie'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Durée:</span>
                        <p className="text-gray-600">
                          {planFormData.date_debut && planFormData.date_fin
                            ? `${Math.ceil((new Date(planFormData.date_fin).getTime() - new Date(planFormData.date_debut).getTime()) / (1000 * 60 * 60 * 24)) + 1} jour${Math.ceil((new Date(planFormData.date_fin).getTime() - new Date(planFormData.date_debut).getTime()) / (1000 * 60 * 60 * 24)) + 1 > 1 ? 's' : ''}`
                            : 'Non définie'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Statut:</span>
                        <p className="text-gray-600">
                          {getStatusBadge(planFormData.statut)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Documents:</span>
                        <p className="text-gray-600">
                          {planFormData.docs_ids.length > 0 
                            ? `${planFormData.docs_ids.length} document${planFormData.docs_ids.length > 1 ? 's' : ''} sélectionné${planFormData.docs_ids.length > 1 ? 's' : ''}`
                            : 'Aucun document sélectionné'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Salariés:</span>
                        <div className="text-gray-600">
                          {planFormData.salarie_ids.length > 0 ? (
                            <div className="space-y-1">
                              {getSalarieDetails(planFormData.salarie_ids).slice(0, 3).map((salarie, index) => (
                                <div key={index} className="text-sm">
                                  {salarie.fullName} ({salarie.poste})
                                </div>
                              ))}
                              {planFormData.salarie_ids.length > 3 && (
                                <div className="text-sm text-blue-600">
                                  +{planFormData.salarie_ids.length - 3} autre{planFormData.salarie_ids.length - 3 > 1 ? 's' : ''}
                                </div>
                              )}
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
                              {getTerrainDetails(planFormData.terrains_ids).slice(0, 3).map((terrain, index) => (
                                <div key={index} className="text-sm">
                                  {terrain.name} / {terrain.projectName}
                                </div>
                              ))}
                              {planFormData.terrains_ids.length > 3 && (
                                <div className="text-sm text-blue-600">
                                  +{planFormData.terrains_ids.length - 3} autre{planFormData.terrains_ids.length - 3 > 1 ? 's' : ''}
                                </div>
                              )}
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
                      disabled={isSubmitting || (planFormData.date_debut && planFormData.date_fin && planFormData.date_debut > planFormData.date_fin)}
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

          {/* Plan Details Popup - Shows Plan's Documents */}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDetailsPopup(false);
                        handleDeletePlan(selectedPlan.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
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
                  {/* Basic Information */}
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
                        {Math.ceil((new Date(selectedPlan.date_fin).getTime() - new Date(selectedPlan.date_debut).getTime()) / (1000 * 60 * 60 * 24)) + 1} jour{Math.ceil((new Date(selectedPlan.date_fin).getTime() - new Date(selectedPlan.date_debut).getTime()) / (1000 * 60 * 60 * 24)) + 1 > 1 ? 's' : ''}
                      </p>
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

                  {/* Document Tables in Plan Details - Show Plan's Documents */}
                  {selectedPlan.plan_docs && selectedPlan.plan_docs.length > 0 && (
                    <div className="space-y-6">
                      <h4 className="text-md font-medium text-gray-900">Documents du Plan</h4>
                      {(() => {
                        const requiredDocs = selectedPlan.plan_docs.filter((doc: Document) => doc.type === 'entry');
                        const deliverableDocs = selectedPlan.plan_docs.filter((doc: Document) => doc.type === 'livrable');
                        
                        return (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Documents Requis - Read Only */}
                            {requiredDocs.length > 0 && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                  Documents Requis ({requiredDocs.length})
                                </label>
                                <div className="border rounded-md max-h-80 overflow-y-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-blue-50 sticky top-0">
                                      <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-blue-700 uppercase">Document</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-blue-700 uppercase">Type</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {requiredDocs.map((doc: Document, index: number) => (
                                        <tr key={`${doc.doc_id}-${index}`} className="bg-green-50">
                                          <td className="px-3 py-2 text-sm">
                                            <div className="flex items-center gap-2">
                                              <CheckCircle className="w-4 h-4 text-green-600" />
                                              <span className="font-medium">{doc.nom}</span>
                                            </div>
                                          </td>
                                          <td className="px-3 py-2 text-xs text-gray-600">
                                            {doc.type}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Documents Livrables - Read Only */}
                            {deliverableDocs.length > 0 && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                  Documents Livrables ({deliverableDocs.length})
                                </label>
                                <div className="border rounded-md max-h-80 overflow-y-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-green-50 sticky top-0">
                                      <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase">Document</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase">Type</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {deliverableDocs.map((doc: Document, index: number) => (
                                        <tr key={`${doc.doc_id}-${index}`} className="bg-green-50">
                                          <td className="px-3 py-2 text-sm">
                                            <div className="flex items-center gap-2">
                                              <CheckCircle className="w-4 h-4 text-green-600" />
                                              <span className="font-medium">{doc.nom}</span>
                                            </div>
                                          </td>
                                          <td className="px-3 py-2 text-xs text-gray-600">
                                            {doc.type}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Show message when no plan documents */}
                  {(!selectedPlan.plan_docs || selectedPlan.plan_docs.length === 0) && (
                    <div className="space-y-6">
                      <h4 className="text-md font-medium text-gray-900">Documents du Plan</h4>
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 text-lg">Aucun document sélectionné pour ce plan</p>
                      </div>
                    </div>
                  )}

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

                  {/* Salaries Table with Tasking Button */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-700">Salariés Assignés:</span>
                      {selectedPlan.salarie_ids.length > 0 && (
                        <button
                          onClick={() => openTaskPopup(selectedPlan)}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colors"
                        >
                          <ClipboardList className="w-4 h-4" />
                          Tasking
                        </button>
                      )}
                    </div>
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
                </div>
              </div>
            </div>
          )}

          {/* Task Assignment Popup */}
          {showTaskPopup && selectedPlan && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  Affecter Des Taches - {selectedPlan.mssg || selectedPlan.description}
                </h3>

                <form onSubmit={handleCreateTask} className="space-y-6">
                  {/* Basic Task Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom de la tâche *</label>
                      <input
                        type="text"
                        value={taskFormData.nom}
                        onChange={(e) => setTaskFormData(prev => ({ ...prev, nom: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nom de la tâche"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date début *</label>
                      <input
                        type="date"
                        value={taskFormData.date_debut}
                        onChange={(e) => setTaskFormData(prev => ({ ...prev, date_debut: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date fin *</label>
                      <input
                        type="date"
                        value={taskFormData.date_fin}
                        onChange={(e) => setTaskFormData(prev => ({ ...prev, date_fin: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={taskFormData.description}
                        onChange={(e) => setTaskFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Description de la tâche"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Date validation */}
                  {taskFormData.date_debut && taskFormData.date_fin && taskFormData.date_debut > taskFormData.date_fin && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      <p className="text-sm">La date de fin doit être postérieure à la date de début.</p>
                    </div>
                  )}

                  {/* Salaries Selection Table */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Salariés à affecter ({taskFormData.salaries_ids.length} sélectionnés)
                    </label>
                    <div className="border rounded-md max-h-80 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poste</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {salaries
                            .filter(s => selectedPlan.salarie_ids.includes(s.id))
                            .map((salarie) => {
                              const isSelected = taskFormData.salaries_ids.includes(salarie.id);
                              const profil = salarie.profils?.[0];

                              return (
                                <tr key={salarie.id} className={isSelected ? "bg-green-50" : "hover:bg-gray-50"}>
                                  <td className="px-4 py-3 text-sm">
                                    <div className="flex items-center gap-2">
                                      {isSelected && <CheckCircle className="w-4 h-4 text-green-600" />}
                                      <span className="font-medium text-gray-900">{salarie.nom} {salarie.prenom}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {profil ? `${profil.nom_profil} - ${profil.poste_profil}` : 'Non défini'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{salarie.email}</td>
                                  <td className="px-4 py-3">
                                    <button
                                      type="button"
                                      onClick={() => toggleSalarieInTask(salarie.id)}
                                      className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded transition-colors ${
                                        isSelected
                                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                                          : "bg-green-100 text-green-700 hover:bg-green-200"
                                      }`}
                                    >
                                      {isSelected ? (
                                        <>
                                          <UserMinus className="w-4 h-4" />
                                          Retirer
                                        </>
                                      ) : (
                                        <>
                                          <UserPlus className="w-4 h-4" />
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
                  </div>

                  {/* Task Preview */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Aperçu de la tâche</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Plan:</span>
                        <p className="text-gray-600">{selectedPlan.mssg || selectedPlan.description}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Période:</span>
                        <p className="text-gray-600">
                          {taskFormData.date_debut && taskFormData.date_fin
                            ? `Du ${new Date(taskFormData.date_debut).toLocaleDateString('fr-FR')} au ${new Date(taskFormData.date_fin).toLocaleDateString('fr-FR')}`
                            : 'Non définie'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Salariés affectés:</span>
                        <p className="text-gray-600">{taskFormData.salaries_ids.length} salarié(s)</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowTaskPopup(false);
                        resetTaskForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || (taskFormData.date_debut && taskFormData.date_fin && taskFormData.date_debut > taskFormData.date_fin) || taskFormData.salaries_ids.length === 0}
                      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Enregistrement...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Save className="w-4 h-4" />
                          <span>Enregistrer</span>
                        </div>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}