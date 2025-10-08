import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Filter,
  AlertTriangle,
  Clock,
  FileText,
  CreditCard,
  BarChart3,
  Euro,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

const breadcrumbs = [
  {
    title: "Dashboard Marchés & Marketing",
    href: "/marches-marketing/dashboard",
  },
]

export default function MarchesMarketing() {
  const alertData = [
    {
      count: 4,
      text: "avec alertes critiques nécessitent une intervention immédiate",
      icon: AlertTriangle,
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      iconColor: "text-red-500",
    },
    {
      count: 4,
      text: "en dépassement de délai de préparation",
      icon: Clock,
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      iconColor: "text-orange-500",
    },
  ]

  const navigationTabs = [
    { name: "Liste des AO", active: true },
    { name: "Suivi Avancement", active: false },
    { name: "Points Bloquants", active: false },
    { name: "Dossiers à Risque", active: false },
  ]

  const tenderData = [
    {
      reference: "AO-2024-001",
      title: "Rénovation énergétique bâtiment A",
      location: "Ville de Paris",
      deadline: "2024-01-15",
      deadlineCode: "J-0",
      responsible: "Marie Dupont",
      progress: 85,
      value: "2.5M MAD",
      status: "Retard 3j",
      statusColor: "bg-red-500",
    },
    {
      reference: "AO-2024-002",
      title: "Construction parking souterrain",
      location: "Métropole Lyon",
      deadline: "2024-01-20",
      deadlineCode: "J-0",
      responsible: "Pierre Martin",
      progress: 95,
      value: "8.7M MAD",
      status: "Dans les temps",
      statusColor: "bg-black",
      statusBadge: "Complet J-2",
      statusBadgeColor: "bg-green-100 text-green-800",
    },
    {
      reference: "AO-2024-003",
      title: "Aménagement espaces verts",
      location: "Région PACA",
      deadline: "2024-01-12",
      deadlineCode: "J-0",
      responsible: "Sophie Bernard",
      progress: 45,
      value: "1.2M MAD",
      status: "Retard 4j",
      statusColor: "bg-red-500",
    },
    {
      reference: "AO-2024-004",
      title: "Réhabilitation centre-ville",
      location: "Ville de Rabat",
      deadline: "2024-01-25",
      deadlineCode: "J-0",
      responsible: "Ahmed Bennani",
      progress: 65,
      value: "15.3M MAD",
      status: "Retard 2j",
      statusColor: "bg-red-500",
    },
  ]

  const moduleCards = [
    {
      title: "Préparation des Dossiers",
      icon: FileText,
      active: true,
    },
    {
      title: "Cautions Provisoires",
      icon: CreditCard,
      active: false,
    },
    {
      title: "Suivi des AO",
      icon: BarChart3,
      active: false,
    },
  ]

  const mainMetrics = [
    {
      title: "Dossiers en préparation",
      value: "6",
      subtitle: "Valeur totale: 102.4M MAD",
      icon: FileText,
      iconColor: "text-gray-600",
    },
    {
      title: "Avancement moyen",
      value: "68%",
      subtitle: "Global sur tous dossiers",
      icon: BarChart3,
      iconColor: "text-gray-600",
      hasProgress: true,
      progressValue: 68,
    },
    {
      title: "Dossiers à compléter urgence",
      value: "3",
      subtitle: "< 70% d'avancement",
      icon: AlertTriangle,
      iconColor: "text-red-500",
    },
    {
      title: "Taux conformité 1ère vérification",
      value: "33%",
      subtitle: "2 dossiers complets à J-2",
      icon: CheckCircle,
      iconColor: "text-green-500",
    },
  ]

  const bottomMetrics = [
    {
      title: "Respect délais cibles",
      value: "2",
      subtitle: "dossiers dans le délai nommé (1 jour)",
      icon: Clock,
      iconColor: "text-green-500",
    },
    {
      title: "Dépassements de délai",
      value: "4",
      subtitle: "dossiers en retard sur planning",
      icon: AlertTriangle,
      iconColor: "text-red-500",
    },
    {
      title: "Alertes actives",
      value: "4",
      subtitle: "dossiers avec alertes critiques",
      icon: AlertCircle,
      iconColor: "text-red-500",
    },
  ]

  const topKPIs = [
    {
      title: "Dossiers en cours",
      value: "24",
      change: "+3 cette semaine",
      icon: FileText,
      iconColor: "text-blue-600",
    },
    {
      title: "Cautions bloquées",
      value: "2.4M MAD",
      change: "12 cautions actives",
      icon: CreditCard,
      iconColor: "text-green-600",
    },
    {
      title: "Taux de réussite",
      value: "68%",
      change: "+5% ce mois",
      icon: BarChart3,
      iconColor: "text-purple-600",
    },
    {
      title: "Valeur totale AO",
      value: "45.2M MAD",
      change: "32 appels d'offres",
      icon: Euro,
      iconColor: "text-orange-600",
    },
  ]

  const alerts = [
    {
      title: "Date limite approche",
      description: "AO Infrastructure Routière - Échéance dans 2 jours",
      time: "Il y a 30 min",
      icon: AlertCircle,
      iconColor: "text-red-500",
    },
    {
      title: "Document manquant",
      description: "Certificat technique manquant pour AO Assainissement",
      time: "Il y a 1h",
      icon: AlertTriangle,
      iconColor: "text-orange-500",
    },
    {
      title: "Caution disponible",
      description: "Mainlevée reçue pour AO Bâtiment Municipal",
      time: "Il y a 3h",
      icon: CheckCircle,
      iconColor: "text-blue-500",
    },
  ]

  const recentActivities = [
    {
      title: "Dossier soumis",
      description: "Construction Pont Moulay Rachid",
      time: "Il y a 2h",
      icon: CheckCircle,
      iconColor: "text-green-500",
    },
    {
      title: "Caution demandée",
      description: "Rénovation École Primaire",
      time: "Il y a 4h",
      icon: AlertCircle,
      iconColor: "text-orange-500",
    },
    {
      title: "AO remporté",
      description: "Aménagement Parc Urbain",
      time: "Hier",
      icon: CheckCircle,
      iconColor: "text-green-500",
    },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard Marchés & Marketing" />
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topKPIs.map((kpi, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">{kpi.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</p>
                    <p className="text-sm text-gray-500">{kpi.change}</p>
                  </div>
                  <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <CardTitle>Alertes et notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <alert.icon className={`h-4 w-4 mt-1 ${alert.iconColor}`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{alert.title}</p>
                    <p className="text-sm text-gray-600">{alert.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <CardTitle>Activités récentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <activity.icon className={`h-4 w-4 mt-1 ${activity.iconColor}`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 pt-4">Modules principaux</h2>

          <div className="flex gap-4">
            {moduleCards.map((module, index) => (
              <Button
                key={index}
                variant={module.active ? "default" : "outline"}
                className="flex items-center gap-2 px-6 py-3"
              >
                <module.icon className="h-4 w-4" />
                {module.title}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainMetrics.map((metric, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-2">{metric.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</p>
                      <p className="text-sm text-gray-500">{metric.subtitle}</p>
                      {metric.hasProgress && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-black h-2 rounded-full"
                              style={{ width: `${metric.progressValue}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <metric.icon className={`h-5 w-5 ${metric.iconColor}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bottomMetrics.map((metric, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-2">{metric.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</p>
                      <p className="text-sm text-gray-500">{metric.subtitle}</p>
                    </div>
                    <metric.icon className={`h-5 w-5 ${metric.iconColor}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
      <div className="min-h-screen space-y-6 bg-gray-50 p-6">
        <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par référence, objet, maître d'ouvrage ou responsable..."
              className="pl-10 border-gray-200"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Filtres
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alertData.map((alert, index) => (
            <Card key={index} className={`${alert.bgColor} border-none`}>
              <CardContent className="flex items-center gap-3 p-4">
                <alert.icon className={`h-5 w-5 ${alert.iconColor}`} />
                <div className={alert.textColor}>
                  <span className="font-bold text-lg">{alert.count} dossiers</span>
                  <p className="text-sm">{alert.text}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex border-b">
            {navigationTabs.map((tab, index) => (
              <button
                key={index}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab.active
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Liste des appels d'offres en préparation</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-gray-500">
                    <th className="pb-3">Référence</th>
                    <th className="pb-3">Objet / Maître d'Ouvrage</th>
                    <th className="pb-3">Date limite</th>
                    <th className="pb-3">Responsable</th>
                    <th className="pb-3">Avancement</th>
                    <th className="pb-3">Valeur</th>
                    <th className="pb-3">Statut délai</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tenderData.map((tender, index) => (
                    <tr key={index} className="text-sm">
                      <td className="py-4 font-medium">{tender.reference}</td>
                      <td className="py-4">
                        <div>
                          <div className="font-medium">{tender.title}</div>
                          <div className="text-gray-500">{tender.location}</div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-red-600 font-medium">{tender.deadline}</div>
                        <div className="text-gray-500">{tender.deadlineCode}</div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {tender.responsible}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div className="bg-black h-2 rounded-full" style={{ width: `${tender.progress}%` }}></div>
                          </div>
                          <span className="text-sm font-medium">{tender.progress}%</span>
                        </div>
                      </td>
                      <td className="py-4 font-medium">{tender.value}</td>
                      <td className="py-4">
                        <div className="flex flex-col gap-1">
                          <Badge className={`${tender.statusColor} text-white text-xs`}>{tender.status}</Badge>
                          {tender.statusBadge && (
                            <Badge className={`${tender.statusBadgeColor} text-xs`}>{tender.statusBadge}</Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AppLayout>
  )
}
