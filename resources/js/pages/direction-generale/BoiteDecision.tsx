import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Calendar, CheckCircle, Clock, DollarSign, Eye, FileText, XCircle } from 'lucide-react';
import { useState } from 'react';

interface MarchePublic {
    id: number;
    type_ao?: string;
    n_reference?: string;
    etat?: string;
    is_accepted?: boolean;
    etape?: string;
    date_limite?: string;
    heure?: string;
    mo?: string;
    objet?: string;
    estimation?: number;
    caution?: number;
    attestation_reference?: string;
    cnss?: string;
    agrement?: string;
    equipe_demandee?: string;
    contrainte?: string;
    autres?: string;
    mode_attribution?: string;
    lieu_ao?: string;
    ville?: string;
    lots?: string;
    importance?: string;
    decision?: string;
    date_decision?: string;
    ordre_preparation?: string;
    commentaire_refus?: string;
    created_at?: string;
    updated_at?: string;
}

interface BoiteDecisionProps {
    marchesPublics: MarchePublic[];
}

interface FilesModal {
    show: boolean;
    marcheReference?: string;
    files: string[];
}

const breadcrumbs = [
    {
        title: 'Boite de decision',
        href: '/direction-generale/boite-decision',
    },
];

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

export default function BoiteDecision({ marchesPublics = [] }: BoiteDecisionProps) {
    const [selectedMarche, setSelectedMarche] = useState<MarchePublic | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [filesModal, setFilesModal] = useState<FilesModal>({
        show: false,
        files: [],
    });

    // États pour le modal de refus
    const [showRefusModal, setShowRefusModal] = useState(false);
    const [refusStep, setRefusStep] = useState<'motif' | 'confirmation'>('motif');
    const [motifRefus, setMotifRefus] = useState('');
    const [motifPersonnalise, setMotifPersonnalise] = useState('');

    // Motifs prédéfinis pour le refus
    const motifsRefusPredefinis = [
        'Dossier incomplet ou non conforme',
        'Délais insuffisants pour la préparation',
        'Estimation budgétaire inadéquate',
        'Contraintes techniques non réalisables',
        "Capacité de l'entreprise insuffisante",
        'Non-conformité aux procédures internes',
        'Documentation manquante ou incorrecte',
        'Autres (préciser ci-dessous)',
    ];

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
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
        console.log(`Téléchargement du fichier: ${fileName}`);
        alert(`Téléchargement de ${fileName} (simulation)`);
    };

    const handleAccepterMarche = (marcheId: number) => {
        if (!marcheId) return;

        setLoading(true);

        router.post(
            `/direction-generale/marche/${marcheId}/accepter`,
            {},
            {
                onSuccess: () => {
                    showNotification('success', "Marché accepté avec succès. L'équipe études techniques a été notifiée.");
                    setShowModal(false);
                },
                onError: (errors) => {
                    console.error("Erreur lors de l'acceptation:", errors);
                    showNotification('error', "Erreur lors de l'acceptation du marché");
                },
                onFinish: () => {
                    setLoading(false);
                },
            },
        );
    };

    // Fonction pour ouvrir le modal de refus
    const openRefusModal = () => {
        setShowRefusModal(true);
        setRefusStep('motif');
        setMotifRefus('');
        setMotifPersonnalise('');
    };

    // Fonction pour fermer le modal de refus
    const closeRefusModal = () => {
        setShowRefusModal(false);
        setRefusStep('motif');
        setMotifRefus('');
        setMotifPersonnalise('');
    };

    // Fonction pour passer à l'étape de confirmation
    const proceedToConfirmation = () => {
        const motifFinal = motifRefus === 'Autres (préciser ci-dessous)' ? motifPersonnalise : motifRefus;
        if (motifFinal.trim()) {
            setRefusStep('confirmation');
        }
    };

    // Fonction pour confirmer le refus
    const confirmRefusMarche = () => {
        if (!selectedMarche) return;

        const motifFinal = motifRefus === 'Autres (préciser ci-dessous)' ? motifPersonnalise : motifRefus;

        setLoading(true);

        router.post(
            `/direction-generale/marche/${selectedMarche.id}/refuser`,
            { motif: motifFinal },
            {
                onSuccess: () => {
                    showNotification('success', 'Marché refusé avec succès. La justification a été enregistrée.');
                    setShowModal(false);
                    closeRefusModal();
                },
                onError: (errors) => {
                    console.error('Erreur lors du refus:', errors);
                    showNotification('error', 'Erreur lors du refus du marché');
                },
                onFinish: () => {
                    setLoading(false);
                },
            },
        );
    };

    const openModal = (marche: MarchePublic) => {
        setSelectedMarche(marche);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedMarche(null);
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('fr-FR');
        } catch {
            return '-';
        }
    };

    const formatCurrency = (amount?: number): string => {
        if (!amount || isNaN(amount)) return '-';
        try {
            return new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'MAD',
            }).format(amount);
        } catch {
            return `${amount} MAD`;
        }
    };

    const calculateUrgentMarches = () => {
        if (!Array.isArray(marchesPublics)) return 0;

        return marchesPublics.filter((m) => {
            if (!m.date_limite) return false;
            try {
                const dateLimit = new Date(m.date_limite);
                const now = new Date();
                const diffDays = (dateLimit.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                return diffDays <= 7;
            } catch {
                return false;
            }
        }).length;
    };

    const calculateTotalValue = () => {
        if (!Array.isArray(marchesPublics)) return 0;

        return marchesPublics.reduce((sum, m) => {
            const estimation = m.estimation || 0;
            return sum + (isNaN(estimation) ? 0 : estimation);
        }, 0);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                <Head title="Boîte de Décisions - Direction Générale" />

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

                {/* Modal de refus avec motif et confirmation */}
                {showRefusModal && selectedMarche && (
                    <div className="bg-opacity-50 fixed inset-0 z-5000 flex items-center justify-center bg-black">
                        <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
                            {/* Étape 1: Saisie du motif */}
                            {refusStep === 'motif' && (
                                <>
                                    <div className="border-b border-gray-200 px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="mr-3 flex-shrink-0">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                                    <XCircle className="h-6 w-6 text-red-600" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">Motif de refus</h3>
                                                <p className="text-sm text-gray-500">Marché {selectedMarche.n_reference}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-4">
                                        <div className="mb-4">
                                            <p className="mb-3 text-sm text-gray-700">
                                                <strong>Objet :</strong> {selectedMarche.objet || 'N/A'}
                                            </p>

                                            <label className="mb-3 block text-sm font-medium text-gray-700">
                                                Sélectionnez le motif de refus <span className="text-red-500">*</span>
                                            </label>
                                            <div className="max-h-48 space-y-2 overflow-y-auto">
                                                {motifsRefusPredefinis.map((motifOption, index) => (
                                                    <label key={index} className="flex items-start">
                                                        <input
                                                            type="radio"
                                                            name="motif"
                                                            value={motifOption}
                                                            checked={motifRefus === motifOption}
                                                            onChange={(e) => setMotifRefus(e.target.value)}
                                                            className="mt-0.5 h-4 w-4 border-gray-300 text-red-600 focus:ring-red-500"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">{motifOption}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Champ texte pour motif personnalisé */}
                                        {motifRefus === 'Autres (préciser ci-dessous)' && (
                                            <div className="mb-4">
                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                    Précisez le motif <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={motifPersonnalise}
                                                    onChange={(e) => setMotifPersonnalise(e.target.value)}
                                                    rows={3}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                                                    placeholder="Décrivez le motif de refus..."
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={closeRefusModal}
                                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                                disabled={loading}
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                onClick={proceedToConfirmation}
                                                disabled={!motifRefus || (motifRefus === 'Autres (préciser ci-dessous)' && !motifPersonnalise.trim())}
                                                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Continuer
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Étape 2: Confirmation */}
                            {refusStep === 'confirmation' && (
                                <>
                                    <div className="border-b border-gray-200 px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="mr-3 flex-shrink-0">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">Confirmation de refus</h3>
                                                <p className="text-sm text-gray-500">Marché {selectedMarche.n_reference}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-4">
                                        <div className="mb-4">
                                            <p className="mb-2 text-sm text-gray-700">
                                                <strong>Motif sélectionné :</strong>
                                            </p>
                                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                                <p className="text-sm text-gray-800">
                                                    {motifRefus === 'Autres (préciser ci-dessous)' ? motifPersonnalise : motifRefus}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                                            <div className="flex">
                                                <AlertTriangle className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-red-400" />
                                                <div className="text-sm text-red-700">
                                                    <p className="font-medium">Attention</p>
                                                    <p>
                                                        Le refus de ce marché sera définitif. L'équipe études techniques sera automatiquement
                                                        notifiée.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                        <div className="flex justify-between">
                                            <button
                                                onClick={() => setRefusStep('motif')}
                                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                                disabled={loading}
                                            >
                                                ← Retour
                                            </button>
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={closeRefusModal}
                                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                                    disabled={loading}
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    onClick={confirmRefusMarche}
                                                    disabled={loading}
                                                    className="flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {loading ? (
                                                        <>
                                                            <svg
                                                                className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <circle
                                                                    className="opacity-25"
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                    stroke="currentColor"
                                                                    strokeWidth="4"
                                                                ></circle>
                                                                <path
                                                                    className="opacity-75"
                                                                    fill="currentColor"
                                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                ></path>
                                                            </svg>
                                                            Refus en cours...
                                                        </>
                                                    ) : (
                                                        'Confirmer le refus'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Notification */}
                {notification && (
                    <div
                        className={`fixed top-4 right-4 z-50 rounded-lg p-4 shadow-lg ${
                            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                {notification.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium">{notification.message}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="mb-2 text-3xl font-bold text-gray-900">Boîte de Décisions</h1>
                        <p className="text-gray-600">Marchés publics en attente de décision administrative</p>
                    </div>

                    {/* Statistics */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="rounded-xl bg-white p-6 shadow-lg">
                            <div className="flex items-center">
                                <div className="rounded-lg bg-blue-100 p-3">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Total en attente</p>
                                    <p className="text-2xl font-bold text-gray-900">{Array.isArray(marchesPublics) ? marchesPublics.length : 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-lg">
                            <div className="flex items-center">
                                <div className="rounded-lg bg-yellow-100 p-3">
                                    <Clock className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Urgent</p>
                                    <p className="text-2xl font-bold text-gray-900">{calculateUrgentMarches()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-lg">
                            <div className="flex items-center">
                                <div className="rounded-lg bg-green-100 p-3">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Valeur totale</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculateTotalValue())}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Liste des marchés */}
                    <div className="overflow-hidden rounded-xl bg-white shadow-lg">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h2 className="text-xl font-semibold text-gray-900">Marchés en attente de décision</h2>
                        </div>

                        {!Array.isArray(marchesPublics) || marchesPublics.length === 0 ? (
                            <div className="p-12 text-center">
                                <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <p className="text-gray-500">Aucun marché en attente de décision</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Référence
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Objet</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Type AO
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Estimation
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Date Limite
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {marchesPublics.map((marche) => {
                                            if (!marche) return null;

                                            const isUrgent = marche.date_limite
                                                ? (() => {
                                                      try {
                                                          const dateLimit = new Date(marche.date_limite);
                                                          const now = new Date();
                                                          const diffDays = Math.ceil((dateLimit.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                                          return diffDays <= 7;
                                                      } catch {
                                                          return false;
                                                      }
                                                  })()
                                                : false;

                                            return (
                                                <tr
                                                    key={marche.id}
                                                    className="cursor-pointer transition-colors hover:bg-gray-50"
                                                    onClick={() => openModal(marche)}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            {isUrgent && <div className="mr-2 h-2 w-2 rounded-full bg-red-500"></div>}
                                                            <span className="text-sm font-medium text-gray-900">{marche.n_reference || '-'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="max-w-xs truncate text-sm text-gray-900">{marche.objet || '-'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                                            {marche.type_ao || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                                        {formatCurrency(marche.estimation)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                                                            <span className={`text-sm ${isUrgent ? 'font-semibold text-red-600' : 'text-gray-900'}`}>
                                                                {formatDate(marche.date_limite)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openModal(marche);
                                                            }}
                                                            className="flex items-center text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            <Eye className="mr-1 h-4 w-4" />
                                                            Voir détails
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal de détails */}
                {showModal && selectedMarche && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
                        <div className="max-h-screen w-full max-w-4xl overflow-y-auto rounded-xl bg-white">
                            <div className="border-b border-gray-200 p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Détails du Marché Public</h3>
                                        <p className="mt-1 text-gray-600">Référence: {selectedMarche.n_reference || 'N/A'}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => showFiles(selectedMarche.id, selectedMarche.n_reference || 'N/A')}
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
                                        <button onClick={closeModal} className="text-2xl text-gray-400 hover:text-gray-600" disabled={loading}>
                                            ×
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 p-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <h4 className="mb-3 font-semibold text-gray-900">Informations générales</h4>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <strong>Objet:</strong> {selectedMarche.objet || '-'}
                                            </div>
                                            <div>
                                                <strong>Type AO:</strong> {selectedMarche.type_ao || '-'}
                                            </div>
                                            <div>
                                                <strong>Mode d'attribution:</strong> {selectedMarche.mode_attribution || '-'}
                                            </div>
                                            <div>
                                                <strong>Importance:</strong> {selectedMarche.importance || '-'}
                                            </div>
                                            <div>
                                                <strong>M.O:</strong> {selectedMarche.mo || '-'}
                                            </div>
                                            <div>
                                                <strong>Ville:</strong> {selectedMarche.ville || '-'}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="mb-3 font-semibold text-gray-900">Détails financiers</h4>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <strong>Estimation:</strong> {formatCurrency(selectedMarche.estimation)}
                                            </div>
                                            <div>
                                                <strong>Caution:</strong> {formatCurrency(selectedMarche.caution)}
                                            </div>
                                            <div>
                                                <strong>Date limite:</strong> {formatDate(selectedMarche.date_limite)}
                                            </div>
                                            <div>
                                                <strong>Heure limite:</strong> {selectedMarche.heure || '-'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {selectedMarche.contrainte && (
                                    <div>
                                        <h4 className="mb-3 font-semibold text-gray-900">Contraintes</h4>
                                        <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{selectedMarche.contrainte}</p>
                                    </div>
                                )}

                                {selectedMarche.autres && (
                                    <div>
                                        <h4 className="mb-3 font-semibold text-gray-900">Autres informations</h4>
                                        <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{selectedMarche.autres}</p>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-4 border-t border-gray-200 pt-6">
                                    <button
                                        onClick={closeModal}
                                        className="rounded-lg border border-gray-300 px-6 py-2 text-gray-600 transition-colors hover:bg-gray-50"
                                        disabled={loading}
                                    >
                                        Fermer
                                    </button>
                                    <button
                                        onClick={openRefusModal}
                                        disabled={loading}
                                        className="flex items-center rounded-lg bg-red-600 px-6 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Refuser
                                    </button>
                                    <button
                                        onClick={() => handleAccepterMarche(selectedMarche.id)}
                                        disabled={loading}
                                        className="flex items-center rounded-lg bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        {loading ? 'En cours...' : 'Accepter'}
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
