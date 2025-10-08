import AppLayout from '@/layouts/app-layout';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

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
}

interface MarchesPublicsProps {
    marchePublics: MarchePublic[];
}

interface ConfirmationModal {
    show: boolean;
    type: 'accept' | 'reject' | 'bulkAccept' | 'bulkReject';
    marcheId?: number;
    marcheReference?: string;
}

interface DetailsModal {
    show: boolean;
    marche?: MarchePublic;
}

interface FilesModal {
    show: boolean;
    marcheReference?: string;
    files: string[];
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
        title: 'Validation des Marchés Publics',
        href: '/marches-publics',
    },
];

const IMPORTANCE_OPTIONS = [
    { value: 'ao_ouvert', label: 'AO Ouvert' },
    { value: 'ao_important', label: 'AO Important' },
    { value: 'ao_simplifie', label: 'AO Simplifié' },
    { value: 'ao_restreint', label: 'AO Restreint' },
    { value: 'ao_preselection', label: 'AO Présélection' },
    { value: 'ao_bon_commande', label: 'AO Bon de Commande' },
];

const TYPE_MARCHE_LABELS = {
    etudes: 'Études',
    assistance_technique: 'Assistance Technique',
    batiment: 'Bâtiment',
    voirie: 'Voirie',
    hydraulique: 'Hydraulique',
};

const STATUT_LABELS = {
    detecte: 'Détecté',
    evalue: 'Évalué',
    en_preparation: 'En Préparation',
    soumis: 'Soumis',
    gagne: 'Gagné',
    perdu: 'Perdu',
    annule: 'Annulé',
};

const URGENCE_LABELS = {
    faible: 'Faible',
    moyenne: 'Moyenne',
    elevee: 'Élevée',
};

// Fonction pour générer des noms de fichiers fictifs
const generateFakeFiles = (marcheId: number): string[] => {
    const fileTypes = [
        'Cahier_des_charges.pdf',
        'Règlement_consultation.pdf',
        'Plans_techniques.pdf',
        'Bordereau_prix.pdf',
        'Acte_engagement.pdf',
        'Certificats_requis.pdf',
    ];

    // Générer entre 3 et 6 fichiers aléatoirement basé sur l'ID du marché
    const numFiles = 3 + (marcheId % 4);
    return fileTypes.slice(0, numFiles).map((file) => `${file}`);
};

export default function MarchesPublics({ marchePublics }: MarchesPublicsProps) {
    const { props } = usePage<PageProps>();
    const successMessage = props.flash?.success;
    const [selectedMarches, setSelectedMarches] = useState<number[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterVille, setFilterVille] = useState('');
    const [processing, setProcessing] = useState<number[]>([]);
    const [selectedImportance, setSelectedImportance] = useState('');
    const [confirmationModal, setConfirmationModal] = useState<ConfirmationModal>({
        show: false,
        type: 'accept',
    });
    const [detailsModal, setDetailsModal] = useState<DetailsModal>({
        show: false,
    });
    const [filesModal, setFilesModal] = useState<FilesModal>({
        show: false,
        files: [],
    });

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

    const showDetails = (marche: MarchePublic) => {
        setDetailsModal({
            show: true,
            marche: marche,
        });
    };

    const closeDetailsModal = () => {
        setDetailsModal({ show: false });
    };

    const showFiles = (marcheId: number, marcheReference: string) => {
        const files = generateFakeFiles(marcheId);
        setFilesModal({
            show: true,
            marcheReference,
            files,
        });
    };

    const closeFilesModal = () => {
        setFilesModal({ show: false, files: [] });
    };

    const handleFileDownload = (fileName: string) => {
        // Ici vous pouvez implémenter la logique de téléchargement réel
        console.log(`Téléchargement du fichier: ${fileName}`);
        alert(`Téléchargement de ${fileName} (simulation)`);
    };

    const handleAccept = async (marcheId: number) => {
        if (!selectedImportance) {
            alert("Veuillez sélectionner un type d'AO avant d'accepter.");
            return;
        }

        setProcessing([...processing, marcheId]);
        try {
            router.post(
                `/marches/${marcheId}/accept`,
                { importance: selectedImportance },
                {
                    preserveState: false,
                    preserveScroll: true,
                    onSuccess: () => {
                        setProcessing(processing.filter((id) => id !== marcheId));
                        setConfirmationModal({ show: false, type: 'accept' });
                        setSelectedImportance('');
                    },
                    onError: () => {
                        setProcessing(processing.filter((id) => id !== marcheId));
                        setConfirmationModal({ show: false, type: 'accept' });
                    },
                },
            );
        } catch (error) {
            setProcessing(processing.filter((id) => id !== marcheId));
            setConfirmationModal({ show: false, type: 'accept' });
        }
    };

    const handleReject = async (marcheId: number) => {
        setProcessing([...processing, marcheId]);
        try {
            router.post(
                `/marches/${marcheId}/reject`,
                {},
                {
                    onSuccess: () => {
                        setProcessing(processing.filter((id) => id !== marcheId));
                        setConfirmationModal({ show: false, type: 'reject' });
                    },
                    onError: () => {
                        setProcessing(processing.filter((id) => id !== marcheId));
                        setConfirmationModal({ show: false, type: 'reject' });
                    },
                },
            );
        } catch (error) {
            setProcessing(processing.filter((id) => id !== marcheId));
            setConfirmationModal({ show: false, type: 'reject' });
        }
    };

    const handleBulkAccept = () => {
        selectedMarches.forEach((id) => handleAccept(id));
        setSelectedMarches([]);
    };

    const handleBulkReject = () => {
        selectedMarches.forEach((id) => handleReject(id));
        setSelectedMarches([]);
    };

    const showAcceptConfirmation = (marcheId: number, reference: string) => {
        setConfirmationModal({
            show: true,
            type: 'accept',
            marcheId,
            marcheReference: reference,
        });
        setSelectedImportance(''); // Reset selection
    };

    const showRejectConfirmation = (marcheId: number, reference: string) => {
        setConfirmationModal({
            show: true,
            type: 'reject',
            marcheId,
            marcheReference: reference,
        });
    };

    const showBulkAcceptConfirmation = () => {
        setConfirmationModal({
            show: true,
            type: 'bulkAccept',
        });
    };

    const showBulkRejectConfirmation = () => {
        setConfirmationModal({
            show: true,
            type: 'bulkReject',
        });
    };

    const handleConfirmAction = () => {
        if (confirmationModal.type === 'accept' && confirmationModal.marcheId) {
            handleAccept(confirmationModal.marcheId);
        } else if (confirmationModal.type === 'reject' && confirmationModal.marcheId) {
            handleReject(confirmationModal.marcheId);
        } else if (confirmationModal.type === 'bulkAccept') {
            handleBulkAccept();
            setConfirmationModal({ show: false, type: 'accept' });
        } else if (confirmationModal.type === 'bulkReject') {
            handleBulkReject();
            setConfirmationModal({ show: false, type: 'reject' });
        }
    };

    const closeModal = () => {
        setConfirmationModal({ show: false, type: 'accept' });
        setSelectedImportance('');
    };

    const toggleSelection = (marcheId: number) => {
        setSelectedMarches((prev) => (prev.includes(marcheId) ? prev.filter((id) => id !== marcheId) : [...prev, marcheId]));
    };

    const filteredMarches = marchePublics.filter((marche) => {
        const matchesSearch =
            !searchTerm ||
            marche.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            marche.objet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            marche.maitre_ouvrage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            marche.ville?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            marche.type_marche?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            marche.zone_geographique?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesVille = !filterVille || marche.ville === filterVille;

        return matchesSearch && matchesVille;
    });

    const villes = [...new Set(marchePublics.map((m) => m.ville).filter(Boolean))];

    const getStatutColor = (statut: string | undefined) => {
        switch (statut?.toLowerCase()) {
            case 'detecte':
                return 'bg-blue-100 text-blue-800';
            case 'evalue':
                return 'bg-yellow-100 text-yellow-800';
            case 'en_preparation':
                return 'bg-purple-100 text-purple-800';
            case 'soumis':
                return 'bg-indigo-100 text-indigo-800';
            case 'gagne':
                return 'bg-green-100 text-green-800';
            case 'perdu':
                return 'bg-red-100 text-red-800';
            case 'annule':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getUrgenceColor = (urgence: string | undefined) => {
        switch (urgence) {
            case 'elevee':
                return 'bg-red-100 text-red-800';
            case 'moyenne':
                return 'bg-yellow-100 text-yellow-800';
            case 'faible':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const isUrgent = (dateLimit: string | undefined) => {
        if (!dateLimit) return false;
        const limit = new Date(dateLimit);
        const today = new Date();
        const diffTime = limit.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    };

    const getModalConfig = () => {
        switch (confirmationModal.type) {
            case 'accept':
                return {
                    title: "Confirmer l'acceptation",
                    message: `Êtes-vous sûr de vouloir accepter le marché "${confirmationModal.marcheReference}" ?`,
                    confirmText: 'Accepter',
                    confirmClass: 'bg-green-600 hover:bg-green-700',
                    icon: (
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ),
                    showImportanceSelect: true,
                };
            case 'reject':
                return {
                    title: 'Confirmer le rejet',
                    message: `Êtes-vous sûr de vouloir rejeter le marché "${confirmationModal.marcheReference}" ?`,
                    confirmText: 'Rejeter',
                    confirmClass: 'bg-red-600 hover:bg-red-700',
                    icon: (
                        <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ),
                    showImportanceSelect: false,
                };
            case 'bulkAccept':
                return {
                    title: "Confirmer l'acceptation en masse",
                    message: `Êtes-vous sûr de vouloir accepter ${selectedMarches.length} marché${selectedMarches.length > 1 ? 's' : ''} sélectionné${selectedMarches.length > 1 ? 's' : ''} ?`,
                    confirmText: 'Accepter tout',
                    confirmClass: 'bg-green-600 hover:bg-green-700',
                    icon: (
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ),
                    showImportanceSelect: false,
                };
            case 'bulkReject':
                return {
                    title: 'Confirmer le rejet en masse',
                    message: `Êtes-vous sûr de vouloir rejeter ${selectedMarches.length} marché${selectedMarches.length > 1 ? 's' : ''} sélectionné${selectedMarches.length > 1 ? 's' : ''} ?`,
                    confirmText: 'Rejeter tout',
                    confirmClass: 'bg-red-600 hover:bg-red-700',
                    icon: (
                        <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ),
                    showImportanceSelect: false,
                };
        }
    };

    const modalConfig = getModalConfig();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen bg-gray-50">
                {/* Files Modal */}
                {filesModal.show && (
                    <div className="fixed inset-0 z-1000 flex items-center justify-center overflow-y-auto">
                        <div className="bg-opacity-50 fixed inset-0 bg-black transition-opacity" onClick={closeFilesModal}></div>
                        <div className="relative mx-4 w-full max-w-2xl rounded-lg bg-white shadow-xl">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">Fichiers du Marché - {filesModal.marcheReference}</h3>
                                    <button onClick={closeFilesModal} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-96 overflow-y-auto px-6 py-4">
                                <div className="space-y-3">
                                    {filesModal.files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{file}</p>
                                                    <p className="text-xs text-gray-500">PDF • {Math.floor(Math.random() * 5 + 1)} MB</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleFileDownload(file)}
                                                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                                Télécharger
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                <div className="flex justify-end">
                                    <button
                                        onClick={closeFilesModal}
                                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Details Modal */}
                {detailsModal.show && detailsModal.marche && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
                        <div className="bg-opacity-50 fixed inset-0 bg-black transition-opacity" onClick={closeDetailsModal}></div>
                        <div className="relative mx-4 w-full max-w-4xl rounded-lg bg-white shadow-xl">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">Détails du Marché - {detailsModal.marche.reference}</h3>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => showFiles(detailsModal.marche!.id, detailsModal.marche!.reference || 'N/A')}
                                            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                            Voir les fichiers
                                        </button>
                                        <button onClick={closeDetailsModal} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="max-h-96 overflow-y-auto px-6 py-4">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Référence</label>
                                            <p className="mt-1 text-sm text-gray-900">{detailsModal.marche.reference || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Type de Marché</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {detailsModal.marche.type_marche ? TYPE_MARCHE_LABELS[detailsModal.marche.type_marche] : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Objet</label>
                                            <p className="mt-1 text-sm text-gray-900">{detailsModal.marche.objet || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Maître d'Ouvrage</label>
                                            <p className="mt-1 text-sm text-gray-900">{detailsModal.marche.maitre_ouvrage || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Budget</label>
                                            <p className="mt-1 text-sm font-medium text-gray-900 text-green-600">
                                                {detailsModal.marche.budget || detailsModal.marche.montant
                                                    ? formatCurrency(detailsModal.marche.budget || detailsModal.marche.montant)
                                                    : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Caution Provisoire</label>
                                            <p className="mt-1 text-sm text-gray-900">{formatCurrency(detailsModal.marche.caution_provisoire)}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Urgence</label>
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getUrgenceColor(detailsModal.marche.urgence)}`}
                                            >
                                                {detailsModal.marche.urgence ? URGENCE_LABELS[detailsModal.marche.urgence] : 'Moyenne'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Date Limite Soumission</label>
                                            <p className="mt-1 text-sm text-gray-900">{formatDateTime(detailsModal.marche.date_limite_soumission)}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Date d'Ouverture</label>
                                            <p className="mt-1 text-sm text-gray-900">{formatDate(detailsModal.marche.date_ouverture)}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Date d'Adjudication</label>
                                            <p className="mt-1 text-sm text-gray-900">{formatDate(detailsModal.marche.date_adjudications)}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Ville</label>
                                            <p className="mt-1 text-sm text-gray-900">{detailsModal.marche.ville || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Zone Géographique</label>
                                            <p className="mt-1 text-sm text-gray-900">{detailsModal.marche.zone_geographique || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Lien DAO</label>
                                            {detailsModal.marche.lien_dao ? (
                                                <a
                                                    href={detailsModal.marche.lien_dao}
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

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Statut</label>
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatutColor(detailsModal.marche.statut)}`}
                                            >
                                                {detailsModal.marche.statut ? STATUT_LABELS[detailsModal.marche.statut] : 'Détecté'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {(detailsModal.marche.pv || detailsModal.marche.dao || detailsModal.marche.adjudicataire) && (
                                    <div className="mt-6 border-t pt-6">
                                        <h4 className="text-md mb-4 font-medium text-gray-900">Informations Complémentaires</h4>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            {detailsModal.marche.pv && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">PV</label>
                                                    <p className="mt-1 text-sm text-gray-900">{detailsModal.marche.pv}</p>
                                                </div>
                                            )}
                                            {detailsModal.marche.dao && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">DAO</label>
                                                    <p className="mt-1 text-sm text-gray-900">{detailsModal.marche.dao}</p>
                                                </div>
                                            )}
                                            {detailsModal.marche.adjudicataire && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Adjudicataire</label>
                                                    <p className="mt-1 text-sm text-gray-900">{detailsModal.marche.adjudicataire}</p>
                                                </div>
                                            )}
                                            {detailsModal.marche.date_publication && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Date Publication</label>
                                                    <p className="mt-1 text-sm text-gray-900">
                                                        {formatDateTime(detailsModal.marche.date_publication)}
                                                    </p>
                                                </div>
                                            )}
                                            {detailsModal.marche.date_affichage && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Date Affichage</label>
                                                    <p className="mt-1 text-sm text-gray-900">{formatDate(detailsModal.marche.date_affichage)}</p>
                                                </div>
                                            )}
                                            {detailsModal.marche.lien_pv && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Lien PV</label>
                                                    <a
                                                        href={detailsModal.marche.lien_pv}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-1 text-sm text-blue-600 hover:underline"
                                                    >
                                                        Voir le PV
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={closeDetailsModal}
                                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                    >
                                        Fermer
                                    </button>
                                    <button
                                        onClick={() => {
                                            closeDetailsModal();
                                            showAcceptConfirmation(detailsModal.marche!.id, detailsModal.marche!.reference || 'N/A');
                                        }}
                                        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                    >
                                        Accepter
                                    </button>
                                    <button
                                        onClick={() => {
                                            closeDetailsModal();
                                            showRejectConfirmation(detailsModal.marche!.id, detailsModal.marche!.reference || 'N/A');
                                        }}
                                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
                                    >
                                        Rejeter
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirmation Modal */}
                {confirmationModal.show && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
                        <div className="bg-opacity-50 fixed inset-0 bg-black transition-opacity" onClick={closeModal}></div>
                        <div className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">{modalConfig.icon}</div>
                                <div className="ml-4 flex-1">
                                    <h3 className="mb-2 text-lg font-medium text-gray-900">{modalConfig.title}</h3>
                                    <p className="mb-6 text-sm text-gray-600">{modalConfig.message}</p>

                                    {modalConfig.showImportanceSelect && (
                                        <div className="mb-6">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Type d'AO <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={selectedImportance}
                                                onChange={(e) => setSelectedImportance(e.target.value)}
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#155DFC] focus:ring-1 focus:ring-[#155DFC] focus:outline-none"
                                                required
                                            >
                                                <option value="">Sélectionner un type d'AO</option>
                                                {IMPORTANCE_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {modalConfig.showImportanceSelect && !selectedImportance && (
                                                <p className="mt-1 text-xs text-red-600">Ce champ est obligatoire</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="mb-6 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-xs text-gray-500">
                                        <div className="flex items-center">
                                            <svg className="mr-2 h-4 w-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                                />
                                            </svg>
                                            <span className="font-medium">Attention :</span>
                                        </div>
                                        <p className="mt-1">Cette action est irréversible. Veuillez confirmer votre choix.</p>
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={closeModal}
                                            className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={handleConfirmAction}
                                            disabled={modalConfig.showImportanceSelect && !selectedImportance}
                                            className={`rounded-md px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${modalConfig.confirmClass}`}
                                        >
                                            {modalConfig.confirmText}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Simple Search Header */}
                <div className="border-b bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-900">Marchés Publics</h1>
                            <div className="flex items-center space-x-4">
                                <div className="relative">
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
                                        placeholder="Rechercher dans les marchés..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-80 rounded-lg border border-gray-300 bg-white py-2 pr-3 pl-10 leading-5 placeholder-gray-500 focus:border-[#155DFC] focus:placeholder-gray-400 focus:ring-1 focus:ring-[#155DFC] focus:outline-none sm:text-sm"
                                    />
                                </div>
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                                    {filteredMarches.length} marchés
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {successMessage && <div className="mb-4 rounded bg-green-100 p-4 text-green-800">{successMessage}</div>}

                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Filters and Actions */}
                    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex gap-4">
                                <select
                                    value={filterVille}
                                    onChange={(e) => setFilterVille(e.target.value)}
                                    className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#155DFC] focus:ring-1 focus:ring-[#155DFC] focus:outline-none"
                                >
                                    <option value="">Toutes les villes</option>
                                    {villes.map((ville) => (
                                        <option key={ville} value={ville}>
                                            {ville}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`rounded p-2 ${viewMode === 'grid' ? 'bg-[#155DFC] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`rounded p-2 ${viewMode === 'list' ? 'bg-[#155DFC] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        {selectedMarches.length > 0 && (
                            <div className="mt-4 flex items-center gap-4 border-t border-gray-200 pt-4">
                                <span className="text-sm text-gray-600">
                                    {selectedMarches.length} sélectionné{selectedMarches.length > 1 ? 's' : ''}
                                </span>
                                <button
                                    onClick={showBulkAcceptConfirmation}
                                    className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Accepter tout
                                </button>
                                <button
                                    onClick={showBulkRejectConfirmation}
                                    className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Rejeter tout
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content */}
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
                            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun marché trouvé</h3>
                            <p className="mt-2 text-gray-500">Aucun marché ne correspond aux critères de recherche.</p>
                        </div>
                    ) : (
                        <>
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                                    {filteredMarches.map((marche: MarchePublic) => (
                                        <div
                                            key={marche.id}
                                            className="relative cursor-pointer rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                                            onClick={() => showDetails(marche)}
                                        >
                                            {/* Urgent Badge */}
                                            {isUrgent(marche.date_limite_soumission) && (
                                                <div className="absolute -top-2 -right-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                                                    Urgent
                                                </div>
                                            )}

                                            {/* Selection Checkbox */}
                                            <div className="absolute top-4 left-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMarches.includes(marche.id)}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        toggleSelection(marche.id);
                                                    }}
                                                    className="h-4 w-4 rounded border-gray-300 text-[#155DFC] focus:ring-[#155DFC]"
                                                />
                                            </div>

                                            <div className="ml-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="mb-2 flex items-center gap-2">
                                                            <span className="text-sm font-semibold text-[#155DFC]">{marche.reference || 'N/A'}</span>
                                                        </div>

                                                        <h3 className="mb-3 line-clamp-2 text-sm font-medium text-gray-900">
                                                            {marche.objet || 'Objet non spécifié'}
                                                        </h3>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 text-xs text-gray-600">
                                                    <div className="flex justify-between">
                                                        <span>M.O:</span>
                                                        <span className="font-medium">{marche.maitre_ouvrage || '-'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Type:</span>
                                                        <span className="font-medium">
                                                            {marche.type_marche ? TYPE_MARCHE_LABELS[marche.type_marche] : '-'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Budget:</span>
                                                        <span className="font-medium text-green-600">
                                                            {formatCurrency(marche.budget || marche.montant)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Date limite:</span>
                                                        <span
                                                            className={`font-medium ${isUrgent(marche.date_limite_soumission) ? 'text-red-600' : ''}`}
                                                        >
                                                            {formatDate(marche.date_limite_soumission)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Ville:</span>
                                                        <span className="font-medium">{marche.ville || '-'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Statut:</span>
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatutColor(marche.statut)}`}
                                                        >
                                                            {marche.statut ? STATUT_LABELS[marche.statut] : 'Détecté'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            showAcceptConfirmation(marche.id, marche.reference || 'N/A');
                                                        }}
                                                        disabled={processing.includes(marche.id)}
                                                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                                    >
                                                        {processing.includes(marche.id) ? (
                                                            <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                                                        ) : (
                                                            <>
                                                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M5 13l4 4L19 7"
                                                                    />
                                                                </svg>
                                                                Accepter
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            showRejectConfirmation(marche.id, marche.reference || 'N/A');
                                                        }}
                                                        disabled={processing.includes(marche.id)}
                                                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                                    >
                                                        {processing.includes(marche.id) ? (
                                                            <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                                                        ) : (
                                                            <>
                                                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M6 18L18 6M6 6l12 12"
                                                                    />
                                                                </svg>
                                                                Rejeter
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg bg-white shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedMarches.length === filteredMarches.length && filteredMarches.length > 0}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedMarches(filteredMarches.map((m) => m.id));
                                                                } else {
                                                                    setSelectedMarches([]);
                                                                }
                                                            }}
                                                            className="h-4 w-4 rounded border-gray-300 text-[#155DFC] focus:ring-[#155DFC]"
                                                        />
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Référence
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Objet
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        M.O
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Budget
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Date limite
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Ville
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Statut
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {filteredMarches.map((marche: MarchePublic, index: number) => (
                                                    <tr
                                                        key={marche.id}
                                                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} cursor-pointer transition-colors hover:bg-gray-100`}
                                                        onClick={() => showDetails(marche)}
                                                    >
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedMarches.includes(marche.id)}
                                                                onChange={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleSelection(marche.id);
                                                                }}
                                                                className="h-4 w-4 rounded border-gray-300 text-[#155DFC] focus:ring-[#155DFC]"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="text-sm font-medium text-[#155DFC]">{marche.reference || 'N/A'}</div>
                                                                {isUrgent(marche.date_limite_soumission) && (
                                                                    <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                                                                        Urgent
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="max-w-xs truncate text-sm text-gray-900" title={marche.objet}>
                                                                {marche.objet || '-'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                                            {marche.maitre_ouvrage || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                                                            {formatCurrency(marche.budget || marche.montant)}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                                            <div
                                                                className={isUrgent(marche.date_limite_soumission) ? 'font-medium text-red-600' : ''}
                                                            >
                                                                {formatDate(marche.date_limite_soumission)}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{marche.ville || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatutColor(marche.statut)}`}
                                                            >
                                                                {marche.statut ? STATUT_LABELS[marche.statut] : 'Détecté'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        showAcceptConfirmation(marche.id, marche.reference || 'N/A');
                                                                    }}
                                                                    disabled={processing.includes(marche.id)}
                                                                    className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                                                >
                                                                    {processing.includes(marche.id) ? (
                                                                        <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                                                                    ) : (
                                                                        <>
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
                                                                                    d="M5 13l4 4L19 7"
                                                                                />
                                                                            </svg>
                                                                            Accepter
                                                                        </>
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        showRejectConfirmation(marche.id, marche.reference || 'N/A');
                                                                    }}
                                                                    disabled={processing.includes(marche.id)}
                                                                    className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                                                >
                                                                    {processing.includes(marche.id) ? (
                                                                        <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                                                                    ) : (
                                                                        <>
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
                                                                                    d="M6 18L18 6M6 6l12 12"
                                                                                />
                                                                            </svg>
                                                                            Rejeter
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
