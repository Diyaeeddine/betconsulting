"use client"

import { useState, useEffect, useCallback } from "react"

export interface Innovation {
  id: number
  entity_type: "innovation" | "kpi" | "ticket" | "tache" | "document"

  // Innovation fields
  titre: string
  description?: string
  statut: string
  priorite: string
  progression?: number
  budget?: number
  budget_utilise?: number
  budget_alloue?: number
  date_debut?: string
  date_fin_prevue?: string
  objectifs?: string
  risques?: string
  responsable?: { name: string }

  // Task fields
  type_tache?: string
  date_echeance?: string
  temps_estime?: number
  temps_passe?: number
  assignee?: { name: string }

  // Ticket fields
  type?: string
  demandeur?: { name: string }

  // Document fields
  nom_fichier?: string
  type_document?: string
  taille_fichier?: number
  version?: string
  date_upload?: string
  uploaded_by?: string
  chemin_fichier?: string

  // KPI fields
  nom_kpi?: string
  valeur_cible?: number
  valeur_actuelle?: number
  unite?: string

  created_at: string
  updated_at: string
}

export interface DashboardStats {
  total_innovations: number
  innovations_actives: number
  total_taches: number
  taches_en_retard: number
  total_tickets: number
  tickets_ouverts: number
  total_documents: number
  total_kpis: number
  kpis_actifs: number
  innovations: {
    total: number
    actives: number
    terminees: number
    en_retard: number
  }
  taches: {
    total: number
    en_cours: number
    terminees: number
    en_retard: number
  }
  tickets: {
    total: number
    ouverts: number
    en_cours: number
    resolus: number
  }
  documents: {
    total: number
    publics: number
  }
  kpis: {
    total: number
    actifs: number
  }
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch("/api/innovations/dashboard-stats")
  if (!response.ok) {
    throw new Error("Erreur lors du chargement des statistiques")
  }
  return response.json()
}

// Hook for dashboard stats
export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await fetchDashboardStats()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}

// Hook for innovations (projects)
export const useInnovations = (filters?: Record<string, any>) => {
  const [innovations, setInnovations] = useState<Innovation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInnovations = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        entity_type: "innovation",
        ...filters,
      })
      const response = await fetch(`/api/innovation-transition/innovations?${params}`)
      if (!response.ok) throw new Error("Erreur lors du chargement des projets")
      const data = await response.json()
      setInnovations(data.data || data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchInnovations()
  }, [fetchInnovations])

  return { innovations, loading, error, refetch: fetchInnovations }
}

// Hook for single innovation
export const useInnovation = (id: number) => {
  const [innovation, setInnovation] = useState<Innovation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInnovation = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/innovation-transition/innovations/${id}`)
        if (!response.ok) throw new Error("Erreur lors du chargement du projet")
        const data = await response.json()
        setInnovation(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchInnovation()
  }, [id])

  return { innovation, loading, error }
}

// Hook for tasks
export const useTasks = (filters?: Record<string, any>) => {
  const [tasks, setTasks] = useState<Innovation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        entity_type: "tache",
        ...filters,
      })
      const response = await fetch(`/taches?${params}`)
      if (!response.ok) throw new Error("Erreur lors du chargement des tâches")
      const data = await response.json()
      setTasks(data.data || data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const toggleTaskComplete = async (id: number, completed: boolean) => {
    try {
      const response = await fetch(`/taches/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut_tache: completed ? "termine" : "en_cours" }),
      })
      if (!response.ok) throw new Error("Erreur lors de la mise à jour")
      fetchTasks()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    }
  }

  return { tasks, loading, error, toggleTaskComplete, refetch: fetchTasks }
}

// Hook for tickets
export const useTickets = () => {
  const [tickets, setTickets] = useState<Innovation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTickets = useCallback(async (page = 1, filters?: Record<string, any>) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        entity_type: "ticket",
        page: page.toString(),
        ...filters,
      })
      const response = await fetch(`/api/innovation-transition/tickets?${params}`)
      if (!response.ok) throw new Error("Erreur lors du chargement des tickets")
      const data = await response.json()
      setTickets(data.data || data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }, [])

  const createTicket = async (ticketData: any) => {
    const response = await fetch("/api/innovation-transition/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...ticketData, entity_type: "ticket" }),
    })
    if (!response.ok) throw new Error("Erreur lors de la création")
    fetchTickets()
  }

  const updateTicket = async (id: number, data: any) => {
    const response = await fetch(`/api/innovation-transition/tickets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Erreur lors de la mise à jour")
    fetchTickets()
  }

  const deleteTicket = async (id: number) => {
    const response = await fetch(`/api/innovation-transition/tickets/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Erreur lors de la suppression")
    fetchTickets()
  }

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  return { tickets, loading, error, fetchTickets, createTicket, updateTicket, deleteTicket }
}

// Hook for documents
export const useDocuments = () => {
  const [documents, setDocuments] = useState<Innovation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/innovation-transition/documents?entity_type=document")
      if (!response.ok) throw new Error("Erreur lors du chargement des documents")
      const data = await response.json()
      setDocuments(data.data || data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }, [])

  const downloadDocument = async (id: number) => {
    try {
      const response = await fetch(`/api/innovation-transition/documents/${id}/download`)
      if (!response.ok) throw new Error("Erreur lors du téléchargement")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `document-${id}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Erreur téléchargement:", err)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  return { documents, loading, error, downloadDocument, refetch: fetchDocuments }
}

// Export individual functions for direct import
const updateTicketFunction = async (id: number, data: any) => {
  const response = await fetch(`/api/innovation-transition/tickets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Erreur lors de la mise à jour")
}

const deleteTicketFunction = async (id: number) => {
  const response = await fetch(`/api/innovation-transition/tickets/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Erreur lors de la suppression")
}

export { updateTicketFunction as updateTicket, deleteTicketFunction as deleteTicket }
