import { useState, useMemo } from "react"
import { Head, router, usePage } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, UserPlus, Edit, Trash2, FolderKanban, Eye, EyeOff, UserCog, Briefcase } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  created_at: string
}

interface Profil {
  id: number
  categorie_profil: string
  poste_profil: string
  missions?: string
  niveau_experience: string
  actif: boolean
  competences_techniques?: string[]
  certifications?: string[]
}

interface Salarie {
  id: number
  nom: string
  prenom: string
  email: string
  telephone: string
  poste?: string
  salaire_mensuel?: number
  date_embauche?: string
  statut: string
  user_id: number
  user?: User
  projets?: Projet[]
  profil?: Profil
}

interface Projet {
  id: number
  nom: string
  description?: string
  statut?: string
}

interface PageProps {
  users: User[]
  salaries: Salarie[]
  projets: Projet[]
  profils: Profil[]
}

const CATEGORIES_OPTIONS = [
  'profils_techniques_fondamentaux',
  'profils_specialises_techniques',
  'profils_conception_avancee',
  'profils_management_encadrement',
  'profils_controle_qualite',
  'profils_expertise_specialisee',
  'profils_digital_innovation',
  'profils_support_administratifs',
  'profils_commerciaux_techniques',
  'profils_rd_innovation',
]

const POSTES_OPTIONS = [
  'ingenieur_structure_beton_arme',
  'ingenieur_structures_metalliques',
  'technicien_bureau_etudes',
  'dessinateur_projeteur',
  'ingenieur_geotechnicien',
  'ingenieur_vrd',
  'technicien_geotechnique',
  'coordinateur_bim',
  'modeleur_bim',
  'bim_manager',
  'chef_projet_etudes',
  'responsable_bureau_etudes',
  'ingenieur_methodes',
  'controleur_technique',
  'coordinateur_sps',
  'expert_rehabilitation',
  'specialiste_hqe',
  'ingenieur_facades',
  'ingenieur_computational_design',
  'specialiste_digital_twin',
  'assistant_technique',
  'gestionnaire_projets',
  'ingenieur_affaires',
  'responsable_marches_publics',
  'ingenieur_recherche_developpement',
  'responsable_innovation',
]

export default function Access() {
  const { users, salaries, projets, profils } = usePage<PageProps>().props
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showProjectDialog, setShowProjectDialog] = useState(false)
  const [showProfilDialog, setShowProfilDialog] = useState(false)
  const [showCreateProfilDialog, setShowCreateProfilDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedSalarie, setSelectedSalarie] = useState<Salarie | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedProjects, setSelectedProjects] = useState<number[]>([])
  const [selectedProfil, setSelectedProfil] = useState<string>("")
  const [processing, setProcessing] = useState(false)

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    password: "",
    poste: "",
    salaire_mensuel: "",
    date_embauche: "",
    statut: "actif",
    profil_id: "",
  })

  const [profilFormData, setProfilFormData] = useState({
    categorie_profil: "",
    poste_profil: "",
    niveau_experience: "junior",
    competences_techniques: "",
    certifications: "",
    missions: "",
    actif: true,
  })

  const filteredSalaries = useMemo(() => {
    if (!searchQuery) return salaries

    return salaries.filter((salarie) => {
      const fullName = `${salarie.prenom} ${salarie.nom}`.toLowerCase()
      const search = searchQuery.toLowerCase()
      return (
        fullName.includes(search) ||
        salarie.email.toLowerCase().includes(search) ||
        salarie.telephone?.includes(search) ||
        salarie.poste?.toLowerCase().includes(search)
      )
    })
  }, [salaries, searchQuery])

  const handleCreate = () => {
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      password: "",
      poste: "",
      salaire_mensuel: "",
      date_embauche: "",
      statut: "actif",
      profil_id: "",
    })
    setShowCreateDialog(true)
  }

  const handleCreateProfil = () => {
    setProfilFormData({
      categorie_profil: "",
      poste_profil: "",
      niveau_experience: "junior",
      competences_techniques: "",
      certifications: "",
      missions: "",
      actif: true,
    })
    setShowCreateProfilDialog(true)
  }

  const submitCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    router.post(route("ressources-humaines.access.store"), formData, {
      onFinish: () => {
        setProcessing(false)
        setShowCreateDialog(false)
      },
    })
  }

  const submitCreateProfil = (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    
    const data = {
      ...profilFormData,
      competences_techniques: profilFormData.competences_techniques 
        ? profilFormData.competences_techniques.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      certifications: profilFormData.certifications
        ? profilFormData.certifications.split(',').map(s => s.trim()).filter(Boolean)
        : [],
    }

    router.post(route("ressources-humaines.access.profil.store"), data, {
      onFinish: () => {
        setProcessing(false)
        setShowCreateProfilDialog(false)
      },
    })
  }

  const handleEdit = (salarie: Salarie) => {
    setSelectedSalarie(salarie)
    setSelectedUser(salarie.user || null)
    setFormData({
      nom: salarie.nom,
      prenom: salarie.prenom,
      email: salarie.email,
      telephone: salarie.telephone,
      password: "",
      poste: salarie.poste || "",
      salaire_mensuel: salarie.salaire_mensuel?.toString() || "",
      date_embauche: salarie.date_embauche || "",
      statut: salarie.statut,
      profil_id: salarie.profil?.id.toString() || "",
    })
    setShowEditDialog(true)
  }

  const handleDelete = (salarie: Salarie) => {
    setSelectedSalarie(salarie)
    setSelectedUser(salarie.user || null)
    setShowDeleteDialog(true)
  }

  const handleProjectAssignment = (salarie: Salarie) => {
    setSelectedSalarie(salarie)
    setSelectedProjects(salarie.projets?.map((p) => p.id) || [])
    setShowProjectDialog(true)
  }

  const handleProfilAssignment = (salarie: Salarie) => {
      setSelectedSalarie(salarie)
      setSelectedProfil(salarie.profil?.id ? salarie.profil.id.toString() : "")
      setShowProfilDialog(true)
  }

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    setProcessing(true)
    router.put(route("ressources-humaines.access.update", selectedUser.id), formData, {
      onFinish: () => {
        setProcessing(false)
        setShowEditDialog(false)
      },
    })
  }

  const confirmDelete = () => {
    if (!selectedUser) return
    setProcessing(true)
    router.delete(route("ressources-humaines.access.destroy", selectedUser.id), {
      onFinish: () => {
        setProcessing(false)
        setShowDeleteDialog(false)
      },
    })
  }

  const submitProjectAssignment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSalarie) return
    setProcessing(true)
    router.post(
      route("ressources-humaines.access.affecter-projets", selectedSalarie.id),
      { projet_ids: selectedProjects },
      {
        onFinish: () => {
          setProcessing(false)
          setShowProjectDialog(false)
        },
      }
    )
  }

  const submitProfilAssignment = (e: React.FormEvent) => {
      e.preventDefault()
      if (!selectedSalarie) return
      setProcessing(true)

      router.post(
        route("ressources-humaines.access.affecter-profil", selectedSalarie.id),
        { profil_id: Number(selectedProfil) }, // <-- convert to number
        {
          onFinish: () => {
            setProcessing(false)
            setShowProfilDialog(false)
          },
        }
      )
  }

  const getStatusBadge = (statut: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      actif: { variant: "default", label: "Actif" },
      inactif: { variant: "secondary", label: "Inactif" },
      conge: { variant: "outline", label: "Congé" },
      demission: { variant: "destructive", label: "Démission" },
    }
    const status = variants[statut] || variants.actif
    return <Badge variant={status.variant}>{status.label}</Badge>
  }

  const getExperienceBadge = (niveau: string) => {
    const colors: Record<string, string> = {
      junior: "bg-blue-100 text-blue-800 border-blue-200",
      intermediaire: "bg-green-100 text-green-800 border-green-200",
      senior: "bg-purple-100 text-purple-800 border-purple-200",
      expert: "bg-orange-100 text-orange-800 border-orange-200",
    }
    return (
      <Badge variant="outline" className={colors[niveau] || ""}>
        {niveau}
      </Badge>
    )
  }

  return (
    <AppLayout>
      <Head title="Gestion des Accès" />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Accès</h1>
            <p className="text-muted-foreground mt-1">
              Gérez les utilisateurs et leurs accès au système
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreateProfil} variant="outline" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Créer Profil
            </Button>
            <Button onClick={handleCreate} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Nouvel Accès
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un salarié..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium">Nom Complet</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Téléphone</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Poste</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Profil</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Projets</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredSalaries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      Aucun salarié trouvé
                    </td>
                  </tr>
                ) : (
                  filteredSalaries.map((salarie) => (
                    <tr key={salarie.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        {salarie.prenom} {salarie.nom}
                      </td>
                      <td className="px-4 py-3 text-sm">{salarie.email}</td>
                      <td className="px-4 py-3 text-sm">{salarie.telephone}</td>
                      <td className="px-4 py-3 text-sm">{salarie.poste || "-"}</td>
                      <td className="px-4 py-3">
                        {salarie.profil ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium">{salarie.profil.poste_profil}</span>
                            {getExperienceBadge(salarie.profil.niveau_experience)}
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Non assigné
                          </Badge>
                        )}
                      </td>

                      <td className="px-4 py-3">{getStatusBadge(salarie.statut)}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{salarie.projets?.length || 0}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleProfilAssignment(salarie)}
                            title="Assigner un profil"
                            className="h-8 w-8"
                          >
                            <UserCog className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleProjectAssignment(salarie)}
                            title="Affecter des projets"
                            className="h-8 w-8"
                          >
                            <FolderKanban className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(salarie)}
                            title="Modifier"
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4 text-orange-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(salarie)}
                            title="Supprimer"
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un Nouvel Accès</DialogTitle>
            <DialogDescription>
              Créez un nouvel utilisateur avec un accès salarié
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input
                  id="prenom"
                  required
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone *</Label>
                <Input
                  id="telephone"
                  required
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-10 w-10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="poste">Poste</Label>
                <Input
                  id="poste"
                  value={formData.poste}
                  onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profil">Profil</Label>
                  <Select value={formData.profil_id || ""} onValueChange={(value) => setFormData({ ...formData, profil_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un profil" />
                    </SelectTrigger>
                    <SelectContent>
                      {profils.map((profil) => (
                        <SelectItem key={profil.id} value={profil.id.toString()}>
                          {profil.poste_profil} - {profil.niveau_experience}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaire">Salaire Mensuel</Label>
                <Input
                  id="salaire"
                  type="number"
                  step="0.01"
                  value={formData.salaire_mensuel}
                  onChange={(e) => setFormData({ ...formData, salaire_mensuel: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_embauche">Date d'Embauche</Label>
                <Input
                  id="date_embauche"
                  type="date"
                  value={formData.date_embauche}
                  onChange={(e) => setFormData({ ...formData, date_embauche: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statut">Statut</Label>
              <Select value={formData.statut} onValueChange={(value) => setFormData({ ...formData, statut: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                  <SelectItem value="conge">Congé</SelectItem>
                  <SelectItem value="demission">Démission</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={submitCreate} disabled={processing}>
              {processing ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Profil Dialog */}
      <Dialog open={showCreateProfilDialog} onOpenChange={setShowCreateProfilDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un Nouveau Profil</DialogTitle>
            <DialogDescription>
              Définissez les caractéristiques du nouveau profil professionnel
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categorie_profil">Catégorie *</Label>
                <Select
                  value={profilFormData.categorie_profil}
                  onValueChange={(value) => setProfilFormData({ ...profilFormData, categorie_profil: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES_OPTIONS.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="poste_profil">Poste *</Label>
                <Select
                  value={profilFormData.poste_profil}
                  onValueChange={(value) => setProfilFormData({ ...profilFormData, poste_profil: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un poste" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSTES_OPTIONS.map((poste) => (
                      <SelectItem key={poste} value={poste}>
                        {poste.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="niveau_experience">Niveau d'expérience *</Label>
              <Select
                value={profilFormData.niveau_experience}
                onValueChange={(value) => setProfilFormData({ ...profilFormData, niveau_experience: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="competences">Compétences Techniques (séparées par des virgules)</Label>
              <Input
                id="competences"
                placeholder="Ex: AutoCAD, Revit, BIM, Calcul de structures..."
                value={profilFormData.competences_techniques}
                onChange={(e) => setProfilFormData({ ...profilFormData, competences_techniques: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications (séparées par des virgules)</Label>
              <Input
                id="certifications"
                placeholder="Ex: AutoCAD Certified, Revit Professional, PMP..."
                value={profilFormData.certifications}
                onChange={(e) => setProfilFormData({ ...profilFormData, certifications: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="missions">Missions Principales</Label>
              <Textarea
                id="missions"
                placeholder="Décrivez les missions et responsabilités principales..."
                value={profilFormData.missions}
                onChange={(e) => setProfilFormData({ ...profilFormData, missions: e.target.value })}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowCreateProfilDialog(false)}>
              Annuler
            </Button>
            <Button onClick={submitCreateProfil} disabled={processing}>
              {processing ? "Création..." : "Créer le Profil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Other dialogs (Edit, Delete, Project Assignment, Profil Assignment) remain the same as your original code */}
      
    </AppLayout>
  )
}