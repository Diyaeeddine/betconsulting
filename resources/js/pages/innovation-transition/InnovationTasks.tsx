"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Plus,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import AppLayout from "@/layouts/app-layout"
import { useTasks } from "../../hooks/useInnovations"

const InnovationTasks = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")

  const { tasks, loading, error, toggleTaskComplete } = useTasks({
    search: searchTerm,
    statut: statusFilter !== "all" ? statusFilter : undefined,
    priorite: priorityFilter !== "all" ? priorityFilter : undefined,
    assignee: assigneeFilter !== "all" ? assigneeFilter : undefined,
  })

  const breadcrumbs = [
    { label: "Innovation & Transition", href: "/innovation" },
    { label: "Tâches", href: "/innovation/taches" },
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      a_faire: "bg-gray-100 text-gray-800",
      en_cours: "bg-blue-100 text-blue-800",
      en_attente: "bg-yellow-100 text-yellow-800",
      termine: "bg-green-100 text-green-800",
      annule: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      basse: "bg-green-100 text-green-800",
      moyenne: "bg-yellow-100 text-yellow-800",
      haute: "bg-orange-100 text-orange-800",
      critique: "bg-red-100 text-red-800",
    }
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "termine":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "en_cours":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "en_attente":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
    }
  }

  if (loading) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Gestion des Tâches</h1>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <div className="p-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-red-800">
                <span>Erreur lors du chargement des tâches: {error}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Tâches</h1>
            <p className="text-gray-600 mt-1">Suivez et gérez toutes les tâches des projets d'innovation</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle tâche
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher une tâche..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="planifie">Planifié</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="termine">Terminé</SelectItem>
                  <SelectItem value="annule">Annulé</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les priorités</SelectItem>
                  <SelectItem value="basse">Basse</SelectItem>
                  <SelectItem value="moyenne">Moyenne</SelectItem>
                  <SelectItem value="haute">Haute</SelectItem>
                  <SelectItem value="critique">Critique</SelectItem>
                </SelectContent>
              </Select>
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Assigné à" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les assignés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0 mt-1">{getStatusIcon(task.statut)}</div>
                    <div className="flex-1 space-y-3">
                      {/* Title and Description */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{task.titre}</h3>
                        <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                      </div>

                      {/* Badges */}
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(task.statut)}>{task.statut.replace("_", " ")}</Badge>
                        <Badge className={getPriorityColor(task.priorite)}>{task.priorite}</Badge>
                        <Badge variant="outline">{task.type_tache}</Badge>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progression</span>
                          <span className="font-medium">{task.progression}%</span>
                        </div>
                        <Progress value={task.progression} className="h-2" />
                      </div>

                      {/* Task Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="flex items-center gap-1 text-gray-600 mb-1">
                            <User className="h-3 w-3" />
                            <span>Assigné à</span>
                          </div>
                          <div className="font-medium">{task.assignee?.name || "Non assigné"}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-gray-600 mb-1">
                            <Calendar className="h-3 w-3" />
                            <span>Échéance</span>
                          </div>
                          <div className="font-medium">
                            {task.date_echeance
                              ? new Date(task.date_echeance).toLocaleDateString("fr-FR")
                              : "Non définie"}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-gray-600 mb-1">
                            <Clock className="h-3 w-3" />
                            <span>Temps</span>
                          </div>
                          <div className="font-medium">
                            {task.temps_passe || 0}h / {task.temps_estime || 0}h
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleTaskComplete(task.id, task.statut !== "termine")}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {task.statut === "termine" ? "Marquer non terminé" : "Marquer terminé"}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {tasks.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                  <Search className="h-full w-full" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche trouvée</h3>
                <p className="text-gray-600 mb-4">Aucune tâche ne correspond à vos critères de recherche.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setPriorityFilter("all")
                    setAssigneeFilter("all")
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Footer */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
                <div className="text-sm text-gray-600">Tâches affichées</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {tasks.filter((t) => t.statut === "en_cours").length}
                </div>
                <div className="text-sm text-gray-600">En cours</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {tasks.filter((t) => t.statut === "termine").length}
                </div>
                <div className="text-sm text-gray-600">Terminées</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {
                    tasks.filter(
                      (t) => t.date_echeance && new Date(t.date_echeance) < new Date() && t.statut !== "termine",
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">En retard</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

export default InnovationTasks
