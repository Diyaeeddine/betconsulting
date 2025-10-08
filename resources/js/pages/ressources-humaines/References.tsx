import AppLayout from '@/layouts/app-layout';
import { router, useForm, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Eye, CheckCircle, XCircle, AlertCircle, Download, FileText, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface PageProps {
  references: Reference[];
  stats: {
    total: number;
    pending: number;
    validated: number;
    rejected: number;
  };
}

export default function References() {
  const { references, stats } = usePage<PageProps>().props;
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
  const [selectedReference, setSelectedReference] = useState<Reference | null>(null);
  const [validationAction, setValidationAction] = useState<'validated' | 'rejected'>('validated');

  const breadcrumbs = [
    { title: 'Accueil', href: '/' },
    { title: 'Références', href: '/ressources-humaines/references' },
  ];

  const { data, setData, post, processing, errors, reset } = useForm({
    status: 'validated' as 'validated' | 'rejected',
    validation_comment: '',
  });

  const openValidationDialog = (reference: Reference, action: 'validated' | 'rejected') => {
    setSelectedReference(reference);
    setValidationAction(action);
    setData('status', action);
    setIsValidationDialogOpen(true);
  };

  const handleValidation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReference) return;

    post(`/ressources-humaines/references/${selectedReference.id}/validate`, {
      onSuccess: () => {
        setIsValidationDialogOpen(false);
        reset();
        setSelectedReference(null);
      },
    });
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

  const filterByStatus = (status?: string) => {
    if (!status) return references;
    return references.filter((ref) => ref.status === status);
  };

  const ReferenceTable = ({ data }: { data: Reference[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fournisseur</TableHead>
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
        {data.length > 0 ? (
          data.map((reference) => (
            <TableRow key={reference.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{reference.user.name}</div>
                  <div className="text-sm text-gray-500">{reference.user.email}</div>
                </div>
              </TableCell>
              <TableCell className="font-medium">{reference.project_name}</TableCell>
              <TableCell>{reference.client_name}</TableCell>
              <TableCell>{reference.project_value} MAD</TableCell>
              <TableCell className="text-sm">
                {new Date(reference.start_date).toLocaleDateString('fr-FR')} -{' '}
                {new Date(reference.end_date).toLocaleDateString('fr-FR')}
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
                    title="Voir le document"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {reference.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => openValidationDialog(reference, 'validated')}
                        title="Valider"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openValidationDialog(reference, 'rejected')}
                        title="Rejeter"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
              Aucune référence dans cette catégorie
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Validation des Références" />
      <div className="space-y-6 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Validation des Références</h1>
          <p className="text-gray-600 mt-2">
            Validez ou rejetez les attestations de références soumises par les fournisseurs
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">En attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Validées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.validated}</div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Rejetées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* References Table with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Références</CardTitle>
            <CardDescription>Gérez toutes les attestations de références</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">Toutes ({stats.total})</TabsTrigger>
                <TabsTrigger value="pending">En attente ({stats.pending})</TabsTrigger>
                <TabsTrigger value="validated">Validées ({stats.validated})</TabsTrigger>
                <TabsTrigger value="rejected">Rejetées ({stats.rejected})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <ReferenceTable data={references} />
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                <ReferenceTable data={filterByStatus('pending')} />
              </TabsContent>

              <TabsContent value="validated" className="mt-4">
                <ReferenceTable data={filterByStatus('validated')} />
              </TabsContent>

              <TabsContent value="rejected" className="mt-4">
                <ReferenceTable data={filterByStatus('rejected')} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Validation Dialog */}
      <Dialog open={isValidationDialogOpen} onOpenChange={setIsValidationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {validationAction === 'validated' ? 'Valider la référence' : 'Rejeter la référence'}
            </DialogTitle>
            <DialogDescription>
              {selectedReference && (
                <div className="mt-2 space-y-1">
                  <p><strong>Projet:</strong> {selectedReference.project_name}</p>
                  <p><strong>Client:</strong> {selectedReference.client_name}</p>
                  <p><strong>Fournisseur:</strong> {selectedReference.user.name}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleValidation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="validation_comment">
                Commentaire {validationAction === 'rejected' && '(requis)'}
              </Label>
              <Textarea
                id="validation_comment"
                value={data.validation_comment}
                onChange={(e) => setData('validation_comment', e.target.value)}
                placeholder={
                  validationAction === 'validated'
                    ? 'Commentaire optionnel...'
                    : 'Expliquez la raison du rejet...'
                }
                rows={4}
                required={validationAction === 'rejected'}
              />
              {errors.validation_comment && (
                <p className="text-sm text-red-500">{errors.validation_comment}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsValidationDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={processing}
                className={
                  validationAction === 'validated'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }
              >
                {validationAction === 'validated' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Valider
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeter
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}