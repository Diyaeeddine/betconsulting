import AppLayout from '@/layouts/app-layout';
import React, { JSX } from 'react';
import {
    Activity,
    AlertCircle,
    ArrowLeft,
    Briefcase,
    Calendar,
    CheckCircle,
    CheckCircle2,
    ChevronRight,
    Clock,
    Download,
    Edit,
    Eye,
    FileText,
    FolderOpen,
    Search,
    Timer,
    TrendingUp,
    Upload,
    User,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

// ========== TYPES ET INTERFACES ==========

type StatutMarche = 'termine' | 'en_cours' | 'en_attente' | 'modification_requis';
type ImportanceMarche = 'ao_ouvert' | 'ao_restreint' | 'ao_simplifie' | 'ao_bon_commande';
type PrioriteType = 'haute' | 'moyenne' | 'basse';
type TypeEvent =
    | 'approbation_finale'
    | 'demande_modification_dg'
    | 'refus_dg'
    | 'upload_fichier'
    | 'affectation_tache'
    | 'finalisation_tache'
    | 'affectation'
    | 'terminaison';

interface Stats {
    total_fichiers: number;
    total_participants: number;
    taches_terminees: number;
    total_taches: number;
    documents_permanents: number;
}

interface Dossier {
    id: number;
    nom: string;
    type: string;
    statut: StatutMarche;
    avancement: number;
    nb_fichiers: number;
    nb_taches: number;
    taches_terminees: number;
}

interface Participant {
    id: number;
    nom: string;
    role: string;
    taches_affectees: number;
    taches_terminees: number;
    temps_passe: number;
    taux_completion: number;
}

interface HistoriqueEvent {
    type: TypeEvent;
    description: string;
    date: string;
    user: string;
    dossier?: string;
    tache?: string;
    commentaire?: string;
    etape_precedente?: string;
    etape_nouvelle?: string;
    statut_precedent?: string;
    statut_nouveau?: string;
}

interface Marche {
    id: number;
    reference: string;
    objet: string;
    maitre_ouvrage: string;
    importance: ImportanceMarche;
    etat: StatutMarche;
    etape: string;
    date_limite: string;
    stats: Stats;
    dossiers: Dossier[];
    participants: Participant[];
    historique: HistoriqueEvent[];
}

interface Fichier {
    id: number;
    nom_original: string;
    taille_fichier: number;
    type_mime: string;
    uploaded_by: string;
    tache_associee: string;
    date_upload: string;
}

interface Affectation {
    salarie_nom: string;
    role: string;
    temps_passe: number | null;
    date_affectation: string | null;
}

interface Tache {
    id: number;
    nom_tache: string;
    description?: string;
    statut: StatutMarche;
    priorite: PrioriteType;
    date_debut: string | null;
    date_limite: string | null;
    duree_estimee: number;
    nb_fichiers: number;
    est_en_retard: boolean;
    affectations: Affectation[];
    dossier_nom?: string;
    dossier_type?: string;
    date_affectation?: string;
    date_terminee?: string;
    temps_passe?: number;
    avancement?: number;
    tache_nom?: string;
    temps_passe_formate?: string; // Exemple : "2h 30min"
    est_en_cours?: boolean; // true si la tâche n’est pas terminée
}

interface TimelineEvent {
    type: 'affectation' | 'terminaison';
    tache_nom: string;
    description: string;
    priorite: PrioriteType;
    salarie: string;
    date: string;
    temps_passe?: number;
}

interface DetailsFichiers {
    fichiers: Fichier[];
    dossier: {
        nom: string;
        type: string;
    };
}

interface DetailsTaches {
    taches: Tache[];
    dossier: {
        nom: string;
        type: string;
    };
}

interface DetailsTimeline {
    timeline: TimelineEvent[];
    dossier: {
        nom: string;
        type: string;
    };
}

interface DetailsParticipantTaches {
    participant: {
        nom: string;
        role: string;
    };
    marche: {
        reference: string;
        objet: string;
    };
    taches: Tache[];
}

interface DetailTemps {
    tache_nom: string;
    dossier_nom: string;
    dossier_type: string;
    temps_passe_heures: number;
    temps_passe_jours: number;
    date_debut: string;
    date_fin: string;
    temps_passe_formate?: string;
    est_en_cours?: boolean;
}

interface DetailsParticipantTemps {
    participant: {
        nom: string;
        role: string;
    };
    marche: {
        reference: string;
    };
    temps_total: number;
    nb_taches_terminees: number;
    temps_total_formate: number;
    details: DetailTemps[];
}

interface DetailsHistorique {
    marche: {
        reference: string;
        objet: string;
    };
    historique: HistoriqueEvent[];
}

type DetailsData = DetailsFichiers | DetailsTaches | DetailsTimeline | DetailsParticipantTaches | DetailsParticipantTemps | DetailsHistorique | null;

type ViewMode = 'list' | 'details';
type ActiveTab = 'overview' | 'dossiers' | 'participants' | 'historique';

interface TracabiliteProps {
    marches?: Marche[];
}

// ========== COMPOSANT PRINCIPAL ==========

const Tracabilite: React.FC<TracabiliteProps> = ({ marches: initialMarches = [] }) => {
const [marches] = useState<Marche[]>(initialMarches);
const [searchTerm, setSearchTerm] = useState<string>('');
const [selectedMarche, setSelectedMarche] = useState<Marche | null>(null);
const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
const [viewMode, setViewMode] = useState<ViewMode>('list');
const [detailsData, setDetailsData] = useState<DetailsData>(null);
const [loading, setLoading] = useState<boolean>(false);
const [searchFichier, setSearchFichier] = useState<string>('');

    const loadDetails = async (url: string): Promise<void> => {
        setLoading(true);
        try {
            const response = await fetch(url);
            const data = await response.json();
            setDetailsData(data);
            setViewMode('details');
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetView = (): void => {
        setViewMode('list');
        setDetailsData(null);
    };

    const filteredMarches = marches.filter(
        (marche) =>
            marche.reference.toLowerCase().includes(searchTerm.toLowerCase()) || marche.objet.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const getStatutColor = (statut: StatutMarche): string => {
        const colors: Record<StatutMarche, string> = {
            termine: 'bg-green-100 text-green-800 border-green-200',
            en_cours: 'bg-blue-100 text-blue-800 border-blue-200',
            en_attente: 'bg-gray-100 text-gray-800 border-gray-200',
            modification_requis: 'bg-orange-100 text-orange-800 border-orange-200',
        };
        return colors[statut] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getTypeIcon = (type: TypeEvent): JSX.Element => {
        const icons: Record<TypeEvent, JSX.Element> = {
            approbation_finale: <CheckCircle2 className="h-4 w-4 text-green-600" />,
            demande_modification_dg: <Edit className="h-4 w-4 text-orange-600" />,
            refus_dg: <XCircle className="h-4 w-4 text-red-600" />,
            upload_fichier: <Upload className="h-4 w-4 text-blue-600" />,
            affectation_tache: <User className="h-4 w-4 text-purple-600" />,
            finalisation_tache: <CheckCircle className="h-4 w-4 text-green-600" />,
            affectation: <User className="h-4 w-4 text-purple-600" />,
            terminaison: <CheckCircle className="h-4 w-4 text-green-600" />,
        };
        return icons[type] || <Activity className="h-4 w-4 text-gray-600" />;
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const getPrioriteColor = (priorite: PrioriteType): string => {
        const colors: Record<PrioriteType, string> = {
            haute: 'bg-red-100 text-red-800',
            moyenne: 'bg-yellow-100 text-yellow-800',
            basse: 'bg-blue-100 text-blue-800',
        };
        return colors[priorite] || 'bg-gray-100 text-gray-800';
    };

    const getImportanceBadge = (importance: ImportanceMarche): string => {
        const labels: Record<ImportanceMarche, string> = {
            ao_ouvert: 'AO Ouvert',
            ao_restreint: 'AO Restreint',
            ao_simplifie: 'AO Simplifié',
            ao_bon_commande: 'Bon de Commande',
        };
        return labels[importance] || importance;
    };

    const renderDetailsView = (): JSX.Element | null => {
        if (loading) {
            return (
                <div className="rounded-lg bg-white p-12 text-center shadow-sm">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            );
        }

        if (!detailsData) return null;

        if ('fichiers' in detailsData) {
            const fichiersFiltres = detailsData.fichiers.filter((f) => f.nom_original.toLowerCase().includes(searchFichier.toLowerCase()));

            return (
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <div className="mb-6 border-b pb-4">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Fichiers du dossier</h3>
                                <p className="text-sm text-gray-600">
                                    {detailsData.dossier.nom} - {detailsData.dossier.type}
                                </p>
                            </div>
                            <div className="rounded-lg bg-blue-50 px-4 py-2">
                                <span className="text-2xl font-bold text-blue-600">{fichiersFiltres.length}</span>
                                <span className="ml-2 text-sm text-gray-600">fichiers</span>
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un fichier..."
                                value={searchFichier}
                                onChange={(e) => setSearchFichier(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        {fichiersFiltres.map((fichier) => (
                            <div
                                key={fichier.id}
                                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                            >
                                <div className="flex flex-1 items-center gap-4">
                                    <FileText className="h-10 w-10 flex-shrink-0 text-blue-600" />
                                    <div className="min-w-0 flex-1">
                                        <h4 className="truncate font-medium text-gray-900">{fichier.nom_original}</h4>
                                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                            <span>{formatFileSize(fichier.taille_fichier)}</span>
                                            <span>•</span>
                                            <span>{fichier.type_mime}</span>
                                            <span>•</span>
                                            <span>Uploadé par: {fichier.uploaded_by}</span>
                                            {fichier.tache_associee !== 'N/A' && (
                                                <>
                                                    <span>•</span>
                                                    <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-800">
                                                        {fichier.tache_associee}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500">{new Date(fichier.date_upload).toLocaleString('fr-FR')}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => (window.location.href = `/api/fichiers/${fichier.id}/download`)}
                                    className="flex-shrink-0 rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700"
                                >
                                    <Download className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if ('taches' in detailsData && !('participant' in detailsData)) {
            return (
                
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between border-b pb-4">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Tâches du dossier</h3>
                                <p className="text-sm text-gray-600">
                                    {detailsData.dossier.nom} - {detailsData.dossier.type}
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div className="rounded-lg bg-green-50 px-4 py-2 text-center">
                                    <span className="text-2xl font-bold text-green-600">
                                        {detailsData.taches.filter((t) => ['terminee', 'validee'].includes(t.statut)).length}
                                    </span>
                                    <span className="ml-2 text-sm text-gray-600">terminées</span>
                                </div>
                                <div className="rounded-lg bg-blue-50 px-4 py-2 text-center">
                                    <span className="text-2xl font-bold text-blue-600">{detailsData.taches.length}</span>
                                    <span className="ml-2 text-sm text-gray-600">total</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {detailsData.taches.map((tache) => (
                                <div key={tache.id} className="rounded-lg border border-gray-200 p-5">
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="mb-2 flex items-center gap-3">
                                                <h4 className="text-lg font-semibold text-gray-900">{tache.nom_tache}</h4>
                                                <span className={`rounded-full border px-2 py-1 text-xs ${getStatutColor(tache.statut)}`}>
                                                    {tache.statut}
                                                </span>
                                                <span className={`rounded px-2 py-1 text-xs font-medium ${getPrioriteColor(tache.priorite)}`}>
                                                    {tache.priorite}
                                                </span>
                                            </div>
                                            {tache.description && <p className="text-sm text-gray-600">{tache.description}</p>}
                                        </div>
                                        {tache.est_en_retard && <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-500" />}
                                    </div>
                                    <div className="mb-4 grid grid-cols-4 gap-3 rounded-lg bg-gray-50 p-3 text-sm">
                                        <div>
                                            <div className="text-xs text-gray-500">Date début</div>
                                            <div className="font-medium">{tache.date_debut || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">Date limite</div>
                                            <div className="font-medium">{tache.date_limite || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">Durée estimée</div>
                                            <div className="font-medium">{tache.duree_estimee}h</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">Fichiers</div>
                                            <div className="font-medium">{tache.nb_fichiers}</div>
                                        </div>
                                    </div>
                                    {tache.affectations.length > 0 && (
                                        <div>
                                            <h5 className="mb-2 text-sm font-semibold text-gray-700">Salarié affecté:</h5>
                                            <div className="space-y-2">
                                                {tache.affectations.map((affectation, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 p-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-200">
                                                                <User className="h-5 w-5 text-blue-700" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">{affectation.salarie_nom}</div>
                                                                <div className="text-xs text-gray-600 capitalize">
                                                                    {affectation.role.replace('_', ' ')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            {affectation.temps_passe !== null && (
                                                                <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                                                                    <Timer className="h-4 w-4" />
                                                                    {affectation.temps_passe}h
                                                                </div>
                                                            )}
                                                            <div className="text-xs text-gray-500">
                                                                {affectation.date_affectation ? `Depuis ${affectation.date_affectation}` : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
            
            );
        }

        if ('timeline' in detailsData) {
            return (
                
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="mb-6 border-b pb-4">
                            <h3 className="text-xl font-semibold text-gray-900">Timeline chronologique</h3>
                            <p className="text-sm text-gray-600">
                                {detailsData.dossier.nom} - {detailsData.dossier.type}
                            </p>
                        </div>
                        <div className="relative">
                            <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-200"></div>
                            <div className="space-y-6">
                                {detailsData.timeline.map((event, index) => (
                                    <div key={index} className="relative flex gap-4">
                                        <div
                                            className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-4 border-white ${
                                                event.type === 'affectation' ? 'bg-blue-500' : 'bg-green-500'
                                            }`}
                                        >
                                            {event.type === 'affectation' ? (
                                                <User className="h-5 w-5 text-white" />
                                            ) : (
                                                <CheckCircle className="h-5 w-5 text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                            <div className="mb-2 flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{event.tache_nom}</h4>
                                                    <p className="text-sm text-gray-600">{event.description}</p>
                                                </div>
                                                <span className={`rounded px-2 py-1 text-xs font-medium ${getPrioriteColor(event.priorite)}`}>
                                                    {event.priorite}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <User className="h-4 w-4" />
                                                    {event.salarie}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {new Date(event.date).toLocaleString('fr-FR')}
                                                </span>
                                                {event.temps_passe && (
                                                    <span className="flex items-center gap-1 font-medium text-blue-600">
                                                        <Timer className="h-4 w-4" />
                                                        {event.temps_passe}h passées
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
    
            );
        }

        if ('participant' in detailsData && 'taches' in detailsData && !('details' in detailsData)) {
            return (
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between border-b pb-4">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">Tâches affectées</h3>
                            <p className="text-sm text-gray-600">
                                {detailsData.participant.nom} - {detailsData.participant.role}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                                {detailsData.marche.reference} - {detailsData.marche.objet}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {detailsData.taches.map((tache, index) => (
                            <div key={index} className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                                <div className="mb-3 flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-900">{tache.tache_nom}</h4>
                                            <span className={`rounded-full border px-2 py-1 text-xs ${getStatutColor(tache.statut)}`}>
                                                {tache.statut}
                                            </span>
                                            <span className={`rounded px-2 py-1 text-xs font-medium ${getPrioriteColor(tache.priorite)}`}>
                                                {tache.priorite}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {tache.dossier_nom} - {tache.dossier_type}
                                        </p>
                                    </div>
                                </div>
                                <div className="mb-3 grid grid-cols-3 gap-3 rounded bg-gray-50 p-3 text-sm">
                                    <div>
                                        <div className="text-xs text-gray-500">Affecté le</div>
                                        <div className="font-medium">{tache.date_affectation || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Terminé le</div>
                                        <div className="font-medium">{tache.date_terminee || 'En cours'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Temps passé</div>
                                        <div className="font-medium text-blue-600">
                                            {tache.temps_passe_formate || 'N/A'}
                                            {tache.est_en_cours && <span className="ml-1 text-xs">(en cours)</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Avancement: <span className="font-semibold">{tache.avancement}%</span>
                                    </div>
                                    <div className="h-2 w-1/2 rounded-full bg-gray-200">
                                        <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${tache.avancement}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if ('details' in detailsData && 'temps_total' in detailsData) {
            const detailsTemps = detailsData as DetailsParticipantTemps;
            return (
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <div className="mb-6 border-b pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Temps passé par tâche</h3>
                                <p className="text-sm text-gray-600">
                                    {detailsTemps.participant.nom} - {detailsTemps.participant.role}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">{detailsTemps.marche.reference}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-blue-600">{detailsTemps.temps_total_formate}</div>
                                <div className="text-sm text-gray-600">Total</div>
                                <div className="mt-1 text-xs text-gray-500">{detailsTemps.nb_taches_terminees} tâches</div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {detailsTemps.details.map((item, index) => (
                            <div key={index} className="rounded-lg border border-gray-200 p-4">
                                <div className="mb-3 flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{item.tache_nom}</h4>
                                        <p className="text-sm text-gray-600">
                                            {item.dossier_nom} - {item.dossier_type}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-blue-600">{item.temps_passe_formate}</div>
                                        <div className="text-xs text-gray-500">({item.temps_passe_jours.toFixed(1)}j au total)</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between rounded bg-gray-50 p-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600">Début:</span>
                                        <span className="font-medium">{item.date_debut}</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-gray-600">Fin:</span>
                                        <span className="font-medium">{item.date_fin}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if ('historique' in detailsData) {
            return (
            
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="mb-6 border-b pb-4">
                            <h3 className="text-xl font-semibold text-gray-900">Historique complet</h3>
                            <p className="text-sm text-gray-600">
                                {detailsData.marche.reference} - {detailsData.marche.objet}
                            </p>
                        </div>
                        <div className="space-y-3">
                            {detailsData.historique.map((event, index) => (
                                <div key={index} className="flex gap-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                                    <div className="mt-1 flex-shrink-0">{getTypeIcon(event.type)}</div>
                                    <div className="flex-1">
                                        <div className="mb-1 flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{event.description}</p>
                                                {event.dossier && <p className="text-sm text-gray-600">Dossier: {event.dossier}</p>}
                                                {event.tache && <p className="text-sm text-gray-600">Tâche: {event.tache}</p>}
                                            </div>
                                            <span className="ml-4 text-xs whitespace-nowrap text-gray-500">
                                                {new Date(event.date).toLocaleString('fr-FR')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">Par: {event.user}</p>
                                        {(event.etape_precedente || event.statut_precedent) && (
                                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                                {event.etape_precedente && (
                                                    <>
                                                        <span className="rounded bg-gray-100 px-2 py-1">{event.etape_precedente}</span>
                                                        <ChevronRight className="h-3 w-3" />
                                                        <span className="rounded bg-blue-100 px-2 py-1">{event.etape_nouvelle}</span>
                                                    </>
                                                )}
                                                {event.statut_precedent && (
                                                    <>
                                                        <span className="rounded bg-gray-100 px-2 py-1">{event.statut_precedent}</span>
                                                        <ChevronRight className="h-3 w-3" />
                                                        <span className="rounded bg-blue-100 px-2 py-1">{event.statut_nouveau}</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        {event.commentaire && (
                                            <p className="mt-2 rounded border-l-2 border-blue-500 bg-gray-50 p-2 text-sm text-gray-700">
                                                {event.commentaire}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
        
            );
        }

        return null;
    };

    if (!selectedMarche) {
        return (
            <AppLayout>
                <div className="min-h-screen bg-gray-50 p-6">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-8">
                            <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
                                <Activity className="h-8 w-8 text-blue-600" />
                                Traçabilité des Marchés
                            </h1>
                            <p className="mt-2 text-gray-600">Consultez l'historique complet et les détails de tous les marchés acceptés</p>
                        </div>
                        <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher par référence ou objet..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 py-3 pr-4 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            {filteredMarches.length === 0 ? (
                                <div className="rounded-lg bg-white p-12 text-center">
                                    <Activity className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                                    <p className="text-gray-500">Aucun marché trouvé</p>
                                </div>
                            ) : (
                                filteredMarches.map((marche) => (
                                    <div
                                        key={marche.id}
                                        onClick={() => setSelectedMarche(marche)}
                                        className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-3">
                                                    <span className="font-mono font-semibold text-blue-600">{marche.reference}</span>
                                                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700">
                                                        {getImportanceBadge(marche.importance)}
                                                    </span>
                                                    <span className={`rounded-full border px-2 py-1 text-xs ${getStatutColor(marche.etat)}`}>
                                                        {marche.etape}
                                                    </span>
                                                </div>
                                                <h3 className="mb-2 text-lg font-medium text-gray-900">{marche.objet}</h3>
                                                <p className="flex items-center gap-1 text-sm text-gray-600">
                                                    <Briefcase className="h-4 w-4" />
                                                    {marche.maitre_ouvrage}
                                                </p>
                                            </div>
                                            <ChevronRight className="h-6 w-6 flex-shrink-0 text-gray-400" />
                                        </div>
                                        <div className="mt-4 grid grid-cols-4 gap-4 border-t border-gray-100 pt-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-900">{marche.stats.total_fichiers}</div>
                                                <div className="text-xs text-gray-500">Fichiers</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-900">{marche.stats.total_participants}</div>
                                                <div className="text-xs text-gray-500">Participants</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {marche.stats.taches_terminees}/{marche.stats.total_taches}
                                                </div>
                                                <div className="text-xs text-gray-500">Tâches</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-900">{marche.dossiers.length}</div>
                                                <div className="text-xs text-gray-500">Dossiers</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
        </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    <button
                        onClick={() => {
                            setSelectedMarche(null);
                            resetView();
                        }}
                        className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour à la liste
                    </button>

                    {viewMode === 'details' && (
                        <button onClick={resetView} className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800">
                            <ArrowLeft className="h-4 w-4" />
                            Retour aux détails du marché
                        </button>
                    )}

                    <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <div className="mb-2 flex items-center gap-3">
                                    <span className="font-mono text-xl font-bold text-blue-600">{selectedMarche.reference}</span>
                                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
                                        {getImportanceBadge(selectedMarche.importance)}
                                    </span>
                                </div>
                                <h2 className="mb-2 text-2xl font-semibold text-gray-900">{selectedMarche.objet}</h2>
                                <p className="flex items-center gap-2 text-gray-600">
                                    <Briefcase className="h-4 w-4" />
                                    {selectedMarche.maitre_ouvrage}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="mb-1 text-sm text-gray-500">Date limite</div>
                                <div className="flex items-center gap-2 font-medium text-gray-900">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(selectedMarche.date_limite).toLocaleDateString('fr-FR')}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-5 gap-4 border-t border-gray-100 pt-4">
                            <div className="rounded-lg bg-blue-50 p-3 text-center">
                                <FileText className="mx-auto mb-1 h-5 w-5 text-blue-600" />
                                <div className="text-xl font-bold text-gray-900">{selectedMarche.stats.total_fichiers}</div>
                                <div className="text-xs text-gray-600">Fichiers</div>
                            </div>
                            <div className="rounded-lg bg-purple-50 p-3 text-center">
                                <Users className="mx-auto mb-1 h-5 w-5 text-purple-600" />
                                <div className="text-xl font-bold text-gray-900">{selectedMarche.stats.total_participants}</div>
                                <div className="text-xs text-gray-600">Participants</div>
                            </div>
                            <div className="rounded-lg bg-green-50 p-3 text-center">
                                <CheckCircle className="mx-auto mb-1 h-5 w-5 text-green-600" />
                                <div className="text-xl font-bold text-gray-900">
                                    {selectedMarche.stats.taches_terminees}/{selectedMarche.stats.total_taches}
                                </div>
                                <div className="text-xs text-gray-600">Tâches</div>
                            </div>
                            <div className="rounded-lg bg-orange-50 p-3 text-center">
                                <FolderOpen className="mx-auto mb-1 h-5 w-5 text-orange-600" />
                                <div className="text-xl font-bold text-gray-900">{selectedMarche.dossiers.length}</div>
                                <div className="text-xs text-gray-600">Dossiers</div>
                            </div>
                            <div className="rounded-lg bg-teal-50 p-3 text-center">
                                <FileText className="mx-auto mb-1 h-5 w-5 text-teal-600" />
                                <div className="text-xl font-bold text-gray-900">{selectedMarche.stats.documents_permanents}</div>
                                <div className="text-xs text-gray-600">Docs Permanents</div>
                            </div>
                        </div>
                    </div>

                    {viewMode === 'details' ? (
                        renderDetailsView()
                    ) : (
                        <div className="mb-6 rounded-lg bg-white shadow-sm">
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex">
                                    {[
                                        { id: 'overview' as ActiveTab, label: "Vue d'ensemble", icon: Eye },
                                        { id: 'dossiers' as ActiveTab, label: 'Dossiers', icon: FolderOpen },
                                        { id: 'participants' as ActiveTab, label: 'Participants', icon: Users },
                                        { id: 'historique' as ActiveTab, label: 'Historique', icon: Clock },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
                                                activeTab === tab.id
                                                    ? 'border-blue-600 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                            }`}
                                        >
                                            <tab.icon className="h-4 w-4" />
                                            {tab.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div className="p-6">
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="mb-4 text-lg font-semibold">Progression globale</h3>
                                            <div className="space-y-3">
                                                {selectedMarche.dossiers.map((dossier) => (
                                                    <div key={dossier.id} className="rounded-lg border border-gray-200 p-4">
                                                        <div className="mb-2 flex items-center justify-between">
                                                            <span className="font-medium">{dossier.nom}</span>
                                                            <span
                                                                className={`rounded-full border px-2 py-1 text-xs ${getStatutColor(dossier.statut)}`}
                                                            >
                                                                {dossier.statut}
                                                            </span>
                                                        </div>
                                                        <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
                                                            <div
                                                                className="h-2 rounded-full bg-blue-600 transition-all"
                                                                style={{ width: `${dossier.avancement}%` }}
                                                            />
                                                        </div>
                                                        <div className="flex justify-between text-sm text-gray-600">
                                                            <span>
                                                                {dossier.taches_terminees}/{dossier.nb_taches} tâches
                                                            </span>
                                                            <span>{dossier.avancement}%</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'dossiers' && (
                                    <div className="space-y-4">
                                        {selectedMarche.dossiers.map((dossier) => (
                                            <div key={dossier.id} className="rounded-lg border border-gray-200 p-6">
                                                <div className="mb-4 flex items-start justify-between">
                                                    <div>
                                                        <h4 className="text-lg font-semibold text-gray-900">{dossier.nom}</h4>
                                                        <p className="mt-1 text-sm text-gray-500">Type: {dossier.type}</p>
                                                    </div>
                                                    <span className={`rounded-full border px-3 py-1 text-sm ${getStatutColor(dossier.statut)}`}>
                                                        {dossier.statut}
                                                    </span>
                                                </div>
                                                <div className="mb-4 grid grid-cols-3 gap-4">
                                                    <button
                                                        onClick={() => loadDetails(`/api/dossiers/${dossier.id}/fichiers`)}
                                                        className="rounded bg-blue-50 p-3 text-center transition-colors hover:bg-blue-100"
                                                    >
                                                        <FileText className="mx-auto mb-1 h-6 w-6 text-blue-600" />
                                                        <div className="text-xl font-bold">{dossier.nb_fichiers}</div>
                                                        <div className="text-xs text-gray-600">Fichiers (Voir)</div>
                                                    </button>
                                                    <button
                                                        onClick={() => loadDetails(`/api/dossiers/${dossier.id}/taches`)}
                                                        className="rounded bg-green-50 p-3 text-center transition-colors hover:bg-green-100"
                                                    >
                                                        <CheckCircle className="mx-auto mb-1 h-6 w-6 text-green-600" />
                                                        <div className="text-xl font-bold">{dossier.nb_taches}</div>
                                                        <div className="text-xs text-gray-600">Tâches (Voir)</div>
                                                    </button>
                                                    <button
                                                        onClick={() => loadDetails(`/api/dossiers/${dossier.id}/timeline`)}
                                                        className="rounded bg-purple-50 p-3 text-center transition-colors hover:bg-purple-100"
                                                    >
                                                        <TrendingUp className="mx-auto mb-1 h-6 w-6 text-purple-600" />
                                                        <div className="text-xl font-bold">{dossier.avancement}%</div>
                                                        <div className="text-xs text-gray-600">Timeline</div>
                                                    </button>
                                                </div>
                                                <div className="h-3 w-full rounded-full bg-gray-200">
                                                    <div
                                                        className="h-3 rounded-full bg-blue-600 transition-all"
                                                        style={{ width: `${dossier.avancement}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'participants' && (
                                    <div className="space-y-4">
                                        {selectedMarche.participants.length > 0 ? (
                                            selectedMarche.participants.map((participant) => (
                                                <div key={participant.id} className="rounded-lg border border-gray-200 p-6">
                                                    <div className="mb-4 flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                                                <User className="h-6 w-6 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900">{participant.nom}</h4>
                                                                <p className="text-sm text-gray-500 capitalize">
                                                                    {participant.role.replace('_', ' ')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-bold text-blue-600">{participant.taux_completion}%</div>
                                                            <div className="text-xs text-gray-500">Complétion</div>
                                                        </div>
                                                    </div>
                                                    <div className="mb-3 grid grid-cols-3 gap-4">
                                                        <button
                                                            onClick={() =>
                                                                loadDetails(
                                                                    `/api/participants/${participant.id}/taches?marche_id=${selectedMarche.id}`,
                                                                )
                                                            }
                                                            className="rounded bg-blue-50 p-3 text-center transition-colors hover:bg-blue-100"
                                                        >
                                                            <CheckCircle className="mx-auto mb-1 h-5 w-5 text-blue-600" />
                                                            <div className="text-lg font-bold text-gray-900">{participant.taches_affectees}</div>
                                                            <div className="text-xs text-gray-600">Affectées (Voir)</div>
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                loadDetails(
                                                                    `/api/participants/${participant.id}/taches?marche_id=${selectedMarche.id}&terminees_only=1`,
                                                                )
                                                            }
                                                            className="rounded bg-green-50 p-3 text-center transition-colors hover:bg-green-100"
                                                        >
                                                            <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-green-600" />
                                                            <div className="text-lg font-bold text-gray-900">{participant.taches_terminees}</div>
                                                            <div className="text-xs text-gray-600">Terminées (Voir)</div>
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                loadDetails(
                                                                    `/api/participants/${participant.id}/temps?marche_id=${selectedMarche.id}`,
                                                                )
                                                            }
                                                            className="rounded bg-purple-50 p-3 text-center transition-colors hover:bg-purple-100"
                                                        >
                                                            <Timer className="mx-auto mb-1 h-5 w-5 text-purple-600" />
                                                            <div className="text-lg font-bold text-gray-900">{participant.temps_passe}h</div>
                                                            <div className="text-xs text-gray-600">Temps (Détails)</div>
                                                        </button>
                                                    </div>
                                                    <div className="h-2 w-full rounded-full bg-gray-200">
                                                        <div
                                                            className="h-2 rounded-full bg-blue-600"
                                                            style={{ width: `${participant.taux_completion}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-12 text-center text-gray-500">
                                                <Users className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                                                <p>Aucun participant pour le moment</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'historique' && (
                                    <div>
                                        <button
                                            onClick={() => loadDetails(`/api/marches/${selectedMarche.id}/historique`)}
                                            className="mb-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                        >
                                            Charger l'historique complet
                                        </button>
                                        {detailsData && 'historique' in detailsData ? (
                                            renderDetailsView()
                                        ) : (
                                            <div className="space-y-3">
                                                {selectedMarche.historique.length > 0 ? (
                                                    selectedMarche.historique.map((event, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex gap-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                                                        >
                                                            <div className="mt-1 flex-shrink-0">{getTypeIcon(event.type)}</div>
                                                            <div className="flex-1">
                                                                <div className="mb-1 flex items-start justify-between">
                                                                    <p className="font-medium text-gray-900">{event.description}</p>
                                                                    <span className="ml-4 text-xs whitespace-nowrap text-gray-500">
                                                                        {new Date(event.date).toLocaleString('fr-FR')}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-600">Par: {event.user}</p>
                                                                {event.commentaire && (
                                                                    <p className="mt-2 rounded border-l-2 border-blue-500 bg-gray-50 p-2 text-sm text-gray-700">
                                                                        {event.commentaire}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="py-12 text-center text-gray-500">
                                                        <Clock className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                                                        <p>Aucun historique disponible</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default Tracabilite;
