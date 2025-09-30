import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';
import { CheckCircle, ChevronDown, ChevronUp, Clock, FileText, Filter, Grid3X3, List, Search, XCircle } from 'lucide-react';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUrgence, setFilterUrgence] = useState('tous');
    const [filterType, setFilterType] = useState('tous');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // États pour les dropdowns et l'affichage
    const [sectionStates, setSectionStates] = useState({
        decision_initial: { collapsed: false },
        preparation: { collapsed: false },
        pret_soumission: { collapsed: false },
    });
    const [tableView, setTableView] = useState(false);

    const toggleSection = (section: keyof typeof sectionStates) => {
        setSectionStates((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                collapsed: !prev[section].collapsed,
            },
        }));
    };

    const formatDate = (date: string | undefined | null): string => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('fr-FR');
    };

    const formatCurrency = (amount: number | string | undefined | null): string => {
        if (!amount) return '-';
        return new Intl.NumberFormat('fr-FR').format(Number(amount)) + ' DH';
    };

    const getUrgenceColor = (urgence: string | undefined) => {
        switch (urgence) {
            case 'faible':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'moyenne':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'elevee':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getImportanceColor = (importance: string | undefined) => {
        switch (importance) {
            case 'ao_important':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'ao_ouvert':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ao_simplifie':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'ao_restreint':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'ao_preselection':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'ao_bon_commande':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Filtrage et organisation des marchés par étapes
    const marchesFiltres = useMemo(() => {
        return marcheP.filter((marche) => {
            const matchesSearch =
                searchTerm === '' ||
                marche.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                marche.objet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                marche.maitre_ouvrage?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesUrgence = filterUrgence === 'tous' || marche.urgence === filterUrgence;
            const matchesType = filterType === 'tous' || marche.type_marche === filterType;

            return matchesSearch && matchesUrgence && matchesType;
        });
    }, [marcheP, searchTerm, filterUrgence, filterType]);

    const marchesByEtape = useMemo(() => {
        const decision_initial = marchesFiltres.filter((m) => m.etape === 'decision admin');
        const preparation = marchesFiltres.filter((m) => m.etape === 'preparation');
        const pret_soumission = marchesFiltres.filter((m) => m.etape === 'pret_soumission' || (m.etape === 'preparation' && m.statut === 'soumis'));

        return {
            decision_initial,
            preparation,
            pret_soumission,
        };
    }, [marchesFiltres]);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const openModal = (marche: MarchePublic) => {
        setSelectedMarche(marche);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedMarche(null);
        setIsModalOpen(false);
    };

    const handleAcceptMarche = async (marche: MarchePublic) => {
        setLoading(true);
        try {
            router.post(
                `/marches/${marche.id}/accept-initial`,
                {},
                {
                    onSuccess: () => {
                        showNotification('success', 'Marché accepté avec succès');
                        marche.etape = 'preparation';
                    },
                    onError: (errors) => {
                        showNotification('error', "Erreur lors de l'acceptation");
                    },
                    onFinish: () => setLoading(false),
                },
            );
        } catch (error) {
            showNotification('error', 'Une erreur inattendue est survenue');
            setLoading(false);
        }
    };

    const handleSoumettre = async (marche: MarchePublic) => {
        setLoading(true);
        try {
            router.post(
                `/marches/${marche.id}/soumettre`,
                {},
                {
                    onSuccess: () => {
                        showNotification('success', 'Marché soumis avec succès');
                        marche.etape = 'soumis';
                        marche.statut = 'soumis';
                    },
                    onError: (errors) => {
                        showNotification('error', 'Erreur lors de la soumission');
                    },
                    onFinish: () => setLoading(false),
                },
            );
        } catch (error) {
            showNotification('error', 'Une erreur inattendue est survenue');
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterUrgence('tous');
        setFilterType('tous');
    };

    const MarcheCard = ({ marche, actions }: { marche: MarchePublic; actions?: React.ReactNode }) => {
        const joursRestants = marche.date_limite_soumission
            ? Math.ceil((new Date(marche.date_limite_soumission).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : null;

        const isClickable = marche.etape === 'preparation';

        return (
            <div
                className={`rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md ${
                    isClickable ? 'cursor-pointer hover:border-blue-300' : ''
                }`}
                onClick={isClickable ? () => router.visit(`/marches-marketing/${marche.id}/dossiers`) : () => openModal(marche)}
            >
                <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-blue-600">{marche.reference || 'N/A'}</span>
                        {marche.importance && (
                            <span
                                className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getImportanceColor(marche.importance)}`}
                            >
                                {IMPORTANCE_LABELS[marche.importance]}
                            </span>
                        )}
                        {/* {isClickable && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                Cliquer pour gérer
                            </span>
                        )} */}
                    </div>
                    {marche.urgence && (
                        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getUrgenceColor(marche.urgence)}`}>
                            {URGENCE_LABELS[marche.urgence]}
                        </span>
                    )}
                </div>

                <h3 className="mb-3 line-clamp-2 text-sm font-medium text-gray-900">{marche.objet || 'Objet non spécifié'}</h3>

                <div className="mb-4 space-y-2 text-xs text-gray-600">
                    <div className="flex justify-between">
                        <span>M.O:</span>
                        <span className="ml-2 truncate font-medium">{marche.maitre_ouvrage || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium">{TYPE_MARCHE_LABELS[marche.type_marche as keyof typeof TYPE_MARCHE_LABELS] || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Budget:</span>
                        <span className="font-medium text-green-600">{marche.budget || '-'}</span>
                    </div>
                    {joursRestants !== null && (
                        <div className="flex justify-between">
                            <span>Délai:</span>
                            <span
                                className={`font-medium ${joursRestants < 7 ? 'text-red-600' : joursRestants < 15 ? 'text-orange-600' : 'text-green-600'}`}
                            >
                                {joursRestants > 0 ? `${joursRestants} jours` : 'Expiré'}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>Ville:</span>
                        <span className="font-medium">{marche.ville || '-'}</span>
                    </div>
                </div>

                {actions && (
                    <div className="border-t pt-3" onClick={(e) => e.stopPropagation()}>
                        {actions}
                    </div>
                )}
            </div>
        );
    };

    const MarcheTable = ({ marches, actions }: { marches: MarchePublic[]; actions?: (marche: MarchePublic) => React.ReactNode }) => {
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full rounded-lg border border-gray-200 bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Référence</th>
                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Objet</th>
                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">M.O</th>
                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Budget</th>
                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Délai</th>
                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Urgence</th>
                            {actions && <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {marches.map((marche) => {
                            const joursRestants = marche.date_limite_soumission
                                ? Math.ceil((new Date(marche.date_limite_soumission).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                                : null;

                            const isClickable = marche.etape === 'preparation';

                            return (
                                <tr
                                    key={marche.id}
                                    className={`hover:bg-gray-50 ${isClickable ? 'cursor-pointer' : ''}`}
                                    onClick={isClickable ? () => router.visit(`/marches-marketing/${marche.id}/dossiers`) : () => openModal(marche)}
                                >
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-blue-600">{marche.reference || 'N/A'}</span>
                                            {marche.importance && (
                                                <span
                                                    className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getImportanceColor(marche.importance)}`}
                                                >
                                                    {IMPORTANCE_LABELS[marche.importance]}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-900">{marche.objet || 'Objet non spécifié'}</td>
                                    <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-900">{marche.maitre_ouvrage || '-'}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-green-600">{marche.budget || '-'}</td>
                                    <td className="px-4 py-3 text-sm">
                                        {joursRestants !== null && (
                                            <span
                                                className={`font-medium ${joursRestants < 7 ? 'text-red-600' : joursRestants < 15 ? 'text-orange-600' : 'text-green-600'}`}
                                            >
                                                {joursRestants > 0 ? `${joursRestants} jours` : 'Expiré'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {marche.urgence && (
                                            <span
                                                className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getUrgenceColor(marche.urgence)}`}
                                            >
                                                {URGENCE_LABELS[marche.urgence]}
                                            </span>
                                        )}
                                    </td>
                                    {actions && (
                                        <td className="px-4 py-3 text-sm" onClick={(e) => e.stopPropagation()}>
                                            {actions(marche)}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    const SectionHeader = ({
        icon,
        title,
        count,
        sectionKey,
        color = 'text-gray-900',
        hint,
    }: {
        icon: React.ReactNode;
        title: string;
        count: number;
        sectionKey: keyof typeof sectionStates;
        color?: string;
        hint?: string;
    }) => (
        <div className="mb-4 flex items-center justify-between">
            <button
                onClick={() => toggleSection(sectionKey)}
                className="flex items-center gap-2 text-xl font-semibold transition-colors hover:text-blue-600"
            >
                {icon}
                <span className={color}>
                    {title} ({count})
                </span>
                {sectionStates[sectionKey].collapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
            </button>

            {hint && <div className="rounded-full bg-blue-50 px-3 py-1 text-sm text-gray-600">{hint}</div>}
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen bg-gray-50 py-8">
                {notification && (
                    <div
                        className={`fixed top-4 right-4 z-50 rounded-lg p-4 shadow-lg ${
                            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                    >
                        {notification.message}
                    </div>
                )}

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* En-tête */}
                    <div className="mb-8">
                        <div className="border-l-4 border-blue-600 pl-4">
                            <h1 className="text-3xl font-bold text-gray-900">Marchés en Cours</h1>
                            <p className="mt-1 text-gray-600">Suivi par étapes du processus d'appels d'offres</p>
                        </div>
                    </div>

                    {/* Filtres */}
                    <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
                        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Recherche</label>
                                <div className="relative">
                                    <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Référence, objet, M.O..."
                                        className="w-full rounded-md border border-gray-300 py-2 pr-3 pl-10 focus:border-blue-500 focus:ring-blue-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Affichage</label>
                                <button
                                    onClick={() => setTableView(!tableView)}
                                    className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                                    title={tableView ? 'Affichage en cartes' : 'Affichage en tableau'}
                                >
                                    {tableView ? (
                                        <>
                                            <Grid3X3 className="h-4 w-4" /> Cartes
                                        </>
                                    ) : (
                                        <>
                                            <List className="h-4 w-4" /> Tableau
                                        </>
                                    )}
                                </button>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Urgence</label>
                                <select
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                    value={filterUrgence}
                                    onChange={(e) => setFilterUrgence(e.target.value)}
                                >
                                    <option value="tous">Toutes</option>
                                    <option value="elevee">Élevée</option>
                                    <option value="moyenne">Moyenne</option>
                                    <option value="faible">Faible</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Type de marché</label>
                                <select
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    <option value="tous">Tous les types</option>
                                    <option value="etudes">Études</option>
                                    <option value="assistance_technique">Assistance technique</option>
                                    <option value="batiment">Bâtiment</option>
                                    <option value="voirie">Voirie</option>
                                    <option value="hydraulique">Hydraulique</option>
                                </select>
                            </div>

                            <div>
                                {(searchTerm || filterUrgence !== 'tous' || filterType !== 'tous') && (
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                                    >
                                        <Filter className="h-4 w-4" />
                                        Effacer filtres
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sections par étapes */}
                    <div className="space-y-8">
                        <div>
                            <SectionHeader
                                icon={<Clock className="h-5 w-5 text-orange-500" />}
                                title="Validation Initiale"
                                count={marchesByEtape.decision_initial.length}
                                sectionKey="decision_initial"
                            />

                            {!sectionStates.decision_initial.collapsed && (
                                <>
                                    {marchesByEtape.decision_initial.length === 0 ? (
                                        <div className="rounded-lg bg-white p-8 text-center">
                                            <Clock className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                            <p className="text-gray-500">Aucun marché en attente de validation administrative</p>
                                        </div>
                                    ) : tableView ? (
                                        <MarcheTable
                                            marches={marchesByEtape.decision_initial}
                                            // actions={(marche) => (
                                            //     <button
                                            //         onClick={() => handleAcceptMarche(marche)}
                                            //         disabled={loading}
                                            //         className="rounded-md bg-orange-600 px-3 py-1 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                                            //     >
                                            //         Accepter
                                            //     </button>
                                            // )}
                                        />
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {marchesByEtape.decision_initial.map((marche) => (
                                                <MarcheCard
                                                    key={marche.id}
                                                    marche={marche}
                                                    // actions={
                                                    //     <button
                                                    //         onClick={() => handleAcceptMarche(marche)}
                                                    //         disabled={loading}
                                                    //         className="w-full rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                                                    //     >
                                                    //         Accepter
                                                    //     </button>
                                                    // }
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Section Préparation */}
                        <div>
                            <SectionHeader
                                icon={<FileText className="h-5 w-5 text-blue-500" />}
                                title="Préparation des Dossiers"
                                count={marchesByEtape.preparation.length}
                                sectionKey="preparation"
                               
                            />

                            {!sectionStates.preparation.collapsed && (
                                <>
                                    {marchesByEtape.preparation.length === 0 ? (
                                        <div className="rounded-lg bg-white p-8 text-center">
                                            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                            <p className="text-gray-500">Aucun marché en préparation</p>
                                        </div>
                                    ) : tableView ? (
                                        <MarcheTable marches={marchesByEtape.preparation} />
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {marchesByEtape.preparation.map((marche) => (
                                                <MarcheCard key={marche.id} marche={marche} />
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Section Prêt à Soumettre */}
                        <div>
                            <SectionHeader
                                icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                                title="Prêt à Soumettre"
                                count={marchesByEtape.pret_soumission.length}
                                sectionKey="pret_soumission"
                            />

                            {!sectionStates.pret_soumission.collapsed && (
                                <>
                                    {marchesByEtape.pret_soumission.length === 0 ? (
                                        <div className="rounded-lg bg-white p-8 text-center">
                                            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                            <p className="text-gray-500">Aucun marché prêt à être soumis</p>
                                        </div>
                                    ) : tableView ? (
                                        <MarcheTable
                                            marches={marchesByEtape.pret_soumission}
                                            actions={(marche) => (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => router.visit(`/marches/${marche.id}/revision`)}
                                                        className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                                                    >
                                                        Réviser
                                                    </button>
                                                    <button
                                                        onClick={() => handleSoumettre(marche)}
                                                        disabled={loading}
                                                        className="rounded-md bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                                    >
                                                        Soumettre
                                                    </button>
                                                </div>
                                            )}
                                        />
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {marchesByEtape.pret_soumission.map((marche) => (
                                                <MarcheCard
                                                    key={marche.id}
                                                    marche={marche}
                                                    actions={
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => router.visit(`/marches/${marche.id}/revision`)}
                                                                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                                            >
                                                                Réviser
                                                            </button>
                                                            <button
                                                                onClick={() => handleSoumettre(marche)}
                                                                disabled={loading}
                                                                className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                                            >
                                                                Soumettre
                                                            </button>
                                                        </div>
                                                    }
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal détails (version simplifiée) */}
                {isModalOpen && selectedMarche && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <div className="bg-opacity-75 fixed inset-0 bg-gray-500" onClick={closeModal}></div>
                            <div className="relative max-h-96 w-full max-w-2xl overflow-y-auto rounded-lg bg-white">
                                <div className="p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="text-lg font-medium text-gray-900">{selectedMarche.reference} - Détails</h3>
                                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                            <XCircle className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <strong>Objet:</strong> {selectedMarche.objet || '-'}
                                        </div>
                                        <div>
                                            <strong>Maître d'ouvrage:</strong> {selectedMarche.maitre_ouvrage || '-'}
                                        </div>
                                        <div>
                                            <strong>Budget:</strong> {selectedMarche.budget || '-'}
                                        </div>
                                        <div>
                                            <strong>Caution:</strong> {formatCurrency(selectedMarche.caution_provisoire)}
                                        </div>
                                        <div>
                                            <strong>Date limite:</strong> {formatDate(selectedMarche.date_limite_soumission)}
                                        </div>
                                        <div>
                                            <strong>Ville:</strong> {selectedMarche.ville || '-'}
                                        </div>
                                        <div>
                                            <strong>Étape actuelle:</strong> {selectedMarche.etape || '-'}
                                        </div>
                                        <div>
                                            <strong>Type:</strong>{' '}
                                            {TYPE_MARCHE_LABELS[selectedMarche.type_marche as keyof typeof TYPE_MARCHE_LABELS] || '-'}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <button onClick={closeModal} className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400">
                                            Fermer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
