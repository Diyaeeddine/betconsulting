import type React from "react"
import AppLayout from "@/layouts/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, Calendar, MapPin, Building2, Clock, FileText, BarChart3, Settings } from "lucide-react"

// Mock Head component for non-Inertia environment
const Head = ({ children }: { children: React.ReactNode }) => {
  if (typeof document !== "undefined") {
    document.title = typeof children === "string" ? children : "Suivi Marchés"
  }
  return null
}

const breadcrumbs = [
  {
    title: "Suivi Marchés",
    href: "/marches-marketing/suivi-marches",
  },
]

const SuiviMarches = () => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head>
        <title>Suivi Marchés</title>
      </Head>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Marchés actifs */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Marchés actifs</h3>
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">2</div>
            </CardContent>
          </Card>

          {/* Progression moyenne */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Progression moyenne</h3>
                <BarChart3 className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">56%</div>
            </CardContent>
          </Card>

          {/* Valeur totale */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Valeur totale</h3>
                <span className="text-purple-500 font-bold">€</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">1915.0M MAD</div>
            </CardContent>
          </Card>

          {/* Marchés à risque */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Marchés à risque</h3>
                <div className="w-5 h-5 bg-red-100 rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">1</div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom de marché, client ou localisation..."
                  className="w-full pl-10 pr-4 py-2 border-0 focus:ring-0 text-gray-600 placeholder-gray-400"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800">
                <Filter className="h-5 w-5" />
                <span>Filtres</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Project Cards */}
        <div className="space-y-6">
          {/* Project 1 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Construction Autoroute Casablanca-Agadir Tronçon 1
                    </h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      En cours
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      Risque faible
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">Ministère de l'Équipement</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">1200.0M MAD</div>
                  <div className="text-sm text-gray-500">ID: M001</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Progression</span>
                  <span className="text-sm font-bold text-gray-900">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-black h-2 rounded-full" style={{ width: "65%" }}></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-600">Période</div>
                    <div className="text-sm text-gray-900">15/01/2024 - 30/12/2025</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-600">Localisation</div>
                    <div className="text-sm text-gray-900">Casablanca - Settat</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-600">Type</div>
                    <div className="text-sm text-gray-900">Infrastructure</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium text-gray-600">Dernière activité</span>
                    <div className="text-sm text-gray-900">Validation du lot 3 - Terrassement</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg">
                    <FileText className="h-4 w-4" />
                    <span>Détails</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg">
                    <BarChart3 className="h-4 w-4" />
                    <span>Rapport</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                    <Settings className="h-4 w-4" />
                    <span>Gérer</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project 2 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Construction Complexe Sportif Rabat</h3>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                      En attente
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                      Risque élevé
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">Ville de Rabat</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">180.0M MAD</div>
                  <div className="text-sm text-gray-500">ID: M004</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Progression</span>
                  <span className="text-sm font-bold text-gray-900">15%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-black h-2 rounded-full" style={{ width: "15%" }}></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-600">Période</div>
                    <div className="text-sm text-gray-900">01/02/2024 - 30/06/2025</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-600">Localisation</div>
                    <div className="text-sm text-gray-900">Rabat</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-600">Type</div>
                    <div className="text-sm text-gray-900">Bâtiment</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium text-gray-600">Dernière activité</span>
                    <div className="text-sm text-gray-900">Attente autorisation environnementale</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg">
                    <FileText className="h-4 w-4" />
                    <span>Détails</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg">
                    <BarChart3 className="h-4 w-4" />
                    <span>Rapport</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                    <Settings className="h-4 w-4" />
                    <span>Gérer</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project 3 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Rénovation Hôpital Universitaire Ibn Rochd</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      En cours
                    </span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                      Risque moyen
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">CHU Ibn Rochd</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">85.0M MAD</div>
                  <div className="text-sm text-gray-500">ID: M002</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Progression</span>
                  <span className="text-sm font-bold text-gray-900">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-black h-2 rounded-full" style={{ width: "45%" }}></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-600">Période</div>
                    <div className="text-sm text-gray-900">01/03/2024 - 30/11/2024</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-600">Localisation</div>
                    <div className="text-sm text-gray-900">Casablanca</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-600">Type</div>
                    <div className="text-sm text-gray-900">Bâtiment</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium text-gray-600">Dernière activité</span>
                    <div className="text-sm text-gray-900">Retard livraison matériaux</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg">
                    <FileText className="h-4 w-4" />
                    <span>Détails</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg">
                    <BarChart3 className="h-4 w-4" />
                    <span>Rapport</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                    <Settings className="h-4 w-4" />
                    <span>Gérer</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project 4 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Aménagement Parc Industriel Mohammedia</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      Terminé
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                      Risque nul
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">Région Casablanca-Settat</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">450.0M MAD</div>
                  <div className="text-sm text-gray-500">ID: M003</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Progression</span>
                  <span className="text-sm font-bold text-gray-900">100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-black h-2 rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-600">Période</div>
                    <div className="text-sm text-gray-900">01/06/2023 - 28/02/2024</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-600">Localisation</div>
                    <div className="text-sm text-gray-900">Mohammedia</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-600">Type</div>
                    <div className="text-sm text-gray-900">Infrastructure</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium text-gray-600">Dernière activité</span>
                    <div className="text-sm text-gray-900">Réception provisoire validée</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg">
                    <FileText className="h-4 w-4" />
                    <span>Détails</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg">
                    <BarChart3 className="h-4 w-4" />
                    <span>Rapport</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                    <Settings className="h-4 w-4" />
                    <span>Gérer</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

export default SuiviMarches
