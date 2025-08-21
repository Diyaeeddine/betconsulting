"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Head, router, usePage } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Edit, Plus, Eye, EyeOff, Users, Shield, Building, FolderPlus, X, Search } from "lucide-react"
import { toast } from "sonner"

interface User {
  id: number
  name: string
  email: string
  created_at: string
  roles?: Array<{ name: string }>
}

interface Salarie {
  user: any
  id: number
  nom: string
  prenom: string
  email: string
  telephone: string
  poste?: string
  salaire_mensuel?: number
  date_embauche?: string
  statut?: string
  projets?: Projet[]
}

interface Projet {
  id: number
  nom: string
  description?: string
  statut?: string
  client?: string
}

interface PageProps extends Record<string, any> {
  users: User[]
  salaries: Salarie[]
  projets?: Projet[] // Made optional to handle undefined case
}

interface FormData {
  nom: string
  prenom: string
  email: string
  telephone: string
  password: string
  poste: string
  salaire_mensuel: string
  date_embauche: string
  statut: string
}

const initialFormData: FormData = {
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  password: "",
  poste: "",
  salaire_mensuel: "",
  date_embauche: "",
  statut: "actif",
}

export default function Access() {
  const pageProps = usePage<PageProps>().props
  const { users = [], salaries = [], projets = [] } = pageProps

  useEffect(() => {
    console.log("[v0] Access component mounted")
    console.log("[v0] Props received:", { users: users?.length, salaries: salaries?.length, projets: projets?.length })
  }, [])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedUserDetails, setSelectedUserDetails] = useState<{ user: User; salarie?: Salarie } | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Salarie | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedProjects, setSelectedProjects] = useState<number[]>([])
  const [projectSearch, setProjectSearch] = useState("")

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [projectFilter, setProjectFilter] = useState<string>("all")

  const breadcrumbs = [
    { title: "Dashboard", href: "/ressources-humaines/dashboard" },
    { title: "Gestion des Accès", href: "/ressources-humaines/access" },
  ]

  const filteredUsers = users.filter((user) => {
    const salarie = salaries?.find((s) => s.user?.id === user.id)

    // Search filter
    const searchMatch =
      searchTerm === "" ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salarie?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salarie?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salarie?.telephone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salarie?.poste?.toLowerCase().includes(searchTerm.toLowerCase())

    // Status filter
    const statusMatch = statusFilter === "all" || salarie?.statut === statusFilter

    // Date filter
    let dateMatch = true
    if (dateFilter !== "all" && salarie?.date_embauche) {
      const hireDate = new Date(salarie.date_embauche)
      const now = new Date()
      const diffTime = now.getTime() - hireDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      switch (dateFilter) {
        case "recent":
          dateMatch = diffDays <= 30
          break
        case "6months":
          dateMatch = diffDays <= 180
          break
        case "1year":
          dateMatch = diffDays <= 365
          break
        case "older":
          dateMatch = diffDays > 365
          break
      }
    }

    // Project filter
    let projectMatch = true
    if (projectFilter === "with_projects") {
      projectMatch = (salarie?.projets?.length ?? 0) > 0
    } else if (projectFilter === "without_projects") {
      projectMatch = (salarie?.projets?.length ?? 0) === 0
    }


    return searchMatch && statusMatch && dateMatch && projectMatch
  })

  const openDetailsDialog = (user: User) => {
    const salarie = salaries?.find((s) => s.user?.id === user.id)
    setSelectedUserDetails({ user, salarie })
    setIsDetailsDialogOpen(true)
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    console.log("[v0] Form submission started", { editingUser: !!editingUser, formData })

    setLoading(true)

    const data = {
      ...formData,
      salaire_mensuel: formData.salaire_mensuel ? Number.parseFloat(formData.salaire_mensuel) : null,
    }

    try {
      if (editingUser) {
        router.put(`/ressources-humaines/access/${editingUser.id}`, data, {
          onSuccess: () => {
            console.log("[v0] Update successful")
            toast.success("Accès mis à jour avec succès")
            setIsDialogOpen(false)
            setEditingUser(null)
            setFormData(initialFormData)
          },
          onError: (errors: any) => {
            console.log("[v0] Update error:", errors)
            toast.error(errors?.error || "Une erreur est survenue")
          },
          onFinish: () => {
            setLoading(false)
          },
        })
      } else {
        router.post("/ressources-humaines/access", data, {
          onSuccess: () => {
            console.log("[v0] Create successful")
            toast.success("Accès créé avec succès ! Un email avec les informations de connexion a été envoyé.")
            setIsDialogOpen(false)
            setEditingUser(null)
            setFormData(initialFormData)
          },
          onError: (errors: any) => {
            console.log("[v0] Create error:", errors)
            toast.error(errors?.error || "Une erreur est survenue")
          },
          onFinish: () => {
            setLoading(false)
          },
        })
      }
    } catch (error) {
      console.log("[v0] Catch error:", error)
      toast.error("Une erreur est survenue")
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    console.log("[v0] Edit button clicked", { user })

    try {
      const salarie = salaries?.find((s) => s.user?.id === user.id)
      console.log("[v0] Found salarie:", salarie)

      setEditingUser(user)
      setFormData({
        nom: salarie?.nom || "",
        prenom: salarie?.prenom || "",
        email: user.email || "",
        telephone: salarie?.telephone || "",
        password: "",
        poste: salarie?.poste || "",
        salaire_mensuel: salarie?.salaire_mensuel?.toString() || "",
        date_embauche: salarie?.date_embauche || "",
        statut: salarie?.statut || "actif",
      })
      setIsDialogOpen(true)
      console.log("[v0] Dialog should open now")
    } catch (error) {
      console.error("[v0] Error in handleEdit:", error)
      toast.error("Erreur lors de l'ouverture du formulaire")
    }
  }

  const handleDelete = async (user: User) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet accès ?")) {
      try {
        router.delete(`/ressources-humaines/access/${user.id}`, {
          onSuccess: () => {
            toast.success("Accès supprimé avec succès")
          },
          onError: () => {
            toast.error("Erreur lors de la suppression")
          },
        })
      } catch (error) {
        toast.error("Erreur lors de la suppression")
      }
    }
  }

  const openCreateDialog = () => {
    console.log("[v0] Create button clicked")

    try {
      setEditingUser(null)
      setFormData(initialFormData)
      setIsDialogOpen(true)
      console.log("[v0] Create dialog should open now")
    } catch (error) {
      console.error("[v0] Error in openCreateDialog:", error)
      toast.error("Erreur lors de l'ouverture du formulaire")
    }
  }

  const openProjectDialog = (salarie: Salarie) => {
    setSelectedEmployee(salarie)
    // Set currently assigned projects
    setSelectedProjects(salarie.projets?.map((p) => p.id) || [])
    setProjectSearch("")
    setIsProjectDialogOpen(true)
  }

  const handleProjectAssignment = async () => {
    if (!selectedEmployee) return

    setLoading(true)
    try {
      router.post(
        `/ressources-humaines/access/${selectedEmployee.id}/affecter-projets`,
        {
          projet_ids: selectedProjects,
        },
        {
          onSuccess: () => {
            toast.success("Projets affectés avec succès")
            setIsProjectDialogOpen(false)
            setSelectedEmployee(null)
            setSelectedProjects([])
          },
          onError: (errors: any) => {
            toast.error(errors?.error || "Erreur lors de l'affectation des projets")
          },
          onFinish: () => {
            setLoading(false)
          },
        },
      )
    } catch (error) {
      toast.error("Erreur lors de l'affectation des projets")
      setLoading(false)
    }
  }

  const toggleProject = (projectId: number) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId],
    )
  }

  const filteredProjects = Array.isArray(projets)
    ? projets.filter(
        (projet) =>
          projet?.nom?.toLowerCase().includes(projectSearch.toLowerCase()) ||
          projet?.client?.toLowerCase().includes(projectSearch.toLowerCase()),
      )
    : []

  const getStatusBadge = (statut?: string) => {
    const statusConfig = {
      actif: {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: "Actif",
        icon: "●",
      },
      inactif: {
        bg: "bg-red-50 text-red-700 border-red-200",
        label: "Inactif",
        icon: "●",
      },
      conge: {
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        label: "En congé",
        icon: "●",
      },
      demission: {
        bg: "bg-gray-50 text-gray-700 border-gray-200",
        label: "Démission",
        icon: "●",
      },
    }

    const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig.inactif

    return (
      <Badge className={`${config.bg} border font-medium`} variant="outline">
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </Badge>
    )
  }

  const getProjectStatusBadge = (statut?: string) => {
    const statusConfig = {
      en_cours: { bg: "bg-blue-50 text-blue-700 border-blue-200", label: "En cours" },
      termine: { bg: "bg-green-50 text-green-700 border-green-200", label: "Terminé" },
      en_attente: { bg: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "En attente" },
      suspendu: { bg: "bg-red-50 text-red-700 border-red-200", label: "Suspendu" },
    }

    const config = statusConfig[statut as keyof typeof statusConfig] || {
      bg: "bg-gray-50 text-gray-700 border-gray-200",
      label: statut || "Non défini",
    }

    return (
      <Badge className={`${config.bg} border text-xs`} variant="outline">
        {config.label}
      </Badge>
    )
  }

  if (!users || !Array.isArray(users)) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Gestion des Accès" />
        <div className="p-4">
          <div className="text-center py-8">
            <p className="text-red-600">Erreur: Données utilisateurs non disponibles</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Recharger la page
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gestion des Accès" />

      <div className="space-y-8 p-4">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestion des Accès</h1>
                <p className="text-gray-500 font-medium">Créez et gérez les comptes d'accès pour les salariés</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-6 mt-6">
              <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Total Accès</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-1">{filteredUsers?.length || 0}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-medium text-gray-600">Actifs</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {filteredUsers?.filter((user) => {
                    const salarie = salaries?.find((s) => s.user?.id === user.id)
                    return salarie?.statut === "actif"
                  }).length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openCreateDialog}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nouvel Accès
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pb-4 border-b border-gray-100">
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {editingUser ? "Modifier l'accès" : "Créer un nouvel accès"}
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  {editingUser
                    ? "Modifiez les informations de l'accès"
                    : 'Créez un nouveau compte d\'accès avec le rôle "salarié"'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Informations Personnelles
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="prenom" className="text-sm font-medium text-gray-700">
                        Prénom *
                      </Label>
                      <Input
                        id="prenom"
                        value={formData.prenom}
                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                        required
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="nom" className="text-sm font-medium text-gray-700">
                        Nom *
                      </Label>
                      <Input
                        id="nom"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        required
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="telephone" className="text-sm font-medium text-gray-700">
                        Téléphone *
                      </Label>
                      <Input
                        id="telephone"
                        value={formData.telephone}
                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                        required
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Sécurité
                  </h3>
                  <div>
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Mot de passe {editingUser ? "(laisser vide pour ne pas modifier)" : "*"}
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!editingUser}
                        className="pr-10 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Informations Professionnelles
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="poste" className="text-sm font-medium text-gray-700">
                        Poste
                      </Label>
                      <Input
                        id="poste"
                        value={formData.poste}
                        onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="salaire" className="text-sm font-medium text-gray-700">
                        Salaire mensuel
                      </Label>
                      <Input
                        id="salaire"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.salaire_mensuel}
                        onChange={(e) => setFormData({ ...formData, salaire_mensuel: e.target.value })}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="date_embauche" className="text-sm font-medium text-gray-700">
                        Date d'embauche
                      </Label>
                      <Input
                        id="date_embauche"
                        type="date"
                        value={formData.date_embauche}
                        onChange={(e) => setFormData({ ...formData, date_embauche: e.target.value })}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="statut" className="text-sm font-medium text-gray-700">
                        Statut
                      </Label>
                      <Select
                        value={formData.statut}
                        onValueChange={(value) => setFormData({ ...formData, statut: value })}
                      >
                        <SelectTrigger className="mt-1 focus:ring-blue-500 focus:border-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="actif">Actif</SelectItem>
                          <SelectItem value="inactif">Inactif</SelectItem>
                          <SelectItem value="conge">En congé</SelectItem>
                          <SelectItem value="demission">Démission</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="px-6 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Enregistrement..." : editingUser ? "Modifier" : "Créer"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              Recherche et Filtres
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, email, téléphone, poste..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Statut</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                    <SelectItem value="conge">En congé</SelectItem>
                    <SelectItem value="demission">Démission</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Date d'embauche</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les dates</SelectItem>
                    <SelectItem value="recent">Moins de 30 jours</SelectItem>
                    <SelectItem value="6months">Moins de 6 mois</SelectItem>
                    <SelectItem value="1year">Moins d'1 an</SelectItem>
                    <SelectItem value="older">Plus d'1 an</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Projets</Label>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="with_projects">Avec projets</SelectItem>
                    <SelectItem value="without_projects">Sans projets</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setDateFilter("all")
                    setProjectFilter("all")
                  }}
                  className="w-full hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filteredUsers.length === 0 ? (
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="font-medium text-gray-500">Aucun accès trouvé</p>
                <p className="text-sm text-gray-400">Essayez de modifier vos critères de recherche</p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((user) => {
              const salarie = salaries?.find((s) => s.user?.id === user.id)

              return (
                <Card
                  key={user.id}
                  className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white cursor-pointer"
                  onClick={() => openDetailsDialog(user)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                          {user.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{user.name || "Nom non défini"}</h3>
                          <p className="text-gray-600 font-medium">{user.email || "Email non défini"}</p>
                          {salarie?.poste && <p className="text-sm text-blue-600 font-medium">{salarie.poste}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(salarie?.statut)}
                        {salarie?.projets && salarie.projets.length > 0 && (
                          <Badge className="bg-green-50 text-green-700 border-green-200">
                            {salarie.projets.length} projet{salarie.projets.length > 1 ? "s" : ""}
                          </Badge>
                        )}
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          {salarie && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openProjectDialog(salarie)}
                              className="hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors"
                            >
                              <FolderPlus className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(user)}
                            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4 border-b border-gray-100">
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                Détails de l'accès
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Informations complètes sur l'accès utilisateur
              </DialogDescription>
            </DialogHeader>

            {selectedUserDetails && (
              <div className="space-y-6 py-4">
                {/* User Info Section */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-medium font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Informations Utilisateur
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="font-medium font-semibold">Nom complet</Label>
                      <p className=" text-gray-900 ">
                        {selectedUserDetails.user.name || "Non défini"}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium font-semibold">Email</Label>
                      <p className=" text-gray-900 ">
                        {selectedUserDetails.user.email || "Non défini"}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium font-semibold">Date de création du compte</Label>
                      <p className=" text-gray-900">
                        {selectedUserDetails.user.created_at
                          ? new Date(selectedUserDetails.user.created_at).toLocaleDateString("fr-FR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Non disponible"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-md font-semibold">Rôles</Label>
                      <div>
                        {selectedUserDetails.user.roles?.map((role) => (
                          <Badge key={role.name} className="bg-purple-50 text-purple-700 border-purple-200 mr-2">
                            {role.name}
                          </Badge>
                        )) || <span className="text-gray-500">Aucun rôle</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employee Info Section */}
                {selectedUserDetails.salarie && (
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="font-medium font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Building className="h-5 w-5 text-green-600" />
                      Informations Professionnelles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Prénom</Label>
                        <p className="font-medium font-semibold text-gray-900 mt-1">
                          {selectedUserDetails.salarie.prenom || "Non défini"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Nom</Label>
                        <p className="font-medium font-semibold text-gray-900 mt-1">
                          {selectedUserDetails.salarie.nom || "Non défini"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Téléphone</Label>
                        <p className="font-medium font-semibold text-gray-900 mt-1">
                          {selectedUserDetails.salarie.telephone || "Non renseigné"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Poste</Label>
                        <p className="font-medium font-semibold text-gray-900 mt-1">
                          {selectedUserDetails.salarie.poste || "Non défini"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Salaire mensuel</Label>
                        <p className="font-medium font-semibold text-gray-900 mt-1">
                          {selectedUserDetails.salarie.salaire_mensuel
                            ? `${selectedUserDetails.salarie.salaire_mensuel.toLocaleString()} DH`
                            : "Non renseigné"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Date d'embauche</Label>
                        <p className="font-medium font-semibold text-gray-900 mt-1">
                          {selectedUserDetails.salarie.date_embauche
                            ? new Date(selectedUserDetails.salarie.date_embauche).toLocaleDateString("fr-FR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "Non renseigné"}
                        </p>
                      </div>
                      <div className="md:col-span-2 lg:col-span-3">
                        <Label className="text-sm font-medium text-gray-600">Statut</Label>
                        <div className="mt-1">{getStatusBadge(selectedUserDetails.salarie.statut)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Projects Section */}
                {selectedUserDetails.salarie?.projets && selectedUserDetails.salarie.projets.length > 0 && (
                  <div className="bg-amber-50 p-6 rounded-lg">
                    <h3 className="font-medium font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FolderPlus className="h-5 w-5 text-amber-600" />
                      Projets Assignés ({selectedUserDetails.salarie.projets.length})
                    </h3>
                    <div className="grid gap-4">
                      {selectedUserDetails.salarie.projets.map((projet) => (
                        <div key={projet.id} className="bg-white p-4 rounded-lg border border-amber-200">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900">{projet.nom}</h4>
                            {getProjectStatusBadge(projet.statut)}
                          </div>
                          {projet.client && (
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Client:</strong> {projet.client}
                            </p>
                          )}
                          {projet.description && <p className="text-sm text-gray-700">{projet.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailsDialogOpen(false)}
                    className="px-6 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Fermer
                  </Button>
                  <Button
                    onClick={() => {
                      setIsDetailsDialogOpen(false)
                      handleEdit(selectedUserDetails.user)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 shadow-sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Project Assignment Dialog */}
        <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-4 border-b border-gray-100">
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-blue-600" />
                Affecter des projets
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Sélectionnez un ou plusieurs projets à affecter à{" "}
                <span className="font-semibold text-gray-900">
                  {selectedEmployee?.prenom} {selectedEmployee?.nom}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 min-h-0 py-4 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un projet par nom ou client..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="pl-10 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Selected Projects Summary */}
              {selectedProjects.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      {selectedProjects.length} projet(s) sélectionné(s)
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedProjects([])}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Tout désélectionner
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedProjects.map((projectId) => {
                      const projet = projets?.find((p) => p.id === projectId)
                      return projet ? (
                        <Badge key={projectId} className="bg-blue-100 text-blue-800 border-blue-300">
                          {projet.nom}
                          <button
                            onClick={() => toggleProject(projectId)}
                            className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              {/* Projects List */}
              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredProjects.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <FolderPlus className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-medium">Aucun projet trouvé</p>
                    <p className="text-sm">Essayez de modifier votre recherche</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredProjects.map((projet) => (
                      <div
                        key={projet.id}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          selectedProjects.includes(projet.id) ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                        }`}
                        onClick={() => toggleProject(projet.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedProjects.includes(projet.id)}
                            onChange={() => toggleProject(projet.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-1">{projet.nom}</h4>
                                {projet.client && <p className="text-sm text-gray-600 mb-2">Client: {projet.client}</p>}
                                {projet.description && (
                                  <p className="text-sm text-gray-700 line-clamp-2">{projet.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 ml-4">{getProjectStatusBadge(projet.statut)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => setIsProjectDialogOpen(false)}
                className="px-6 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </Button>
              <Button
                onClick={handleProjectAssignment}
                disabled={loading || selectedProjects.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Affectation..." : `Affecter ${selectedProjects.length} projet(s)`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
