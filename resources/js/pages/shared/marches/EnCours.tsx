import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

interface MarchePublic {
    id: number;
    type_ao?: string;
    n_reference?: string;
    etat?: string;
    is_accepted: boolean;
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
    decision?: string;
    date_decision?: string;
    ordre_preparation?: string;
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

    const formatDate = (date: string | undefined | null): string => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('fr-FR');
    };

    const formatCurrency = (amount: number | string | undefined | null): string => {
        if (!amount) return '-';
        return new Intl.NumberFormat('fr-FR').format(Number(amount)) + ' DH';
    };

    const filteredMarches = useMemo(() => {
        return marcheP.filter((marche) => {
            const matchesSearch =
                searchTerm === '' ||
                marche.n_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                marche.objet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                marche.mo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                marche.ville?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                marche.type_ao?.toLowerCase().includes(searchTerm.toLowerCase());

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
        setConfirmAction(action);
        setShowConfirmModal(true);
    };

    const executeAction = async () => {
        if (!selectedMarche || !confirmAction) return;

        setLoading(true);
        const endpoint = confirmAction === 'accept' ? `/marches/${selectedMarche.id}/accept-initial` : `/marches/${selectedMarche.id}/annule`;

        try {
            console.log('Envoi de la requête vers:', endpoint);
            console.log('URL complète:', window.location.origin + endpoint);

            router.post(
                endpoint,
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    only: [],
                    onSuccess: (page) => {
                        console.log('Succès:', page);
                        showNotification('success', confirmAction === 'accept' ? 'Marché accepté avec succès' : 'Marché annulé avec succès');

                        // Mettre à jour les données localement
                        if (confirmAction === 'accept') {
                            selectedMarche.etape = 'decision admin';
                            selectedMarche.is_accepted = true;
                        } else {
                            selectedMarche.etat = 'annulee';
                        }

                        // Fermer les modales
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
                                    placeholder="Rechercher par référence, objet, M.O, ville ou type AO..."
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
                            </div>

                            <div className="text-sm whitespace-nowrap text-gray-500">
                                {filteredMarches.length} marché{filteredMarches.length > 1 ? 's' : ''} trouvé{filteredMarches.length > 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900">Liste des Marchés</h2>
                            <p className="mt-1 text-sm text-gray-500">Cliquez sur une ligne pour voir les détails complets</p>
                        </div>

                        <div className="px-6 py-4">
                            {filteredMarches.length === 0 ? (
                                <div className="py-12 text-center">
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
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Référence
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Type AO
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Objet
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    M.O
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Estimation
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
                                                                {marche.n_reference || '-'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{marche.type_ao || '-'}</div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="max-w-xs truncate text-sm text-gray-900" title={marche.objet}>
                                                            {marche.objet || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{marche.mo || '-'}</div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{formatCurrency(marche.estimation)}</div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{formatCurrency(marche.caution)}</div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{formatDate(marche.date_limite)}</div>
                                                        {marche.heure && <div className="text-xs text-gray-500">{marche.heure}</div>}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{marche.ville || '-'}</div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {filteredMarches.length > 0 && (
                            <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Affichage de {filteredMarches.length} marché{filteredMarches.length > 1 ? 's' : ''}
                                    </div>
                                    <div className="text-sm text-gray-500">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</div>
                                </div>
                            </div>
                        )}
                    </div>
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
                                                    <dd className="mt-1 text-sm font-semibold text-gray-900">{selectedMarche.n_reference || '-'}</dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Type AO</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedMarche.type_ao || '-'}</dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">M.O</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedMarche.mo || '-'}</dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">État</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedMarche.etat || '-'}</dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Étape</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedMarche.etape || '-'}</dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Mode d'attribution</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedMarche.mode_attribution || '-'}</dd>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="border-b border-gray-300 pb-2 text-sm font-bold tracking-wide text-gray-900 uppercase">
                                                    Informations Financières
                                                </h4>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Estimation</dt>
                                                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                                                        {formatCurrency(selectedMarche.estimation)}
                                                    </dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Caution</dt>
                                                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                                                        {formatCurrency(selectedMarche.caution)}
                                                    </dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Date limite</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {formatDate(selectedMarche.date_limite)}
                                                        {selectedMarche.heure && ` à ${selectedMarche.heure}`}
                                                    </dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Ville</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedMarche.ville || '-'}</dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Lieu AO</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {selectedMarche.lieu_ao ? (
                                                            <a
                                                                className="text-blue-600 underline hover:text-blue-800"
                                                                href={selectedMarche.lieu_ao}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                Lien vers AO
                                                            </a>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Lots</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedMarche.lots || '-'}</dd>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="border-b border-gray-300 pb-2 text-sm font-bold tracking-wide text-gray-900 uppercase">
                                                    Informations Techniques
                                                </h4>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Attestation Référence</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedMarche.attestation_reference || '-'}</dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">CNSS</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedMarche.cnss || '-'}</dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Agrément</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedMarche.agrement || '-'}</dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Ordre préparation</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedMarche.ordre_preparation || '-'}</dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Décision</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedMarche.decision || '-'}</dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Date décision</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedMarche.date_decision)}</dd>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 space-y-6 border-t border-gray-200 pt-6">
                                            <h4 className="text-sm font-bold tracking-wide text-gray-900 uppercase">Détails Complémentaires</h4>

                                            {selectedMarche.objet && (
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Objet</dt>
                                                    <dd className="mt-1 rounded bg-gray-50 p-3 text-sm text-gray-900">{selectedMarche.objet}</dd>
                                                </div>
                                            )}

                                            {selectedMarche.equipe_demandee && (
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Équipe demandée</dt>
                                                    <dd className="mt-1 rounded bg-gray-50 p-3 text-sm text-gray-900">
                                                        {selectedMarche.equipe_demandee}
                                                    </dd>
                                                </div>
                                            )}

                                            {selectedMarche.contrainte && (
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Contraintes</dt>
                                                    <dd className="mt-1 rounded bg-gray-50 p-3 text-sm text-gray-900">{selectedMarche.contrainte}</dd>
                                                </div>
                                            )}

                                            {selectedMarche.autres && (
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">Autres informations</dt>
                                                    <dd className="mt-1 rounded bg-gray-50 p-3 text-sm text-gray-900">{selectedMarche.autres}</dd>
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
                                    {selectedMarche.etat !== 'annulee' && (
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

                {showConfirmModal && selectedMarche && (
                    <div className="fixed inset-0 z-60 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <div className="bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity"></div>

                            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div
                                            className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                                                confirmAction === 'accept' ? 'bg-green-100' : 'bg-red-100'
                                            } sm:mx-0 sm:h-10 sm:w-10`}
                                        >
                                            {confirmAction === 'accept' ? (
                                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                {confirmAction === 'accept' ? "Confirmer l'acceptation" : "Confirmer l'annulation"}
                                            </h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    {confirmAction === 'accept'
                                                        ? `Êtes-vous sûr de vouloir accepter le marché ${selectedMarche.n_reference} ? Cette action changera l'étape à "decision admin".`
                                                        : `Êtes-vous sûr de vouloir annuler le marché ${selectedMarche.n_reference} ? Cette action changera l'état à "annulee".`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button
                                        type="button"
                                        className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${
                                            confirmAction === 'accept'
                                                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                        } ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
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
                                        ) : confirmAction === 'accept' ? (
                                            'Accepter'
                                        ) : (
                                            'Annuler'
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
                                        Annuler
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
