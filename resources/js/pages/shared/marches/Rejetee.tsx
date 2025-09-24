'use client';

import AppLayout from '@/layouts/app-layout';
import { AlertTriangle, XCircle } from 'lucide-react';
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
    importance?: string;
    motif_rejet?: string;
    created_at?: string;
    updated_at?: string;
}

interface RejeteeProps {
    marcheR: MarchePublic[];
}

const breadcrumbs = [
    {
        title: 'Marchés rejetés',
        href: '/marches/rejetee',
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

export default function Rejetee({ marcheR }: RejeteeProps) {
    const [selectedMarche, setSelectedMarche] = useState<MarchePublic | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const formatDate = (date: string | undefined | null): string => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('fr-FR');
    };

    const formatCurrency = (amount: number | string | undefined | null): string => {
        if (!amount) return '-';
        return new Intl.NumberFormat('fr-FR').format(Number(amount)) + ' DH';
    };

    const getImportanceLabel = (importance: string | undefined): string => {
        if (!importance) return '-';
        return IMPORTANCE_LABELS[importance as keyof typeof IMPORTANCE_LABELS] || importance;
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

    const filteredMarches = useMemo(() => {
        return marcheR.filter((marche) => {
            const matchesSearch =
                searchTerm === '' ||
                marche.n_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                marche.objet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                marche.mo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                marche.ville?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                marche.type_ao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                marche.motif_rejet?.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesSearch;
        });
    }, [marcheR, searchTerm]);

    const openModal = (marche: MarchePublic) => {
        setSelectedMarche(marche);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedMarche(null);
        setIsModalOpen(false);
    };

    const clearFilters = () => {
        setSearchTerm('');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <div className="border-l-4 border-red-500 pl-4">
                            <h1 className="text-3xl font-bold text-gray-900">Marchés Publics Rejetés</h1>
                            <p className="mt-1 text-gray-600">Liste des appels d'offres qui ont été rejetés</p>
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
                                    placeholder="Rechercher par référence, objet, M.O, ville, type AO ou motif de rejet..."
                                    className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-10 leading-5 placeholder-gray-500 focus:border-red-500 focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center space-x-4">
                                {searchTerm && (
                                    <button
                                        onClick={clearFilters}
                                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:outline-none"
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
                                        className={`rounded p-2 ${viewMode === 'grid' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`rounded p-2 ${viewMode === 'list' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
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
                                {filteredMarches.length} marché{filteredMarches.length > 1 ? 's' : ''} rejeté
                                {filteredMarches.length > 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>

                    {filteredMarches.length === 0 ? (
                        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
                            <XCircle className="mx-auto h-12 w-12 text-red-400" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">{searchTerm ? 'Aucun résultat trouvé' : 'Aucun marché rejeté'}</h3>
                            <p className="mt-2 text-gray-500">
                                {searchTerm
                                    ? 'Essayez de modifier vos critères de recherche.'
                                    : "Il n'y a aucun marché public rejeté pour le moment."}
                            </p>
                        </div>
                    ) : (
                        <>
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                                    {filteredMarches.map((marche: MarchePublic) => (
                                        <div
                                            key={marche.id}
                                            className="relative cursor-pointer rounded-lg border-l-4 border-red-500 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                                            onClick={() => openModal(marche)}
                                        >
                                            <div className="mb-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-red-600">{marche.n_reference || 'N/A'}</span>
                                                    {marche.importance && (
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getImportanceColor(marche.importance)}`}
                                                        >
                                                            {getImportanceLabel(marche.importance)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center text-red-500">
                                                    <XCircle className="h-5 w-5" />
                                                </div>
                                            </div>

                                            <h3 className="mb-3 line-clamp-2 text-sm font-medium text-gray-900">
                                                {marche.objet || 'Objet non spécifié'}
                                            </h3>

                                            <div className="space-y-2 text-xs text-gray-600">
                                                <div className="flex justify-between">
                                                    <span>M.O:</span>
                                                    <span className="font-medium">{marche.mo || '-'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Type:</span>
                                                    <span className="font-medium">{marche.type_ao || '-'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Estimation:</span>
                                                    <span className="font-medium text-green-600">{formatCurrency(marche.estimation)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Ville:</span>
                                                    <span className="font-medium">{marche.ville || '-'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Date rejet:</span>
                                                    <span className="font-medium">{formatDate(marche.updated_at)}</span>
                                                </div>
                                            </div>

                                            {marche.motif_rejet && (
                                                <div className="mt-3 rounded bg-red-50 p-2">
                                                    <p className="text-xs text-red-700">
                                                        <span className="font-medium">Motif:</span> {marche.motif_rejet}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg bg-white shadow-sm">
                                    <div className="border-b border-gray-200 px-6 py-4">
                                        <h2 className="text-lg font-semibold text-gray-900">Liste des Marchés Rejetés</h2>
                                        <p className="mt-1 text-sm text-gray-500">Cliquez sur une ligne pour voir les détails complets</p>
                                    </div>

                                    <div className="px-6 py-4">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead>
                                                    <tr className="bg-red-50">
                                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                            Référence
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                            Type AO
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                            Importance
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
                                                            Ville
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                            Motif de Rejet
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                            Date Rejet
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                    {filteredMarches.map((marche: MarchePublic, index: number) => (
                                                        <tr
                                                            key={marche.id}
                                                            className={`cursor-pointer transition-colors duration-200 ${
                                                                hoveredRow === index
                                                                    ? 'bg-red-50'
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
                                                                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                                                    <div
                                                                        className={`text-sm font-medium ${hoveredRow === index ? 'font-bold text-red-600' : 'text-red-600'}`}
                                                                    >
                                                                        {marche.n_reference || '-'}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">{marche.type_ao || '-'}</div>
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
                                                            <td className="px-4 py-4">
                                                                <div className="max-w-xs truncate text-sm text-gray-900" title={marche.objet}>
                                                                    {marche.objet || '-'}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">{marche.mo || '-'}</div>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {formatCurrency(marche.estimation)}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">{marche.ville || '-'}</div>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <div className="max-w-xs text-sm text-red-600" title={marche.motif_rejet}>
                                                                    {marche.motif_rejet ? (
                                                                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                                                            {marche.motif_rejet.length > 30
                                                                                ? `${marche.motif_rejet.substring(0, 30)}...`
                                                                                : marche.motif_rejet}
                                                                        </span>
                                                                    ) : (
                                                                        '-'
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">{formatDate(marche.updated_at)}</div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {filteredMarches.length > 0 && (
                                        <div className="border-t border-gray-200 bg-red-50 px-6 py-3">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-gray-500">
                                                    Affichage de {filteredMarches.length} marché{filteredMarches.length > 1 ? 's' : ''} rejeté
                                                    {filteredMarches.length > 1 ? 's' : ''}
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

                {/* Modal de détails */}
                {isModalOpen && selectedMarche && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <div className="bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity" onClick={closeModal}></div>

                            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-5xl">
                                <div className="bg-white px-6 py-6">
                                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                                        <div className="flex items-center">
                                            <XCircle className="mr-3 h-8 w-8 text-red-500" />
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">Marché Rejeté</h3>
                                                <p className="text-sm text-gray-500">Référence: {selectedMarche.n_reference}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={closeModal}
                                            className="rounded-md bg-white text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-red-500 focus:outline-none"
                                        >
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="mt-6 max-h-96 overflow-y-auto">
                                        {/* Motif de rejet en évidence */}
                                        {selectedMarche.motif_rejet && (
                                            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                                                <div className="flex items-start">
                                                    <AlertTriangle className="mr-3 h-5 w-5 flex-shrink-0 text-red-400" />
                                                    <div>
                                                        <h4 className="text-sm font-medium text-red-800">Motif du rejet</h4>
                                                        <p className="mt-1 text-sm text-red-700">{selectedMarche.motif_rejet}</p>
                                                        <p className="mt-2 text-xs text-red-600">
                                                            Rejeté le : {formatDate(selectedMarche.updated_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Détails complets du marché - même structure que EnCours */}
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
                                                    <dt className="text-sm font-medium text-gray-600">M.O</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedMarche.mo || '-'}</dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm font-medium text-gray-600">État</dt>
                                                    <dd className="mt-1">
                                                        <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                                                            Rejeté
                                                        </span>
                                                    </dd>
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
                                                    <dt className="text-sm font-medium text-gray-600">Date limite (initiale)</dt>
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
                                                <div>Rejeté le : {formatDate(selectedMarche.updated_at)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 bg-red-50 px-6 py-4">
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
            </div>
        </AppLayout>
    );
}
