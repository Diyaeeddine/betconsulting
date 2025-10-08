'use client';

import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';
import { AlertTriangle, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

interface MarchePublic {
    id: number;
    reference?: string;
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
    chemin_fichiers?: any;
    importance?: 'ao_ouvert' | 'ao_important' | 'ao_simplifie' | 'ao_restreint' | 'ao_preselection' | 'ao_bon_commande';
    etat?: string;
    is_accepted: boolean;
    etape?: string;
    created_at?: string;
    updated_at?: string;
}

interface EnCoursProps {
    marcheP: MarchePublic[];
}

const breadcrumbs = [
    {
        title: 'Marchés en cours',
        href: '/marches/encours',
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

const STATUT_LABELS = {
    detecte: 'Détecté',
    evalue: 'Évalué',
    en_preparation: 'En préparation',
    soumis: 'Soumis',
    gagne: 'Gagné',
    perdu: 'Perdu',
    annule: 'Annulé',
};

const TYPE_MARCHE_LABELS = {
    etudes: 'Études',
    assistance_technique: 'Assistance technique',
    batiment: 'Bâtiment',
    voirie: 'Voirie',
    hydraulique: 'Hydraulique',
};

const URGENCE_LABELS = {
    faible: 'Faible',
    moyenne: 'Moyenne',
    elevee: 'Élevée',
};

export default function EnCours({ marcheP }: EnCoursProps) {
    const [selectedMarche, setSelectedMarche] = useState<MarchePublic | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('tous');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'accept' | 'cancel' | null>(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // États pour le modal d'annulation avec motif
    const [showAnnulationModal, setShowAnnulationModal] = useState(false);
    const [annulationStep, setAnnulationStep] = useState<'motif' | 'confirmation'>('motif');
    const [motifAnnulation, setMotifAnnulation] = useState('');
    const [motifPersonnalise, setMotifPersonnalise] = useState('');

    // Motifs prédéfinis pour l'annulation
    const motifsAnnulationPredefinis = [
        'Changement de priorités stratégiques',
        'Budget insuffisant ou réalloué',
        'Contraintes techniques non surmontables',
        'Délais incompatibles avec les besoins',
        'Évolution des besoins du projet',
        'Problèmes réglementaires ou administratifs',
        'Conditions du marché défavorables',
        'Autres (préciser ci-dessous)',
    ];

    const formatDate = (date: string | undefined | null): string => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('fr-FR');
    };

    const formatDateTime = (dateTime: string | undefined | null): string => {
        if (!dateTime) return '-';
        return new Date(dateTime).toLocaleDateString('fr-FR') + ' à ' + new Date(dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatCurrency = (amount: number | string | undefined | null): string => {
        if (!amount) return '-';
        return new Intl.NumberFormat('fr-FR').format(Number(amount)) + ' DH';
    };

    const getImportanceLabel = (importance: string | undefined): string => {
        if (!importance) return '-';
        return IMPORTANCE_LABELS[importance as keyof typeof IMPORTANCE_LABELS] || importance;
    };

    const getStatutLabel = (statut: string | undefined): string => {
        if (!statut) return '-';
        return STATUT_LABELS[statut as keyof typeof STATUT_LABELS] || statut;
    };

    const getTypeMarcheLabel = (type: string | undefined): string => {
        if (!type) return '-';
        return TYPE_MARCHE_LABELS[type as keyof typeof TYPE_MARCHE_LABELS] || type;
    };

    const getUrgenceLabel = (urgence: string | undefined): string => {
        if (!urgence) return '-';
        return URGENCE_LABELS[urgence as keyof typeof URGENCE_LABELS] || urgence;
    };

    const getImportanceColor = (importance: string | undefined) => {
        switch (importance) {
            case 'ao_important':
                return 'bg-red-100 text-red-800';
            case 'ao_ouvert':
                return 'bg-blue-100 text-blue-800';
            case 'ao_simplifie':
                return 'bg-green-100 text-green-800';
            case 'ao_restreint':
                return 'bg-purple-100 text-purple-800';
            case 'ao_preselection':
                return 'bg-yellow-100 text-yellow-800';
            case 'ao_bon_commande':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatutColor = (statut: string | undefined) => {
        switch (statut) {
            case 'detecte':
                return 'bg-blue-100 text-blue-800';
            case 'evalue':
                return 'bg-yellow-100 text-yellow-800';
            case 'en_preparation':
                return 'bg-orange-100 text-orange-800';
            case 'soumis':
                return 'bg-purple-100 text-purple-800';
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
            case 'faible':
                return 'bg-green-100 text-green-800';
            case 'moyenne':
                return 'bg-yellow-100 text-yellow-800';
            case 'elevee':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredMarches = useMemo(() => {
        return marcheP.filter((marche) => {
            const matchesSearch =
                searchTerm === '' ||
                marche.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                marche.objet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                marche.maitre_ouvrage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                marche.ville?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                marche.type_marche?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus =
                filterStatus === 'tous' ||
                (filterStatus === 'accepte' && marche.is_accepted) ||
                (filterStatus === 'non_accepte' && !marche.is_accepted);

            return matchesSearch && matchesStatus;
        });
    }, [marcheP, searchTerm, filterStatus]);

    const openModal = (marche: MarchePublic) => {
        setSelectedMarche(marche);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedMarche(null);
        setIsModalOpen(false);
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleConfirmAction = (action: 'accept' | 'cancel') => {
        if (action === 'cancel') {
            openAnnulationModal();
        } else {
            setConfirmAction(action);
            setShowConfirmModal(true);
        }
    };

    const openAnnulationModal = () => {
        setShowAnnulationModal(true);
        setAnnulationStep('motif');
        setMotifAnnulation('');
        setMotifPersonnalise('');
    };

    const closeAnnulationModal = () => {
        setShowAnnulationModal(false);
        setAnnulationStep('motif');
        setMotifAnnulation('');
        setMotifPersonnalise('');
    };

    const proceedToConfirmation = () => {
        const motifFinal = motifAnnulation === 'Autres (préciser ci-dessous)' ? motifPersonnalise : motifAnnulation;
        if (motifFinal.trim()) {
            setAnnulationStep('confirmation');
        }
    };

    const confirmAnnulationMarche = async () => {
        if (!selectedMarche) return;

        const motifFinal = motifAnnulation === 'Autres (préciser ci-dessous)' ? motifPersonnalise : motifAnnulation;

        setLoading(true);

        try {
            router.post(
                `/marches/${selectedMarche.id}/annule`,
                { motif_annulation: motifFinal },
                {
                    preserveState: false,
                    preserveScroll: true,
                    onSuccess: () => {
                        showNotification('success', 'Marché annulé avec succès');
                        selectedMarche.statut = 'annule';
                        setShowAnnulationModal(false);
                        closeModal();
                    },
                    onError: (errors) => {
                        console.error('Erreur Inertia:', errors);
                        const errorMessage =
                            typeof errors === 'object' && errors !== null
                                ? (Object.values(errors)[0] as string) || 'Une erreur est survenue'
                                : 'Une erreur est survenue';
                        showNotification('error', errorMessage);
                    },
                    onFinish: () => {
                        setLoading(false);
                    },
                },
            );
        } catch (error) {
            console.error('Erreur inattendue:', error);
            showNotification('error', 'Une erreur inattendue est survenue');
            setLoading(false);
            setShowAnnulationModal(false);
        }
    };

    const executeAction = async () => {
        if (!selectedMarche || !confirmAction) return;

        setLoading(true);
        const endpoint = `/marches/${selectedMarche.id}/accept-initial`;

        try {
            router.post(
                endpoint,
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        showNotification('success', 'Marché accepté avec succès');
                        selectedMarche.etape = 'decision admin';
                        selectedMarche.is_accepted = true;
                        setShowConfirmModal(false);
                        setConfirmAction(null);
                        closeModal();
                    },
                    onError: (errors) => {
                        console.error('Erreur Inertia:', errors);
                        const errorMessage =
                            typeof errors === 'object' && errors !== null
                                ? (Object.values(errors)[0] as string) || 'Une erreur est survenue'
                                : 'Une erreur est survenue';
                        showNotification('error', errorMessage);
                    },
                    onFinish: () => {
                        setLoading(false);
                    },
                },
            );
        } catch (error) {
            console.error('Erreur inattendue:', error);
            showNotification('error', 'Une erreur inattendue est survenue');
            setLoading(false);
            setShowConfirmModal(false);
            setConfirmAction(null);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterStatus('tous');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen bg-gray-50 py-8">
                {notification && (
                    <div
                        className={`fixed top-4 right-4 z-50 rounded-lg p-4 shadow-lg ${
                            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                {notification.type === 'success' ? (
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium">{notification.message}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <div className="border-l-4 border-[#155DFC] pl-4">
                            <h1 className="text-3xl font-bold text-gray-900">Marchés Publics en Cours</h1>
                            <p className="mt-1 text-gray-600">Suivi des appels d'offres actuellement en cours de traitement</p>
                        </div>
                    </div>

                    <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
                        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-4">
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
                                    placeholder="Rechercher par référence, objet, maître d'ouvrage, ville ou type de marché..."
                                    className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-10 leading-5 placeholder-gray-500 focus:border-[#155DFC] focus:placeholder-gray-400 focus:ring-1 focus:ring-[#155DFC] focus:outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center space-x-4">
                                <select
                                    className="block rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-[#155DFC] focus:ring-[#155DFC] focus:outline-none"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="tous">Tous les statuts</option>
                                    <option value="accepte">Acceptés</option>
                                    <option value="non_accepte">Non acceptés</option>
                                </select>

                                {(searchTerm || filterStatus !== 'tous') && (
                                    <button
                                        onClick={clearFilters}
                                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-[#155DFC] focus:outline-none"
                                    >
                                        <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Effacer
                                    </button>
                                )}

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

                            <div className="text-sm whitespace-nowrap text-gray-500">
                                {filteredMarches.length} marché{filteredMarches.length > 1 ? 's' : ''} trouvé
                                {filteredMarches.length > 1 ? 's' : ''}
                            </div>
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
                            <h3 className="mt-4 text-lg font-medium text-gray-900">
                                {searchTerm || filterStatus !== 'tous' ? 'Aucun résultat trouvé' : 'Aucun marché en cours'}
                            </h3>
                            <p className="mt-2 text-gray-500">
                                {searchTerm || filterStatus !== 'tous'
                                    ? 'Essayez de modifier vos critères de recherche.'
                                    : "Il n'y a aucun marché public en cours pour le moment."}
                            </p>
                        </div>
                    ) : (
                        <>
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                                    {filteredMarches.map((marche: MarchePublic) => (
                                        <div
                                            key={marche.id}
                                            className="relative cursor-pointer rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                                            onClick={() => openModal(marche)}
                                        >
                                            <div className="mb-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-[#155DFC]">{marche.reference || 'N/A'}</span>
                                                    {marche.importance && (
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getImportanceColor(marche.importance)}`}
                                                        >
                                                            {getImportanceLabel(marche.importance)}
                                                        </span>
                                                    )}
                                                </div>
                                                {marche.urgence && (
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getUrgenceColor(marche.urgence)}`}
                                                    >
                                                        {getUrgenceLabel(marche.urgence)}
                                                    </span>
                                                )}
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
                                                    <span className="font-medium">{getTypeMarcheLabel(marche.type_marche)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Statut:</span>
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatutColor(marche.statut)}`}
                                                    >
                                                        {getStatutLabel(marche.statut)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Budget:</span>
                                                    <span className="font-medium text-green-600">{marche.budget || '-'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Caution:</span>
                                                    <span className="font-medium">{formatCurrency(marche.caution_provisoire)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Date limite:</span>
                                                    <span className="font-medium">{formatDate(marche.date_limite_soumission)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Ville:</span>
                                                    <span className="font-medium">{marche.ville || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg bg-white shadow-sm">
                                    <div className="border-b border-gray-200 px-6 py-4">
                                        <h2 className="text-lg font-semibold text-gray-900">Liste des Marchés</h2>
                                        <p className="mt-1 text-sm text-gray-500">Cliquez sur une ligne pour voir les détails complets</p>
                                    </div>

                                    <div className="px-6 py-4">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead>
                                                    <tr className="bg-gray-50">
                                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                            Référence
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                            Type Marché
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                            Importance
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                            Statut
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                            Objet
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                            M.O
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                            Budget
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                            Caution
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                            Date Limite
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                            Ville
                                                        </th>
                                                        <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                    {filteredMarches.map((marche: MarchePublic, index: number) => (
                                                        <tr
                                                            key={marche.id}
                                                            className={`cursor-pointer transition-colors duration-200 ${
                                                                hoveredRow === index
                                                                    ? 'bg-blue-50'
                                                                    : index % 2 === 0
                                                                      ? 'bg-white hover:bg-gray-50'
                                                                      : 'bg-gray-50 hover:bg-gray-100'
                                                            }`}
                                                            onClick={() => openModal(marche)}
                                                            onMouseEnter={() => setHoveredRow(index)}
                                                            onMouseLeave={() => setHoveredRow(null)}
                                                        >
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div
                                                                        className={`text-sm font-medium ${hoveredRow === index ? 'font-bold text-[#155DFC]' : 'text-[#155DFC]'}`}
                                                                    >
                                                                        {marche.reference || '-'}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">{getTypeMarcheLabel(marche.type_marche)}</div>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                {marche.importance ? (
                                                                    <span
                                                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getImportanceColor(marche.importance)}`}
                                                                    >
                                                                        {getImportanceLabel(marche.importance)}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-sm text-gray-500">-</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <span
                                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatutColor(marche.statut)}`}
                                                                >
                                                                    {getStatutLabel(marche.statut)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <div className="max-w-xs truncate text-sm text-gray-900" title={marche.objet}>
                                                                    {marche.objet || '-'}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">{marche.maitre_ouvrage || '-'}</div>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {marche.budget || '-'}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">{formatCurrency(marche.caution_provisoire)}</div>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">{formatDate(marche.date_limite_soumission)}</div>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">{marche.ville || '-'}</div>
                                                            </td>
                                                            <td className="px-4 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                                {marche.statut !== 'annule' && (
                                                                    <div className="flex justify-end gap-2">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedMarche(marche);
                                                                                handleConfirmAction('accept');
                                                                            }}
                                                                            className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
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
                                                                                    d="M5 13l4 4L19 7"
                                                                                />
                                                                            </svg>
                                                                            Accepter
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedMarche(marche);
                                                                                handleConfirmAction('cancel');
                                                                            }}
                                                                            className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
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
                                                                                    d="M6 18L18 6M6 6l12 12"
                                                                                />
                                                                            </svg>
                                                                            Annuler
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {filteredMarches.length > 0 && (
                                        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-gray-500">
                                                    Affichage de {filteredMarches.length} marché{filteredMarches.length > 1 ? 's' : ''}
                                                </div>
                                              <div className="text-sm text-gray-500">
                                                    Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {isModalOpen && selectedMarche && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <div className="bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity" onClick={closeModal}></div>

                            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-5xl">
                                <div className="bg-white px-6 py-6">
                                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                                        <h3 className="text-xl font-bold text-gray-900">Détails du Marché Public</h3>
                                        <button
                                            onClick={closeModal}
                                            className="rounded-md bg-white text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-[#155DFC] focus:outline-none"
                                        >
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="mt-6 max-h-96 overflow-y-auto">
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                            <div className="space-y-4">
                                                <h4 className="border-b border-gray-300 pb-2 text-sm font-bold tracking-wide text-gray-900 uppercase">
                                                    Informations Générales
                                                </h4>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Référence</dt>
                                                    <dd className="mt-1 text-sm font-semibold text-gray-900">{selectedMarche.reference || '-'}</dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Type de Marché</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{getTypeMarcheLabel(selectedMarche.type_marche)}</dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Importance</dt>
                                                    <dd className="mt-1">
                                                        {selectedMarche.importance ? (
                                                            <span
                                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getImportanceColor(selectedMarche.importance)}`}
                                                            >
                                                                {getImportanceLabel(selectedMarche.importance)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-gray-900">-</span>
                                                        )}
                                                    </dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Maître d'Ouvrage</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedMarche.maitre_ouvrage || '-'}</dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Statut</dt>
                                                    <dd className="mt-1">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatutColor(selectedMarche.statut)}`}
                                                        >
                                                            {getStatutLabel(selectedMarche.statut)}
                                                        </span>
                                                    </dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Urgence</dt>
                                                    <dd className="mt-1">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getUrgenceColor(selectedMarche.urgence)}`}
                                                        >
                                                            {getUrgenceLabel(selectedMarche.urgence)}
                                                        </span>
                                                    </dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Étape</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedMarche.etape || '-'}</dd>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="border-b border-gray-300 pb-2 text-sm font-bold tracking-wide text-gray-900 uppercase">
                                                    Informations Financières & Dates
                                                </h4>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Budget</dt>
                                                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                                                        {selectedMarche.budget || '-'}
                                                    </dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Montant</dt>
                                                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                                                        {selectedMarche.montant || '-'}
                                                    </dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Caution Provisoire</dt>
                                                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                                                        {formatCurrency(selectedMarche.caution_provisoire)}
                                                    </dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Date Publication</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {formatDateTime(selectedMarche.date_publication)}
                                                    </dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Date Limite Soumission</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {formatDateTime(selectedMarche.date_limite_soumission)}
                                                    </dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Date Ouverture</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedMarche.date_ouverture)}</dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Date Adjudications</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedMarche.date_adjudications)}</dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Date Affichage</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedMarche.date_affichage)}</dd>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="border-b border-gray-300 pb-2 text-sm font-bold tracking-wide text-gray-900 uppercase">
                                                    Informations Géographiques & Liens
                                                </h4>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Ville</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedMarche.ville || '-'}</dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Zone Géographique</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedMarche.zone_geographique || '-'}</dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">PV</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedMarche.pv || '-'}</dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">DAO</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedMarche.dao || '-'}</dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Adjudicataire</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedMarche.adjudicataire || '-'}</dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Lien DAO</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {selectedMarche.lien_dao ? (
                                                            <a
                                                                className="text-blue-600 underline hover:text-blue-800"
                                                                href={selectedMarche.lien_dao}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                Lien vers DAO
                                                            </a>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Lien PV</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {selectedMarche.lien_pv ? (
                                                            <a
                                                                className="text-blue-600 underline hover:text-blue-800"
                                                                href={selectedMarche.lien_pv}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                Lien vers PV
                                                            </a>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </dd>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 space-y-6 border-t border-gray-200 pt-6">
                                            <h4 className="text-sm font-bold tracking-wide text-gray-900 uppercase">Objet du Marché</h4>

                                            {selectedMarche.objet && (
                                                <div>
                                                    <dd className="mt-1 rounded bg-gray-50 p-3 text-sm text-gray-900">{selectedMarche.objet}</dd>
                                                </div>
                                            )}

                                            <div className="flex justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
                                                <div>Créé le : {formatDate(selectedMarche.created_at)}</div>
                                                <div>Modifié le : {formatDate(selectedMarche.updated_at)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 bg-gray-50 px-6 py-4">
                                    {selectedMarche.statut !== 'annule' && (
                                        <>
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                                onClick={() => handleConfirmAction('accept')}
                                            >
                                                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Acceptation Initiale
                                            </button>
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
                                                onClick={() => handleConfirmAction('cancel')}
                                            >
                                                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Annuler ce Marché
                                            </button>
                                        </>
                                    )}
                                    <button
                                        type="button"
                                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                                        onClick={closeModal}
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal d'annulation reste inchangé */}
                {showAnnulationModal && selectedMarche && (
                    <div className="bg-opacity-50 fixed inset-0 z-60 flex items-center justify-center bg-black">
                        <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
                            {annulationStep === 'motif' && (
                                <>
                                    <div className="border-b border-gray-200 px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="mr-3 flex-shrink-0">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                                    <XCircle className="h-6 w-6 text-red-600" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">Motif d'annulation</h3>
                                                <p className="text-sm text-gray-500">Marché {selectedMarche.reference}</p>
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
                                                    {motifAnnulation === 'Autres (préciser ci-dessous)' ? motifPersonnalise : motifAnnulation}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                                            <div className="flex">
                                                <AlertTriangle className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-red-400" />
                                                <div className="text-sm text-red-700">
                                                    <p className="font-medium">Attention</p>
                                                    <p>L'annulation de ce marché sera définitive. L'équipe sera automatiquement notifiée.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                        <div className="flex justify-between">
                                            <button
                                                onClick={() => setAnnulationStep('motif')}
                                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                                disabled={loading}
                                            >
                                                ← Retour
                                            </button>
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={closeAnnulationModal}
                                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                                    disabled={loading}
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    onClick={confirmAnnulationMarche}
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
                                                            Annulation en cours...
                                                        </>
                                                    ) : (
                                                        "Confirmer l'annulation"
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

                {showConfirmModal && selectedMarche && (
                    <div className="fixed inset-0 z-60 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <div className="bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity"></div>

                            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">Confirmer l'acceptation</h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    Êtes-vous sûr de vouloir accepter le marché {selectedMarche.reference} ? Cette action changera
                                                    l'étape à "decision admin".
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button
                                        type="button"
                                        className={`inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                                        onClick={executeAction}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <div className="flex items-center">
                                                <svg className="mr-3 -ml-1 h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
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
                                                Traitement...
                                            </div>
                                        ) : (
                                            'Accepter'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => {
                                            setShowConfirmModal(false);
                                            setConfirmAction(null);
                                        }}
                                        disabled={loading}
                                    >
                                        Retour
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
