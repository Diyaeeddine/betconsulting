import { Head } from '@inertiajs/react'
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Ticket,
  AlertCircle,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  X
} from "lucide-react"
import { useState, useMemo } from 'react'
import { useForm, router } from '@inertiajs/react'

interface TicketData {
  id: number
  titre: string
  description?: string
  statut: 'ouvert' | 'en_cours' | 'en_attente' | 'resolu' | 'ferme'
  priorite?: 'basse' | 'moyenne' | 'haute' | 'critique'
  type?: 'bug' | 'amelioration' | 'question' | 'incident' | 'demande'
  client?: string
  assignee?: string
  created_at: string
  updated_at: string
}

interface InnovationTicketsProps {
  tickets?: TicketData[]
}

const InnovationTickets = ({ tickets = [] }: InnovationTicketsProps) => {
  const safeTickets = Array.isArray(tickets) ? tickets : []

  // États pour les modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null)

  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('tous')
  const [priorityFilter, setPriorityFilter] = useState('tous')
  const [typeFilter, setTypeFilter] = useState('tous')
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Formulaires
  const { data: createData, setData: setCreateData, post, processing: createProcessing, errors: createErrors, reset: resetCreate } = useForm({
    titre: '',
    description: '',
    priorite: 'moyenne',
    type: 'question',
    client: '',
    assignee: ''
  })

  const { data: editData, setData: setEditData, put, processing: editProcessing, errors: editErrors, reset: resetEdit } = useForm({
    titre: '',
    description: '',
    priorite: 'moyenne',
    type: 'question',
    client: '',
    assignee: '',
    statut: 'ouvert'
  })

  // Tickets filtrés
  const filteredTickets = useMemo(() => {
    return safeTickets.filter(ticket => {
      const matchesSearch = ticket.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.assignee?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'tous' || ticket.statut === statusFilter
      const matchesPriority = priorityFilter === 'tous' || ticket.priorite === priorityFilter
      const matchesType = typeFilter === 'tous' || ticket.type === typeFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesType
    })
  }, [safeTickets, searchTerm, statusFilter, priorityFilter, typeFilter])

  // Handlers pour les actions
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    post('/innovation-transition/tickets', {
      onSuccess: () => {
        setIsCreateModalOpen(false)
        resetCreate()
      }
    })
  }

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket) return

    put(`/innovation-transition/tickets/${selectedTicket.id}`, {
      onSuccess: () => {
        setIsEditModalOpen(false)
        setSelectedTicket(null)
        resetEdit()
      }
    })
  }

  const handleDelete = (ticket: TicketData) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le ticket "${ticket.titre}" ?`)) {
      router.delete(`/innovation-transition/tickets/${ticket.id}`)
    }
  }

  const openEditModal = (ticket: TicketData) => {
    setSelectedTicket(ticket)
    setEditData({
      titre: ticket.titre,
      description: ticket.description || '',
      priorite: ticket.priorite || 'moyenne',
      type: ticket.type || 'question',
      client: ticket.client || '',
      assignee: ticket.assignee || '',
      statut: ticket.statut
    })
    setIsEditModalOpen(true)
  }

  const openViewModal = (ticket: TicketData) => {
    setSelectedTicket(ticket)
    setIsViewModalOpen(true)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('tous')
    setPriorityFilter('tous')
    setTypeFilter('tous')
  }

  const getStatusBadge = (statut: string) => {
    const statusConfig = {
      ouvert: { label: "Ouvert", className: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
      en_cours: { label: "En cours", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
      en_attente: { label: "En attente", className: "bg-orange-100 text-orange-800 hover:bg-orange-200" },
      resolu: { label: "Résolu", className: "bg-green-100 text-green-800 hover:bg-green-200" },
      ferme: { label: "Fermé", className: "bg-gray-100 text-gray-800 hover:bg-gray-200" }
    }

    const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig.ouvert
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getPriorityBadge = (priorite: string) => {
    const priorityConfig = {
      basse: { label: "Basse", className: "bg-green-100 text-green-800" },
      moyenne: { label: "Moyenne", className: "bg-yellow-100 text-yellow-800" },
      haute: { label: "Haute", className: "bg-orange-100 text-orange-800" },
      critique: { label: "Critique", className: "bg-red-100 text-red-800" }
    }

    const config = priorityConfig[priorite as keyof typeof priorityConfig] || priorityConfig.moyenne
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const activeFiltersCount = [statusFilter, priorityFilter, typeFilter].filter(f => f !== 'tous').length + (searchTerm ? 1 : 0)

  return (
    <SidebarProvider>
      <Head title="Tickets Support - Innovation & Transition" />

      <AppSidebar />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <div className="flex items-center gap-2">
            <Ticket className="h-6 w-6 text-blue-600" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/innovation-transition/dashboard">
                    Innovation & Transition
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Tickets Support</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
          {/* Header avec actions */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tickets Support</h1>
              <p className="text-muted-foreground">
                Gestion des demandes et incidents clients
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {filteredTickets.length} / {safeTickets.length} ticket(s)
              </div>

              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau ticket
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Ticket className="h-5 w-5" />
                      Créer un nouveau ticket
                    </DialogTitle>
                    <DialogDescription>
                      Créez un nouveau ticket de support pour une demande ou un incident client.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleCreate} className="space-y-6">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="titre">Titre *</Label>
                        <Input
                          id="titre"
                          value={createData.titre}
                          onChange={(e) => setCreateData('titre', e.target.value)}
                          placeholder="Décrivez brièvement le problème ou la demande"
                          className={createErrors.titre ? 'border-red-500' : ''}
                        />
                        {createErrors.titre && (
                          <p className="text-sm text-red-500">{createErrors.titre}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          value={createData.description}
                          onChange={(e) => setCreateData('description', e.target.value)}
                          placeholder="Décrivez en détail le problème, les étapes pour le reproduire, etc."
                          rows={4}
                          className={createErrors.description ? 'border-red-500' : ''}
                        />
                        {createErrors.description && (
                          <p className="text-sm text-red-500">{createErrors.description}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="priorite">Priorité</Label>
                          <Select
                            value={createData.priorite}
                            onValueChange={(value) => setCreateData('priorite', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner la priorité" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basse">🟢 Basse</SelectItem>
                              <SelectItem value="moyenne">🟡 Moyenne</SelectItem>
                              <SelectItem value="haute">🟠 Haute</SelectItem>
                              <SelectItem value="critique">🔴 Critique</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="type">Type</Label>
                          <Select
                            value={createData.type}
                            onValueChange={(value) => setCreateData('type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner le type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="question">❓ Question</SelectItem>
                              <SelectItem value="bug">🐛 Bug</SelectItem>
                              <SelectItem value="amelioration">✨ Amélioration</SelectItem>
                              <SelectItem value="incident">⚠️ Incident</SelectItem>
                              <SelectItem value="demande">📝 Demande</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="client">Demandeur</Label>
                          <Input
                            id="client"
                            value={createData.client}
                            onChange={(e) => setCreateData('client', e.target.value)}
                            placeholder="Nom du demandeur (optionnel)"
                            className={createErrors.client ? 'border-red-500' : ''}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="assignee">Assigné à</Label>
                          <Input
                            id="assignee"
                            value={createData.assignee}
                            onChange={(e) => setCreateData('assignee', e.target.value)}
                            placeholder="Nom du responsable (optionnel)"
                          />
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateModalOpen(false)}
                        disabled={createProcessing}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        disabled={createProcessing}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {createProcessing ? (
                          <>
                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-white"></div>
                            Création...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Créer le ticket
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Statistiques rapides */}
          {safeTickets.length > 0 && (
            <div className="grid gap-4 md:grid-cols-5">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="text-2xl font-bold">
                      {safeTickets.filter(t => t.statut === 'ouvert').length}
                    </div>
                    <div className="ml-auto">
                      <Badge className="bg-blue-100 text-blue-800">Ouverts</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="text-2xl font-bold">
                      {safeTickets.filter(t => t.statut === 'en_cours').length}
                    </div>
                    <div className="ml-auto">
                      <Badge className="bg-yellow-100 text-yellow-800">En cours</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="text-2xl font-bold">
                      {safeTickets.filter(t => t.statut === 'en_attente').length}
                    </div>
                    <div className="ml-auto">
                      <Badge className="bg-orange-100 text-orange-800">En attente</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="text-2xl font-bold">
                      {safeTickets.filter(t => t.statut === 'resolu').length}
                    </div>
                    <div className="ml-auto">
                      <Badge className="bg-green-100 text-green-800">Résolus</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="text-2xl font-bold">
                      {safeTickets.filter(t => t.statut === 'ferme').length}
                    </div>
                    <div className="ml-auto">
                      <Badge className="bg-gray-100 text-gray-800">Fermés</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Barre de recherche et filtres */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par titre, demandeur ou assigné..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                    className="relative"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filtres
                    {activeFiltersCount > 0 && (
                      <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-blue-600">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Effacer
                    </Button>
                  )}
                </div>

                {isFiltersOpen && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Statut</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tous">Tous les statuts</SelectItem>
                          <SelectItem value="ouvert">Ouvert</SelectItem>
                          <SelectItem value="en_cours">En cours</SelectItem>
                          <SelectItem value="en_attente">En attente</SelectItem>
                          <SelectItem value="resolu">Résolu</SelectItem>
                          <SelectItem value="ferme">Fermé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Priorité</Label>
                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tous">Toutes les priorités</SelectItem>
                          <SelectItem value="basse">Basse</SelectItem>
                          <SelectItem value="moyenne">Moyenne</SelectItem>
                          <SelectItem value="haute">Haute</SelectItem>
                          <SelectItem value="critique">Critique</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tous">Tous les types</SelectItem>
                          <SelectItem value="question">Question</SelectItem>
                          <SelectItem value="bug">Bug</SelectItem>
                          <SelectItem value="amelioration">Amélioration</SelectItem>
                          <SelectItem value="incident">Incident</SelectItem>
                          <SelectItem value="demande">Demande</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tableau des tickets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Liste des tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    {safeTickets.length === 0 ? "Aucun ticket trouvé" : "Aucun résultat"}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {safeTickets.length === 0
                      ? "Il n'y a actuellement aucun ticket de support dans le système."
                      : "Aucun ticket ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
                    }
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Titre</TableHead>
                        <TableHead className="hidden md:table-cell">Type</TableHead>
                        <TableHead className="hidden md:table-cell">Demandeur</TableHead>
                        <TableHead className="hidden sm:table-cell">Assigné</TableHead>
                        <TableHead>Priorité</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="hidden lg:table-cell">Créé le</TableHead>
                        <TableHead className="w-[50px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTickets.map((ticket) => (
                        <TableRow key={ticket.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            #{ticket.id}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px]">
                              <div className="font-medium truncate">{ticket.titre}</div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline">{ticket.type}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {ticket.client || (
                              <span className="text-muted-foreground">Non spécifié</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {ticket.assignee || (
                              <span className="text-muted-foreground">Non assigné</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {getPriorityBadge(ticket.priorite || 'moyenne')}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(ticket.statut)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="text-sm">
                              {formatDate(ticket.created_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openViewModal(ticket)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Voir
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditModal(ticket)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(ticket)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal de visualisation */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Détails du ticket #{selectedTicket?.id}
              </DialogTitle>
            </DialogHeader>

            {selectedTicket && (
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Titre</Label>
                    <p className="mt-1 text-sm">{selectedTicket.titre}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Description</Label>
                    <p className="mt-1 text-sm whitespace-pre-wrap">{selectedTicket.description || 'Aucune description'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Statut</Label>
                      <div className="mt-1">
                        {getStatusBadge(selectedTicket.statut)}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Priorité</Label>
                      <div className="mt-1">
                        {getPriorityBadge(selectedTicket.priorite || 'moyenne')}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Type</Label>
                      <p className="mt-1 text-sm">{selectedTicket.type}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Demandeur</Label>
                      <p className="mt-1 text-sm">{selectedTicket.client || 'Non spécifié'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Assigné à</Label>
                      <p className="mt-1 text-sm">{selectedTicket.assignee || 'Non assigné'}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Créé le</Label>
                      <p className="mt-1 text-sm">{formatDate(selectedTicket.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Fermer
              </Button>
              <Button onClick={() => {
                setIsViewModalOpen(false)
                if (selectedTicket) openEditModal(selectedTicket)
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de modification */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Modifier le ticket #{selectedTicket?.id}
              </DialogTitle>
              <DialogDescription>
                Mettez à jour les informations du ticket de support.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEdit} className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-titre">Titre *</Label>
                  <Input
                    id="edit-titre"
                    value={editData.titre}
                    onChange={(e) => setEditData('titre', e.target.value)}
                    placeholder="Décrivez brièvement le problème ou la demande"
                    className={editErrors.titre ? 'border-red-500' : ''}
                  />
                  {editErrors.titre && (
                    <p className="text-sm text-red-500">{editErrors.titre}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description *</Label>
                  <Textarea
                    id="edit-description"
                    value={editData.description}
                    onChange={(e) => setEditData('description', e.target.value)}
                    placeholder="Décrivez en détail le problème, les étapes pour le reproduire, etc."
                    rows={4}
                    className={editErrors.description ? 'border-red-500' : ''}
                  />
                  {editErrors.description && (
                    <p className="text-sm text-red-500">{editErrors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-statut">Statut</Label>
                    <Select
                      value={editData.statut}
                      onValueChange={(value) => setEditData('statut', value as TicketData['statut'])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ouvert">Ouvert</SelectItem>
                        <SelectItem value="en_cours">En cours</SelectItem>
                        <SelectItem value="en_attente">En attente</SelectItem>
                        <SelectItem value="resolu">Résolu</SelectItem>
                        <SelectItem value="ferme">Fermé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-priorite">Priorité</Label>
                    <Select
                      value={editData.priorite}
                      onValueChange={(value) => setEditData('priorite', value as TicketData['priorite'])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner la priorité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basse">🟢 Basse</SelectItem>
                        <SelectItem value="moyenne">🟡 Moyenne</SelectItem>
                        <SelectItem value="haute">🟠 Haute</SelectItem>
                        <SelectItem value="critique">🔴 Critique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">Type</Label>
                    <Select
                      value={editData.type}
                      onValueChange={(value) => setEditData('type', value as TicketData['type'])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="question">❓ Question</SelectItem>
                        <SelectItem value="bug">🐛 Bug</SelectItem>
                        <SelectItem value="amelioration">✨ Amélioration</SelectItem>
                        <SelectItem value="incident">⚠️ Incident</SelectItem>
                        <SelectItem value="demande">📝 Demande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-client">Demandeur</Label>
                    <Input
                      id="edit-client"
                      value={editData.client}
                      onChange={(e) => setEditData('client', e.target.value)}
                      placeholder="Nom du demandeur (optionnel)"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-assignee">Assigné à</Label>
                  <Input
                    id="edit-assignee"
                    value={editData.assignee}
                    onChange={(e) => setEditData('assignee', e.target.value)}
                    placeholder="Nom du responsable (optionnel)"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={editProcessing}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={editProcessing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {editProcessing ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-white"></div>
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Mettre à jour
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default InnovationTickets
