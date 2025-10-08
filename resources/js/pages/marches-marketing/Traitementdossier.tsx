import type React from "react"
import AppLayout from "@/layouts/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Filter,
  Plus,
  Upload,
  Download,
  Archive,
  Eye,
  Edit,
  Send,
  User,
  Calendar,
  FileText,
  MessageSquare,
  AlertTriangle,
  Clock,
  CheckCircle,
  Trash2,
} from "lucide-react"

const Traitement: React.FC = () => {
  const breadcrumbs = [
    { title: "Accueil", href: "/" },
    { title: "Traitement", href: "/marches-marketing/traitement" },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6 p-4">
        

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Dossiers actifs</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En retard</p>
                  <p className="text-2xl font-bold">4</p>
                </div>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">À valider</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Soumis ce mois</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <Send className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        

        {/* Alerts section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Alertes délais de dossier</h3>
          </div>

          <div className="space-y-3">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-red-800">Délai critique -...</h4>
                  <p className="text-sm text-red-600">
                    Échéance dans 1 jour - Type AO Important (21j min) - Dossier technique en attente
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Dossier DOS001
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-orange-800">Approche délai...</h4>
                  <p className="text-sm text-orange-600">
                    Échéance dans 3 jours - Demande de clarification en cours (3-7j)
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Dossier DOS004
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-800">Délai de...</h4>
                  <p className="text-sm text-blue-600">
                    Dossier en attente validation depuis 2 jours - Délai administratif dépassé (3j)
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Dossier DOS002
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Header with tabs */}
        <div className="space-y-4">
          

          <div className="flex items-center space-x-4">
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <FileText className="h-4 w-4" />
              <span>Gestion des Dossiers</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <Clock className="h-4 w-4" />
              <span>Référentiel des Délais</span>
            </Button>
          </div>

          {/* Search and filters */}
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Rechercher par nom de dossier, client ou responsable..." className="pl-10" />
              </div>
            </div>
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <Filter className="h-4 w-4" />
              <span>Filtres</span>
            </Button>
          </div>

          {/* Quick actions */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Actions rapides</h3>
            <div className="flex items-center space-x-2">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Nouveau dossier</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <Upload className="h-4 w-4" />
                <span>Importer</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <Download className="h-4 w-4" />
                <span>Exporter</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <Archive className="h-4 w-4" />
                <span>Archiver sélection</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Project cards */}
        <div className="space-y-6">
          {/* First project */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">Infrastructure Autoroute Casablanca-Agadir</h3>
                      <Badge className="bg-blue-100 text-blue-800">En révision</Badge>
                      <Badge className="bg-red-100 text-red-800">Haute</Badge>
                      <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Ministère de l'Équipement</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">1200.0M MAD</p>
                    <p className="text-xs text-gray-500">ID: DOS001</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progression</span>
                    <span className="text-sm text-gray-600">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Responsable</p>
                      <p className="text-sm font-medium">Hassan Alami</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Échéance</p>
                      <p className="text-sm font-medium text-red-600">Retard de 610 j</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Documents</p>
                      <p className="text-sm font-medium">12 fichiers</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Commentaires</p>
                      <p className="text-sm font-medium">3 notes</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Dernière action</p>
                    <p className="text-sm">Révision composante technique</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="flex items-center space-x-1 bg-transparent">
                      <Eye className="h-4 w-4" />
                      <span>Voir</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center space-x-1 bg-transparent">
                      <Edit className="h-4 w-4" />
                      <span>Modifier</span>
                    </Button>
                    <Button size="sm" className="flex items-center space-x-1">
                      <Send className="h-4 w-4" />
                      <span>Soumettre</span>
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Second project */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">Assainissement Zone Industrielle</h3>
                      <Badge className="bg-gray-100 text-gray-800">Brouillon</Badge>
                      <Badge className="bg-red-100 text-red-800">Haute</Badge>
                      <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Région Casablanca-Settat</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">320.0M MAD</p>
                    <p className="text-xs text-gray-500">ID: DOS004</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progression</span>
                    <span className="text-sm text-gray-600">25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Responsable</p>
                      <p className="text-sm font-medium">Aicha Tazi</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Échéance</p>
                      <p className="text-sm font-medium text-red-600">Retard de 607 j</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Documents</p>
                      <p className="text-sm font-medium">3 fichiers</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Commentaires</p>
                      <p className="text-sm font-medium">2 notes</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Dernière action</p>
                    <p className="text-sm">Début de préparation</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="flex items-center space-x-1 bg-transparent">
                      <Eye className="h-4 w-4" />
                      <span>Voir</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center space-x-1 bg-transparent">
                      <Edit className="h-4 w-4" />
                      <span>Modifier</span>
                    </Button>
                    <Button size="sm" className="flex items-center space-x-1">
                      <Send className="h-4 w-4" />
                      <span>Soumettre</span>
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third project */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">Complexe Sportif Municipal Rabat</h3>
                      <Badge className="bg-orange-100 text-orange-800">En attente validation</Badge>
                      <Badge className="bg-yellow-100 text-yellow-800">Moyenne</Badge>
                      <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Ville de Rabat</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">180.0M MAD</p>
                    <p className="text-xs text-gray-500">ID: DOS002</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progression</span>
                    <span className="text-sm text-gray-600">90%</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Responsable</p>
                      <p className="text-sm font-medium">Fatima Benali</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Échéance</p>
                      <p className="text-sm font-medium text-red-600">Retard de 605 j</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Documents</p>
                      <p className="text-sm font-medium">8 fichiers</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Commentaires</p>
                      <p className="text-sm font-medium">1 notes</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Dernière action</p>
                    <p className="text-sm">Documents administratifs complétés</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="flex items-center space-x-1 bg-transparent">
                      <Eye className="h-4 w-4" />
                      <span>Voir</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center space-x-1 bg-transparent">
                      <Edit className="h-4 w-4" />
                      <span>Modifier</span>
                    </Button>
                    <Button size="sm" className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>Valider</span>
                    </Button>
                    <Button size="sm" className="flex items-center space-x-1">
                      <Send className="h-4 w-4" />
                      <span>Soumettre</span>
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fourth project */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">Rénovation École Primaire Hay Riad</h3>
                      <Badge className="bg-green-100 text-green-800">Soumis</Badge>
                      <Badge className="bg-green-100 text-green-800">Faible</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Académie Régionale</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">45.0M MAD</p>
                    <p className="text-xs text-gray-500">ID: DOS003</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progression</span>
                    <span className="text-sm text-gray-600">100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Responsable</p>
                      <p className="text-sm font-medium">Mohamed Idrissi</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Échéance</p>
                      <p className="text-sm font-medium text-red-600">Retard de 615 j</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Documents</p>
                      <p className="text-sm font-medium">6 fichiers</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Commentaires</p>
                      <p className="text-sm font-medium">0 notes</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Dernière action</p>
                    <p className="text-sm">Dossier soumis avec succès</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="flex items-center space-x-1 bg-transparent">
                      <Eye className="h-4 w-4" />
                      <span>Voir</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center space-x-1 bg-transparent">
                      <Edit className="h-4 w-4" />
                      <span>Modifier</span>
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

export default Traitement
