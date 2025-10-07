import AppLayout from '@/layouts/app-layout';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface DossierFinancier {
    id: number;
    type_dossier: string;
    nom_dossier: string;
    description: string;
    statut: string;
    pourcentage_avancement: number;
    date_creation: string;
    date_finalisation?: string;
    fichiers_joints: Array<{
        nom_original: string;
        nom_fichier: string;
        chemin: string;
        taille: number;
        type: string;
        date_upload: string;
        uploaded_by: number;
    }>;
    commentaires?: string;
}

interface MarchePublic {
    id: number;
    reference?: string;
    importance?: 'ao_ouvert' | 'ao_important' | 'ao_simplifie' | 'ao_restreint' | 'ao_preselection' | 'ao_bon_commande';
    etat?: string;
    is_accepted: boolean;
    etape?: string;
    maitre_ouvrage?: string;
    pv?: string;
    caution_provisoire?: number;
    date_ouverture?: string;
    date_limite_soumission?: string;
    date_publication?: string;
    statut?: 'detecte' | 'evalue' | 'en_preparation' | 'soumis' | 'gagne' | 'perdu' | 'annule';
    type_marche?: 'etudes' | 'assistance_technique' | 'batiment' | 'voirie' | 'hydraulique';
    budget?: string;
    urgence?: 'faible' | 'moyenne' | 'elevee';
    zone_geographique?: string;
    lien_dao?: string;
    lien_pv?: string;
    dao?: string;
    date_adjudications?: string;
    ville?: string;
    montant?: string;
    objet?: string;
    adjudicataire?: string;
    date_affichage?: string;
    chemin_fichiers?: string[];
    created_at?: string;
    updated_at?: string;
    motif_refus?: string;
    dossiers?: DossierFinancier[];
}

interface MarcheDecisionProps {
    marches: MarchePublic[];
}

interface FlashProps {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

interface PageProps {
    flash?: FlashProps;
    [key: string]: any;
}

const breadcrumbs = [
    {
        title: 'Boite de décision',
        href: '/direction-generale/boite-decision',
    },
    {
        title: 'Décisions Marchés',
        href: '/marches/decisions',
    },
];

const IMPORTANCE_LABELS = {
    ao_ouvert: 'AO Ouvert',
    ao_important: 'AO Important',
    ao_simplifie: 'AO Simplifié',
    ao_restreint: 'AO Restreint',
    ao_preselection: 'AO Présélection',
    ao_bon_commande: 'AO Bon de Commande',
};

const TYPE_MARCHE_LABELS = {
    etudes: 'Études',
    assistance_technique: 'Assistance Technique',
    batiment: 'Bâtiment',
    voirie: 'Voirie',
    hydraulique: 'Hydraulique',
};

const URGENCE_LABELS = {
    faible: 'Faible',
    moyenne: 'Moyenne',
    elevee: 'Élevée',
};

export default function MarcheDecision({ marches }: MarcheDecisionProps) {
    const { props } = usePage<PageProps>();
    const successMessage = props.flash?.success;
    const errorMessage = props.flash?.error;

    const [searchTerm, setSearchTerm] = useState('');
    const [filterUrgence, setFilterUrgence] = useState('');
    const [selectedMarche, setSelectedMarche] = useState<MarchePublic | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showDecisionModal, setShowDecisionModal] = useState(false);
    const [decisionType, setDecisionType] = useState<'accept' | 'refuse' | 'modification'>('accept');
    const [motifRefus, setMotifRefus] = useState('');
    const [commentaire, setCommentaire] = useState('');
    const [showFilesModal, setShowFilesModal] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<DossierFinancier['fichiers_joints']>([]);

    const formatDate = (date: string | undefined | null): string => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('fr-FR');
    };

    const formatDateTime = (dateTime: string | undefined | null): string => {
        if (!dateTime) return '-';
        return new Date(dateTime).toLocaleString('fr-FR');
    };

    const formatCurrency = (amount: number | string | undefined | null): string => {
        if (!amount) return '-';
        return new Intl.NumberFormat('fr-FR').format(Number(amount)) + ' DH';
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getUrgenceColor = (urgence: string | undefined) => {
        const colors: Record<string, string> = {
            elevee: 'bg-red-100 text-red-800 border-red-200',
            moyenne: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            faible: 'bg-green-100 text-green-800 border-green-200',
        };
        return urgence && colors[urgence] ? colors[urgence] : 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getImportanceColor = (importance: string | undefined) => {
        const colors = {
            ao_important: 'bg-red-100 text-red-800 border-red-200',
            ao_ouvert: 'bg-blue-100 text-blue-800 border-blue-200',
            ao_restreint: 'bg-purple-100 text-purple-800 border-purple-200',
            ao_simplifie: 'bg-green-100 text-green-800 border-green-200',
            ao_preselection: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            ao_bon_commande: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
        return importance && colors[importance as keyof typeof colors]
            ? colors[importance as keyof typeof colors]
            : 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const isUrgent = (dateLimit: string | undefined) => {
        if (!dateLimit) return false;
        const limit = new Date(dateLimit);
        const today = new Date();
        const diffTime = limit.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    };

    const showDetails = (marche: MarchePublic) => {
        setSelectedMarche(marche);
        setShowDetailsModal(true);
    };

    const showDecision = (marche: MarchePublic, type: 'accept' | 'refuse' | 'modification') => {
        setSelectedMarche(marche);
        setDecisionType(type);
        setMotifRefus('');
        setCommentaire('');
        setShowDecisionModal(true);
    };

    const showFiles = (files: DossierFinancier['fichiers_joints']) => {
        setSelectedFiles(files);
        setShowFilesModal(true);
    };

    const handleDecision = () => {
        if (!selectedMarche) return;

        if (decisionType === 'refuse' && !motifRefus.trim()) {
            alert('Veuillez saisir un motif de refus');
            return;
        }

        if ((decisionType === 'accept' || decisionType === 'modification') && !commentaire.trim()) {
            alert('Veuillez saisir un commentaire');
            return;
        }

        let endpoint = '';
        let data: any = {};

        if (decisionType === 'accept') {
            endpoint = `/direction-generale/marche/${selectedMarche.id}/approuver-final`;
            data = { commentaire };
        } else if (decisionType === 'refuse') {
            endpoint = `/direction-generale/marche/${selectedMarche.id}/refuser`;
            data = { motif_refus: motifRefus };
        } else if (decisionType === 'modification') {
            endpoint = `/direction-generale/marche/${selectedMarche.id}/demander-modification`;
            data = { commentaire };
        }

        router.post(endpoint, data, {
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                setShowDecisionModal(false);
                setShowDetailsModal(false);
                setSelectedMarche(null);
                setMotifRefus('');
                setCommentaire('');
            },
            onError: (errors) => {
                console.error('Erreurs:', errors);
                if (errors.error) {
                    alert(errors.error);
                } else {
                    alert('Une erreur est survenue lors de la prise de décision');
                }
            },
        });
    };

    const viewFile = (fichier: DossierFinancier['fichiers_joints'][0]) => {
        window.open(`/storage/${fichier.chemin}`, '_blank');
    };

    const filteredMarches = marches.filter((marche) => {
        const matchesSearch =
            !searchTerm ||
            marche.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            marche.objet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            marche.maitre_ouvrage?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesUrgence = !filterUrgence || marche.urgence === filterUrgence;

        return matchesSearch && matchesUrgence;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen bg-gray-50">
                {(successMessage || errorMessage) && (
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        {successMessage && (
                            <div className="mb-4 rounded-lg border border-green-400 bg-green-100 p-4 text-green-800">
                                <div className="flex items-center">
                                    <svg className="mr-2 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {successMessage}
                                </div>
                            </div>
                        )}
                        {errorMessage && (
                            <div className="mb-4 rounded-lg border border-red-400 bg-red-100 p-4 text-red-800">
                                <div className="flex items-center">
                                    <svg className="mr-2 h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    {errorMessage}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="border-b bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Décisions Administratives</h1>
                                <p className="mt-2 text-sm text-gray-600">Examinez les AOs acceptés et prenez vos décisions administratives</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                                    {filteredMarches.length} Marché(s) en attente
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Rechercher par référence, objet ou maître d'ouvrage..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full rounded-lg border border-gray-300 bg-white py-2 pr-3 pl-10 leading-5 placeholder-gray-500 focus:border-blue-500 focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-sm"
                                />
                            </div>
                            <select
                                value={filterUrgence}
                                onChange={(e) => setFilterUrgence(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="">Toutes les urgences</option>
                                <option value="elevee">Urgence Élevée</option>
                                <option value="moyenne">Urgence Moyenne</option>
                                <option value="faible">Urgence Faible</option>
                            </select>
                        </div>
                    </div>

                    {filteredMarches.length === 0 ? (
                        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun marché en attente</h3>
                            <p className="mt-2 text-gray-500">Aucun marché ne correspond aux critères de recherche.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredMarches.map((marche) => {
                                const dossierFinancier = marche.dossiers?.find((d) => d.type_dossier === 'financier');
                                const nbFichiers = dossierFinancier?.fichiers_joints?.length || 0;

                                return (
                                    <div key={marche.id} className="rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md">
                                        <div className="border-b bg-gray-50 px-6 py-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {marche.reference || 'Référence non spécifiée'}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">Soumis le {formatDateTime(marche.updated_at)}</p>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        {isUrgent(marche.date_limite_soumission) && (
                                                            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                                                                <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                                Urgent
                                                            </span>
                                                        )}
                                                        <span
                                                            className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${getImportanceColor(marche.importance)}`}
                                                        >
                                                            {marche.importance ? IMPORTANCE_LABELS[marche.importance] : 'Non spécifié'}
                                                        </span>
                                                        <span
                                                            className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${getUrgenceColor(marche.urgence)}`}
                                                        >
                                                            {marche.urgence ? URGENCE_LABELS[marche.urgence] : 'Moyenne'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => showDetails(marche)}
                                                        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                            />
                                                        </svg>
                                                        Examiner
                                                    </button>
                                                    <button
                                                        onClick={() => showDecision(marche, 'accept')}
                                                        className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Approbation Finale
                                                    </button>
                                                    <button
                                                        onClick={() => showDecision(marche, 'modification')}
                                                        className="inline-flex items-center gap-2 rounded-md bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                        Demander Modification
                                                    </button>
                                                    <button
                                                        onClick={() => showDecision(marche, 'refuse')}
                                                        className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
                                                        </svg>
                                                        Refuser
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                                <div className="lg:col-span-2">
                                                    <h4 className="mb-3 text-sm font-medium text-gray-900">Informations du Marché</h4>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700">Objet:</p>
                                                            <p className="text-sm text-gray-900">{marche.objet || 'Non spécifié'}</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-700">Maître d'Ouvrage:</p>
                                                                <p className="text-sm text-gray-900">{marche.maitre_ouvrage || '-'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-700">Type de Marché:</p>
                                                                <p className="text-sm text-gray-900">
                                                                    {marche.type_marche ? TYPE_MARCHE_LABELS[marche.type_marche] : '-'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-700">Budget Estimé:</p>
                                                                <p className="text-sm font-semibold text-green-600">
                                                                    {formatCurrency(marche.budget || marche.montant)}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-700">Date Limite:</p>
                                                                <p
                                                                    className={`text-sm font-medium ${isUrgent(marche.date_limite_soumission) ? 'text-red-600' : 'text-gray-900'}`}
                                                                >
                                                                    {formatDateTime(marche.date_limite_soumission)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-700">Ville:</p>
                                                                <p className="text-sm text-gray-900">{marche.ville || '-'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-700">Caution Provisoire:</p>
                                                                <p className="text-sm text-gray-900">{formatCurrency(marche.caution_provisoire)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="rounded-lg border bg-blue-50 p-4">
                                                    <h4 className="mb-3 flex items-center text-sm font-medium text-blue-900">
                                                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                            />
                                                        </svg>
                                                        Dossier Financier
                                                    </h4>

                                                    {dossierFinancier ? (
                                                        <div className="space-y-3">
                                                            <div>
                                                                <p className="text-xs font-medium text-blue-700">Nom du dossier:</p>
                                                                <p className="text-sm text-blue-900">{dossierFinancier.nom_dossier}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-medium text-blue-700">Statut:</p>
                                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                                    {dossierFinancier.statut}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-medium text-blue-700">Date de soumission:</p>
                                                                <p className="text-sm text-blue-900">{formatDate(dossierFinancier.date_creation)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-medium text-blue-700">Fichiers joints:</p>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm font-semibold text-blue-900">
                                                                        {nbFichiers} fichier(s)
                                                                    </span>
                                                                    {nbFichiers > 0 && (
                                                                        <button
                                                                            onClick={() => showFiles(dossierFinancier.fichiers_joints)}
                                                                            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
                                                                        >
                                                                            <svg
                                                                                className="h-3 w-3"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={2}
                                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                                />
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={2}
                                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                                />
                                                                            </svg>
                                                                            Voir
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {dossierFinancier.commentaires && (
                                                                <div>
                                                                    <p className="text-xs font-medium text-blue-700">Commentaires:</p>
                                                                    <p className="text-xs text-blue-800 italic">{dossierFinancier.commentaires}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-blue-700">Aucun dossier financier trouvé</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Modal Détails */}
                {showDetailsModal && selectedMarche && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
                        <div className="bg-opacity-50 fixed inset-0 bg-black transition-opacity" onClick={() => setShowDetailsModal(false)}></div>
                        <div className="relative mx-4 w-full max-w-4xl rounded-lg bg-white shadow-xl">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">Détails du Marché - {selectedMarche.reference}</h3>
                                    <button
                                        onClick={() => setShowDetailsModal(false)}
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                    >
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-96 overflow-y-auto px-6 py-4">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Référence</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedMarche.reference || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Type de Marché</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {selectedMarche.type_marche ? TYPE_MARCHE_LABELS[selectedMarche.type_marche] : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Objet</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedMarche.objet || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Maître d'Ouvrage</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedMarche.maitre_ouvrage || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Budget</label>
                                            <p className="mt-1 text-sm font-medium text-green-600">
                                                {formatCurrency(selectedMarche.budget || selectedMarche.montant)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Caution Provisoire</label>
                                            <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedMarche.caution_provisoire)}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Type d'AO</label>
                                            <span
                                                className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${getImportanceColor(selectedMarche.importance)}`}
                                            >
                                                {selectedMarche.importance ? IMPORTANCE_LABELS[selectedMarche.importance] : 'Non spécifié'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Date Limite Soumission</label>
                                            <p className="mt-1 text-sm text-gray-900">{formatDateTime(selectedMarche.date_limite_soumission)}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Date d'Ouverture</label>
                                            <p className="mt-1 text-sm text-gray-900">{formatDate(selectedMarche.date_ouverture)}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Date d'Adjudication</label>
                                            <p className="mt-1 text-sm text-gray-900">{formatDate(selectedMarche.date_adjudications)}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Ville</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedMarche.ville || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Zone Géographique</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedMarche.zone_geographique || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Urgence</label>
                                            <span
                                                className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${getUrgenceColor(selectedMarche.urgence)}`}
                                            >
                                                {selectedMarche.urgence ? URGENCE_LABELS[selectedMarche.urgence] : 'Moyenne'}
                                            </span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Lien DAO</label>
                                            {selectedMarche.lien_dao ? (
                                                <a
                                                    href={selectedMarche.lien_dao}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-1 text-sm text-blue-600 hover:underline"
                                                >
                                                    Voir le DAO
                                                </a>
                                            ) : (
                                                <p className="mt-1 text-sm text-gray-900">-</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {selectedMarche.dossiers && selectedMarche.dossiers.length > 0 && (
                                    <div className="mt-6 border-t pt-6">
                                        <h4 className="mb-4 text-lg font-medium text-gray-900">Dossiers Associés</h4>
                                        <div className="space-y-4">
                                            {selectedMarche.dossiers.map((dossier) => (
                                                <div key={dossier.id} className="rounded-lg border bg-blue-50 p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h5 className="font-medium text-blue-900">{dossier.nom_dossier}</h5>
                                                            <p className="text-sm text-blue-700">{dossier.description}</p>
                                                            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                                                <div>
                                                                    <span className="font-medium text-blue-800">Type:</span>
                                                                    <span className="ml-1 text-blue-700 capitalize">{dossier.type_dossier}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium text-blue-800">Statut:</span>
                                                                    <span className="ml-1 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                                        {dossier.statut}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium text-blue-800">Date création:</span>
                                                                    <span className="ml-1 text-blue-700">{formatDate(dossier.date_creation)}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium text-blue-800">Avancement:</span>
                                                                    <span className="ml-1 text-blue-700">{dossier.pourcentage_avancement}%</span>
                                                                </div>
                                                            </div>
                                                            {dossier.commentaires && (
                                                                <div className="mt-2">
                                                                    <span className="text-sm font-medium text-blue-800">Commentaires:</span>
                                                                    <p className="text-sm text-blue-700 italic">{dossier.commentaires}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {dossier.fichiers_joints && dossier.fichiers_joints.length > 0 && (
                                                            <button
                                                                onClick={() => showFiles(dossier.fichiers_joints)}
                                                                className="ml-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                                            >
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                    />
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                    />
                                                                </svg>
                                                                {dossier.fichiers_joints.length} fichier(s)
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowDetailsModal(false)}
                                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                    >
                                        Fermer
                                    </button>
                                    <button
                                        onClick={() => showDecision(selectedMarche, 'refuse')}
                                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
                                    >
                                        Refuser
                                    </button>
                                    <button
                                        onClick={() => showDecision(selectedMarche, 'modification')}
                                        className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                    >
                                        Demander Modification
                                    </button>
                                    <button
                                        onClick={() => showDecision(selectedMarche, 'accept')}
                                        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                    >
                                        Approbation Finale
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Décision */}
                {showDecisionModal && selectedMarche && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
                        <div className="bg-opacity-50 fixed inset-0 bg-black transition-opacity" onClick={() => setShowDecisionModal(false)}></div>
                        <div className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    {decisionType === 'accept' ? (
                                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    ) : decisionType === 'modification' ? (
                                        <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                            />
                                        </svg>
                                    ) : (
                                        <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                                            />
                                        </svg>
                                    )}
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="mb-2 text-lg font-medium text-gray-900">
                                        {decisionType === 'accept'
                                            ? 'Approbation finale du marché'
                                            : decisionType === 'modification'
                                              ? 'Demander des modifications'
                                              : 'Refuser le marché'}
                                    </h3>
                                    <p className="mb-4 text-sm text-gray-600">Marché "{selectedMarche.reference}"</p>

                                    {decisionType === 'accept' ? (
                                        <div className="mb-4">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Commentaire <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={commentaire}
                                                onChange={(e) => setCommentaire(e.target.value)}
                                                placeholder="Ajoutez un commentaire pour l'approbation finale..."
                                                rows={4}
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Ce commentaire sera communiqué au service marché marketing</p>
                                        </div>
                                    ) : decisionType === 'modification' ? (
                                        <div className="mb-4">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Description des modifications requises <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={commentaire}
                                                onChange={(e) => setCommentaire(e.target.value)}
                                                placeholder="Décrivez les modifications à apporter au dossier financier..."
                                                rows={4}
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                            />
                                           
                                        </div>
                                    ) : (
                                        <div className="mb-4">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Motif de refus <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={motifRefus}
                                                onChange={(e) => setMotifRefus(e.target.value)}
                                                placeholder="Veuillez préciser le motif du refus..."
                                                rows={4}
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Ce motif sera communiqué à l'équipe concernée</p>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => setShowDecisionModal(false)}
                                            className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={handleDecision}
                                            className={`rounded-md px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:outline-none ${
                                                decisionType === 'accept'
                                                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                                    : decisionType === 'modification'
                                                      ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
                                                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                            }`}
                                        >
                                            {decisionType === 'accept'
                                                ? "Confirmer l'approbation"
                                                : decisionType === 'modification'
                                                  ? 'Demander les modifications'
                                                  : 'Confirmer le refus'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Fichiers - Visualisation uniquement */}
                {showFilesModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
                        <div className="bg-opacity-50 fixed inset-0 bg-black transition-opacity" onClick={() => setShowFilesModal(false)}></div>
                        <div className="relative mx-4 w-full max-w-3xl rounded-lg bg-white shadow-xl">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">Fichiers du Dossier Financier</h3>
                                    <button onClick={() => setShowFilesModal(false)} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-96 overflow-y-auto px-6 py-4">
                                {selectedFiles.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        <p className="mt-2 text-sm text-gray-500">Aucun fichier disponible</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedFiles.map((fichier, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{fichier.nom_original}</p>
                                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                            <span>{formatFileSize(fichier.taille)}</span>
                                                            <span>•</span>
                                                            <span>{fichier.type}</span>
                                                            <span>•</span>
                                                            <span>Uploadé le {formatDateTime(fichier.date_upload)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => viewFile(fichier)}
                                                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                        />
                                                    </svg>
                                                    Voir
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setShowFilesModal(false)}
                                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
