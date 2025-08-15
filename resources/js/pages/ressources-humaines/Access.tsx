import { useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Plus, Eye, EyeOff, Users, Shield, Building, Phone, Calendar, Wallet } from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: number
  name: string
  email: string
  created_at: string
  roles?: Array<{ name: string }>
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
  statut?: string
  projet_id?: number
  user?: User
}

interface Projet {
  id: number
  nom: string
}

// Fixed PageProps interface with index signature
interface PageProps extends Record<string, any> {
  users: User[]
  salaries: Salarie[]
  projets?: Projet[]
}

interface FormData {
  nom: string
  prenom: string
  email: string
  telephone: string
  password: string
  poste: string
  salaire_mensuel: string
  date_embauche: string
  statut: string
  projet_id: string
}

const initialFormData: FormData = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  password: '',
  poste: '',
  salaire_mensuel: '',
  date_embauche: '',
  statut: 'actif',
  projet_id: ''
}

export default function Access() {
  const { users, salaries, projets = [] } = usePage<PageProps>().props
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const breadcrumbs = [
    { title: 'Dashboard', href: '/ressources-humaines/dashboard' },
    { title: 'Gestion des Accès', href: '/ressources-humaines/access' },
  ]

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)

    const data = {
      ...formData,
      salaire_mensuel: formData.salaire_mensuel ? parseFloat(formData.salaire_mensuel) : null,
      projet_id: formData.projet_id || null
    }

    try {
      if (editingUser) {
        await router.put(`/ressources-humaines/access/${editingUser.id}`, data)
        toast.success('Accès mis à jour avec succès')
      } else {
        await router.post('/ressources-humaines/access', data)
        toast.success('Accès créé avec succès')
      }
      
      setIsDialogOpen(false)
      setEditingUser(null)
      setFormData(initialFormData)
    } catch (error) {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    const salarie = salaries.find(s => s.user?.id === user.id)
    
    setEditingUser(user)
    setFormData({
      nom: salarie?.nom || '',
      prenom: salarie?.prenom || '',
      email: user.email,
      telephone: salarie?.telephone || '',
      password: '',
      poste: salarie?.poste || '',
      salaire_mensuel: salarie?.salaire_mensuel?.toString() || '',
      date_embauche: salarie?.date_embauche || '',
      statut: salarie?.statut || 'actif',
      projet_id: salarie?.projet_id?.toString() || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (user: User) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet accès ?')) {
      try {
        await router.delete(`/ressources-humaines/access/${user.id}`)
        toast.success('Accès supprimé avec succès')
      } catch (error) {
        toast.error('Erreur lors de la suppression')
      }
    }
  }

  const openCreateDialog = () => {
    setEditingUser(null)
    setFormData(initialFormData)
    setIsDialogOpen(true)
  }

  const getStatusBadge = (statut?: string) => {
    const statusConfig = {
      actif: { 
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
        label: 'Actif',
        icon: '●'
      },
      inactif: { 
        bg: 'bg-red-50 text-red-700 border-red-200', 
        label: 'Inactif',
        icon: '●'
      },
      conge: { 
        bg: 'bg-amber-50 text-amber-700 border-amber-200', 
        label: 'En congé',
        icon: '●'
      },
      demission: { 
        bg: 'bg-gray-50 text-gray-700 border-gray-200', 
        label: 'Démission',
        icon: '●'
      }
    }
    
    const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig.inactif
    
    return (
      <Badge className={`${config.bg} border font-medium`} variant="outline">
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </Badge>
    )
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gestion des Accès" />
      
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestion des Accès</h1>
                <p className="text-gray-500 font-medium">
                  Créez et gérez les comptes d'accès pour les salariés
                </p>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="flex gap-6 mt-6">
              <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Total Accès</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-medium text-gray-600">Actifs</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {salaries.filter(s => s.statut === 'actif').length}
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={openCreateDialog} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nouvel Accès
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pb-4 border-b border-gray-100">
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {editingUser ? 'Modifier l\'accès' : 'Créer un nouvel accès'}
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  {editingUser ? 'Modifiez les informations de l\'accès' : 'Créez un nouveau compte d\'accès avec le rôle "salarié"'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Informations Personnelles
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="prenom" className="text-sm font-medium text-gray-700">Prénom *</Label>
                      <Input
                        id="prenom"
                        value={formData.prenom}
                        onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                        required
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="nom" className="text-sm font-medium text-gray-700">Nom *</Label>
                      <Input
                        id="nom"
                        value={formData.nom}
                        onChange={(e) => setFormData({...formData, nom: e.target.value})}
                        required
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="telephone" className="text-sm font-medium text-gray-700">Téléphone *</Label>
                      <Input
                        id="telephone"
                        value={formData.telephone}
                        onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                        required
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Sécurité
                  </h3>
                  <div>
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Mot de passe {editingUser ? '(laisser vide pour ne pas modifier)' : '*'}
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required={!editingUser}
                        className="pr-10 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Informations Professionnelles
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="poste" className="text-sm font-medium text-gray-700">Poste</Label>
                      <Input
                        id="poste"
                        value={formData.poste}
                        onChange={(e) => setFormData({...formData, poste: e.target.value})}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="salaire" className="text-sm font-medium text-gray-700">Salaire mensuel</Label>
                      <Input
                        id="salaire"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.salaire_mensuel}
                        onChange={(e) => setFormData({...formData, salaire_mensuel: e.target.value})}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="date_embauche" className="text-sm font-medium text-gray-700">Date d'embauche</Label>
                      <Input
                        id="date_embauche"
                        type="date"
                        value={formData.date_embauche}
                        onChange={(e) => setFormData({...formData, date_embauche: e.target.value})}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="statut" className="text-sm font-medium text-gray-700">Statut</Label>
                      <Select value={formData.statut} onValueChange={(value) => setFormData({...formData, statut: value})}>
                        <SelectTrigger className="mt-1 focus:ring-blue-500 focus:border-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="actif">Actif</SelectItem>
                          <SelectItem value="inactif">Inactif</SelectItem>
                          <SelectItem value="conge">En congé</SelectItem>
                          <SelectItem value="demission">Démission</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {projets.length > 0 && (
                    <div className="mt-4">
                      <Label htmlFor="projet" className="text-sm font-medium text-gray-700">Projet assigné</Label>
                      <Select value={formData.projet_id} onValueChange={(value) => setFormData({...formData, projet_id: value})}>
                        <SelectTrigger className="mt-1 focus:ring-blue-500 focus:border-blue-500">
                          <SelectValue placeholder="Sélectionner un projet" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Aucun projet</SelectItem>
                          {projets.map((projet) => (
                            <SelectItem key={projet.id} value={projet.id.toString()}>
                              {projet.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="px-6 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Enregistrement...' : editingUser ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Users Grid */}
        <div className="grid gap-6">
          {users.map((user) => {
            const salarie = salaries.find(s => s.user?.id === user.id)
            
            return (
              <Card key={user.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">{user.name}</CardTitle>
                        <CardDescription className="text-gray-600 font-medium">{user.email}</CardDescription>
                        {salarie?.poste && (
                          <p className="text-sm text-blue-600 font-medium mt-1">{salarie.poste}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(salarie?.statut)}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user)}
                          className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                {salarie && (
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Téléphone</span>
                          <p className="text-sm font-semibold text-gray-900">{salarie.telephone || 'Non renseigné'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                        <Wallet className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Salaire</span>
                          <p className="text-sm font-semibold text-gray-900">
                            {salarie.salaire_mensuel ? `${salarie.salaire_mensuel.toLocaleString()} DH` : 'Non renseigné'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Embauche</span>
                          <p className="text-sm font-semibold text-gray-900">
                            {salarie.date_embauche ? new Date(salarie.date_embauche).toLocaleDateString('fr-FR') : 'Non renseigné'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                        <Building className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Projet</span>
                          <p className="text-sm font-semibold text-gray-900">
                            {salarie.projet_id ? 
                              projets.find(p => p.id === salarie.projet_id)?.nom || 'Projet introuvable'
                              : 'Aucun projet'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
            
        </div>
      </div>
    </AppLayout>
  )
}