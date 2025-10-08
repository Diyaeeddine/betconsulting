import AppLayout from '@/layouts/app-layout';
import { router, useForm, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Upload, FileText, Download, Trash2, Eye, CheckCircle, XCircle, AlertCircle, Plus, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Reference {
  id: number;
  project_name: string;
  client_name: string;
  project_value: string;
  start_date: string;
  end_date: string;
  description: string;
  document_path: string;
  document_name: string;
  status: 'pending' | 'validated' | 'rejected';
  validation_comment?: string;
  submitted_at: string;
  validated_at?: string;
}

interface PageProps {
  references: Reference[];
  errors?: any;
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function References() {
  const { references, errors: pageErrors, flash } = usePage<PageProps>().props;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const breadcrumbs = [
    { title: 'Accueil', href: '/' },
    { title: 'Offre Technique', href: '/fournisseurs-traitants/OffreTechnique' },
    { title: 'Références', href: '/fournisseurs-traitants/references' },
  ];

  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    project_name: '',
    client_name: '',
    project_value: '',
    start_date: '',
    end_date: '',
    description: '',
    document: null as File | null,
  });

  // Show flash messages
  useEffect(() => {
    if (flash?.success) {
      console.log('Success:', flash.success);
    }
    if (flash?.error) {
      console.error('Error:', flash.error);
    }
  }, [flash]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submitting form with data:', {
      ...data,
      document: data.document ? data.document.name : null
    });

    // Clear previous errors
    clearErrors();

    // Create FormData
    const formData = new FormData();
    formData.append('project_name', data.project_name);
    formData.append('client_name', data.client_name);
    formData.append('project_value', data.project_value);
    formData.append('start_date', data.start_date);
    formData.append('end_date', data.end_date);
    formData.append('description', data.description);
    
    if (data.document) {
      formData.append('document', data.document);
    }

    // Submit using Inertia
    post('/fournisseurs-traitants/references/store', {
      data: formData,
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        console.log('Form submitted successfully');
        setIsDialogOpen(false);
        reset();
      },
      onError: (errors) => {
        console.error('Form submission errors:', errors);
      },
      onFinish: () => {
        console.log('Form submission finished');
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette référence ?')) {
      router.delete(`/fournisseurs-traitants/references/${id}`, {
        onSuccess: () => {
          console.log('Reference deleted successfully');
        },
        onError: (errors) => {
          console.error('Delete errors:', errors);
        }
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Validé</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejeté</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" /> En attente</Badge>;
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Attestations de Références" />

      <div className="space-y-6">
        {/* Flash Messages */}
        {flash?.success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {flash.success}
            </AlertDescription>
          </Alert>
        )}

        {flash?.error && (
          <Alert className="bg-red-50 border-red-200">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {flash.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Page Errors */}
        {pageErrors?.error && (
          <Alert className="bg-red-50 border-red-200">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {pageErrors.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attestations de Références</h1>
            <p className="text-gray-600 mt-2">
              Téléchargez les attestations de vos projets antérieurs pour validation par les RH
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Ajouter une référence
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nouvelle Attestation de Référence</DialogTitle>
                <DialogDescription>
                  Remplissez les informations du projet et téléchargez l'attestation
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project_name">Nom du Projet *</Label>
                    <Input
                      id="project_name"
                      value={data.project_name}
                      onChange={(e) => setData('project_name', e.target.value)}
                      placeholder="Ex: Construction d'un pont"
                      required
                    />
                    {errors.project_name && (
                      <p className="text-sm text-red-500">{errors.project_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client_name">Nom du Client *</Label>
                    <Input
                      id="client_name"
                      value={data.client_name}
                      onChange={(e) => setData('client_name', e.target.value)}
                      placeholder="Ex: Ministère de l'Équipement"
                      required
                    />
                    {errors.client_name && (
                      <p className="text-sm text-red-500">{errors.client_name}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project_value">Montant du Projet (MAD) *</Label>
                  <Input
                    id="project_value"
                    type="text"
                    value={data.project_value}
                    onChange={(e) => setData('project_value', e.target.value)}
                    placeholder="Ex: 5 000 000"
                    required
                  />
                  {errors.project_value && (
                    <p className="text-sm text-red-500">{errors.project_value}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Date de Début *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={data.start_date}
                      onChange={(e) => setData('start_date', e.target.value)}
                      required
                    />
                    {errors.start_date && (
                      <p className="text-sm text-red-500">{errors.start_date}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">Date de Fin *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={data.end_date}
                      onChange={(e) => setData('end_date', e.target.value)}
                      required
                    />
                    {errors.end_date && (
                      <p className="text-sm text-red-500">{errors.end_date}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description du Projet *</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Décrivez brièvement le projet et vos responsabilités..."
                    rows={4}
                    required
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document">Attestation de Référence (PDF) *</Label>
                  <Input
                    id="document"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setData('document', file);
                      console.log('File selected:', file?.name);
                    }}
                    required
                  />
                  {data.document && (
                    <p className="text-sm text-green-600">
                      Fichier sélectionné: {data.document.name}
                    </p>
                  )}
                  {errors.document && (
                    <p className="text-sm text-red-500">{errors.document}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Format accepté : PDF uniquement (max 10 MB)
                  </p>
                </div>

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      reset();
                    }}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={processing} 
                    className="flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {processing ? 'Envoi en cours...' : 'Soumettre pour validation'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{references?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">En attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {references?.filter((r) => r.status === 'pending').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Validées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {references?.filter((r) => r.status === 'validated').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Rejetées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {references?.filter((r) => r.status === 'rejected').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* References Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Références</CardTitle>
            <CardDescription>
              Toutes vos attestations de références soumises
            </CardDescription>
          </CardHeader>
          <CardContent>
            {references && references.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projet</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Soumis le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {references.map((reference) => (
                    <TableRow key={reference.id}>
                      <TableCell className="font-medium">{reference.project_name}</TableCell>
                      <TableCell>{reference.client_name}</TableCell>
                      <TableCell>{reference.project_value} MAD</TableCell>
                      <TableCell className="text-sm">
                        {new Date(reference.start_date).toLocaleDateString('fr-FR')} - {new Date(reference.end_date).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>{getStatusBadge(reference.status)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(reference.submitted_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/storage/${reference.document_path}`, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {reference.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(reference.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune référence soumise pour le moment</p>
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter votre première référence
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}