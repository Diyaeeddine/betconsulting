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
    motif_annulation?: string;
}

interface AosSelectionneProps {
    marcheS: MarchePublic[];
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
        title: 'AOs Sélectionnés',
        href: '/marches/aos-selectionnes',
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
    const numFiles = 3 + (marcheId % 4);
    return fileTypes.slice(0, numFiles);
};

export default function AosSelectionne({ marcheS }: AosSelectionneProps) {
    const { props } = usePage<PageProps>();
    const successMessage = props.flash?.success;
    const errorMessage = props.flash?.error;
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterVille, setFilterVille] = useState('');
    const [detailsModal, setDetailsModal] = useState<{ show: boolean; marche?: MarchePublic }>({ show: false });
    const [filesModal, setFilesModal] = useState<{ show: boolean; marcheReference?: string; files: string[] }>({
        show: false,
        files: [],
    });

    // États pour le workflow d'acceptation en 3 étapes
    const [acceptModal, setAcceptModal] = useState<{ show: boolean; marcheReference?: string; marcheId?: number }>({
        show: false,
    });
    const [acceptanceStep, setAcceptanceStep] = useState<'select_type' | 'upload_files' | 'confirm'>('select_type');
    const [selectedImportance, setSelectedImportance] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const [annulerModal, setAnnulerModal] = useState<{ show: boolean; marcheReference?: string; marcheId?: number }>({
        show: false,
    });
    const [motifAnnulation, setMotifAnnulation] = useState('');

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
        setDetailsModal({ show: true, marche });
    };

    const closeDetailsModal = () => {
        setDetailsModal({ show: false });
    };

    const showFiles = (marcheId: number, marcheReference: string) => {
        const files = generateFakeFiles(marcheId);
        setFilesModal({ show: true, marcheReference, files });
    };

    const closeFilesModal = () => {
        setFilesModal({ show: false, files: [] });
    };

    const handleFileDownload = (fileName: string) => {
        console.log(`Téléchargement du fichier: ${fileName}`);
        alert(`Téléchargement de ${fileName} (simulation)`);
    };

    // Fonctions pour gérer le drag & drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        const validFiles = files.filter(
            (file) =>
                file.type === 'application/pdf' ||
                file.name.toLowerCase().endsWith('.pdf') ||
                file.name.toLowerCase().endsWith('.zip'),
                // file.name.toLowerCase().endsWith('.rar'),
        );

        setUploadedFiles((prev) => [...prev, ...validFiles]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setUploadedFiles((prev) => [...prev, ...files]);
        }
    };

    const removeFile = (index: number) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAcceptMarche = (marcheId: number, marcheReference: string) => {
        setAcceptModal({ show: true, marcheId, marcheReference });
        setAcceptanceStep('select_type');
        setSelectedImportance('');
        setUploadedFiles([]);
    };

    // Fonction pour passer à l'étape suivante
    const handleNextStep = () => {
        if (acceptanceStep === 'select_type') {
            if (!selectedImportance) {
                alert("Veuillez sélectionner un type d'AO");
                return;
            }
            setAcceptanceStep('upload_files');
        } else if (acceptanceStep === 'upload_files') {
            if (uploadedFiles.length === 0) {
                alert("Veuillez ajouter au moins un fichier d'offre financière");
                return;
            }
            setAcceptanceStep('confirm');
        }
    };

    // Fonction pour revenir en arrière
    const handlePreviousStep = () => {
        if (acceptanceStep === 'upload_files') {
            setAcceptanceStep('select_type');
        } else if (acceptanceStep === 'confirm') {
            setAcceptanceStep('upload_files');
        }
    };

    // Fonction finale d'acceptation avec upload des fichiers
    const confirmFinalAcceptMarche = () => {
        const formData = new FormData();
        formData.append('importance', selectedImportance);

        uploadedFiles.forEach((file, index) => {
            formData.append(`offre_financiere[${index}]`, file);
        });

        router.post(`/marches/${acceptModal.marcheId}/accept-initial`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                closeAcceptModal();
                setDetailsModal({ show: false });
            },
            onError: () => {
                closeAcceptModal();
            },
        });
    };

    const closeAcceptModal = () => {
        setAcceptModal({ show: false });
        setSelectedImportance('');
        setUploadedFiles([]);
        setAcceptanceStep('select_type');
    };

    const handleAnnulerMarche = (marcheId: number, marcheReference: string) => {
        setAnnulerModal({ show: true, marcheId, marcheReference });
        setMotifAnnulation('');
    };

    const confirmAnnulerMarche = () => {
        if (!motifAnnulation.trim()) {
            alert("Veuillez saisir un motif d'annulation");
            return;
        }

        router.post(
            `/marches/${annulerModal.marcheId}/annule`,
            { motif_annulation: motifAnnulation },
            {
                preserveState: false,
                preserveScroll: true,
                onSuccess: () => {
                    setAnnulerModal({ show: false });
                    setDetailsModal({ show: false });
                    setMotifAnnulation('');
                },
                onError: () => {
                    setAnnulerModal({ show: false });
                },
            },
        );
    };

    const closeAnnulerModal = () => {
        setAnnulerModal({ show: false });
        setMotifAnnulation('');
    };

    const retourMarchesPublics = () => {
        router.get('/marches-publics');
    };

    const filteredMarches = marcheS.filter((marche) => {
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

    const villes = [...new Set(marcheS.map((m) => m.ville).filter(Boolean))];

    const getStatutColor = (statut: string | undefined) => {
        const colors = {
            detecte: 'bg-blue-100 text-blue-800',
            evalue: 'bg-yellow-100 text-yellow-800',
            en_preparation: 'bg-purple-100 text-purple-800',
            soumis: 'bg-indigo-100 text-indigo-800',
            gagne: 'bg-green-100 text-green-800',
            perdu: 'bg-red-100 text-red-800',
            annule: 'bg-gray-100 text-gray-800',
        };
        return statut ? colors[statut.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800';
    };

    const getUrgenceColor = (urgence: string | undefined) => {
        const colors: Record<string, string> = {
            elevee: 'bg-red-100 text-red-800',
            moyenne: 'bg-yellow-100 text-yellow-800',
            faible: 'bg-green-100 text-green-800',
        };
        return urgence && colors[urgence] ? colors[urgence] : 'bg-gray-100 text-gray-800';
    };

    const isUrgent = (dateLimit: string | undefined) => {
        if (!dateLimit) return false;
        const limit = new Date(dateLimit);
        const today = new Date();
        const diffTime = limit.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen bg-gray-50">
                {/* Accept Modal avec workflow en 3 étapes */}
                {acceptModal.show && (
                    <div className="fixed inset-0 z-5000 flex items-center justify-center overflow-y-auto">
                        <div className="bg-opacity-50 fixed inset-0 bg-black transition-opacity" onClick={closeAcceptModal}></div>
                        <div className="relative mx-4 w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
                            {/* En-tête avec indicateur d'étapes */}
                            <div className="mb-6">
                                <h3 className="mb-4 text-lg font-medium text-gray-900">Accepter le marché - {acceptModal.marcheReference}</h3>

                                {/* Indicateur d'étapes */}
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                                                acceptanceStep === 'select_type' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                                            }`}
                                        >
                                            1
                                        </div>
                                        <span className="text-sm text-gray-600">Type d'AO</span>
                                    </div>

                                    <div
                                        className={`mx-4 h-1 flex-1 ${
                                            acceptanceStep === 'upload_files' || acceptanceStep === 'confirm' ? 'bg-green-600' : 'bg-gray-200'
                                        }`}
                                    ></div>

                                    <div className="flex items-center space-x-2">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                                                acceptanceStep === 'select_type'
                                                    ? 'bg-gray-200 text-gray-500'
                                                    : acceptanceStep === 'upload_files'
                                                      ? 'bg-blue-600 text-white'
                                                      : 'bg-green-600 text-white'
                                            }`}
                                        >
                                            2
                                        </div>
                                        <span className="text-sm text-gray-600">Offre financière</span>
                                    </div>

                                    <div className={`mx-4 h-1 flex-1 ${acceptanceStep === 'confirm' ? 'bg-green-600' : 'bg-gray-200'}`}></div>

                                    <div className="flex items-center space-x-2">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                                                acceptanceStep === 'confirm' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                                            }`}
                                        >
                                            3
                                        </div>
                                        <span className="text-sm text-gray-600">Confirmation</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contenu selon l'étape */}
                            <div className="min-h-[300px]">
                                {/* Étape 1: Sélection du type d'AO */}
                                {acceptanceStep === 'select_type' && (
                                    <div>
                                        <div className="mb-6 flex items-start">
                                            <div className="flex-shrink-0">
                                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <p className="mb-4 text-sm text-gray-600">Sélectionnez le type d'appel d'offres pour ce marché.</p>

                                                <div className="mb-4">
                                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                                        Type d'AO <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={selectedImportance}
                                                        onChange={(e) => setSelectedImportance(e.target.value)}
                                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                                                    >
                                                        <option value="">Sélectionnez un type d'AO</option>
                                                        {IMPORTANCE_OPTIONS.map((option) => (
                                                            <option key={option.value} value={option.value}>
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Étape 2: Upload de l'offre financière */}
                                {acceptanceStep === 'upload_files' && (
                                    <div>
                                        <div className="mb-6">
                                            <h4 className="text-md mb-2 font-medium text-gray-900">Ajouter l'offre financière</h4>
                                            <p className="mb-4 text-sm text-gray-600">
                                                Glissez-déposez vos fichiers ici ou cliquez pour les sélectionner. Formats acceptés: PDF, ZIP,
                                            </p>

                                            {/* Zone de drag & drop */}
                                            <div
                                                className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                                                    isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                            >
                                                <svg
                                                    className="mx-auto h-12 w-12 text-gray-400"
                                                    stroke="currentColor"
                                                    fill="none"
                                                    viewBox="0 0 48 48"
                                                >
                                                    <path
                                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                                <div className="mt-4">
                                                    <label htmlFor="file-upload" className="cursor-pointer">
                                                        <span className="mt-2 block text-sm font-medium text-gray-900">
                                                            Glissez vos fichiers ici ou
                                                            <span className="text-blue-600 hover:text-blue-500"> parcourez</span>
                                                        </span>
                                                        <input
                                                            id="file-upload"
                                                            name="file-upload"
                                                            type="file"
                                                            multiple
                                                            className="sr-only"
                                                            accept=".pdf,.zip"
                                                            onChange={handleFileSelect}
                                                        />
                                                    </label>
                                                    <p className="mt-1 text-xs text-gray-500">PDF, ZIP jusqu'à 10MB chacun</p>
                                                </div>
                                            </div>

                                            {/* Liste des fichiers uploadés */}
                                            {uploadedFiles.length > 0 && (
                                                <div className="mt-4">
                                                    <h5 className="mb-2 text-sm font-medium text-gray-900">
                                                        Fichiers sélectionnés ({uploadedFiles.length})
                                                    </h5>
                                                    <div className="max-h-32 space-y-2 overflow-y-auto">
                                                        {uploadedFiles.map((file, index) => (
                                                            <div key={index} className="flex items-center justify-between rounded bg-gray-50 p-2">
                                                                <div className="flex items-center space-x-2">
                                                                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                    <span className="max-w-xs truncate text-sm text-gray-900" title={file.name}>
                                                                        {file.name}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    onClick={() => removeFile(index)}
                                                                    className="p-1 text-red-500 hover:text-red-700"
                                                                    type="button"
                                                                >
                                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M6 18L18 6M6 6l12 12"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Étape 3: Confirmation */}
                                {acceptanceStep === 'confirm' && (
                                    <div>
                                        <div className="mb-6 flex items-start">
                                            <div className="flex-shrink-0">
                                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <h4 className="text-md mb-2 font-medium text-gray-900">Récapitulatif</h4>
                                                <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700">Marché:</span>
                                                        <span className="ml-2 text-sm text-gray-900">{acceptModal.marcheReference}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700">Type d'AO:</span>
                                                        <span className="ml-2 text-sm text-gray-900">
                                                            {IMPORTANCE_OPTIONS.find((opt) => opt.value === selectedImportance)?.label}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700">Fichiers d'offre:</span>
                                                        <span className="ml-2 text-sm text-gray-900">{uploadedFiles.length} fichier(s)</span>
                                                    </div>
                                                </div>
                                                <p className="mt-4 text-sm text-gray-600">
                                                    En confirmant, le marché sera accepté et votre offre financière sera transmise au DG pour
                                                    validation.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Boutons de navigation */}
                            <div className="flex justify-between border-t pt-6">
                                <div>
                                    {acceptanceStep !== 'select_type' && (
                                        <button
                                            onClick={handlePreviousStep}
                                            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            Précédent
                                        </button>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={closeAcceptModal}
                                        className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                    >
                                        Annuler
                                    </button>

                                    {acceptanceStep === 'confirm' ? (
                                        <button
                                            onClick={confirmFinalAcceptMarche}
                                            className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Accepter le marché
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleNextStep}
                                            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        >
                                            Suivant
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Annuler Modal */}
                {annulerModal.show && (
                    <div className="fixed inset-0 z-5000 flex items-center justify-center overflow-y-auto">
                        <div className="bg-opacity-50 fixed inset-0 bg-black transition-opacity" onClick={closeAnnulerModal}></div>
                        <div className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="mb-2 text-lg font-medium text-gray-900">Annuler le marché</h3>
                                    <p className="mb-4 text-sm text-gray-600">Marché "{annulerModal.marcheReference}"</p>

                                    <div className="mb-4">
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Motif d'annulation <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={motifAnnulation}
                                            onChange={(e) => setMotifAnnulation(e.target.value)}
                                            placeholder="Veuillez préciser le motif d'annulation..."
                                            rows={4}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Maximum 500 caractères</p>
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={closeAnnulerModal}
                                            className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                        >
                                            Fermer
                                        </button>
                                        <button
                                            onClick={confirmAnnulerMarche}
                                            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
                                        >
                                            Confirmer l'annulation
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
                                                {formatCurrency(detailsModal.marche.budget || detailsModal.marche.montant)}
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
                                        onClick={() => handleAnnulerMarche(detailsModal.marche!.id, detailsModal.marche!.reference || 'N/A')}
                                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={() => handleAcceptMarche(detailsModal.marche!.id, detailsModal.marche!.reference || 'N/A')}
                                        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                    >
                                        Accepter
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="border-b bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-900">AOs Sélectionnés</h1>
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
                                        placeholder="Rechercher dans les AOs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-80 rounded-lg border border-gray-300 bg-white py-2 pr-3 pl-10 leading-5 placeholder-gray-500 focus:border-[#155DFC] focus:placeholder-gray-400 focus:ring-1 focus:ring-[#155DFC] focus:outline-none sm:text-sm"
                                    />
                                </div>
                                <button
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    onClick={retourMarchesPublics}
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Retour aux marchés
                                </button>

                                <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
                                    {filteredMarches.length} AOs sélectionnés
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

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

                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Filters */}
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
                            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun AO sélectionné</h3>
                            <p className="mt-2 text-gray-500">Aucun AO ne correspond aux critères de recherche.</p>
                            <div className="mt-6">
                                <button
                                    onClick={retourMarchesPublics}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Aller aux marchés publics
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {viewMode === 'grid' ? (
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
    {filteredMarches.map((marche: MarchePublic) => (
      <div
        key={marche.id}
        className="relative cursor-pointer rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md border border-gray-200"
        onClick={() => showDetails(marche)}
      >
        {isUrgent(marche.date_limite_soumission) && (
          <div className="absolute -top-2 -right-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
            Urgent
          </div>
        )}

        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-[#155DFC]">{marche.reference || 'N/A'}</span>
          <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
            Sélectionné
          </span>
        </div>

        <h3 className="mb-3 line-clamp-2 text-sm font-medium text-gray-900">
          {marche.objet || 'Objet non spécifié'}
        </h3>

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
              className={`font-medium ${
                isUrgent(marche.date_limite_soumission) ? 'text-red-600' : ''
              }`}
            >
              {formatDate(marche.date_limite_soumission)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Ville:</span>
            <span className="font-medium">{marche.ville || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span>Étape:</span>
            <span className="inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
              {marche.etape || 'Sélectionné'}
            </span>
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
                                                        État
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {filteredMarches.map((marche: MarchePublic, index: number) => (
                                                    <tr
                                                        key={marche.id}
                                                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} transition-colors hover:bg-gray-100`}
                                                    >
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
                                                            <div
                                                                className="max-w-xs cursor-pointer truncate text-sm text-gray-900"
                                                                title={marche.objet}
                                                                onClick={() => showDetails(marche)}
                                                            >
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
                                                            <span className="inline-flex rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
                                                                Sélectionné
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleAcceptMarche(marche.id, marche.reference || 'N/A');
                                                                    }}
                                                                    className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                                                >
                                                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M5 13l4 4L19 7"
                                                                        />
                                                                    </svg>
                                                                    Accepter
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleAnnulerMarche(marche.id, marche.reference || 'N/A');
                                                                    }}
                                                                    className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
                                                                >
                                                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M6 18L18 6M6 6l12 12"
                                                                        />
                                                                    </svg>
                                                                    Annuler
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
