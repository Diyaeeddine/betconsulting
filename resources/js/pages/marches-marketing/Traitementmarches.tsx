import type React from "react"
import AppLayout from "@/layouts/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, Play, Pause, Square, BarChart3, Settings, Edit, StickyNote } from "lucide-react"

const Traitement: React.FC = () => {
  const breadcrumbs = [
    { title: "Accueil", href: "/" },
    { title: "Traitement de marchés", href: "/marches-marketing/traitementMar" },
  ]

  const projects = [
    {
      id: "MAR001",
      title: "Construction Autoroute Casablanca-Agadir",
      ministry: "Ministère de l'Équipement",
      phase: "Terrassement",
      status: "En cours",
      riskLevel: "Risque Faible",
      budget: "1200.0M MAD",
      projectManager: "Hassan Alami",
      team: "45 personnes",
      location: "Casablanca - Settat",
      nextDelivery: "15/02/2024",
      progress: 65,
      budgetUsed: 78,
      quality: 92,
      incidents: 2,
      lastAction: "Validation du lot 3"
    },
    {
      id: "MAR002",
      title: "Rénovation Hôpital Universitaire",
      ministry: "CHU Ibn Rochd",
      phase: "Études techniques",
      status: "En attente",
      riskLevel: "Risque Moyen",
      budget: "85.0M MAD",
      projectManager: "Fatima Benali",
      team: "20 personnes",
      location: "Casablanca",
      nextDelivery: "01/04/2024",
      progress: 45,
      budgetUsed: 42,
      quality: 88,
      incidents: 1,
      lastAction: "Attente autorisation"
    },
    {
      id: "MAR003",
      title: "Aménagement Parc Industriel",
      ministry: "Région Casablanca-Settat",
      phase: "Réception",
      status: "Terminé",
      riskLevel: "Risque Nul",
      budget: "450.0M MAD",
      projectManager: "Mohamed Idrissi",
      team: "0 personnes",
      location: "Mohammedia",
      nextDelivery: "",
      progress: 100,
      budgetUsed: 98,
      quality: 95,
      incidents: 0,
      lastAction: "Réception définitive"
    },
    {
      id: "MAR004",
      title: "Complexe Sportif Municipal",
      ministry: "Ville de Rabat",
      phase: "Fondations",
      status: "Suspendu",
      riskLevel: "Risque Élevé",
      budget: "180.0M MAD",
      projectManager: "Aicha Tazi",
      team: "12 personnes",
      location: "Rabat",
      nextDelivery: "Invalid Date",
      progress: 15,
      budgetUsed: 18,
      quality: 75,
      incidents: 3,
      lastAction: "Suspension pour révision"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En cours": return "bg-blue-500 text-white"
      case "En attente": return "bg-orange-500 text-white"
      case "Terminé": return "bg-green-500 text-white"
      case "Suspendu": return "bg-red-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Risque Faible": return "bg-green-100 text-green-800"
      case "Risque Moyen": return "bg-orange-100 text-orange-800"
      case "Risque Élevé": return "bg-red-100 text-red-800"
      case "Risque Nul": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-6">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Marchés actifs</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <Settings className="h-5 w-5 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Budget moyen utilisé</p>
                <p className="text-2xl font-bold">59%</p>
              </div>
              <span className="text-green-500">€</span>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Qualité moyenne</p>
                <p className="text-2xl font-bold">88%</p>
              </div>
              <div className="h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Incidents actifs</p>
                <p className="text-2xl font-bold">6</p>
              </div>
              <div className="h-5 w-5 flex items-center justify-center">
                <div className="h-4 w-4 bg-red-500 transform rotate-45"></div>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom de marché, client ou chef de projet..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            Filtres
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">Contrôles opérationnels</p>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
              <Play className="h-4 w-4" />
              Démarrer sélection
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Pause className="h-4 w-4" />
              Suspendre sélection
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Square className="h-4 w-4" />
              Arrêter sélection
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <BarChart3 className="h-4 w-4" />
              Rapport global
            </button>
          </div>
        </div>

        {/* Project Cards */}
        <div className="space-y-6">
          {projects.map((project) => (
            <Card key={project.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{project.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(project.riskLevel)}`}>
                      {project.riskLevel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{project.ministry}</p>
                  <p className="text-sm text-gray-500">Phase actuelle: {project.phase}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{project.budget}</p>
                  <p className="text-sm text-gray-500">ID: {project.id}</p>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="grid grid-cols-3 gap-8 mb-6">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Avancement</span>
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-black h-2 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Budget utilisé</span>
                    <span className="text-sm font-medium">{project.budgetUsed}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-black h-2 rounded-full" 
                      style={{ width: `${project.budgetUsed}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Qualité</span>
                    <span className="text-sm font-medium">{project.quality}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-black h-2 rounded-full" 
                      style={{ width: `${project.quality}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-4 gap-8 mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <div className="h-4 w-4 bg-gray-400 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Chef de projet</p>
                    <p className="text-sm font-medium">{project.projectManager}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <div className="h-4 w-4 bg-gray-400 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Équipe</p>
                    <p className="text-sm font-medium">{project.team}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <div className="h-4 w-4 bg-gray-400 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Localisation</p>
                    <p className="text-sm font-medium">{project.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <div className="h-4 w-4 bg-gray-400 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Prochaine livraison</p>
                    <p className="text-sm font-medium">{project.nextDelivery}</p>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Qualité: {project.quality}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Budget: {project.budgetUsed}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Incidents: {project.incidents}</span>
                  </div>
                </div>
              </div>

              {/* Last Action */}
              <div className="flex items-center gap-2 mb-4">
                <div className="h-4 w-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Dernière action</p>
                  <p className="text-sm">{project.lastAction}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {project.status === "En cours" && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                      <Pause className="h-4 w-4" />
                      Démarrer
                    </button>
                  )}
                  {project.status === "En attente" && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                      <Play className="h-4 w-4" />
                      Démarrer
                    </button>
                  )}
                  {project.status === "Terminé" && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                      <Play className="h-4 w-4" />
                      Réactiver
                    </button>
                  )}
                  {project.status === "Suspendu" && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                      <Play className="h-4 w-4" />
                      Reprendre
                    </button>
                  )}
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Edit className="h-4 w-4" />
                    Modifier
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <StickyNote className="h-4 w-4" />
                    Notes
                  </button>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                    <Settings className="h-4 w-4" />
                    Gérer
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <BarChart3 className="h-4 w-4" />
                    Rapport
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}

export default Traitement