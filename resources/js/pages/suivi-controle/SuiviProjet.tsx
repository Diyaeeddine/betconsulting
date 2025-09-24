"use client"
import type React from "react"
import { useState, useEffect, useCallback } from "react"
import {
  Users, MapPin, Car, Wrench, Monitor, Phone, Mail,
  Calendar, DollarSign, CheckCircle, Clock, AlertCircle,
  XCircle, X, ChevronDown, Building2, User, Truck, Laptop
} from "lucide-react"
import AppLayout from "@/layouts/app-layout"
import { Head, usePage } from "@inertiajs/react"

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
  surface: string
  radius: string
  salarie_ids: number[]
  statut_tech: string
  statut_final: string
  projet_id: number
  created_at: string
  updated_at: string
}

interface Profil {
  id: number
  nom_profil: string
  poste_profil: string
}

interface Vehicule {
  id: number
  modele: string
  matricule: string
  marque: string
  type: string
  etat: string
  cout_location_jour: string | null
  date_debut_location: string | null
  date_fin_location: string | null
  cout_location: string | null
  duree_location: string | null
  date_affectation: string | null
  date_disponibilite: string | null
  duree_affectation: string | null
  salarie_id: number
  statut: string
  date_achat: string
  type_paiement: string
  montant_achat: string
  montant_credit_total: string | null
  montant_credit_mensuel: string | null
  duree_credit_mois: string | null
  date_debut_credit: string | null
  created_at: string
  updated_at: string
}

interface Materiel {
  id: number
  nom: string
  marque: string
  type: string
  etat: string
  cout_location_jour: string | null
  date_acquisition: string
  duree_location: string | null
  statut: string
  type_paiement: string
  montant_achat: string
  montant_credit_total: string | null
  montant_credit_mensuel: string | null
  duree_credit_mois: string | null
  date_debut_credit: string | null
  date_debut_location: string | null
  date_fin_location: string | null
  cout_location: string | null
  salarie_id: number
  created_at: string
  updated_at: string
}

interface Logiciel {
  id: number
  name: string
  domaine: string
  description: string
  output: string
  statut: string
  created_at: string
  updated_at: string
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
  profils: Profil[]
  vehicules: Vehicule[]
  materiels: Materiel[]
  terrains: Terrain[]
  created_at: string
  updated_at: string
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
  budget_total: string
  budget_utilise: string
  date_debut: string
  date_fin: string
  statut: string
  client: string
  lieu_realisation: string
  responsable_id: number
  type_projet: string
  latitude: string
  longitude: string
  radius: string
  rh_needs: RhNeed[]
  terrain_ids: number[]
  salarie_ids: number[]
  terrains: Terrain[]
  salaries: Salarie[]
  created_at: string
  updated_at: string
}

interface ProjectResourcesData {
  projet: Projet
  terrains: Terrain[]
  salaries: Salarie[]
  vehicules: Vehicule[]
  materiels: Materiel[]
  logiciels: Logiciel[]
}

interface MessageState {
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  id: string
}

// Helper function to truncate text
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

// Status badge component
const getStatusBadge = (statut: string) => {
  const statusConfig = {
    en_cours: { bg: "bg-blue-100", text: "text-blue-800", icon: Clock, label: "En cours" },
    en_attente: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock, label: "En attente" },
    en_revision: { bg: "bg-yellow-100", text: "text-yellow-800", icon: AlertCircle, label: "En révision" },
    valide: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle, label: "Validé" },
    termine: { bg: "bg-gray-100", text: "text-gray-800", icon: XCircle, label: "Terminé" },
    actif: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle, label: "Actif" },
    inactif: { bg: "bg-red-100", text: "text-red-800", icon: XCircle, label: "Inactif" },
    disponible: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle, label: "Disponible" },
    en_panne: { bg: "bg-red-100", text: "text-red-800", icon: XCircle, label: "En panne" },
    en_mission: { bg: "bg-blue-100", text: "text-blue-800", icon: Clock, label: "En mission" }
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

const breadcrumbs = [
  {
    title: "Dashboard Suivi & Contrôle des Travaux",
    href: "/suivi-controle/gestion-ressources",
  },
]

export default function GestionRessourcesProjet() {
  const { props } = usePage()
  const { projets: initialProjets } = props as { projets: { id: number, nom: string }[] }

  // States
  const [projets, setProjets] = useState<{ id: number, nom: string }[]>(initialProjets || [])
  const [selectedProjetId, setSelectedProjetId] = useState<number | null>(null)
  const [projectData, setProjectData] = useState<ProjectResourcesData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageState[]>([])

  // Message handling functions
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

  // Fetch project resources using regular fetch instead of Inertia router.get
  const fetchProjectResources = useCallback(async (projetId: number) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/suivi-controle/fetch-projet/${projetId}`, {
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

      const data: ProjectResourcesData = await response.json()
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
    fetchProjectResources(projetId)
  }

  // Format currency
  const formatCurrency = (amount: string | null) => {
    if (!amount) return '-'
    return `${parseFloat(amount).toLocaleString()} MAD`
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  // Get salarie name with profile
  const getSalarieDisplayName = (salarie: Salarie) => {
    const profile = salarie.profils?.[0]
    if (profile) {
      return `${salarie.nom} ${salarie.prenom} (${profile.poste_profil})`
    }
    return `${salarie.nom} ${salarie.prenom}`
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="min-h-screen bg-gray-50 p-6">
        <Head title="Gestion Ressources Projet" />
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header with Title, Project Selector, and Notifications */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 bg-white rounded-lg shadow-md border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900"> Projet : </h1>
              
              {/* Project Selection Dropdown */}
              <div className="min-w-64">
                <div className="relative">
                  <select
                    value={selectedProjetId || ''}
                    onChange={(e) => {
                      const id = e.target.value ? parseInt(e.target.value) : null
                      if (id) handleProjetSelect(id)
                    }}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    disabled={loading}
                  >
                    <option value="">Choisir un projet...</option>
                    {projets.map(projet => (
                      <option key={projet.id} value={projet.id}>
                        {projet.nom}
                      </option>
                    ))}
                  </select>
                  {/* <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /> */}
                </div>
              </div>
            </div>

            {/* Loading indicator when fetching */}
            {loading && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Chargement...</span>
              </div>
            )}
          </div>

          {/* Messages Display - Fixed position notifications */}
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

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-lg shadow-md border border-gray-100 p-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des données du projet...</p>
              </div>
            </div>
          )}

          {/* Project Data Display */}
          {projectData && !loading && (
            <>
              {/* Project Overview */}
              <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">{projectData.projet.nom}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Budget Total</div>
                    <div className="text-lg font-bold text-blue-900">{formatCurrency(projectData.projet.budget_total)}</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-sm text-red-600 font-medium">Budget Utilisé</div>
                    <div className="text-lg font-bold text-red-900">{formatCurrency(projectData.projet.budget_utilise)}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Date Début</div>
                    <div className="text-lg font-bold text-green-900">{formatDate(projectData.projet.date_debut)}</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Statut</div>
                    <div className="mt-1">{getStatusBadge(projectData.projet.statut)}</div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p><strong>Description:</strong> {projectData.projet.description}</p>
                  <p><strong>Client:</strong> {projectData.projet.client}</p>
                  <p><strong>Lieu:</strong> <TruncatedText text={projectData.projet.lieu_realisation} maxLength={100} /></p>
                </div>
              </div>

              {/* First Section: RH Needs and Project Salaries */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* RH Needs Table */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Besoins RH ({projectData.projet.rh_needs?.length || 0})</h3>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profil</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poste</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {projectData.projet.rh_needs?.map((need, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <TruncatedText text={need.profilename} maxLength={20} />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <TruncatedText text={need.profileposte} maxLength={25} />
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {need.number}
                              </span>
                            </td>
                          </tr>
                        )) || (
                          <tr>
                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                              Aucun besoin RH défini
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Project Salaries Table */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 bg-green-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Salariés du Projet ({projectData.salaries?.length || 0})</h3>
                    </div>
                  </div>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {projectData.salaries?.map((salarie) => (
                          <tr key={salarie.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                <TruncatedText text={getSalarieDisplayName(salarie)} maxLength={25} />
                              </div>
                              <div className="text-xs text-gray-500">
                                Embauché le {formatDate(salarie.date_embauche)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Phone className="w-3 h-3" />
                                {salarie.telephone}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Mail className="w-3 h-3" />
                                <TruncatedText text={salarie.email} maxLength={20} />
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(salarie.statut)}
                            </td>
                          </tr>
                        )) || (
                          <tr>
                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                              Aucun salarié affecté au projet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Second Section: Terrains */}
              <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-orange-50 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Terrains ({projectData.terrains?.length || 0})</h3>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom Terrain</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Surface (m²)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salariés Affectés</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {projectData.terrains?.map((terrain) => (
                        <tr key={terrain.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            <TruncatedText text={terrain.name} maxLength={20} />
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <TruncatedText text={terrain.description} maxLength={30} />
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {parseInt(terrain.surface).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {terrain.salarie_ids?.length || 0} salariés
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(terrain.statut_tech)}
                          </td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            Aucun terrain associé au projet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Third Section: Vehicles */}
              <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-purple-50 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Véhicules ({projectData.vehicules?.length || 0})</h3>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Véhicule</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matricule</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salarié Affecté</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant Achat</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {projectData.vehicules?.map((vehicule) => {
                        const assignedSalarie = projectData.salaries?.find(s => s.id === vehicule.salarie_id)
                        return (
                          <tr key={vehicule.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {vehicule.marque} {vehicule.modele}
                              </div>
                              <div className="text-xs text-gray-500">
                                {vehicule.type}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                              {vehicule.matricule}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {assignedSalarie ? (
                                <TruncatedText text={`${assignedSalarie.nom} ${assignedSalarie.prenom}`} maxLength={20} />
                              ) : (
                                <span className="text-gray-400">Non affecté</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {formatCurrency(vehicule.montant_achat)}
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(vehicule.etat)}
                            </td>
                          </tr>
                        )
                      }) || (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            Aucun véhicule associé au projet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Fourth Section: Materials and Software */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Materials Table */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 bg-yellow-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-yellow-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Matériels ({projectData.materiels?.length || 0})</h3>
                    </div>
                  </div>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salarié</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {projectData.materiels?.map((materiel) => {
                          const assignedSalarie = projectData.salaries?.find(s => s.id === materiel.salarie_id)
                          return (
                            <tr key={materiel.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="text-sm font-medium text-gray-900">
                                  <TruncatedText text={materiel.nom} maxLength={15} />
                                </div>
                                <div className="text-xs text-gray-500">
                                  {materiel.marque} - {materiel.type}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {assignedSalarie ? (
                                  <TruncatedText text={`${assignedSalarie.nom} ${assignedSalarie.prenom}`} maxLength={15} />
                                ) : (
                                  <span className="text-gray-400">Non affecté</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-900">
                                {formatCurrency(materiel.montant_achat)}
                              </td>
                              <td className="px-4 py-3">
                                {getStatusBadge(materiel.etat)}
                              </td>
                            </tr>
                          )
                        }) || (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">
                              Aucun matériel
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Software Table */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 bg-indigo-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Logiciels ({projectData.logiciels?.length || 0})</h3>
                    </div>
                  </div>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domaine</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Output</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {projectData.logiciels?.map((logiciel) => (
                          <tr key={logiciel.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">
                                <TruncatedText text={logiciel.name} maxLength={15} />
                              </div>
                              <div className="text-xs text-gray-500">
                                <TruncatedText text={logiciel.description} maxLength={25} />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <TruncatedText text={logiciel.domaine} maxLength={15} />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <TruncatedText text={logiciel.output} maxLength={15} />
                            </td>
                            <td className="px-4 py-3">
                              {logiciel.statut}
                            </td>
                          </tr>
                        )) || (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">
                              Aucun logiciel
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Empty State when no project selected */}
          {!selectedProjetId && !loading && (
            <div className="bg-white rounded-lg shadow-md border border-gray-100 p-12">
              <div className="text-center">
                <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez un projet</h3>
                <p className="text-gray-500">
                  Choisissez un projet dans la liste déroulante ci-dessus pour afficher ses ressources.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}