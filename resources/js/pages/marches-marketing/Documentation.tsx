import type React from "react"
import AppLayout from "@/layouts/app-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Clock, Star, Eye, BookOpen } from "lucide-react"

const Documentation: React.FC = () => {
  const breadcrumbs = [
    { title: "Dashboard", href: "/marches-marketing/dashboard" },
    { title: "Documentation", href: "/marches-marketing/documentation" },
  ]

  const tabs = [
    { id: "guides", label: "Guides", active: true },
    { id: "videos", label: "Vidéos", active: false },
    { id: "faq", label: "FAQ", active: false },
    { id: "ressources", label: "Ressources", active: false },
  ]

  const categories = [
    { id: "tous", label: "Tous", active: true },
    { id: "preparation", label: "Préparation", active: false },
    { id: "finance", label: "Finance", active: false },
    { id: "analyse", label: "Analyse", active: false },
    { id: "technique", label: "Technique", active: false },
    { id: "juridique", label: "Juridique", active: false },
  ]

  const documentationItems = [
    {
      title: "Guide de préparation des dossiers d'AO",
      description: "Étapes complètes pour préparer un dossier conforme",
      tags: [
        { label: "Préparation", variant: "secondary" as const },
        { label: "Débutant", variant: "default" as const },
      ],
      duration: "15 min",
      rating: 4.8,
      views: 1250,
      lastUpdated: "Mis à jour le 05/01/2024",
    },
    {
      title: "Gestion des cautions provisoires",
      description: "Procédures pour gérer efficacement les cautions",
      tags: [
        { label: "Finance", variant: "secondary" as const },
        { label: "Intermédiaire", variant: "outline" as const },
      ],
      duration: "20 min",
      rating: 4.6,
      views: 890,
      lastUpdated: "Mis à jour le 03/01/2024",
    },
    {
      title: "Analyse des résultats d'AO",
      description: "Méthodes d'analyse pour améliorer les performances",
      tags: [
        { label: "Analyse", variant: "secondary" as const },
        { label: "Avancé", variant: "destructive" as const },
      ],
      duration: "25 min",
      rating: 4.9,
      views: 456,
      lastUpdated: "Mis à jour le 28/12/2023",
    },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-balance">Documentation et Support</h1>
          <p className="text-muted-foreground">Guides, tutoriels et ressources pour maîtriser l'application</p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher dans la documentation..." className="pl-10" />
          </div>
          <Button className="bg-black text-white hover:bg-black/90">Rechercher</Button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                  tab.active
                    ? "border-black text-black"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={category.active ? "default" : "outline"}
              size="sm"
              className={category.active ? "bg-black text-white hover:bg-black/90" : ""}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Documentation Items */}
        <div className="space-y-4">
          {documentationItems.map((item, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant={tag.variant}>
                        {tag.label}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {item.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {item.rating}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {item.views} vues
                    </div>
                    <span>{item.lastUpdated}</span>
                  </div>
                </div>

                <Button className="bg-black text-white hover:bg-black/90">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Lire
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}

export default Documentation
