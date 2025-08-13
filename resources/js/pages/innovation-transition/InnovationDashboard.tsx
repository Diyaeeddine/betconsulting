"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, Clock, FileText, MessageSquare, Plus, Users, Target, Calendar, DollarSign, Activity, Timer, AlertCircle, Zap, TrendingDown } from "lucide-react"
import { Head, router } from '@inertiajs/react'
import AppLayout from "@/layouts/app-layout"

// ✅ Types enrichis pour un dashboard complet
interface BreadcrumbItem {
  label: string
  href: string
}

interface DashboardStats {
  // Projets
  total_projets: number
  projets_actifs: number
  projets_en_retard: number
  projets_par_statut: Record<string, number>
  projets_par_priorite: Record<string, number>

  // Budget
  budget_total_alloue: number
  budget_total_utilise: number

  // Nouvelles métriques de performance
  taches_en_retard: number
  taches_completees_mois: number
  taches_assignees: number

  tickets_ouverts: number
  tickets_resolus_semaine: number
  temps_moyen_resolution: number // en heures
  satisfaction_client: number // pourcentage

  // Métriques d'équipe
  membres_actifs: number
  projets_livres_trimestre: number
  taux_completion: number // pourcentage

  // Tendances (variation par rapport au mois précédent)
  tendance_projets: number // pourcentage +/-
  tendance_tickets: number
  tendance_satisfaction: number
}

interface ProjetRecent {
  id: number
  nom: string
  statut: string
  priorite: string
  date_creation: string
  responsable: string
  progression: number
}

interface ActiviteRecente {
  id: number
  type: string
  description: string
  utilisateur: string
  date: string
  projet?: string
}

interface DashboardProps {
  stats: DashboardStats
  projets_recents?: ProjetRecent[]
  activites_recentes?: ActiviteRecente[]
}

const InnovationDashboard = ({ stats, projets_recents = [], activites_recentes = [] }: DashboardProps) => {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Innovation & Transition", href: "/innovation-transition/dashboard" },
    { label: "Tableau de bord", href: "/innovation-transition/dashboard" },
  ]

  // 🔧 Fonctions de navigation
  const handleNouveauProjet = () => {
    router.visit('/innovation-transition/projets/create')
  }

  const navigateTo = (url: string) => {
    router.visit(url)
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'nouveau-projet':
        router.visit('/innovation-transition/projets/create')
        break
      case 'mes-taches':
        router.visit('/innovation-transition/taches')
        break
      case 'tickets':
        router.visit('/innovation-transition/tickets')
        break
      case 'documents':
        router.visit('/innovation-transition/documents')
        break
      default:
        console.log(`Action non définie: ${action}`)
    }
  }

  // 🎨 Fonctions utilitaires
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      brouillon: "bg-gray-100 text-gray-800",
      en_cours: "bg-blue-100 text-blue-800",
      en_attente: "bg-yellow-100 text-yellow-800",
      termine: "bg-green-100 text-green-800",
      annule: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      basse: "bg-green-100 text-green-800",
      moyenne: "bg-yellow-100 text-yellow-800",
      haute: "bg-orange-100 text-orange-800",
      critique: "bg-red-100 text-red-800",
    }
    return colors[priority] || "bg-gray-100 text-gray-800"
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <div className="h-4 w-4" />
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600"
    if (trend < 0) return "text-red-600"
    return "text-gray-600"
  }

  const formatDuration = (hours: number) => {
    if (hours < 24) return `${hours.toFixed(1)}h`
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return `${days}j ${remainingHours.toFixed(0)}h`
  }

  const budgetUtilisePourcentage = stats && stats.budget_total_alloue > 0
    ? (stats.budget_total_utilise / stats.budget_total_alloue) * 100
    : 0

  if (!stats) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Innovation & Transition - Dashboard" />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="text-center py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Innovation & Transition - Dashboard" />

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header avec résumé exécutif */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Innovation & Transition</h1>
            <p className="text-gray-600 mt-1">Tableau de bord des projets d'innovation et support technique</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {stats.membres_actifs} membres actifs
              </span>
              <span className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {stats.taux_completion}% de réussite
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {stats.projets_livres_trimestre} projets livrés ce trimestre
              </span>
            </div>
          </div>
          <Button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={handleNouveauProjet}
          >
            <Plus className="h-4 w-4" />
            Nouveau projet
          </Button>
        </div>

        {/* KPIs principaux avec tendances */}
        <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Projets */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200" onClick={() => navigateTo('/innovation-transition/projets')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projets Actifs</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.projets_actifs}</div>
              <div className="flex items-center gap-1 text-xs">
                {getTrendIcon(stats.tendance_projets)}
                <span className={getTrendColor(stats.tendance_projets)}>
                  {Math.abs(stats.tendance_projets)}% ce mois
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.projets_en_retard} en retard
              </p>
            </CardContent>
          </Card>

          {/* Tâches */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200" onClick={() => navigateTo('/innovation-transition/taches')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tâches</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.taches_assignees}
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>{stats.taches_completees_mois} complétées ce mois</span>
              </div>
              <p className="text-xs text-red-600 mt-1">
                {stats.taches_en_retard} en retard
              </p>
            </CardContent>
          </Card>

          {/* Tickets Support */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200" onClick={() => navigateTo('/innovation-transition/tickets')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Ouverts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.tickets_ouverts}</div>
              <div className="flex items-center gap-1 text-xs">
                {getTrendIcon(stats.tendance_tickets)}
                <span className={getTrendColor(stats.tendance_tickets)}>
                  {Math.abs(stats.tendance_tickets)}% cette semaine
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.tickets_resolus_semaine} résolus cette semaine
              </p>
            </CardContent>
          </Card>

          {/* Performance Support */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200" onClick={() => navigateTo('/innovation-transition/analytics')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction Client</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.satisfaction_client}%</div>
              <div className="flex items-center gap-1 text-xs">
                {getTrendIcon(stats.tendance_satisfaction)}
                <span className={getTrendColor(stats.tendance_satisfaction)}>
                  {Math.abs(stats.tendance_satisfaction)}% ce mois
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Résolution moy: {formatDuration(stats.temps_moyen_resolution)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alertes et notifications importantes */}
        {(stats.projets_en_retard > 0 || stats.taches_en_retard > 0 || stats.tickets_ouverts > 10) && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="h-5 w-5" />
                Attention requise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-3">
                {stats.projets_en_retard > 0 && (
                  <div className="flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">
                      {stats.projets_en_retard} projet(s) en retard
                    </span>
                  </div>
                )}
                {stats.taches_en_retard > 0 && (
                  <div className="flex items-center gap-2 text-amber-700">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      {stats.taches_en_retard} tâche(s) en retard
                    </span>
                  </div>
                )}
                {stats.tickets_ouverts > 10 && (
                  <div className="flex items-center gap-2 text-amber-700">
                    <Timer className="h-4 w-4" />
                    <span className="text-sm">
                      Charge élevée: {stats.tickets_ouverts} tickets
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contenu principal avec onglets enrichis */}
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
          <Tabs defaultValue="overview" className="space-y-4 p-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="projects">Projets récents</TabsTrigger>
              <TabsTrigger value="activity">Activité</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Vue d'ensemble enrichie */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Répartition par statut avec graphique */}
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition par statut</CardTitle>
                    <CardDescription>État actuel des projets avec progression</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(stats.projets_par_statut || {}).map(([status, count]) => {
                      const percentage = stats.total_projets > 0 ? (count as number / stats.total_projets) * 100 : 0
                      return (
                        <div
                          key={status}
                          className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                          onClick={() => navigateTo(`/innovation-transition/projets?status=${status}`)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(status)}>
                                {status.replace("_", " ")}
                              </Badge>
                            </div>
                            <span className="font-semibold">{count as number}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {percentage.toFixed(1)}% du total
                          </p>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Priorités avec urgence */}
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition par priorité</CardTitle>
                    <CardDescription>Niveau de priorité et urgence</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(stats.projets_par_priorite || {}).map(([priority, count]) => {
                      const percentage = stats.total_projets > 0 ? (count as number / stats.total_projets) * 100 : 0
                      return (
                        <div
                          key={priority}
                          className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                          onClick={() => navigateTo(`/innovation-transition/projets?priority=${priority}`)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getPriorityColor(priority)}>
                                {priority}
                              </Badge>
                              {priority === 'critique' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                            </div>
                            <span className="font-semibold">{count as number}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {percentage.toFixed(1)}% du total
                          </p>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Budget avec détails financiers */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigateTo('/innovation-transition/budget')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Aperçu budgétaire et ROI
                  </CardTitle>
                  <CardDescription>Utilisation du budget et retour sur investissement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Budget alloué</span>
                        <span className="text-xl font-bold">
                          {stats.budget_total_alloue.toLocaleString()} €
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Budget utilisé</span>
                        <span className="text-xl font-bold text-blue-600">
                          {stats.budget_total_utilise.toLocaleString()} €
                        </span>
                      </div>
                      <Progress value={budgetUtilisePourcentage} className="h-3" />
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>
                          Restant: {(stats.budget_total_alloue - stats.budget_total_utilise).toLocaleString()} €
                        </span>
                        <span>{budgetUtilisePourcentage.toFixed(1)}% utilisé</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Performance financière</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Projets livrés</span>
                            <span className="font-semibold">{stats.projets_livres_trimestre}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Coût moyen/projet</span>
                            <span className="font-semibold">
                              {stats.projets_livres_trimestre > 0
                                ? Math.round(stats.budget_total_utilise / stats.projets_livres_trimestre).toLocaleString()
                                : 0} €
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Taux de réussite</span>
                            <span className="font-semibold text-green-600">{stats.taux_completion}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projets récents avec plus de détails */}
            <TabsContent value="projects" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Projets récents</CardTitle>
                    <CardDescription>Derniers projets créés ou modifiés avec progression</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateTo('/innovation-transition/projets')}
                    >
                      Voir tous
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleNouveauProjet}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Nouveau
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {projets_recents.length > 0 ? (
                    <div className="space-y-4">
                      {projets_recents.slice(0, 5).map((projet) => (
                        <div
                          key={projet.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => navigateTo(`/innovation-transition/projets/${projet.id}`)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">{projet.nom}</h4>
                              <p className="text-sm text-muted-foreground">
                                Par {projet.responsable} • {projet.date_creation}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(projet.statut)}>
                                {projet.statut.replace("_", " ")}
                              </Badge>
                              <Badge className={getPriorityColor(projet.priorite)}>
                                {projet.priorite}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progression</span>
                              <span>{projet.progression}%</span>
                            </div>
                            <Progress value={projet.progression} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun projet récent</h3>
                      <p className="text-gray-500 mb-4">Commencez par créer votre premier projet</p>
                      <Button onClick={handleNouveauProjet}>
                        <Plus className="h-4 w-4 mr-2" />
                        Créer un projet
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activité enrichie */}
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Activité récente</CardTitle>
                    <CardDescription>Dernières actions et modifications</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateTo('/innovation-transition/activity')}
                  >
                    Voir historique complet
                  </Button>
                </CardHeader>
                <CardContent>
                  {activites_recentes.length > 0 ? (
                    <div className="space-y-4">
                      {activites_recentes.slice(0, 8).map((activite) => (
                        <div key={activite.id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Activity className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {activite.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">{activite.utilisateur}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">{activite.date}</span>
                              {activite.projet && (
                                <>
                                  <span className="text-xs text-gray-400">•</span>
                                  <Badge variant="outline" className="text-xs">
                                    {activite.projet}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune activité récente</h3>
                      <p className="text-gray-500">Les actions de l'équipe apparaîtront ici</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Nouvel onglet Analytics */}
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Support Technique</CardTitle>
                    <CardDescription>Métriques clés du support client</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Temps moyen de résolution</span>
                        <span className="text-lg font-bold text-blue-600">
                          {formatDuration(stats.temps_moyen_resolution)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Tickets résolus cette semaine</span>
                        <span className="text-lg font-bold text-green-600">
                          {stats.tickets_resolus_semaine}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Satisfaction client</span>
                        <div className="flex items-center gap-2">
                          <Progress value={stats.satisfaction_client} className="w-20 h-2" />
                          <span className="text-lg font-bold text-green-600">
                            {stats.satisfaction_client}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Efficacité de l'équipe</CardTitle>
                    <CardDescription>Métriques de productivité</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Taux de complétion</span>
                        <div className="flex items-center gap-2">
                          <Progress value={stats.taux_completion} className="w-20 h-2" />
                          <span className="text-lg font-bold text-green-600">
                            {stats.taux_completion}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Projets livrés ce trimestre</span>
                        <span className="text-lg font-bold text-blue-600">
                          {stats.projets_livres_trimestre}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Membres actifs</span>
                        <span className="text-lg font-bold text-purple-600">
                          {stats.membres_actifs}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Graphiques de tendances */}
              <Card>
                <CardHeader>
                  <CardTitle>Tendances mensuelles</CardTitle>
                  <CardDescription>Évolution des métriques clés</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Projets</span>
                      </div>
                      <div className="text-2xl font-bold mb-1">{stats.projets_actifs}</div>
                      <div className="flex items-center justify-center gap-1">
                        {getTrendIcon(stats.tendance_projets)}
                        <span className={`text-sm ${getTrendColor(stats.tendance_projets)}`}>
                          {stats.tendance_projets > 0 ? '+' : ''}{stats.tendance_projets}%
                        </span>
                      </div>
                    </div>

                    <div className="text-center p-4 border rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <span className="font-medium">Tickets</span>
                      </div>
                      <div className="text-2xl font-bold mb-1">{stats.tickets_ouverts}</div>
                      <div className="flex items-center justify-center gap-1">
                        {getTrendIcon(stats.tendance_tickets)}
                        <span className={`text-sm ${getTrendColor(stats.tendance_tickets)}`}>
                          {stats.tendance_tickets > 0 ? '+' : ''}{stats.tendance_tickets}%
                        </span>
                      </div>
                    </div>

                    <div className="text-center p-4 border rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Zap className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Satisfaction</span>
                      </div>
                      <div className="text-2xl font-bold mb-1">{stats.satisfaction_client}%</div>
                      <div className="flex items-center justify-center gap-1">
                        {getTrendIcon(stats.tendance_satisfaction)}
                        <span className={`text-sm ${getTrendColor(stats.tendance_satisfaction)}`}>
                          {stats.tendance_satisfaction > 0 ? '+' : ''}{stats.tendance_satisfaction}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Actions rapides améliorées */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>Accès rapide aux fonctionnalités principales du support technique</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-150 w-full group"
                onClick={() => handleQuickAction('nouveau-projet')}
              >
                <Plus className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Nouveau projet</span>
                <span className="text-xs text-gray-500">Innovation</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-150 w-full group"
                onClick={() => handleQuickAction('mes-taches')}
              >
                <CheckCircle className="h-6 w-6 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Mes tâches</span>
                <span className="text-xs text-gray-500">{stats.taches_assignees} assignées</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-150 w-full group"
                onClick={() => handleQuickAction('tickets')}
              >
                <Clock className="h-6 w-6 text-orange-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Tickets ouverts</span>
                <span className="text-xs text-gray-500">{stats.tickets_ouverts} en cours</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-150 w-full group"
                onClick={() => handleQuickAction('documents')}
              >
                <FileText className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Documents</span>
                <span className="text-xs text-gray-500">Base de connaissances</span>
              </Button>
            </div>

            {/* Actions secondaires */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Outils de gestion</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => navigateTo('/innovation-transition/calendar')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Planning
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => navigateTo('/innovation-transition/budget')}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Budget
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => navigateTo('/innovation-transition/team')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Équipe
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => navigateTo('/innovation-transition/reports')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Rapports
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => navigateTo('/innovation-transition/settings')}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Paramètres
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer avec résumé de performance */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Résumé de performance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.taux_completion}%</div>
                  <div className="text-blue-700">Taux de réussite</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.satisfaction_client}%</div>
                  <div className="text-green-700">Satisfaction client</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{formatDuration(stats.temps_moyen_resolution)}</div>
                  <div className="text-purple-700">Résolution moyenne</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.projets_livres_trimestre}</div>
                  <div className="text-orange-700">Projets livrés</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

export default InnovationDashboard
