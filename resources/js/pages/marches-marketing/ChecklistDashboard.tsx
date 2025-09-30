import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@headlessui/react';
import AppLayout from '@/layouts/app-layout';
import {
    AlertTriangle,
    Briefcase,
    Calendar,
    CheckCircle2,
    CheckSquare,
    Circle,
    Clock,
    Download,
    Eye,
    FileText,
    Filter,
    Target,
    TrendingUp,
    Users,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface MarchePublic {
    id: number;
    reference: string;
    objet: string;
    maitre_ouvrage: string;
    statut: string;
    urgence: 'faible' | 'moyenne' | 'elevee';
    date_limite_soumission: string;
    ville: string;
    montant: string;
}

interface DossierMarche {
    id: number;
    marche_public_id: number;
    type_dossier: 'dossier_administratif' | 'dossier_technique' | 'offre_financiere' | 'offre_technique';
    nom_dossier: string;
    statut: 'non_commence' | 'en_cours' | 'termine' | 'valide';
    pourcentage_avancement: number;
    date_limite: string;
    total_taches: number;
    taches_terminees: number;
    taches_en_retard: number;
    salaries_assignes: number;
    marche?: MarchePublic;
}

interface TacheDossier {
    id: number;
    dossier_marche_id: number;
    nom_tache: string;
    description?: string;
    priorite: 'faible' | 'moyenne' | 'elevee' | 'critique';
    statut: 'non_assignee' | 'assignee' | 'en_cours' | 'terminee' | 'validee';
    duree_estimee?: number;
    duree_reelle?: number;
    date_limite?: string;
    date_debut?: string;
    date_fin?: string;
    assignes?: Array<{
        id: number;
        nom: string;
        prenom: string;
        role: string;
    }>;
}

interface Props {
    dossiers: DossierMarche[];
    taches: TacheDossier[];
    marches: MarchePublic[];
}

const STATUT_DOSSIER_COLORS = {
    non_commence: 'bg-gray-100 text-gray-700 border-gray-200',
    en_cours: 'bg-blue-100 text-blue-700 border-blue-200',
    termine: 'bg-green-100 text-green-700 border-green-200',
    valide: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const PRIORITE_COLORS = {
    faible: 'bg-green-100 text-green-700',
    moyenne: 'bg-yellow-100 text-yellow-700',
    elevee: 'bg-orange-100 text-orange-700',
    critique: 'bg-red-100 text-red-700',
};

const STATUT_TACHE_COLORS = {
    non_assignee: 'bg-gray-100 text-gray-600',
    assignee: 'bg-blue-100 text-blue-700',
    en_cours: 'bg-yellow-100 text-yellow-700',
    terminee: 'bg-green-100 text-green-700',
    validee: 'bg-emerald-100 text-emerald-700',
};

export default function ChecklistDashboard({ dossiers = [], taches = [], marches = [] }: Props) {
    const [selectedDossier, setSelectedDossier] = useState<number | null>(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [filterMarche, setFilterMarche] = useState<string>('all');
    const [filterStatut, setFilterStatut] = useState<string>('all');
    const [commentaire, setCommentaire] = useState('');

    const breadcrumbs = [
        { title: 'Marché Marketing', href: '/marches-marketing' },
        { title: 'Checklist BTP', href: '/marches-marketing/checklist' },
    ];

    // Enrichir les dossiers avec les données des marchés
    const dossiersEnriches = useMemo(() => {
        return dossiers.map((dossier) => ({
            ...dossier,
            marche: marches.find((m) => m.id === dossier.marche_public_id),
            taches_dossier: taches.filter((t) => t.dossier_marche_id === dossier.id),
        }));
    }, [dossiers, marches, taches]);

    // Filtrage des dossiers
    const dossiersFiltrés = useMemo(() => {
        return dossiersEnriches.filter((dossier) => {
            const matchMarche = filterMarche === 'all' || dossier.marche_public_id.toString() === filterMarche;
            const matchStatut = filterStatut === 'all' || dossier.statut === filterStatut;
            return matchMarche && matchStatut;
        });
    }, [dossiersEnriches, filterMarche, filterStatut]);

    // Statistiques globales
    const statistiques = useMemo(() => {
        const total = dossiersFiltrés.length;
        const termines = dossiersFiltrés.filter((d) => d.statut === 'termine' || d.statut === 'valide').length;
        const enCours = dossiersFiltrés.filter((d) => d.statut === 'en_cours').length;
        const enRetard = dossiersFiltrés.filter((d) => {
            const dateLimit = new Date(d.date_limite);
            return dateLimit < new Date() && d.statut !== 'termine' && d.statut !== 'valide';
        }).length;

        const avancementMoyen = total > 0 ? dossiersFiltrés.reduce((acc, d) => acc + d.pourcentage_avancement, 0) / total : 0;

        return {
            total,
            termines,
            enCours,
            enRetard,
            avancementMoyen: Math.round(avancementMoyen),
        };
    }, [dossiersFiltrés]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const isEnRetard = (dateLimit: string, statut: string) => {
        return new Date(dateLimit) < new Date() && statut !== 'termine' && statut !== 'valide';
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-green-500';
        if (percentage >= 70) return 'bg-blue-500';
        if (percentage >= 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const ouvrirDetails = (dossierId: number) => {
        setSelectedDossier(dossierId);
        setIsDetailDialogOpen(true);
    };

    const marquerTacheTerminee = (tacheId: number) => {
        // Logique pour marquer une tâche comme terminée
        console.log('Marquer tâche terminée:', tacheId);
    };

    const validerDossier = (dossierId: number) => {
        // Logique pour valider un dossier complet
        console.log('Valider dossier:', dossierId, 'Commentaire:', commentaire);
        setCommentaire('');
    };

    const dossierSelectionne = selectedDossier ? dossiersEnriches.find((d) => d.id === selectedDossier) : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    {/* En-tête avec statistiques */}
                    <div className="mb-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Checklist BTP</h1>
                                <p className="text-gray-600">Suivi de l'avancement des dossiers de marché</p>
                            </div>
                            <Button className="flex items-center space-x-2">
                                <Download className="h-4 w-4" />
                                <span>Rapport PDF</span>
                            </Button>
                        </div>

                        {/* Cartes statistiques */}
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-gray-600">TOTAL DOSSIERS</p>
                                            <p className="text-2xl font-bold text-gray-900">{statistiques.total}</p>
                                        </div>
                                        <FileText className="h-8 w-8 text-blue-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-gray-600">TERMINÉS</p>
                                            <p className="text-2xl font-bold text-green-600">{statistiques.termines}</p>
                                        </div>
                                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-gray-600">EN COURS</p>
                                            <p className="text-2xl font-bold text-blue-600">{statistiques.enCours}</p>
                                        </div>
                                        <Clock className="h-8 w-8 text-blue-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-gray-600">EN RETARD</p>
                                            <p className="text-2xl font-bold text-red-600">{statistiques.enRetard}</p>
                                        </div>
                                        <AlertTriangle className="h-8 w-8 text-red-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-gray-600">AVANCEMENT</p>
                                            <p className="text-2xl font-bold text-purple-600">{statistiques.avancementMoyen}%</p>
                                        </div>
                                        <TrendingUp className="h-8 w-8 text-purple-600" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Filtres */}
                        <Card className="mb-6">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-4">
                                    <Filter className="h-4 w-4 text-gray-500" />
                                    <div className="flex items-center space-x-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-600">Marché</label>
                                            <select
                                                value={filterMarche}
                                                onChange={(e) => setFilterMarche(e.target.value)}
                                                className="ml-2 rounded border-gray-300 text-sm"
                                            >
                                                <option value="all">Tous les marchés</option>
                                                {marches.map((marche) => (
                                                    <option key={marche.id} value={marche.id.toString()}>
                                                        {marche.reference}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-600">Statut</label>
                                            <select
                                                value={filterStatut}
                                                onChange={(e) => setFilterStatut(e.target.value)}
                                                className="ml-2 rounded border-gray-300 text-sm"
                                            >
                                                <option value="all">Tous les statuts</option>
                                                <option value="non_commence">Non commencé</option>
                                                <option value="en_cours">En cours</option>
                                                <option value="termine">Terminé</option>
                                                <option value="valide">Validé</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Liste des dossiers */}
                    <div className="grid gap-6">
                        {dossiersFiltrés.map((dossier) => (
                            <Card
                                key={dossier.id}
                                className={`border-l-4 ${
                                    isEnRetard(dossier.date_limite, dossier.statut)
                                        ? 'border-l-red-500'
                                        : dossier.statut === 'termine' || dossier.statut === 'valide'
                                          ? 'border-l-green-500'
                                          : 'border-l-blue-500'
                                }`}
                            >
                                <CardContent className="p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{dossier.nom_dossier}</h3>
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Briefcase className="h-4 w-4" />
                                                    <span>{dossier.marche?.reference}</span>
                                                    <span>•</span>
                                                    <span>{dossier.marche?.maitre_ouvrage}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Badge variant="outline" className={STATUT_DOSSIER_COLORS[dossier.statut]}>
                                                {dossier.statut.replace('_', ' ').toUpperCase()}
                                            </Badge>

                                            {isEnRetard(dossier.date_limite, dossier.statut) && (
                                                <Badge variant="outline" className="border-red-200 bg-red-100 text-red-700">
                                                    <AlertTriangle className="mr-1 h-3 w-3" />
                                                    EN RETARD
                                                </Badge>
                                            )}

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => ouvrirDetails(dossier.id)}
                                                className="flex items-center space-x-1"
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span>Détails</span>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Barre de progression */}
                                    <div className="mb-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Avancement: {dossier.pourcentage_avancement}%</span>
                                            <span className="text-sm text-gray-600">
                                                {dossier.taches_terminees} / {dossier.total_taches} tâches
                                            </span>
                                        </div>
                                        <div className="h-3 w-full rounded-full bg-gray-200">
                                            <div
                                                className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(dossier.pourcentage_avancement)}`}
                                                style={{ width: `${dossier.pourcentage_avancement}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Informations détaillées */}
                                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-600">Échéance:</span>
                                            <span
                                                className={`font-medium ${
                                                    isEnRetard(dossier.date_limite, dossier.statut) ? 'text-red-600' : 'text-gray-900'
                                                }`}
                                            >
                                                {formatDate(dossier.date_limite)}
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Users className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-600">Assignés:</span>
                                            <span className="font-medium text-gray-900">{dossier.salaries_assignes} personne(s)</span>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Target className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-600">Ville:</span>
                                            <span className="font-medium text-gray-900">{dossier.marche?.ville}</span>
                                        </div>
                                    </div>

                                    {/* Alerte si en retard */}
                                    {isEnRetard(dossier.date_limite, dossier.statut) && (
                                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                                            <div className="flex items-center space-x-2">
                                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                                <span className="text-sm font-medium text-red-800">
                                                    Ce dossier est en retard. Action urgente requise.
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {dossiersFiltrés.length === 0 && (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                <p className="text-gray-500">Aucun dossier trouvé avec les filtres sélectionnés</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Dialog détails dossier */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <FileText className="h-5 w-5" />
                            <span>Détails - {dossierSelectionne?.nom_dossier}</span>
                        </DialogTitle>
                    </DialogHeader>

                    {dossierSelectionne && (
                        <div className="space-y-6 py-4">
                            {/* Informations générales */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Informations générales</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Marché</p>
                                            <p className="text-lg font-semibold">{dossierSelectionne.marche?.reference}</p>
                                            <p className="text-sm text-gray-600">{dossierSelectionne.marche?.objet}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Maître d'ouvrage</p>
                                            <p className="text-lg font-semibold">{dossierSelectionne.marche?.maitre_ouvrage}</p>
                                            <p className="text-sm text-gray-600">{dossierSelectionne.marche?.ville}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Date limite soumission</p>
                                            <p className="text-lg font-semibold text-red-600">
                                                {formatDate(dossierSelectionne.marche?.date_limite_soumission || '')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Montant estimé</p>
                                            <p className="text-lg font-semibold text-green-600">
                                                {dossierSelectionne.marche?.montant || 'Non spécifié'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Liste des tâches */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Tâches du dossier ({dossierSelectionne.taches_dossier?.length || 0})</span>
                                        <Badge variant="outline" className="text-sm">
                                            {dossierSelectionne.taches_terminees} / {dossierSelectionne.total_taches} terminées
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {dossierSelectionne.taches_dossier?.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500">
                                                <CheckSquare className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                                <p>Aucune tâche définie pour ce dossier</p>
                                                <p className="mt-2 text-xs">Les tâches doivent être créées à partir des templates</p>
                                            </div>
                                        ) : (
                                            dossierSelectionne.taches_dossier?.map((tache) => (
                                                <div
                                                    key={tache.id}
                                                    className={`rounded-lg border p-4 transition-all hover:shadow-sm ${
                                                        tache.statut === 'terminee' || tache.statut === 'validee'
                                                            ? 'border-green-200 bg-green-50'
                                                            : 'border-gray-200 bg-white'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex flex-1 items-start space-x-3">
                                                            <div className="pt-1">
                                                                {tache.statut === 'terminee' || tache.statut === 'validee' ? (
                                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                                ) : (
                                                                    <Circle className="h-5 w-5 text-gray-400" />
                                                                )}
                                                            </div>

                                                            <div className="flex-1">
                                                                <h4 className="font-medium text-gray-900">{tache.nom_tache}</h4>
                                                                {tache.description && (
                                                                    <p className="mt-1 text-sm text-gray-600">{tache.description}</p>
                                                                )}

                                                                <div className="mt-2 flex items-center space-x-4">
                                                                    <Badge variant="outline" className={`text-xs ${PRIORITE_COLORS[tache.priorite]}`}>
                                                                        {tache.priorite}
                                                                    </Badge>

                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`text-xs ${STATUT_TACHE_COLORS[tache.statut]}`}
                                                                    >
                                                                        {tache.statut.replace('_', ' ')}
                                                                    </Badge>

                                                                    {tache.duree_estimee && (
                                                                        <div className="flex items-center text-xs text-gray-500">
                                                                            <Clock className="mr-1 h-3 w-3" />
                                                                            {tache.duree_estimee}h estimées
                                                                        </div>
                                                                    )}

                                                                    {tache.date_limite && (
                                                                        <div className="flex items-center text-xs text-gray-500">
                                                                            <Calendar className="mr-1 h-3 w-3" />
                                                                            {formatDate(tache.date_limite)}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {tache.assignes && tache.assignes.length > 0 && (
                                                                    <div className="mt-2">
                                                                        <p className="mb-1 text-xs font-medium text-gray-600">Assigné à:</p>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {tache.assignes.map((assigne, index) => (
                                                                                <Badge key={index} variant="outline" className="text-xs">
                                                                                    {assigne.prenom} {assigne.nom} ({assigne.role})
                                                                                </Badge>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-2">
                                                            {tache.statut !== 'terminee' && tache.statut !== 'validee' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => marquerTacheTerminee(tache.id)}
                                                                    className="text-xs"
                                                                >
                                                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                                                    Terminer
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Zone de validation */}
                            {dossierSelectionne.statut === 'termine' && (
                                <Card className="border-green-200 bg-green-50">
                                    <CardHeader>
                                        <CardTitle className="text-green-800">Validation du dossier</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">Commentaire de validation</label>
                                                <Textarea
                                                    placeholder="Ajouter un commentaire sur la validation de ce dossier..."
                                                    value={commentaire}
                                                    onChange={(e) => setCommentaire(e.target.value)}
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="flex justify-end space-x-3">
                                                <Button variant="outline" className="border-red-300 text-red-600">
                                                    <XCircle className="mr-1 h-4 w-4" />
                                                    Rejeter
                                                </Button>
                                                <Button
                                                    onClick={() => validerDossier(dossierSelectionne.id)}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle2 className="mr-1 h-4 w-4" />
                                                    Valider le dossier
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
