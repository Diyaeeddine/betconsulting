import React, { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { 
    PlayIcon, 
    PauseIcon, 
    DownloadIcon, 
    RefreshCcwIcon,
    SearchIcon,
    FilterIcon,
    FileTextIcon,
    DatabaseIcon,
    AlertCircleIcon,
    CheckCircleIcon,
    ClockIcon,
    TrashIcon,
    EyeIcon,
    ExternalLinkIcon
} from 'lucide-react';

// Types
interface MarchePublic {
    id: number;
    type_procedure: string;
    detail_procedure: string;
    categorie: string;
    date_publication: string;
    reference: string;
    objet: string;
    objet_complet: string;
    acheteur_public: string;
    lieu_execution: string;
    lieu_execution_complet: string;
    lien_detail_lots: string;
    date_limite: string;
    type_reponse_electronique: string;
    lien_consultation: string;
    ref_consultation_id: string;
    extracted_at: string;
    row_index: number;
    storage_link_csv: string;
    storage_link_json: string;
    EXTRACTED_FILES: string[];
    chemin_zip: string;
}

interface PaginatedData {
    data: MarchePublic[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Stats {
    total: number;
    with_files: number;
    recent: number;
}

interface ScriptStatus {
    is_running: boolean;
    process_count: number;
    last_update: string | null;
    files_exist: {
        json: boolean;
        csv: boolean;
    };
}

const MarchePublic: React.FC = () => {
    // Breadcrumbs
    const breadcrumbs = [
        {
            title: 'Dashboard Ressources Humaines - Marchés Publics',
            href: '/ressources-humaines/marche-public-page',
        },
    ];
    // États
    const [data, setData] = useState<PaginatedData | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(false);
    const [scriptRunning, setScriptRunning] = useState(false);
    const [scriptStatus, setScriptStatus] = useState<ScriptStatus | null>(null);
    const [filters, setFilters] = useState({
        search: '',
        categorie: '',
        type_procedure: '',
        date_from: '',
        date_to: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [sortField, setSortField] = useState('extracted_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedMarche, setSelectedMarche] = useState<MarchePublic | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    // Charger les données au montage
    useEffect(() => {
        loadData();
        checkScriptStatus();
        
        // Vérifier le statut du script toutes les 5 secondes
        const statusInterval = setInterval(checkScriptStatus, 5000);
        
        return () => clearInterval(statusInterval);
    }, []);

    // Recharger les données quand les filtres changent
    useEffect(() => {
        const debounce = setTimeout(() => {
            setCurrentPage(1);
            loadData();
        }, 300);
        
        return () => clearTimeout(debounce);
    }, [filters, sortField, sortDirection, perPage]);

    // Charger les données quand la page change
    useEffect(() => {
        loadData();
    }, [currentPage]);

    const loadData = async () => {
        try {
            setLoading(true);
            
            const params = new URLSearchParams({
                page: currentPage.toString(),
                per_page: perPage.toString(),
                sort_field: sortField,
                sort_direction: sortDirection,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value !== '')
                )
            });

            const response = await axios.get(`/ressources-humaines/marche-public?${params}`);
            
            if (response.data.success) {
                setData(response.data.data);
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkScriptStatus = async () => {
        try {
            const response = await axios.get('/ressources-humaines/marche-public/status');
            if (response.data.success) {
                setScriptStatus(response.data);
                setScriptRunning(response.data.is_running);
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du statut:', error);
        }
    };

    const runScript = async () => {
        if (scriptRunning) return;

        try {
            setScriptRunning(true);
            
            // Utiliser la route GET au lieu de POST
            const response = await axios.get('/ressources-humaines/fetch-marche-public');
            
            if (response.data.success) {
                alert('Script exécuté avec succès! Les données ont été mises à jour.');
                loadData();
            } else {
                alert(`Erreur: ${response.data.message}`);
            }
        } catch (error: any) {
            console.error('Erreur lors de l\'exécution du script:', error);
            alert(`Erreur: ${error.response?.data?.message || 'Erreur inconnue'}`);
        } finally {
            setScriptRunning(false);
        }
    };

    const downloadFile = async (type: 'csv' | 'json') => {
        try {
            const url = `/ressources-humaines/marche-public/download-${type}`;
            window.open(url, '_blank');
        } catch (error) {
            console.error(`Erreur lors du téléchargement ${type}:`, error);
            alert(`Erreur lors du téléchargement du fichier ${type.toUpperCase()}`);
        }
    };

    const deleteMarche = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce marché public?')) {
            return;
        }

        try {
            const response = await axios.delete(`/ressources-humaines/marche-public/${id}`);
            
            if (response.data.success) {
                alert('Marché public supprimé avec succès');
                loadData();
            }
        } catch (error: any) {
            console.error('Erreur lors de la suppression:', error);
            alert(`Erreur: ${error.response?.data?.message || 'Erreur inconnue'}`);
        }
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const resetFilters = () => {
        setFilters({
            search: '',
            categorie: '',
            type_procedure: '',
            date_from: '',
            date_to: ''
        });
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('fr-FR');
        } catch {
            return dateString;
        }
    };

    const formatDateTime = (dateTimeString: string) => {
        if (!dateTimeString) return '-';
        try {
            return new Date(dateTimeString).toLocaleString('fr-FR');
        } catch {
            return dateTimeString;
        }
    };

    const truncateText = (text: string, maxLength: number = 100) => {
        if (!text) return '-';
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Ressources Humaines - Bon Commande" />
            
            <div className="min-h-screen bg-gray-50">
                {/* En-tête */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Marchés Publics - Playwright
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Extraction automatisée avec Playwright
                                </p>
                            </div>
                            
                            {/* Statut du script */}
                            <div className="flex items-center space-x-4">
                                {scriptStatus && (
                                    <div className="flex items-center space-x-2">
                                        {scriptRunning ? (
                                            <>
                                                <ClockIcon className="h-5 w-5 text-yellow-500 animate-spin" />
                                                <span className="text-yellow-600 font-medium">
                                                    Script en cours...
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                                <span className="text-green-600 font-medium">
                                                    Prêt
                                                </span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistiques */}
                {stats && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <DatabaseIcon className="h-8 w-8 text-blue-500" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            Total des marchés
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {stats.total}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <FileTextIcon className="h-8 w-8 text-green-500" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            Avec fichiers
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {stats.with_files}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <ClockIcon className="h-8 w-8 text-purple-500" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            Récents (7j)
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {stats.recent}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions principales */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={runScript}
                                    disabled={scriptRunning}
                                    className={`inline-flex items-center px-4 py-2 rounded-lg font-medium ${
                                        scriptRunning
                                            ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    {scriptRunning ? (
                                        <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <PlayIcon className="h-4 w-4 mr-2" />
                                    )}
                                    {scriptRunning ? 'Extraction en cours...' : 'Lancer l\'extraction'}
                                </button>
                                
                                <button
                                    onClick={loadData}
                                    disabled={loading}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <RefreshCcwIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                    Actualiser
                                </button>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                {scriptStatus?.files_exist.csv && (
                                    <button
                                        onClick={() => downloadFile('csv')}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <DownloadIcon className="h-4 w-4 mr-2" />
                                        CSV
                                    </button>
                                )}
                                
                                {scriptStatus?.files_exist.json && (
                                    <button
                                        onClick={() => downloadFile('json')}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <DownloadIcon className="h-4 w-4 mr-2" />
                                        JSON
                                    </button>
                                )}
                                
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`inline-flex items-center px-4 py-2 rounded-lg font-medium ${
                                        showFilters
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                    }`}
                                >
                                    <FilterIcon className="h-4 w-4 mr-2" />
                                    Filtres
                                </button>
                            </div>
                        </div>
                        
                        {/* Informations du dernier update */}
                        {scriptStatus?.last_update && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    <strong>Dernière mise à jour:</strong> {formatDateTime(scriptStatus.last_update)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filtres */}
                {showFilters && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Recherche
                                    </label>
                                    <div className="relative">
                                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={filters.search}
                                            onChange={(e) => setFilters({...filters, search: e.target.value})}
                                            placeholder="Référence, objet, acheteur..."
                                            className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Catégorie
                                    </label>
                                    <input
                                        type="text"
                                        value={filters.categorie}
                                        onChange={(e) => setFilters({...filters, categorie: e.target.value})}
                                        placeholder="Catégorie..."
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type de procédure
                                    </label>
                                    <input
                                        type="text"
                                        value={filters.type_procedure}
                                        onChange={(e) => setFilters({...filters, type_procedure: e.target.value})}
                                        placeholder="Type de procédure..."
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date de publication (de)
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.date_from}
                                        onChange={(e) => setFilters({...filters, date_from: e.target.value})}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date de publication (à)
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.date_to}
                                        onChange={(e) => setFilters({...filters, date_to: e.target.value})}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div className="flex items-end">
                                    <button
                                        onClick={resetFilters}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Réinitialiser
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tableau des données */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center">
                                <RefreshCcwIcon className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
                                <p className="text-gray-600">Chargement des données...</p>
                            </div>
                        ) : data && data.data.length > 0 ? (
                            <>
                                {/* Controls de pagination en haut */}
                                <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-gray-700">
                                            {data.total} résultat(s) au total
                                        </span>
                                        <select
                                            value={perPage}
                                            onChange={(e) => setPerPage(Number(e.target.value))}
                                            className="text-sm border border-gray-300 rounded px-2 py-1"
                                        >
                                            <option value={10}>10 par page</option>
                                            <option value={15}>15 par page</option>
                                            <option value={25}>25 par page</option>
                                            <option value={50}>50 par page</option>
                                        </select>
                                    </div>
                                    
                                    {/* Pagination */}
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Précédent
                                        </button>
                                        
                                        <span className="text-sm text-gray-600">
                                            Page {currentPage} sur {data.last_page}
                                        </span>
                                        
                                        <button
                                            onClick={() => setCurrentPage(Math.min(data.last_page, currentPage + 1))}
                                            disabled={currentPage === data.last_page}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Suivant
                                        </button>
                                    </div>
                                </div>

                                {/* Tableau responsive */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th 
                                                    scope="col" 
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('reference')}
                                                >
                                                    Référence
                                                    {sortField === 'reference' && (
                                                        <span className="ml-1">
                                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                                        </span>
                                                    )}
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('objet')}
                                                >
                                                    Objet
                                                    {sortField === 'objet' && (
                                                        <span className="ml-1">
                                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                                        </span>
                                                    )}
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('acheteur_public')}
                                                >
                                                    Acheteur public
                                                    {sortField === 'acheteur_public' && (
                                                        <span className="ml-1">
                                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                                        </span>
                                                    )}
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('date_publication')}
                                                >
                                                    Date publication
                                                    {sortField === 'date_publication' && (
                                                        <span className="ml-1">
                                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                                        </span>
                                                    )}
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('date_limite')}
                                                >
                                                    Date limite
                                                    {sortField === 'date_limite' && (
                                                        <span className="ml-1">
                                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                                        </span>
                                                    )}
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Fichiers
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {data.data.map((marche) => (
                                                <tr key={marche.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {marche.reference}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {marche.type_procedure}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 max-w-xs">
                                                            {truncateText(marche.objet, 80)}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {marche.categorie}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 max-w-xs">
                                                            {truncateText(marche.acheteur_public, 60)}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {truncateText(marche.lieu_execution, 40)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDate(marche.date_publication)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDate(marche.date_limite)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center space-x-2">
                                                            {marche.chemin_zip && (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                    ZIP
                                                                </span>
                                                            )}
                                                            {marche.EXTRACTED_FILES && marche.EXTRACTED_FILES.length > 0 && (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    {marche.EXTRACTED_FILES.length} fichier(s)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedMarche(marche);
                                                                    setShowDetails(true);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-900"
                                                                title="Voir les détails"
                                                            >
                                                                <EyeIcon className="h-4 w-4" />
                                                            </button>
                                                            
                                                            {marche.lien_consultation && (
                                                                <a
                                                                    href={marche.lien_consultation}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-green-600 hover:text-green-900"
                                                                    title="Ouvrir la consultation"
                                                                >
                                                                    <ExternalLinkIcon className="h-4 w-4" />
                                                                </a>
                                                            )}
                                                            
                                                            <button
                                                                onClick={() => deleteMarche(marche.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Supprimer"
                                                            >
                                                                <TrashIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination en bas */}
                                <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Affichage de {((currentPage - 1) * perPage) + 1} à {Math.min(currentPage * perPage, data.total)} sur {data.total} résultats
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Premier
                                        </button>
                                        
                                        <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Précédent
                                        </button>
                                        
                                        {/* Pages numérotées */}
                                        {Array.from({ length: Math.min(5, data.last_page) }, (_, i) => {
                                            const pageNum = Math.max(1, Math.min(data.last_page - 4, currentPage - 2)) + i;
                                            if (pageNum <= data.last_page) {
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`px-3 py-1 text-sm border rounded ${
                                                            pageNum === currentPage
                                                                ? 'bg-blue-500 text-white border-blue-500'
                                                                : 'border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            }
                                            return null;
                                        })}
                                        
                                        <button
                                            onClick={() => setCurrentPage(Math.min(data.last_page, currentPage + 1))}
                                            disabled={currentPage === data.last_page}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Suivant
                                        </button>
                                        
                                        <button
                                            onClick={() => setCurrentPage(data.last_page)}
                                            disabled={currentPage === data.last_page}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Dernier
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-8 text-center">
                                <AlertCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Aucun marché public trouvé
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Lancez une extraction ou modifiez vos critères de recherche.
                                </p>
                                <button
                                    onClick={runScript}
                                    disabled={scriptRunning}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <PlayIcon className="h-4 w-4 mr-2" />
                                    Lancer une extraction
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal des détails */}
                {showDetails && selectedMarche && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Détails du marché public
                                    </h2>
                                    <button
                                        onClick={() => setShowDetails(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            Informations générales
                                        </h3>
                                        <dl className="space-y-3">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Référence</dt>
                                                <dd className="text-sm text-gray-900">{selectedMarche.reference}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Type de procédure</dt>
                                                <dd className="text-sm text-gray-900">{selectedMarche.type_procedure}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Détail procédure</dt>
                                                <dd className="text-sm text-gray-900">{selectedMarche.detail_procedure || '-'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Catégorie</dt>
                                                <dd className="text-sm text-gray-900">{selectedMarche.categorie || '-'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Date de publication</dt>
                                                <dd className="text-sm text-gray-900">{formatDate(selectedMarche.date_publication)}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Date limite</dt>
                                                <dd className="text-sm text-gray-900">{formatDate(selectedMarche.date_limite)}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            Détails du marché
                                        </h3>
                                        <dl className="space-y-3">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Objet</dt>
                                                <dd className="text-sm text-gray-900">{selectedMarche.objet}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Objet complet</dt>
                                                <dd className="text-sm text-gray-900 max-h-32 overflow-y-auto">
                                                    {selectedMarche.objet_complet}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Acheteur public</dt>
                                                <dd className="text-sm text-gray-900">{selectedMarche.acheteur_public}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Lieu d'exécution</dt>
                                                <dd className="text-sm text-gray-900">{selectedMarche.lieu_execution}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Lieu complet</dt>
                                                <dd className="text-sm text-gray-900">{selectedMarche.lieu_execution_complet}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                                
                                {/* Fichiers extraits */}
                                {selectedMarche.EXTRACTED_FILES && selectedMarche.EXTRACTED_FILES.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            Fichiers extraits ({selectedMarche.EXTRACTED_FILES.length})
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                                            {selectedMarche.EXTRACTED_FILES.map((file, index) => (
                                                <div key={index} className="flex items-center p-2 bg-gray-50 rounded text-sm">
                                                    <FileTextIcon className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                                                    <span className="truncate" title={file}>
                                                        {file.split('/').pop()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Liens */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Liens
                                    </h3>
                                    <div className="space-y-2">
                                        {selectedMarche.lien_consultation && (
                                            <a
                                                href={selectedMarche.lien_consultation}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-blue-600 hover:text-blue-800"
                                            >
                                                <ExternalLinkIcon className="h-4 w-4 mr-2" />
                                                Lien de consultation
                                            </a>
                                        )}
                                        {selectedMarche.lien_detail_lots && (
                                            <a
                                                href={selectedMarche.lien_detail_lots}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-blue-600 hover:text-blue-800 ml-4"
                                            >
                                                <ExternalLinkIcon className="h-4 w-4 mr-2" />
                                                Détail des lots
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default MarchePublic;