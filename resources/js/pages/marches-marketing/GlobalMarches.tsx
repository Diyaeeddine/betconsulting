import React, { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import axios from 'axios';

const breadcrumbs = [
    {
        title: 'Dashboard marches-marketing & Appels d\'Offres',
        href: '/marches-marketing/global-marches',
    },
];

type AppelOffer = {
    id: number;
    reference?: string | null;
    maitre_ouvrage?: string | null;
    pv?: string | null;
    date_ouverture?: string | null;
    budget?: string | null;
    lien_dao?: string | null;
    lien_pv?: string | null;
    dao?: string | null;
    date_adjudications?: string | null;
    ville?: string | null;
    montant?: string | null;
    objet?: string | null;
    adjudicataire?: string | null;
    date_affichage?: string | null;
    chemin_fichiers?: string[] | null;
};

interface ApiResponse {
    success: boolean;
    message: string;
    recordCount?: number;
    hasNewData?: boolean;
}

interface ImportData {
    available: boolean;
    count?: number;
    lastModified?: string;
    preview?: any[];
    message?: string;
    fileTimestamp?: number;
}

interface ImportResult {
    success: boolean;
    message: string;
    stats?: {
        imported: number;
        updated: number;
        total: number;
        errors: number;
    };
    errors?: string[];
}

interface FilterOptions {
    maitresOuvrage: string[];
    villes: string[];
    adjudicataires: string[];
    dateRanges: {
        ouverture: { min: string; max: string };
        adjudication: { min: string; max: string };
        affichage: { min: string; max: string };
    };
}

export default function AppelOffer() {
    const [appelOffres, setAppelOffres] = useState<AppelOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [daoFiles, setDaoFiles] = useState<{ name: string; path: string }[]>([]);
    const [showDaoFiles, setShowDaoFiles] = useState(false);
    const [currentZip, setCurrentZip] = useState<string | null>(null);
    const [loadingDao, setLoadingDao] = useState(false);

    // Enhanced filters
    const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
    const [filters, setFilters] = useState({
        maitre_ouvrage: '',
        ville: '',
        adjudicataire: '',
        reference: '',
        budget_min: '',
        budget_max: '',
        montant_min: '',
        montant_max: '',
        date_ouverture_from: '',
        date_ouverture_to: '',
        date_adjudication_from: '',
        date_adjudication_to: '',
        objet: ''
    });

    // États pour le scraping et l'import
    const [refreshing, setRefreshing] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importData, setImportData] = useState<ImportData | null>(null);
    const [importing, setImporting] = useState(false);

    const fetchAppelOffres = async () => {
        try {
            setError(null);
            const response = await axios.get('/marches-marketing/appel-offers-data');
            setAppelOffres(response.data);
        } catch (err: any) {
            console.error('Error fetching appel offres:', err);
            setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const fetchFilterOptions = async () => {
        try {
            console.log('Fetching filter options...');
            const response = await axios.get('/marches-marketing/get-filter-options');
            console.log('Filter options response:', response.data);
            setFilterOptions(response.data);
        } catch (err: any) {
            console.error('Error fetching filter options:', err);
            // Don't show error to user for filter options, just log it
            // We can work without filter options, just won't have dropdowns populated
        }
    };

    const checkForAvailableImports = async (showErrorIfNone = false) => {
        try {
            console.log('Checking for available imports...');
            const response = await axios.get('/marches-marketing/check-available-imports');
            const data: ImportData = response.data;
            
            console.log('Import check response:', data);
            
            if (data.available) {
                setImportData(data);
                setShowImportModal(true);
                if (showErrorIfNone) {
                    setSuccessMessage(`${data.count} nouveaux résultats trouvés et prêts à importer!`);
                }
            } else {
                if (showErrorIfNone) {
                    setSuccessMessage(data.message || 'Aucune nouvelle donnée à importer');
                }
                console.log('No new imports available:', data.message);
            }
        } catch (err: any) {
            console.error('Error checking imports:', err);
            
            let errorMessage = 'Erreur lors de la vérification des imports';
            
            if (err.response) {
                // Server responded with error status
                console.error('Server error response:', err.response.data);
                errorMessage = err.response.data?.message || `Erreur serveur: ${err.response.status}`;
            } else if (err.request) {
                // Request made but no response
                console.error('No response received:', err.request);
                errorMessage = 'Pas de réponse du serveur';
            } else {
                // Error in request setup
                console.error('Request setup error:', err.message);
                errorMessage = err.message;
            }
            
            if (showErrorIfNone) {
                setError(errorMessage);
            }
        }
    };

    useEffect(() => {
        fetchAppelOffres();
        fetchFilterOptions();
        // Check for available imports on load
        checkForAvailableImports();
    }, []);

    // Clear messages after some time
    useEffect(() => {
        if (successMessage || error) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                setError(null);
            }, 7000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, error]);

    const formatDate = (dateString?: string | null): string => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('fr-FR');
        } catch {
            return dateString;
        }
    };

    const formatCurrency = (amount?: string | null): string => {
        if (!amount) return '';
        return amount.includes('DH') ? amount : `${amount} DH`;
    };

    const parseNumericValue = (value: string): number => {
        return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
    };

    const filteredAppelOffres = appelOffres.filter((ao) => {
        // Text filters
        const matchMaitreOuvrage = !filters.maitre_ouvrage || 
            (ao.maitre_ouvrage || '').toLowerCase().includes(filters.maitre_ouvrage.toLowerCase());

        const matchVille = !filters.ville || 
            (ao.ville || '').toLowerCase().includes(filters.ville.toLowerCase());

        const matchAdjudicataire = !filters.adjudicataire || 
            (ao.adjudicataire || '').toLowerCase().includes(filters.adjudicataire.toLowerCase());

        const matchReference = !filters.reference || 
            (ao.reference || '').toLowerCase().includes(filters.reference.toLowerCase());

        const matchObjet = !filters.objet || 
            (ao.objet || '').toLowerCase().includes(filters.objet.toLowerCase());

        // Numeric filters for budget
        let matchBudget = true;
        if (filters.budget_min || filters.budget_max) {
            const budget = parseNumericValue(ao.budget || '0');
            if (filters.budget_min && budget < parseNumericValue(filters.budget_min)) matchBudget = false;
            if (filters.budget_max && budget > parseNumericValue(filters.budget_max)) matchBudget = false;
        }

        // Numeric filters for montant
        let matchMontant = true;
        if (filters.montant_min || filters.montant_max) {
            const montant = parseNumericValue(ao.montant || '0');
            if (filters.montant_min && montant < parseNumericValue(filters.montant_min)) matchMontant = false;
            if (filters.montant_max && montant > parseNumericValue(filters.montant_max)) matchMontant = false;
        }

        // Date filters for ouverture
        let matchDateOuverture = true;
        if (filters.date_ouverture_from || filters.date_ouverture_to) {
            const dateOuverture = ao.date_ouverture ? new Date(ao.date_ouverture) : null;
            if (filters.date_ouverture_from && dateOuverture && dateOuverture < new Date(filters.date_ouverture_from)) {
                matchDateOuverture = false;
            }
            if (filters.date_ouverture_to && dateOuverture && dateOuverture > new Date(filters.date_ouverture_to)) {
                matchDateOuverture = false;
            }
        }

        // Date filters for adjudication
        let matchDateAdjudication = true;
        if (filters.date_adjudication_from || filters.date_adjudication_to) {
            const dateAdjudication = ao.date_adjudications ? new Date(ao.date_adjudications) : null;
            if (filters.date_adjudication_from && dateAdjudication && dateAdjudication < new Date(filters.date_adjudication_from)) {
                matchDateAdjudication = false;
            }
            if (filters.date_adjudication_to && dateAdjudication && dateAdjudication > new Date(filters.date_adjudication_to)) {
                matchDateAdjudication = false;
            }
        }

        return matchMaitreOuvrage && matchVille && matchAdjudicataire && matchReference && 
               matchObjet && matchBudget && matchMontant && matchDateOuverture && matchDateAdjudication;
    });

    const handleOpenDao = async (zipUrl: string) => {
        setLoadingDao(true);
        try {
            const response = await axios.get('/marches-marketing/list-dao-files', {
                params: { zipPath: zipUrl }
            });
            setDaoFiles(response.data);
            setCurrentZip(zipUrl);
            setShowDaoFiles(true);
        } catch (err: any) {
            console.error('Error loading DAO files:', err);
            setError('Erreur lors du chargement des fichiers DAO');
        } finally {
            setLoadingDao(false);
        }
    };

    const handleDownloadFile = (filePath: string) => {
        if (!currentZip) return;
        const params = new URLSearchParams({ zipPath: currentZip, filePath });
        window.open(`/marches-marketing/download-dao-file?${params.toString()}`, '_blank');
    };

    const handleScrapeData = async () => {
        setRefreshing(true);
        setError(null);
        setSuccessMessage(null);

        try {
            console.log('Starting selenium scraping...');
            const response = await axios.get('/marches-marketing/fetch-resultats-offres', {
                timeout: 300000 // 5 minutes timeout
            });

            const data: ApiResponse = response.data;
            
            if (data.success) {
                setSuccessMessage(data.message);
                
                // If scraping found new data, show import modal after a short delay
                if (data.hasNewData && data.recordCount && data.recordCount > 0) {
                    setTimeout(() => checkForAvailableImports(), 1500);
                }
            } else {
                setError(data.message);
            }
        } catch (err: any) {
            console.error('Error during scraping:', err);
            
            if (err.code === 'ECONNABORTED') {
                setError('Le processus de scraping a pris trop de temps. Veuillez réessayer plus tard.');
            } else if (err.response?.status === 423) {
                setError('Un scraping est déjà en cours. Veuillez attendre quelques minutes.');
            } else {
                setError(err.response?.data?.message || 'Erreur lors du scraping des données');
            }
        } finally {
            setRefreshing(false);
        }
    };

    const handleImportData = async () => {
        setImporting(true);
        setError(null);

        try {
            const response = await axios.post('/marches-marketing/import-scraped-data');
            const result: ImportResult = response.data;

            if (result.success) {
                const stats = result.stats;
                let message = result.message;
                
                if (stats) {
                    message += ` - ${stats.imported} nouveaux, ${stats.updated} mis à jour`;
                    if (stats.errors > 0) {
                        message += `, ${stats.errors} erreurs`;
                    }
                }
                
                setSuccessMessage(message);
                setShowImportModal(false);
                setImportData(null);
                
                // Refresh the data
                await fetchAppelOffres();
                await fetchFilterOptions(); // Refresh filter options
                
                // Show errors if any
                if (result.errors && result.errors.length > 0) {
                    console.warn('Import errors:', result.errors);
                }
                
            } else {
                setError(result.message);
            }
        } catch (err: any) {
            console.error('Error during import:', err);
            setError(err.response?.data?.message || 'Erreur lors de l\'import des données');
        } finally {
            setImporting(false);
        }
    };

    const updateFilter = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            maitre_ouvrage: '',
            ville: '',
            adjudicataire: '',
            reference: '',
            budget_min: '',
            budget_max: '',
            montant_min: '',
            montant_max: '',
            date_ouverture_from: '',
            date_ouverture_to: '',
            date_adjudication_from: '',
            date_adjudication_to: '',
            objet: ''
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Ressources Humaines - Appels d'Offres" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                    
                    {/* Header Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Résultats des Appels d'Offres
                                </h1>
                                <p className="text-gray-600 text-lg">
                                    Gestion et suivi des appels d'offres publics
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => checkForAvailableImports(true)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-sm transition-colors duration-200 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Vérifier les imports
                                </button>
                                <button
                                    onClick={handleScrapeData}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-sm transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={refreshing}
                                >
                                    {refreshing ? (
                                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    )}
                                    {refreshing ? 'Scraping en cours...' : 'Lancer le Scraping'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Success/Error Messages */}
                    {successMessage && (
                        <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                        <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-emerald-800 font-semibold">Succès</h3>
                                        <p className="text-emerald-700">{successMessage}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSuccessMessage(null)}
                                    className="text-emerald-500 hover:text-emerald-700 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-red-800 font-semibold">Erreur</h3>
                                        <p className="text-red-700">{error}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setError(null)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Import Modal */}
                    {showImportModal && importData && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            <h3 className="text-2xl font-bold">Nouveaux Résultats Disponibles</h3>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setShowImportModal(false);
                                                setImportData(null);
                                            }}
                                            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
                                            disabled={importing}
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-8 overflow-y-auto max-h-[60vh] space-y-6">
                                    {/* Stats Section */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                                            <div className="text-4xl font-bold text-blue-600 mb-2">{importData.count}</div>
                                            <div className="text-blue-600 font-medium">Nouveaux résultats</div>
                                        </div>
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                                            <div className="text-sm font-medium text-emerald-600 mb-1">Dernière mise à jour</div>
                                            <div className="text-sm text-emerald-500">{importData.lastModified}</div>
                                        </div>
                                    </div>

                                    {/* Preview Section */}
                                    {importData.preview && importData.preview.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                Aperçu des données ({importData.preview.length} premiers résultats)
                                            </h4>
                                            <div className="space-y-4 max-h-64 overflow-y-auto bg-gray-50 rounded-xl p-6">
                                                {importData.preview.map((item, index) => (
                                                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                                        <div className="space-y-2">
                                                            <div className="flex items-start gap-3">
                                                                <span className="font-semibold text-blue-600 text-sm min-w-[80px]">Référence:</span>
                                                                <span className="text-gray-700 text-sm">{item.Référence || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex items-start gap-3">
                                                                <span className="font-semibold text-emerald-600 text-sm min-w-[80px]">Maître:</span>
                                                                <span className="text-gray-700 text-sm line-clamp-1">{item["Maitre d'ouvrage"] || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex items-start gap-3">
                                                                <span className="font-semibold text-purple-600 text-sm min-w-[80px]">Objet:</span>
                                                                <span className="text-gray-700 text-sm line-clamp-2">{(item.Objet || 'N/A').substring(0, 100)}...</span>
                                                            </div>
                                                            <div className="flex items-start gap-3">
                                                                <span className="font-semibold text-orange-600 text-sm min-w-[80px]">Ville:</span>
                                                                <span className="text-gray-700 text-sm">{item.Ville || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex gap-4 justify-end">
                                    <button
                                        onClick={() => {
                                            setShowImportModal(false);
                                            setImportData(null);
                                        }}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm"
                                        disabled={importing}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleImportData}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 transition-all shadow-sm"
                                        disabled={importing}
                                    >
                                        {importing && (
                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                            </svg>
                                        )}
                                        {importing ? 'Import en cours...' : 'Importer vers la base de données'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Filter Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                                </svg>
                                <h3 className="text-xl font-semibold text-gray-800">Filtres de Recherche</h3>
                            </div>
                            <button
                                onClick={clearFilters}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Effacer tous les filtres
                            </button>
                        </div>
                        
                        {/* Basic Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Maître d'Ouvrage</label>
                                <select
                                    value={filters.maitre_ouvrage}
                                    onChange={(e) => updateFilter('maitre_ouvrage', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900"
                                >
                                    <option value="">Tous les maîtres d'ouvrage</option>
                                    {filterOptions?.maitresOuvrage.map((mo, i) => (
                                        <option key={i} value={mo}>{mo}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Ville</label>
                                <select
                                    value={filters.ville}
                                    onChange={(e) => updateFilter('ville', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900"
                                >
                                    <option value="">Toutes les villes</option>
                                    {filterOptions?.villes.map((ville, i) => (
                                        <option key={i} value={ville}>{ville}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Adjudicataire</label>
                                <select
                                    value={filters.adjudicataire}
                                    onChange={(e) => updateFilter('adjudicataire', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900"
                                >
                                    <option value="">Tous les adjudicataires</option>
                                    {filterOptions?.adjudicataires.map((adj, i) => (
                                        <option key={i} value={adj}>{adj}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Référence</label>
                                <input
                                    type="text"
                                    value={filters.reference}
                                    onChange={(e) => updateFilter('reference', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    placeholder="Rechercher par référence..."
                                />
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2">Budget (DH)</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="number"
                                        value={filters.budget_min}
                                        onChange={(e) => updateFilter('budget_min', e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                        placeholder="Min"
                                    />
                                    <input
                                        type="number"
                                        value={filters.budget_max}
                                        onChange={(e) => updateFilter('budget_max', e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                        placeholder="Max"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2">Montant (DH)</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="number"
                                        value={filters.montant_min}
                                        onChange={(e) => updateFilter('montant_min', e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                        placeholder="Min"
                                    />
                                    <input
                                        type="number"
                                        value={filters.montant_max}
                                        onChange={(e) => updateFilter('montant_max', e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                        placeholder="Max"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2">Date d'Ouverture</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="date"
                                        value={filters.date_ouverture_from}
                                        onChange={(e) => updateFilter('date_ouverture_from', e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                    />
                                    <input
                                        type="date"
                                        value={filters.date_ouverture_to}
                                        onChange={(e) => updateFilter('date_ouverture_to', e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Object Search and Results */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Objet de l'appel d'offre</label>
                                <input
                                    type="text"
                                    value={filters.objet}
                                    onChange={(e) => updateFilter('objet', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    placeholder="Rechercher dans l'objet de l'appel d'offre..."
                                />
                            </div>

                            <div className="flex items-end">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 w-full text-center">
                                    <div className="text-3xl font-bold text-blue-600 mb-1">{filteredAppelOffres.length}</div>
                                    <div className="text-blue-600 font-medium text-sm">Résultats trouvés</div>
                                    <div className="text-gray-500 text-xs mt-1">sur {appelOffres.length} total</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="relative">
                                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-gray-800">Chargement en cours</h3>
                                    <p className="text-gray-600">Récupération des appels d'offres...</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results Section */}
                    {!loading && filteredAppelOffres.length > 0 && (
                        <div className="space-y-6">
                            {/* Results Header */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-blue-700 font-medium text-center">
                                    <span className="font-bold">{filteredAppelOffres.length}</span> résultat(s) trouvé(s) 
                                    {appelOffres.length !== filteredAppelOffres.length && (
                                        <span> sur <span className="font-bold">{appelOffres.length}</span> total</span>
                                    )}
                                </p>
                            </div>

                            {/* Results List */}
                            {filteredAppelOffres.map((appelOffre, index) => (
                                <div key={appelOffre.id || index} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                                    {/* Card Header */}
                                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-8 py-6 rounded-t-2xl">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <div>
                                                    <span className="text-gray-300 text-sm font-medium">Référence</span>
                                                    <div className="bg-white bg-opacity-20 px-4 py-1 rounded-full text-sm text-black font-semibold mt-1">
                                                        {appelOffre.reference || 'Non spécifié'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7h8M8 7H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2M8 7v8a2 2 0 002 2h4a2 2 0 002-2V7" />
                                                </svg>
                                                <div>
                                                    <span className="text-gray-300 text-sm font-medium">Date d'Ouverture</span>
                                                    <div className="bg-white bg-opacity-20 px-4 py-1 rounded-full text-sm text-black font-semibold mt-1">
                                                        {formatDate(appelOffre.date_ouverture)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Left Column */}
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 uppercase tracking-wide">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m2 0v-6a1 1 0 011-1h2a1 1 0 011 1v6m-3 0V9a1 1 0 011-1h2a1 1 0 011 1v10.01M16 9v6" />
                                                        </svg>
                                                        Maître d'Ouvrage
                                                    </div>
                                                    <p className="text-gray-900 font-medium text-lg">
                                                        {appelOffre.maitre_ouvrage || 'Non spécifié'}
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 uppercase tracking-wide">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                        </svg>
                                                        Objet
                                                    </div>
                                                    <p className="text-gray-700 leading-relaxed">
                                                        {appelOffre.objet || 'Non spécifié'}
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-sm font-semibold text-purple-600 uppercase tracking-wide">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            Ville
                                                        </div>
                                                        <p className="text-gray-900 font-medium">
                                                            {appelOffre.ville || 'Non spécifié'}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-sm font-semibold text-orange-600 uppercase tracking-wide">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                            </svg>
                                                            Budget
                                                        </div>
                                                        <p className="text-gray-900 font-bold text-lg">
                                                            {formatCurrency(appelOffre.budget)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Right Column */}
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 gap-6">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-sm font-semibold text-red-600 uppercase tracking-wide">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 0a3 3 0 118 0m-3 0a3 3 0 11-8 0m-3 0a3 3 0 118 0m0 0a3 3 0 11-8 0m3 0h2a3 3 0 013 3v1a3 3 0 01-3 3H9a3 3 0 01-3-3v-1a3 3 0 013-3z" />
                                                            </svg>
                                                            Montant Adjudication
                                                        </div>
                                                        <p className="text-gray-900 font-bold text-xl">
                                                            {formatCurrency(appelOffre.montant)}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 uppercase tracking-wide">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            Adjudicataire
                                                        </div>
                                                        <p className="text-gray-900 font-medium">
                                                            {appelOffre.adjudicataire || 'Non attribué'}
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-sm font-semibold text-teal-600 uppercase tracking-wide">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m0 0H8m8 0v2a1 1 0 01-1 1H9a1 1 0 01-1-1V9M8 7H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                                                                </svg>
                                                                Date Adjudication
                                                            </div>
                                                            <p className="text-gray-700">
                                                                {formatDate(appelOffre.date_adjudications)}
                                                            </p>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-sm font-semibold text-pink-600 uppercase tracking-wide">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                                                </svg>
                                                                Date Affichage
                                                            </div>
                                                            <p className="text-gray-700">
                                                                {formatDate(appelOffre.date_affichage)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* PV Section */}
                                        {appelOffre.pv && (
                                            <div className="mt-8 pt-8 border-t border-gray-200">
                                                <div className="space-y-4">
                                                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        Procès-Verbal
                                                    </h3>
                                                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                                        <p className="text-gray-700 leading-relaxed">{appelOffre.pv}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-wrap gap-4 justify-end">
                                            {appelOffre.lien_pv && (
                                                <a
                                                    href={appelOffre.lien_pv}
                                                    download
                                                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm flex items-center gap-2"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Télécharger PV
                                                </a>
                                            )}

                                            {appelOffre.lien_dao && (
                                                <>
                                                    <a
                                                        href={appelOffre.lien_dao}
                                                        download
                                                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm flex items-center gap-2"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9v.1"/>
                                                        </svg>
                                                        Télécharger D.A.O
                                                    </a>

                                                    <button
                                                        onClick={() => handleOpenDao(appelOffre.lien_dao!)}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm flex items-center gap-2"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        Ouvrir D.A.O
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty States */}
                    {!loading && filteredAppelOffres.length === 0 && appelOffres.length === 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16">
                            <div className="text-center space-y-4">
                                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun appel d'offres</h3>
                                    <p className="text-gray-600 mb-4">La base de données ne contient aucun appel d'offres pour le moment.</p>
                                    <p className="text-gray-500 text-sm">Cliquez sur "Lancer le Scraping" pour récupérer les dernières données.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!loading && filteredAppelOffres.length === 0 && appelOffres.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16">
                            <div className="text-center space-y-4">
                                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun résultat trouvé</h3>
                                    <p className="text-gray-600 mb-4">Aucun appel d'offres ne correspond aux filtres sélectionnés.</p>
                                    <p className="text-gray-500 text-sm">Essayez de modifier ou d'effacer vos critères de recherche.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DAO Files Modal */}
                    {showDaoFiles && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden w-full max-w-lg">
                                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4">
                                    <h3 className="text-xl font-semibold flex items-center gap-2">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v0" />
                                        </svg>
                                        Fichiers D.A.O
                                    </h3>
                                </div>

                                <div className="p-6">
                                    {daoFiles.length > 0 ? (
                                        <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
                                            {daoFiles.map((file, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleDownloadFile(file.path)}
                                                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center gap-3 group"
                                                >
                                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <span className="text-gray-700 group-hover:text-blue-700 font-medium">
                                                        {file.name}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v0" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-500">Aucun fichier trouvé dans cette archive</p>
                                        </div>
                                    )}
                                    
                                    <button
                                        onClick={() => setShowDaoFiles(false)}
                                        className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading DAO Modal */}
                    {loadingDao && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                            <div className="bg-white rounded-2xl shadow-2xl p-8">
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg font-semibold text-gray-800">Chargement en cours</h3>
                                        <p className="text-gray-600">Extraction des fichiers D.A.O...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}