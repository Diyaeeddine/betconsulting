"use client"
import type React from "react"
import { useState, useEffect, useCallback } from "react"
import {
  Users, MapPin, Car, Wrench, Monitor, Phone, Mail,
  Calendar, DollarSign, CheckCircle, Clock, AlertCircle,
  XCircle, X, ChevronDown, Building2, User, Truck, Laptop,
  Download, FileCheck, MessageSquare, Eye, Filter,
  TrendingUp, FileText, Send, Settings, Target,
  Activity, BarChart3, PlusCircle, Search, Bell, UserCheck
} from "lucide-react"
import AppLayout from "@/layouts/app-layout"
import { Head, usePage } from "@inertiajs/react"

// Types
interface Point {
  lat: number
  lng: number
}

interface DocReq {
  id: number
  nom: string
  description: string
  type: "entry" | "livrable"
  created_at: string
  updated_at: string
}

interface Document {
  id: number
  nomdoc: string
  phasedoc: string
  docfiletype: string
  type: string
  status: string
  file_path: string
  file_type: string
  statut: string
  uploaded_by: number
  projet_id: number
  created_at: string | null
  updated_at: string | null
}

interface DocumentEntry {
  doc_req: DocReq
  document: Document | null
  found: boolean
}

interface PlanDoc {
  id: number
  doc_req_id: number
  file_id: string | null
}

interface Profil {
  id: number
  nom_profil: string
  poste_profil: string
}

interface Salarie {
  id: number
  nom: string
  prenom: string
  email: string
  telephone: string
  salaire_mensuel: string
  date_embauche: string
  statut: string
  emplacement: string
  terrain_ids: number[]
  projet_ids: number[]
  logiciel_id: number | null
  created_at: string
  updated_at: string
  profils: Profil[]
}

interface Task {
  id: number
  nom: string
  description: string
  date_debut: string
  date_fin: string
  statut: string
  salaries_ids: number[]
  plan_id: number
  created_at: string
  updated_at: string
  salaries: Salarie[]
  parent_plan?: {
    id: number
    date_debut: string
    date_fin: string
    statut: string
    mssg: string
  }
}

interface Plan {
  id: number
  date_debut: string
  date_fin: string
  mssg: string
  description: string
  terrains_ids: number[]
  salarie_ids: number[]
  projet_id: number
  statut: string
  plan_docs: PlanDoc[]
  created_at: string
  updated_at: string
  tasks: Task[]
}

interface Terrain {
  id: number
  name: string
  description: string
  points: Point[]
  surface: string
  radius: string
  salarie_ids: number[]
  statut_tech: string
  statut_final: string
  projet_id: number
  created_at: string
  updated_at: string
  salaries?: Salarie[]
}

interface RhNeed {
  profilename: string
  profileposte: string
  number: number
}

interface DocsNeed {
  doc_req_id: number
  file_id: string
}

interface Responsable {
  id: number
  name: string
}

interface Projet {
  id: number
  nom: string
  description: string
  budget_total: string
  budget_utilise: string
  date_debut: string
  date_fin: string | null
  statut: string
  client: string
  lieu_realisation: string
  responsable_id: number
  type_projet: string
  latitude: string | null
  longitude: string | null
  radius: string
  rh_needs: RhNeed[]
  docs_needs: DocsNeed[]
  terrain_ids: number[]
  salarie_ids: number[]
  created_at: string
  updated_at: string
  responsable: Responsable
  terrains: Terrain[]
}

interface Message {
  id: number
  mssg: string
  sent_by: number
  projet_id: number
  created_at: string | null
  updated_at: string | null
}

interface Delays {
  project_delayed: boolean
  plan_delays: any[]
  task_delays: Task[]
}

interface ProjectData {
  success: boolean
  projet: Projet
  plans: Plan[]
  terrains: Terrain[]
  documents: DocumentEntry[]
  messages: Message[]
  delays: Delays
  salaries: Salarie[]
  profiles: Profil[]
}

interface MessageState {
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  id: string
}

interface PageProps {
  projets: { id: number, nom: string }[]
}

const SuiviControleDashboard = () => {
  // Get real projects data from page props using Inertia (same as working page)
  const { props } = usePage()
  const { projets: initialProjets } = props as { projets: { id: number, nom: string }[] }
  
  const [projets, setProjets] = useState<{ id: number, nom: string }[]>(initialProjets || [])
  const [selectedProjetId, setSelectedProjetId] = useState<number | null>(null)
  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageState[]>([])
  
  // Section states
  const [documentFilter, setDocumentFilter] = useState<'all' | 'entry' | 'livrable'>('all')
  const [showPlanDetails, setShowPlanDetails] = useState<number | null>(null)
  const [showDocPopup, setShowDocPopup] = useState<{ docId: number, fileId: string | null } | null>(null)
  const [processMode, setProcessMode] = useState<'processus' | 'affectation'>('processus')
  const [newMessage, setNewMessage] = useState('')
  const [salarieFilter, setSalarieFilter] = useState<'actif' | 'inactif'>('actif')

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

  // Fetch project data
  const fetchProjectData = useCallback(async (projetId: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/suivi-controle/fetch-projetData/${projetId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ProjectData = await response.json()
      setProjectData(data)
      addMessage('success', `Données du projet chargées avec succès`)
    } catch (error) {
      console.error('Project fetch error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Erreur lors du chargement du projet'
      setError(errorMsg)
      addMessage('error', errorMsg)
    } finally {
      setLoading(false)
    }
  }, [addMessage])

  // Handle project selection
  const handleProjetSelect = (projetId: number) => {
    setSelectedProjetId(projetId)
    setProjectData(null)
    fetchProjectData(projetId)
  }

  // Document actions
  const handleDownloadDoc = async (fileId: string) => {
    try {
      const response = await fetch(`/suivi-controle/download-projetDoc/${fileId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream',
          'X-Requested-With': 'XMLHttpRequest',
        },
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `document-${fileId}`
        a.click()
        setShowDocPopup(null)
        addMessage('success', 'Document téléchargé avec succès')
      }
    } catch (error) {
      addMessage('error', 'Erreur lors du téléchargement')
    }
  }

  const handleApproveDoc = async (fileId: string) => {
    try {
      const response = await fetch(`/suivi-controle/approuve-projetDoc/${fileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      })
      
      if (response.ok) {
        setShowDocPopup(null)
        addMessage('success', 'Document approuvé avec succès')
        if (selectedProjetId) fetchProjectData(selectedProjetId)
      }
    } catch (error) {
      addMessage('error', "Erreur lors de l'approbation")
    }
  }

  const handleCommentDoc = async (fileId: string, comment: string) => {
    try {
      const response = await fetch(`/suivi-controle/comment-projetDoc/${fileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ comment }),
      })
      
      if (response.ok) {
        setShowDocPopup(null)
        addMessage('success', 'Commentaire ajouté avec succès')
        if (selectedProjetId) fetchProjectData(selectedProjetId)
      }
    } catch (error) {
      addMessage('error', 'Erreur lors de l\'ajout du commentaire')
    }
  }

  // Utility functions
  const getStatusBadge = (statut: string) => {
    const statusConfig = {
      'en_cours': { bg: "bg-blue-100", text: "text-blue-800", icon: Clock, label: "En cours" },
      'en_attente': { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock, label: "En attente" },
      'termine': { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle, label: "Terminé" },
      'prévu': { bg: "bg-gray-100", text: "text-gray-800", icon: Calendar, label: "Prévu" },
      'encours': { bg: "bg-blue-100", text: "text-blue-800", icon: Activity, label: "En cours" },
      'completed': { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle, label: "Terminé" },
      'actif': { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle, label: "Actif" },
      'inactif': { bg: "bg-red-100", text: "text-red-800", icon: XCircle, label: "Inactif" },
    }

    const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig.en_attente
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const calculateDelay = (dateEnd: string) => {
    const endDate = new Date(dateEnd)
    const now = new Date()
    const diffMs = now.getTime() - endDate.getTime()
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 7) {
      return `${Math.floor(days / 7)} semaine${Math.floor(days / 7) > 1 ? 's' : ''}`
    } else if (days > 0) {
      return `${days} jour${days > 1 ? 's' : ''}`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${Math.floor(diffMs / (1000 * 60))}min`
    }
  }

  // Get documents from plan docs based on IDs
  const getPlanDocuments = () => {
    if (!projectData) return []
    
    const planDocuments: any[] = []
    
    projectData.plans.forEach((plan, planIndex) => {
      plan.plan_docs.forEach((planDoc) => {
        // Find the document info based on plan doc's doc_req_id
        const docReq = projectData.documents.find(d => d.doc_req.id === planDoc.doc_req_id)
        const document = projectData.documents.find(d => d.document?.id === planDoc.doc_req_id)
        
        if (docReq) {
          planDocuments.push({
            id: planDoc.id,
            phase: `Phase ${planIndex}`,
            nomdoc: docReq.doc_req.nom,
            phasedoc: `Phase ${planIndex}`,
            docfiletype: document?.document?.file_type || 'N/A',
            type: docReq.doc_req.type,
            status: document?.document?.statut || 'pending',
            file_id: planDoc.file_id,
            doc_req_id: planDoc.doc_req_id
          })
        }
      })
    })
    
    return planDocuments
  }

  const getAllSalaries = () => {
    if (!projectData) return []
    
    // Get all unique salaries from all terrains
    const allSalaries: Salarie[] = []
    const addedIds = new Set()
    
    projectData.terrains.forEach(terrain => {
      terrain.salaries?.forEach(salarie => {
        if (!addedIds.has(salarie.id)) {
          addedIds.add(salarie.id)
          allSalaries.push({
            ...salarie,
            terrain_name: terrain.name
          } as Salarie & { terrain_name: string })
        }
      })
    })
    
    // Also include project-level salaries if available
    if (projectData.salaries) {
      projectData.salaries.forEach(salarie => {
        if (!addedIds.has(salarie.id)) {
          addedIds.add(salarie.id)
          allSalaries.push(salarie)
        }
      })
    }
    
    return allSalaries
  }

  const getAllProfiles = () => {
    if (!projectData) return []
    
    const allProfiles: Profil[] = []
    const addedIds = new Set()
    
    // Get all unique profiles
    if (projectData.profiles) {
      projectData.profiles.forEach(profile => {
        if (!addedIds.has(profile.id)) {
          addedIds.add(profile.id)
          allProfiles.push(profile)
        }
      })
    }
    
    // Also get profiles from salaries
    getAllSalaries().forEach(salarie => {
      salarie.profils.forEach(profile => {
        if (!addedIds.has(profile.id)) {
          addedIds.add(profile.id)
          allProfiles.push(profile)
        }
      })
    })
    
    return allProfiles
  }

  const getProfileTasks = (profileId: number) => {
    if (!projectData) return []
    
    const tasks: Task[] = []
    
    // Find salaries with this profile
    const salariesWithProfile = getAllSalaries().filter(salarie => 
      salarie.profils.some(p => p.id === profileId)
    )
    
    // Get tasks for these salaries
    projectData.plans.forEach(plan => {
      plan.tasks.forEach(task => {
        const hasProfileSalarie = task.salaries_ids.some(salarieId => 
          salariesWithProfile.some(s => s.id === salarieId)
        )
        
        if (hasProfileSalarie) {
          tasks.push(task)
        }
      })
    })
    
    return tasks
  }

  const getSalarieCurrentTask = (salarieId: number) => {
    if (!projectData) return null
    
    // Find current task for this salarie
    const currentTask = projectData.plans
      .flatMap(plan => plan.tasks)
      .find(task => 
        task.salaries_ids.includes(salarieId) && 
        task.statut === 'en_cours'
      )
    
    return currentTask || projectData.plans
      .flatMap(plan => plan.tasks)
      .find(task => task.salaries_ids.includes(salarieId))
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        <Head title="Dashboard Suivi & Contrôle" />
        {/* Fixed Messages Display */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
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

        <div className="max-w-7xl mx-auto p-6 space-y-6">
          
          {/* Section 1: Project Selection & Overview */}
          <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Side: Project Info */}
              <div>
                <div className="mb-4">
                  <select
                    value={selectedProjetId || ''}
                    onChange={(e) => {
                      const id = e.target.value ? parseInt(e.target.value) : null
                      if (id) handleProjetSelect(id)
                    }}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    disabled={loading}
                  >
                    <option value="">Sélectionner un projet...</option>
                    {projets.map(projet => (
                      <option key={projet.id} value={projet.id}>
                        {projet.nom}
                      </option>
                    ))}
                  </select>
                </div>
                
                {projectData && (
                  <div className="space-y-2">
                    <div className="text-lg font-semibold text-gray-900">
                      Responsable - Projet : {projectData.projet.nom}
                    </div>
                    <div className="text-sm text-gray-600">
                      Marché N° {projectData.projet.id}
                    </div>
                    <div className="text-sm text-gray-600">
                      Responsable: {projectData.projet.responsable.name}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Side: Progress */}
              {projectData && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    Avancement Global
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: '68%' }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-indigo-600">68%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-lg shadow-md border border-gray-100 p-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des données du projet...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900 font-bold">×</button>
            </div>
          )}

          {projectData && !loading && (
            <>
              {/* Section 2: Suivi des Phases de Projet */}
              <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Suivi des Phases de Projet</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projectData.plans.map((plan, index) => (
                    <div key={`plan-${plan.id}`} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">Phase {index} : {plan.mssg}</h3>
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          {plan.statut === 'termine' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : plan.statut === 'encours' ? (
                            <Clock className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Calendar className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                      
                      <div className="mb-3">
                        {getStatusBadge(plan.statut)}
                      </div>
                      
                      <div className="border-t border-gray-200 pt-3">
                        <div className="text-xs text-gray-500 mb-2">Tâches ({plan.tasks.length})</div>
                        <div className="space-y-1">
                          {plan.tasks.slice(0, 2).map((task) => (
                            <div key={`task-${task.id}`} className="text-xs bg-gray-50 px-2 py-1 rounded">
                              {task.nom}
                            </div>
                          ))}
                          {plan.tasks.length > 2 && (
                            <div className="text-xs text-gray-500">+{plan.tasks.length - 2} autres...</div>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setShowPlanDetails(plan.id)}
                        className="mt-3 w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded text-sm transition-colors"
                      >
                        <Eye className="w-4 h-4 inline mr-2" />
                        Voir Détails
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Documents & Alertes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Documents Clés - Updated to show plan docs */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 bg-green-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Documents Clés</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select
                          value={documentFilter}
                          onChange={(e) => setDocumentFilter(e.target.value as any)}
                          className="text-sm border-gray-300 rounded"
                        >
                          <option value="all">Tous</option>
                          <option value="entry">Requis</option>
                          <option value="livrable">Livrable</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phase</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {getPlanDocuments()
                          .filter((doc) => 
                            documentFilter === 'all' || doc.type === documentFilter
                          )
                          .map((doc) => (
                          <tr
                            key={`plandoc-${doc.id}`}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => setShowDocPopup({ docId: doc.doc_req_id, fileId: doc.file_id })}
                          >
                            <td className="px-4 py-3 text-xs font-medium text-gray-900">{doc.phasedoc}</td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900">{doc.nomdoc}</div>
                              <div className="text-xs text-gray-500">{doc.docfiletype}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                doc.type === 'entry' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {doc.type === 'entry' ? 'Requis' : 'Livrable'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {doc.file_id && doc.file_id !== "" ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right: Alertes & Problèmes */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 bg-red-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Alertes & Problèmes Ouverts</h3>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                    {projectData.delays.task_delays.map((task) => (
                      <div key={`delay-${task.id}`} className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="font-semibold text-red-900">{task.nom}</div>
                        <div className="text-sm text-red-700 mt-1">{task.description}</div>
                        
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-xs text-red-600">
                            Phase {task.parent_plan ? task.parent_plan.id : 'N/A'} :
                             
                            {getStatusBadge(task.statut)}
                          </div>
                          <div className="text-xs font-semibold text-red-700">
                            Retard: {calculateDelay(task.date_fin)}
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-600 mt-1">
                          Assigné à: {task.salaries.map(s => `${s.nom} ${s.prenom}`).join(', ')}
                        </div>
                      </div>
                    ))}
                    
                    {projectData.delays.task_delays.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                        Aucun problème détecté
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 4: Suivi du Chantier en Temps Réel - Updated */}
              <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Suivi du Chantier en Temps Réel</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getAllSalaries().map((salarie) => {
                    const currentTask = getSalarieCurrentTask(salarie.id)
                    const isOnline = Math.random() > 0.3 // Random for demo
                    const terrain = projectData.terrains.find(t => t.salarie_ids.includes(salarie.id))
                    
                    return (
                      <div key={`salarie-realtime-${salarie.id}`} className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-lg p-4 relative">
                        {/* Online/Offline indicator */}
                        <div className="absolute top-2 right-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                            isOnline 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            {isOnline ? 'En ligne' : 'Hors ligne'}
                          </span>
                        </div>
                        
                        <div className="flex items-start gap-3 mt-6">
                          {/* Profile Picture Placeholder */}
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            <User className="w-6 h-6 text-gray-600" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              {salarie.nom} {salarie.prenom}
                            </div>
                            
                            <div className="text-sm text-purple-600 mb-1">
                              {salarie.profils[0]?.poste_profil || 'Non assigné'}
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-2">
                              Terrain: {terrain?.name || 'Non assigné'}
                            </div>
                            
                            {currentTask && (
                              <div className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                Tâche: {currentTask.nom}
                              </div>
                            )}
                            
                            {/* <div className="text-xs text-gray-400 mt-1">
                              Mis à jour: {calculateDelay(salarie.updated_at)}
                            </div> */}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Section 5: Indicateurs Clés (KPIs) */}
              <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Indicateurs Clés (KPIs)</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* KPI 1 */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-900">68%</div>
                    <div className="text-sm font-medium text-blue-700">Avancement par lot</div>
                    <div className="text-xs text-blue-600">Suivi global des travaux</div>
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                    <div className="text-xs text-green-600 mt-1">+5% cette semaine</div>
                  </div>

                  {/* KPI 2 */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-900">
                      {getPlanDocuments().filter(d => d.file_id).length}/{getPlanDocuments().length}
                    </div>
                    <div className="text-sm font-medium text-green-700">Documents signés</div>
                    <div className="text-xs text-green-600">Documents validés</div>
                    <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(getPlanDocuments().filter(d => d.file_id).length / getPlanDocuments().length) * 100}%` }}></div>
                    </div>
                    <div className="text-xs text-yellow-600 mt-1">
                      {getPlanDocuments().filter(d => !d.file_id).length} en attente de signature
                    </div>
                  </div>

                  {/* KPI 3 */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-900">{projectData.delays.task_delays.length}</div>
                    <div className="text-sm font-medium text-red-700">NCR ouvertes</div>
                    <div className="text-xs text-red-600">Non-conformités actives</div>
                    <div className="text-xs text-red-600 mt-1">
                      1 critique, {Math.max(0, projectData.delays.task_delays.length - 1)} mineures
                    </div>
                  </div>

                  {/* KPI 4 */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-900">1.8 jours</div>
                    <div className="text-sm font-medium text-purple-700">Délai moyen traitement</div>
                    <div className="text-xs text-purple-600">Réactivité équipe</div>
                    <div className="text-xs text-green-600 mt-1">Objectif: 2 jours</div>
                  </div>
                </div>
              </div>

              {/* Section 6: Messages & Coordination - Updated Équipe Projet */}
              <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Messages & Coordination</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Équipe Projet - Updated to show all profiles */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Équipe Projet</h3>
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setSalarieFilter('actif')}
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                            salarieFilter === 'actif' 
                              ? 'bg-green-500 text-white' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Actifs
                        </button>
                        <button
                          onClick={() => setSalarieFilter('inactif')}
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                            salarieFilter === 'inactif' 
                              ? 'bg-red-500 text-white' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Inactifs
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {getAllProfiles().map((profile) => {
                        const profileSalaries = getAllSalaries().filter(s => 
                          s.profils.some(p => p.id === profile.id) &&
                          (salarieFilter === 'actif' ? s.statut === 'actif' : s.statut === 'inactif')
                        )
                        const profileTasks = getProfileTasks(profile.id)
                        
                        return (
                          <div key={`profile-${profile.id}`} className="bg-gray-50 rounded-lg p-3">
                            <div className="font-medium text-gray-900">{profile.nom_profil}</div>
                            <div className="text-sm text-gray-600">{profile.poste_profil}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {profileSalaries.length} salarié(s) • {profileTasks.length} tâche(s)
                            </div>
                            
                            {/* Show profile tasks */}
                            {profileTasks.slice(0, 2).map(task => (
                              <div key={`profile-task-${task.id}`} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded mt-1">
                                {task.nom}
                              </div>
                            ))}
                            
                            {profileTasks.length > 2 && (
                              <div className="text-xs text-gray-400 mt-1">
                                +{profileTasks.length - 2} autres tâches...
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Right: Chat */}
                  <div>
                    <h3 className="font-semibold mb-4">Messages</h3>
                    <div className="border border-gray-300 rounded-lg h-64 flex flex-col">
                      <div className="flex-1 p-3 overflow-y-auto space-y-2">
                        {projectData.messages.map((message) => (
                          <div key={`message-${message.id}`} className="bg-blue-50 rounded p-2">
                            <div className="text-sm">{message.mssg}</div>
                            <div className="text-xs text-gray-500">Par utilisateur #{message.sent_by}</div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-300 p-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Tapez votre message..."
                            className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm"
                          />
                          <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 7: Gestion des Processus & Affectations - Updated */}
              <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Settings className="w-6 h-6 text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Gestion des Processus & Affectations</h2>
                  </div>
                  
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setProcessMode('processus')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        processMode === 'processus' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Processus Détaillés
                    </button>
                    <button
                      onClick={() => setProcessMode('affectation')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        processMode === 'affectation' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Affectation
                    </button>
                  </div>
                </div>
                
                {processMode === 'processus' ? (
                  <div className="space-y-4">
                    {projectData.plans.map((plan, index) => {
                      const requiredDocs = plan.plan_docs.filter(pd => {
                        const docReq = projectData.documents.find(d => d.doc_req.id === pd.doc_req_id)
                        return docReq?.doc_req.type === 'entry'
                      })
                      
                      const livrableDocs = plan.plan_docs.filter(pd => {
                        const docReq = projectData.documents.find(d => d.doc_req.id === pd.doc_req_id)
                        return docReq?.doc_req.type === 'livrable'
                      })
                      
                      return (
                        <div key={`process-plan-${plan.id}`} className="border border-gray-200 rounded-lg p-6 bg-gradient-to-r from-gray-50 to-white">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left: Phase Info */}
                            <div>
                              <div className="text-lg font-semibold text-gray-900 mb-1">
                                Phase {index}
                              </div>
                              <div className="text-base text-gray-700 mb-2">
                                {plan.mssg}
                              </div>
                              <div className="text-sm text-gray-600 mb-3">
                                RP {/* Responsable Projet */}
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                {projectData.projet.responsable.name}
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                {formatDate(plan.date_fin)}
                              </div>
                              <div className="mb-2">
                                {getStatusBadge(plan.statut)}
                              </div>
                              <div className="text-sm text-orange-600 font-medium">
                               
                              </div>
                              <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                                Gérer
                              </button>
                            </div>
                            
                            {/* Middle: Documents d'entrée */}
                            <div>
                              <div className="font-semibold text-gray-900 mb-3">Documents d'entrée</div>
                              <div className="space-y-2">
                                {requiredDocs.map(planDoc => {
                                  const docReq = projectData.documents.find(d => d.doc_req.id === planDoc.doc_req_id)
                                  return (
                                    <div key={`required-${planDoc.id}`} className="text-sm text-gray-700 bg-blue-50 px-3 py-2 rounded">
                                      {docReq?.doc_req.nom || 'Document requis'}
                                    </div>
                                  )
                                })}
                                
                                {requiredDocs.length === 0 && (
                                  <div className="text-sm text-gray-500 italic">
                                    Aucun document d'entrée requis
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Right: Livrables de sortie */}
                            <div>
                              <div className="font-semibold text-gray-900 mb-3">Livrables de sortie</div>
                              <div className="space-y-2">
                                {livrableDocs.map(planDoc => {
                                  const docReq = projectData.documents.find(d => d.doc_req.id === planDoc.doc_req_id)
                                  return (
                                    <div key={`livrable-${planDoc.id}`} className="text-sm text-gray-700 bg-green-50 px-3 py-2 rounded">
                                      {docReq?.doc_req.nom || 'Document livrable'}
                                    </div>
                                  )
                                })}
                                
                                {livrableDocs.length === 0 && (
                                  <div className="text-sm text-gray-500 italic">
                                    Aucun livrable spécifié
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  /* Affectation - Updated to show profiles */
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profil</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poste</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plans</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tâches dans ce Projet</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salariés Affectés</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {getAllProfiles().map((profile) => {
                          const profileTasks = getProfileTasks(profile.id)
                          const profileSalaries = getAllSalaries().filter(s => 
                            s.profils.some(p => p.id === profile.id)
                          )
                          const profilePlans = projectData.plans.filter(plan => 
                            plan.tasks.some(task => 
                              task.salaries_ids.some(salarieId =>
                                profileSalaries.some(s => s.id === salarieId)
                              )
                            )
                          )
                          
                          return (
                            <tr key={`affectation-profile-${profile.id}`} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{profile.nom_profil}</div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {profile.poste_profil}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="space-y-1">
                                  {profilePlans.map((plan, index) => (
                                    <div key={`plan-${plan.id}`} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      Phase {index}: {plan.mssg}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="space-y-1">
                                  {profileTasks.slice(0, 3).map(task => (
                                    <div key={`task-${task.id}`} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                      {task.nom} ({getStatusBadge(task.statut)})
                                    </div>
                                  ))}
                                  {profileTasks.length > 3 && (
                                    <div className="text-xs text-gray-500">
                                      +{profileTasks.length - 3} autres...
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="space-y-1">
                                  {profileSalaries.slice(0, 2).map(salarie => (
                                    <div key={`salarie-${salarie.id}`} className="text-xs">
                                      {salarie.nom} {salarie.prenom}
                                    </div>
                                  ))}
                                  {profileSalaries.length > 2 && (
                                    <div className="text-xs text-gray-500">
                                      +{profileSalaries.length - 2} autres...
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Empty State */}
          {!selectedProjetId && !loading && (
            <div className="bg-white rounded-lg shadow-md border border-gray-100 p-12">
              <div className="text-center">
                <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez un projet</h3>
                <p className="text-gray-500">
                  Choisissez un projet dans la liste déroulante ci-dessus pour afficher le dashboard de suivi.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Plan Details Modal */}
        {showPlanDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Détails de la Phase</h3>
                  <button
                    onClick={() => setShowPlanDetails(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {projectData?.plans.find(p => p.id === showPlanDetails) && (
                  <div className="space-y-4">
                    {/* Plan details content */}
                    <div className="text-sm text-gray-600">
                      Informations détaillées de la phase...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Document Action Modal - Updated */}
        {showDocPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Actions Document</h3>
                  <button
                    onClick={() => setShowDocPopup(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {showDocPopup.fileId && showDocPopup.fileId !== "" ? (
                    <>
                      <button
                        onClick={() => handleDownloadDoc(showDocPopup.fileId!)}
                        className="w-full flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Télécharger
                      </button>
                      <button
                        onClick={() => handleApproveDoc(showDocPopup.fileId!)}
                        className="w-full flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded transition-colors"
                      >
                        <FileCheck className="w-4 h-4" />
                        Approuver
                      </button>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Ajouter un commentaire..."
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              handleCommentDoc(showDocPopup.fileId!, e.currentTarget.value)
                            }
                          }}
                        />
                        <button className="w-full flex items-center gap-2 px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          Commenter
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center py-4 text-gray-500">
                        Document non disponible pour téléchargement
                      </div>
                      <button
                        className="w-full flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded transition-colors"
                        onClick={() => {
                          // Handle approve action even without file
                          addMessage('info', 'Document approuvé sans fichier')
                          setShowDocPopup(null)
                        }}
                      >
                        <FileCheck className="w-4 h-4" />
                        Approuver
                      </button>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Ajouter un commentaire..."
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              addMessage('success', 'Commentaire ajouté')
                              setShowDocPopup(null)
                            }
                          }}
                        />
                        <button className="w-full flex items-center gap-2 px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          Commenter
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default SuiviControleDashboard