import type React from "react"
import AppLayout from "@/layouts/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Filter,
  RefreshCw,
  Upload,
  FileText,
  MessageSquare,
  Download,
  ExternalLink,
  Bell,
  Send,
} from "lucide-react"

const Portail: React.FC = () => {
  const breadcrumbs = [
  { title: "Marchés & Marketing", href: "/marches-marketing/dashboard" },
  { title: "Portail", href: "/marches-marketing/portail" },
]


  const recentDocuments = [
    {
      title: "Cahier des charges - Infrastructure A7",
      type: "PDF",
      size: "2.4 MB",
      date: "08/01/2024",
      status: "Nouveau",
      statusColor: "bg-black text-white",
    },
    {
      title: "Devis quantitatif - Hôpital Ibn Rochd",
      type: "Excel",
      size: "1.8 MB",
      date: "07/01/2024",
      status: "Mis à jour",
      statusColor: "bg-yellow-100 text-yellow-800",
    },
    {
      title: "Plans techniques - Complexe Sportif",
      type: "DWG",
      size: "15.2 MB",
      date: "06/01/2024",
      status: "Consulté",
      statusColor: "bg-gray-100 text-gray-800",
    },
  ]

  const usefulLinks = [
    {
      title: "Portail National des Marchés Publics",
      subtitle: "Consultation des AO nationaux",
    },
    {
      title: "Trésorerie Générale du Royaume",
      subtitle: "Suivi des paiements et cautions",
    },
    {
      title: "Ministère de l'Équipement",
      subtitle: "Réglementation et actualités",
    },
    {
      title: "CGEM - Confédération Générale",
      subtitle: "Support aux entreprises",
    },
  ]

  const quickStats = [
    { label: "AO en cours", value: "12", color: "bg-slate-900 text-white" },
    { label: "Dossiers soumis", value: "8", color: "bg-slate-900 text-white" },
    { label: "En attente", value: "5", color: "bg-slate-900 text-white" },
    { label: "Marchés actifs", value: "3", color: "bg-green-500 text-white" },
  ]

  const notifications = [
    {
      type: "Nouveau AO publié",
      message: "Infrastructure Autoroute A7 - Date limite: 15/01/2025",
      time: "Il y a 2h",
      color: "bg-blue-500",
    },
    {
      type: "Date limite approche",
      message: "AO Complexe Sportif - Plus que 3 jours",
      time: "Il y a 4h",
      color: "bg-orange-500",
    },
    {
      type: "Dossier accepté",
      message: "Votre proposition pour AO Parc Urbain a été retenue",
      time: "Hier",
      color: "bg-green-500",
    },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portail d'accès</h1>
          <p className="text-gray-600">Accès centralisé aux services et informations</p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Rechercher des documents, AO, ou informations..." className="pl-10" />
          </div>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Filtrer
          </Button>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Actions rapides */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">Soumettre un dossier</h3>
                    <p className="text-sm text-gray-300">Déposer une nouvelle candidature</p>
                  </CardContent>
                </Card>

                <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Search className="h-8 w-8 mx-auto mb-3 text-gray-600" />
                    <h3 className="font-semibold mb-1">Consulter les AO</h3>
                    <p className="text-sm text-gray-600">Parcourir les appels d'offres disponibles</p>
                  </CardContent>
                </Card>

                <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <FileText className="h-8 w-8 mx-auto mb-3 text-gray-600" />
                    <h3 className="font-semibold mb-1">Mes cautions</h3>
                    <p className="text-sm text-gray-600">Gérer les cautions provisoires</p>
                  </CardContent>
                </Card>

                <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <MessageSquare className="h-8 w-8 mx-auto mb-3 text-gray-600" />
                    <h3 className="font-semibold mb-1">Support technique</h3>
                    <p className="text-sm text-gray-600">Contacter l'assistance</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Documents récents */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Documents récents</h2>
              <div className="space-y-3">
                {recentDocuments.map((doc, index) => (
                  <Card key={index} className="hover:bg-gray-50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-blue-600" />
                          <div>
                            <h3 className="font-medium">{doc.title}</h3>
                            <p className="text-sm text-gray-600">
                              {doc.type} • {doc.size} • {doc.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={doc.statusColor}>{doc.status}</Badge>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Liens utiles */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Liens utiles</h2>
              <div className="space-y-3">
                {usefulLinks.map((link, index) => (
                  <Card key={index} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{link.title}</h3>
                          <p className="text-sm text-gray-600">{link.subtitle}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Aperçu rapide */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aperçu rapide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stat.label}</span>
                    <Badge className={stat.color}>{stat.value}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {notifications.map((notification, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full ${notification.color} mt-2 flex-shrink-0`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.type}</p>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Message rapide</p>
                  <Input placeholder="Décrivez votre question ou problème..." className="mb-3" />
                  <Button className="w-full bg-slate-900 hover:bg-slate-800">
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center">Réponse sous 2h en moyenne</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default Portail
