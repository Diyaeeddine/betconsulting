'use client';

import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Briefcase, Building2, Eye, Plus, Save, Search, Trash2, UserCheck, Users, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

interface SousTrait {
    id: number;
    nom: string;
    poste: string;
    description?: string;
    formation: any[];
    experience: any[];
    competences: any[];
    autre?: string;
    cv_path?: string;
    created_at: string;
    updated_at: string;
    profil?: string;
    profil_string?: string;
}

interface SearchResult {
    nom: string;
    poste: string;
    niveau_etudes: string;
    experience: string;
}

interface Formation {
    start_date: string;
    end_date: string;
    degree: string;
    school: string;
}

interface Experience {
    start_date: string;
    end_date: string;
    company: string;
    description: string;
}

interface SousTraitantsManagementProps {
    sousTraitants?: SousTrait[];
}

const profilsPostes = [
    {
        value: 'bureau_etudes',
        label: "Bureau d'Études Techniques (BET)",
        postes: [
            'Ingénieur structure (béton, acier, bois)',
            'Ingénieur génie civil',
            'Ingénieur électricité / électricité industrielle',
            'Ingénieur thermique / énergétique',
            'Ingénieur fluides (HVAC, plomberie, CVC)',
            'Ingénieur géotechnique',
            'Dessinateur projeteur / DAO (Autocad, Revit, Tekla)',
            "Technicien bureau d'études",
            "Chargé d'études techniques",
            'Ingénieur environnement / développement durable',
            'Ingénieur calcul de structures',
            'Architecte',
        ],
    },
    {
        value: 'construction',
        label: 'Construction',
        postes: [
            'Chef de chantier',
            'Conducteur de travaux',
            'Ingénieur travaux / Ingénieur chantier',
            "Conducteur d'engins",
            "Chef d'équipe",
            'Technicien travaux',
            'Manœuvre / Ouvrier spécialisé',
            'Coordinateur sécurité chantier (SST, prévention)',
            'Métreur / Économiste de la construction',
        ],
    },
    {
        value: 'suivi_controle',
        label: 'Suivi et Contrôle',
        postes: [
            'Contrôleur technique',
            'Chargé de suivi qualité',
            'Chargé de suivi sécurité',
            'Inspecteur de chantier',
            'Responsable HSE (Hygiène, Sécurité, Environnement)',
            'Technicien contrôle qualité',
            'Planificateur / Chargé de planning',
            'Responsable logistique chantier',
        ],
    },
    {
        value: 'support_gestion',
        label: 'Support et Gestion',
        postes: [
            'Responsable administratif chantier',
            'Assistant de projet',
            'Responsable achats / approvisionnement',
            'Responsable qualité',
            'Gestionnaire de contrats',
            'Chargé de communication',
            'Responsable financier / comptable chantier',
        ],
    },
];

const breadcrumbs = [
    {
        title: 'Gestion des Sous-traitants',
        href: '/sous-traitants',
    },
];

export default function SousTraitantsManagement({ sousTraitants: initialSousTraitants = [] }: SousTraitantsManagementProps) {
    // Main state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [sousTraitants, setSousTraitants] = useState<SousTrait[]>(initialSousTraitants);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewingHtml, setViewingHtml] = useState<string>('');
    const [viewingTitle, setViewingTitle] = useState<string>('');

    const [formData, setFormData] = useState({
        nom: '',
        profil: '',
        poste: '',
        description: '',
        competences: '',
        autre: '',
    });

    const [formations, setFormations] = useState<Formation[]>([
        {
            start_date: '',
            end_date: '',
            degree: '',
            school: '',
        },
    ]);

    const [experiences, setExperiences] = useState<Experience[]>([
        {
            start_date: '',
            end_date: '',
            company: '',
            description: '',
        },
    ]);

    // Load initial data
    useEffect(() => {
        if (initialSousTraitants.length === 0) {
            fetchSousTraitants();
        }
    }, []);

    const handleDeleteSousTrait = (id: number) => {
        if (window.confirm('Are you sure you want to delete this sous traitant?')) {
            router.delete(`/sousTrais/${id}`, {
                onSuccess: () => {
                    setSousTraitants(sousTraitants.filter((item) => item.id !== id));
                    console.log(`Successfully deleted item with ID: ${id}`);
                },
                onError: (errors) => {
                    console.error('Failed to delete sous traitant:', errors);
                },
            });
        }
    };
    const fetchSousTraitants = async () => {
        try {
            setLoading(true);
            const response = await fetch('/sousTrais');
            if (response.ok) {
                const data = await response.json();
                setSousTraitants(data);
            } else {
                console.error('Failed to fetch sous-traitants');
            }
        } catch (error) {
            console.error('Error fetching sous-traitants:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        try {
            setSearchLoading(true);
            const response = await fetch(`/search-sousTrais?query=${encodeURIComponent(searchQuery)}`);
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
            } else {
                console.error('Search failed');
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleProfilChange = (profilValue: string) => {
        setFormData((prev) => ({
            ...prev,
            profil: profilValue,
            poste: '', // Reset poste when profil changes
        }));
    };

    const getSelectedProfilPostes = () => {
        const selectedProfil = profilsPostes.find((p) => p.value === formData.profil);
        return selectedProfil ? selectedProfil.postes : [];
    };

    const addFormation = () => {
        setFormations((prev) => [
            ...prev,
            {
                start_date: '',
                end_date: '',
                degree: '',
                school: '',
            },
        ]);
    };

    const removeFormation = (index: number) => {
        setFormations((prev) => prev.filter((_, i) => i !== index));
    };

    const updateFormation = (index: number, field: keyof Formation, value: string) => {
        setFormations((prev) => prev.map((formation, i) => (i === index ? { ...formation, [field]: value } : formation)));
    };

    const addExperience = () => {
        setExperiences((prev) => [
            ...prev,
            {
                start_date: '',
                end_date: '',
                company: '',
                description: '',
            },
        ]);
    };

    const removeExperience = (index: number) => {
        setExperiences((prev) => prev.filter((_, i) => i !== index));
    };

    const updateExperience = (index: number, field: keyof Experience, value: string) => {
        setExperiences((prev) => prev.map((experience, i) => (i === index ? { ...experience, [field]: value } : experience)));
    };

    const handleAddSousTrait = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Prepare data
        const selectedProfilData = profilsPostes.find((p) => p.value === formData.profil);

        const filteredFormations = formations
            .filter((f) => f.start_date || f.end_date || f.degree || f.school)
            .map((f) => ({
                start_date: f.start_date || null,
                end_date: f.end_date || null,
                degree: f.degree || '',
                school: f.school || '',
            }));

        const filteredExperiences = experiences
            .filter((exp) => exp.start_date || exp.end_date || exp.company || exp.description)
            .map((exp) => ({
                start_date: exp.start_date || null,
                end_date: exp.end_date || null,
                company: exp.company || '',
                description: exp.description || '',
            }));

        const preparedCompetences = Array.isArray(formData.competences) ? formData.competences : formData.competences ? [formData.competences] : [];

        const submitData = {
            nom: formData.nom || '',
            poste: formData.poste || '',
            description: formData.description || '',
            formation: filteredFormations,
            experience: filteredExperiences,
            competences: preparedCompetences,
            autre: formData.autre || '',
            profil: formData.profil,
            profil_string: selectedProfilData?.label || '',
        };

        // Send request via Inertia
        router.post('/sousTrais', submitData, {
            onStart: () => console.log('[CREATE SOUS-TRAIT] Request started'),
            onSuccess: (page: any) => {
                console.log('[CREATE SOUS-TRAIT] Success flash:', page?.props?.flash);
                handleAddCancel();
                fetchSousTraitants(); // Refresh list
            },
            onError: (errors: any) => {
                console.error('[CREATE SOUS-TRAIT] Validation/Server errors:', errors);
            },
            onFinish: () => {
                console.log('[CREATE SOUS-TRAIT] Request finished');
                setIsSubmitting(false);
            },
        });
    };

    const handleAddCancel = () => {
        setFormData({
            nom: '',
            profil: '',
            poste: '',
            description: '',
            competences: '',
            autre: '',
        });
        
        setFormations([
            {
                start_date: '',
                end_date: '',
                degree: '',
                school: '',
            },
        ]);
        setExperiences([
            {
                start_date: '',
                end_date: '',
                company: '',
                description: '',
            },
        ]);
        setIsSubmitting(false);
    };

    const handleViewFromLeftTable = async (sousTrait: SousTrait) => {
        setViewingTitle(`CV - ${sousTrait.nom}`);

        if (sousTrait.cv_path) {
            try {
                const response = await fetch(sousTrait.cv_path);
                if (response.ok) {
                    const html = await response.text();
                    setViewingHtml(html);
                } else {
                    setViewingHtml('<div class="p-8 text-center text-gray-500">No Template Found</div>');
                }
            } catch (error) {
                setViewingHtml('<div class="p-8 text-center text-gray-500">No Template Found</div>');
            }
        } else {
            setViewingHtml('<div class="p-8 text-center text-gray-500">No Template Found</div>');
        }

        setIsViewModalOpen(true);
    };

    const handleViewFromRightTable = async (result: SearchResult) => {
        setViewingTitle(`Template - ${result.nom}`);

        try {
            const response = await fetch(`/get-template?nom=${encodeURIComponent(result.nom)}`);
            if (response.ok) {
                const html = await response.text();
                setViewingHtml(html);
            } else {
                setViewingHtml('<div class="p-8 text-center text-gray-500">No Template Found</div>');
            }
        } catch (error) {
            setViewingHtml('<div class="p-8 text-center text-gray-500">No Template Found</div>');
        }

        setIsViewModalOpen(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    // Calculate stats
    function getProfilFromPoste(poste: string) {
        for (const profil of profilsPostes) {
            if (profil.postes.includes(poste)) {
                return profil.value;
            }
        }
        return 'autre';
    }

    const totalSousTraitants = sousTraitants.length;

    const bureauEtudesCount = sousTraitants.filter((st) => getProfilFromPoste(st.poste) === 'bureau_etudes').length;

    const constructionCount = sousTraitants.filter((st) => getProfilFromPoste(st.poste) === 'construction').length;

    const suiviControleCount = sousTraitants.filter((st) => getProfilFromPoste(st.poste) === 'suivi_controle').length;

    const supportGestionCount = sousTraitants.filter((st) => getProfilFromPoste(st.poste) === 'support_gestion').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Sous-traitants" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestion des Sous-traitants</h1>
                        <p className="mt-1 text-gray-600">Gérez vos sous-traitants et consultez leurs profils</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-md transition-colors hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        Nouveau Sous-traitant
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Sous-traitants</p>
                                <p className="text-2xl font-bold text-gray-900">{totalSousTraitants}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-green-100 p-2">
                                <Building2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Bureau d'Études</p>
                                <p className="text-2xl font-bold text-gray-900">{bureauEtudesCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-orange-100 p-2">
                                <Briefcase className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Construction</p>
                                <p className="text-2xl font-bold text-gray-900">{constructionCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-purple-100 p-2">
                                <UserCheck className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Suivi & Support</p>
                                <p className="text-2xl font-bold text-gray-900">{suiviControleCount + supportGestionCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    {/* Left Table - 60% */}
                    <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md lg:col-span-3">
                        <div className="border-b border-gray-200 p-6">
                            {/* <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Sous-traitants enregistrés
              </h2> */}

                            {/* Search Bar */}
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Rechercher..."
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    disabled={searchLoading || !searchQuery.trim()}
                                    className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                                >
                                    <Search className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500">
                                    <div className="mb-4 inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                                    <div>Chargement...</div>
                                </div>
                            ) : sousTraitants.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="text-gray-500">
                                        <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun sous-traitant</h3>
                                        <p className="mt-1 text-sm text-gray-500">Commencez par ajouter votre premier sous-traitant.</p>
                                    </div>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">N°</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Nom</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Poste</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Date création
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {sousTraitants.length > 0 ? (
                                            sousTraitants.map((sousTrait, index) => (
                                                <tr key={sousTrait.id} className="transition-colors hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">{index + 1}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{sousTrait.nom}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">{sousTrait.poste}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                                                        {formatDate(sousTrait.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-medium whitespace-nowrap">
                                                        <div className="flex justify-center space-x-2">
                                                            {/* View Button */}
                                                            <button
                                                                onClick={() => handleViewFromLeftTable(sousTrait)}
                                                                className="inline-flex items-center justify-center rounded-full bg-blue-600 p-2 text-xs font-medium text-white shadow-md transition-colors duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                                                                aria-label={`View details for ${sousTrait.nom}`}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>

                                                            {/* Delete Button with Trash Icon */}
                                                            <button
                                                                onClick={() => handleDeleteSousTrait(sousTrait.id)}
                                                                className="inline-flex items-center justify-center rounded-full bg-red-600 p-2 text-xs font-medium text-white shadow-md transition-colors duration-200 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
                                                                aria-label={`Delete ${sousTrait.nom}`}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                                    No sous traitants found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Right Table - 40% */}
                    <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md lg:col-span-2">
                        <div className="border-b border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900">Résultats de recherche</h2>
                        </div>

                        <div className="overflow-x-auto">
                            {searchLoading ? (
                                <div className="p-8 text-center text-gray-500">
                                    <div className="mb-4 inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                                    <div>Recherche en cours...</div>
                                </div>
                            ) : searchResults.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    {searchQuery ? (
                                        <div>
                                            <Search className="mx-auto mb-4 h-8 w-8 text-gray-400" />
                                            <p>Aucun résultat trouvé</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <Search className="mx-auto mb-4 h-8 w-8 text-gray-400" />
                                            <p>Effectuez une recherche</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Nom</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Poste</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Niveau Études
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Expérience
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {searchResults.map((result, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 text-sm font-medium whitespace-nowrap text-gray-900">{result.nom}</td>
                                                <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-600">{result.poste}</td>
                                                <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-600">{result.niveau_etudes}</td>
                                                <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-600">{result.experience}</td>
                                                <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-600">
                                                    <button
                                                        onClick={() => handleViewFromRightTable(result)}
                                                        className="inline-flex items-center space-x-1 rounded bg-green-600 px-3 py-1 text-xs font-medium text-white transition-colors duration-200 hover:bg-green-700"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        <span>Voir</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* Add Modal */}
                {isAddModalOpen && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-600">
                        <div className="m-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6">
                            <h3 className="mb-4 text-lg font-medium text-gray-900">Ajouter un sous-traitant</h3>

                            <form onSubmit={handleAddSousTrait} className="space-y-8">
                                {/* Basic Information */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium text-gray-900">Informations de base</h3>

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Nom *</label>
                                            <input
                                                type="text"
                                                name="nom"
                                                value={formData.nom}
                                                onChange={handleInputChange}
                                                required
                                                disabled={isSubmitting}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="Entrez le nom"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Profil *</label>
                                            <select
                                                value={formData.profil}
                                                onChange={(e) => handleProfilChange(e.target.value)}
                                                required
                                                disabled={isSubmitting}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            >
                                                <option value="">Sélectionner un profil</option>
                                                {profilsPostes.map((profil) => (
                                                    <option key={profil.value} value={profil.value}>
                                                        {profil.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Poste *</label>
                                        <div className="mt-2 max-h-48 space-y-2 overflow-y-auto">
                                            {getSelectedProfilPostes().map((poste, index) => (
                                                <label key={index} className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="poste"
                                                        value={poste}
                                                        checked={formData.poste === poste}
                                                        onChange={(e) => setFormData((prev) => ({ ...prev, poste: e.target.value }))}
                                                        className="mr-2 text-blue-600 focus:ring-blue-500"
                                                        disabled={isSubmitting}
                                                        required
                                                    />
                                                    <span className="text-sm text-gray-700">{poste}</span>
                                                </label>
                                            ))}

                                            {formData.profil && getSelectedProfilPostes().length === 0 && (
                                                <p className="text-sm text-gray-500">Aucun poste disponible pour ce profil</p>
                                            )}

                                            {!formData.profil && <p className="text-sm text-gray-500">Sélectionnez d'abord un profil</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={3}
                                            disabled={isSubmitting}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Description du profil du sous-traitant"
                                        />
                                    </div>
                                </div>

                                {/* Formation */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium text-gray-900">Formation</h3>
                                        <button
                                            type="button"
                                            onClick={addFormation}
                                            disabled={isSubmitting}
                                            className="inline-flex items-center rounded-md bg-green-600 px-3 py-1 text-sm text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                                        >
                                            <Plus className="mr-1 h-4 w-4" />
                                            Ajouter
                                        </button>
                                    </div>

                                    {formations.map((formation, index) => (
                                        <div key={index} className="space-y-3 rounded-lg border border-gray-200 p-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium text-gray-700">Formation {index + 1}</h4>
                                                {formations.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFormation(index)}
                                                        disabled={isSubmitting}
                                                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">Date de début</label>
                                                    <input
                                                        type="month"
                                                        value={formation.start_date}
                                                        onChange={(e) => updateFormation(index, 'start_date', e.target.value)}
                                                        disabled={isSubmitting}
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">Date de fin</label>
                                                    <input
                                                        type="month"
                                                        value={formation.end_date}
                                                        onChange={(e) => updateFormation(index, 'end_date', e.target.value)}
                                                        disabled={isSubmitting}
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">Diplôme</label>
                                                    <input
                                                        type="text"
                                                        value={formation.degree}
                                                        onChange={(e) => updateFormation(index, 'degree', e.target.value)}
                                                        disabled={isSubmitting}
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Nom du diplôme"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">École</label>
                                                    <input
                                                        type="text"
                                                        value={formation.school}
                                                        onChange={(e) => updateFormation(index, 'school', e.target.value)}
                                                        disabled={isSubmitting}
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Nom de l'établissement"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Experience */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium text-gray-900">Expérience</h3>
                                        <button
                                            type="button"
                                            onClick={addExperience}
                                            disabled={isSubmitting}
                                            className="inline-flex items-center rounded-md bg-green-600 px-3 py-1 text-sm text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                                        >
                                            <Plus className="mr-1 h-4 w-4" />
                                            Ajouter
                                        </button>
                                    </div>

                                    {experiences.map((experience, index) => (
                                        <div key={index} className="space-y-3 rounded-lg border border-gray-200 p-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium text-gray-700">Expérience {index + 1}</h4>
                                                {experiences.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExperience(index)}
                                                        disabled={isSubmitting}
                                                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">Date de début</label>
                                                    <input
                                                        type="month"
                                                        value={experience.start_date}
                                                        onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                                                        disabled={isSubmitting}
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">Date de fin</label>
                                                    <input
                                                        type="month"
                                                        value={experience.end_date}
                                                        onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                                                        disabled={isSubmitting}
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Entreprise</label>
                                                <input
                                                    type="text"
                                                    value={experience.company}
                                                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                                    disabled={isSubmitting}
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Nom de l'entreprise"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                                                <textarea
                                                    value={experience.description}
                                                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                                    rows={3}
                                                    disabled={isSubmitting}
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Description des responsabilités et réalisations"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Competences */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900">Compétences</h3>
                                    <textarea
                                        name="competences"
                                        value={formData.competences}
                                        onChange={handleInputChange}
                                        rows={4}
                                        disabled={isSubmitting}
                                        placeholder="Décrivez les compétences techniques et fonctionnelles..."
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 border-t pt-4">
                                    <button
                                        type="button"
                                        onClick={handleAddCancel}
                                        className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                                        disabled={isSubmitting}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                <span>Enregistrement...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <Save className="h-4 w-4" />
                                                <span>Enregistrer</span>
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* View Template Modal */}
                {isViewModalOpen && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-600">
                        <div className="m-4 flex max-h-[90vh] w-full max-w-5xl flex-col rounded-lg bg-white p-6">
                            <div className="mb-6 flex flex-shrink-0 items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">{viewingTitle}</h2>
                                <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 transition-colors hover:text-gray-600">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-auto">
                                <div className="min-h-96 rounded-lg border border-gray-200">
                                    <div dangerouslySetInnerHTML={{ __html: viewingHtml }} className="h-full w-full" style={{ minHeight: '400px' }} />
                                </div>
                            </div>

                            <div className="mt-6 flex flex-shrink-0 items-center justify-end border-t border-gray-200 pt-4">
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
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
}
