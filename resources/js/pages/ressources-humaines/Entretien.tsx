import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

import { 
    ClipboardList, 
    Plus, 
    Search, 
    Filter,
    Calendar,
    User,
    TrendingUp,
    Eye,
    Trash2,
    Download,
    FileText,
    Award,
    AlertCircle,
    CheckCircle,
    Clock,
    Edit,
    BarChart3
} from 'lucide-react';

interface Salarie {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    poste: string;
    telephone?: string;
    date_embauche?: string;
}

interface Entretien {
    id: number;
    salarie: Salarie;
    poste_vise: string;
    date_entretien: string;
    date_entretien_formatted: string;
    type_entretien: string;
    type_entretien_libelle: string;
    evaluateur_principal: string;
    score_total: number;
    pourcentage_score: number;
    appreciation: string;
    couleur_score: string;
    statut: string;
    statut_libelle: string;
    created_at: string;
}

interface Props {
    auth: any;
    entretiens: Entretien[];
}

export default function EntretienIndex({ auth, entretiens }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatut, setFilterStatut] = useState('all');
    const [sortBy, setSortBy] = useState<'date' | 'score' | 'nom'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Filtrer et trier les entretiens
    const filteredEntretiens = entretiens
        .filter(entretien => {
            const matchesSearch = 
                entretien.salarie.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entretien.salarie.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entretien.poste_vise.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entretien.evaluateur_principal.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesType = filterType === 'all' || entretien.type_entretien === filterType;
            const matchesStatut = filterStatut === 'all' || entretien.statut === filterStatut;
            
            return matchesSearch && matchesType && matchesStatut;
        })
        .sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
                case 'date':
                    comparison = new Date(a.date_entretien).getTime() - new Date(b.date_entretien).getTime();
                    break;
                case 'score':
                    comparison = a.pourcentage_score - b.pourcentage_score;
                    break;
                case 'nom':
                    comparison = a.salarie.nom.localeCompare(b.salarie.nom);
                    break;
            }
            
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    // Statistiques améliorées
    const stats = {
        total: entretiens.length,
        enCours: entretiens.filter(e => e.statut === 'en_cours').length,
        completes: entretiens.filter(e => e.statut === 'complete').length,
        validees: entretiens.filter(e => e.statut === 'validee').length,
        moyenneScore: entretiens.length > 0 
            ? (entretiens.reduce((sum, e) => sum + e.pourcentage_score, 0) / entretiens.length).toFixed(1)
            : 0,
        excellents: entretiens.filter(e => e.pourcentage_score >= 80).length,
        aBesoinDamelioration: entretiens.filter(e => e.pourcentage_score < 60).length,
    };

    const getScoreColor = (couleur: string) => {
        const colors = {
            green: 'bg-green-100 text-green-800 border-green-200',
            blue: 'bg-blue-100 text-blue-800 border-blue-200',
            yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            red: 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[couleur as keyof typeof colors] || colors.blue;
    };

    const getStatutColor = (statut: string) => {
        const colors = {
            en_cours: 'bg-orange-100 text-orange-800 border-orange-300',
            complete: 'bg-green-100 text-green-800 border-green-300',
            validee: 'bg-blue-100 text-blue-800 border-blue-300',
        };
        return colors[statut as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getStatutIcon = (statut: string) => {
        switch (statut) {
            case 'en_cours':
                return <Clock className="w-4 h-4" />;
            case 'complete':
                return <CheckCircle className="w-4 h-4" />;
            case 'validee':
                return <Award className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet entretien ? Cette action est irréversible.')) {
            router.delete(route('entretiens.destroy', id), {
                preserveScroll: true,
                onSuccess: () => {
                    // Success message will be shown by flash message
                },
            });
        }
    };

    const handleSort = (field: 'date' | 'score' | 'nom') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterType('all');
        setFilterStatut('all');
        setSortBy('date');
        setSortOrder('desc');
    };

    return (
        <AppLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                            <ClipboardList className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Gestion des Entretiens
                            </h2>
                            <p className="text-sm text-gray-600">
                                Évaluations professionnelles et suivis RH
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('entretiens.create')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5" />
                        Nouvel Entretien
                    </Link>
                </div>
            }
        >
            <Head title="Entretiens RH" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Statistiques améliorées */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm p-6 border border-indigo-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-indigo-700 font-semibold mb-1">Total Entretiens</p>
                                    <p className="text-3xl font-bold text-indigo-900">{stats.total}</p>
                                    <p className="text-xs text-indigo-600 mt-1">
                                        {stats.excellents} excellents
                                    </p>
                                </div>
                                <div className="bg-indigo-200 p-4 rounded-xl">
                                    <ClipboardList className="w-8 h-8 text-indigo-700" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-6 border border-orange-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-orange-700 font-semibold mb-1">En Cours</p>
                                    <p className="text-3xl font-bold text-orange-900">{stats.enCours}</p>
                                    <p className="text-xs text-orange-600 mt-1">
                                        En attente de finalisation
                                    </p>
                                </div>
                                <div className="bg-orange-200 p-4 rounded-xl">
                                    <Clock className="w-8 h-8 text-orange-700" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-6 border border-green-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-700 font-semibold mb-1">Complétés</p>
                                    <p className="text-3xl font-bold text-green-900">{stats.completes}</p>
                                    <p className="text-xs text-green-600 mt-1">
                                        {stats.validees} validés
                                    </p>
                                </div>
                                <div className="bg-green-200 p-4 rounded-xl">
                                    <CheckCircle className="w-8 h-8 text-green-700" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-6 border border-blue-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-700 font-semibold mb-1">Score Moyen</p>
                                    <p className="text-3xl font-bold text-blue-900">{stats.moyenneScore}%</p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        Performance globale
                                    </p>
                                </div>
                                <div className="bg-blue-200 p-4 rounded-xl">
                                    <TrendingUp className="w-8 h-8 text-blue-700" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtres et Recherche améliorés */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Filter className="w-5 h-5 text-indigo-600" />
                                Filtres et Recherche
                            </h3>
                            {(searchTerm || filterType !== 'all' || filterStatut !== 'all') && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-gray-600 hover:text-indigo-600 underline"
                                >
                                    Réinitialiser les filtres
                                </button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Recherche */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Recherche
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher un salarié, poste ou évaluateur..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Filtre Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type d'entretien
                                </label>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="all">Tous les types</option>
                                    <option value="premier">Premier entretien</option>
                                    <option value="technique">Entretien technique</option>
                                    <option value="final">Entretien final</option>
                                </select>
                            </div>

                            {/* Filtre Statut */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Statut
                                </label>
                                <select
                                    value={filterStatut}
                                    onChange={(e) => setFilterStatut(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="all">Tous les statuts</option>
                                    <option value="en_cours">En cours</option>
                                    <option value="complete">Complété</option>
                                    <option value="validee">Validé</option>
                                </select>
                            </div>
                        </div>

                        {/* Options de tri */}
                        <div className="mt-4 flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700">Trier par:</span>
                            <button
                                onClick={() => handleSort('date')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    sortBy === 'date' 
                                        ? 'bg-indigo-100 text-indigo-700' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </button>
                            <button
                                onClick={() => handleSort('score')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    sortBy === 'score' 
                                        ? 'bg-indigo-100 text-indigo-700' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Score {sortBy === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </button>
                            <button
                                onClick={() => handleSort('nom')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    sortBy === 'nom' 
                                        ? 'bg-indigo-100 text-indigo-700' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Nom {sortBy === 'nom' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </button>
                        </div>
                    </div>

                    {/* Liste des Entretiens */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                                    Liste des Entretiens
                                    <span className="ml-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full">
                                        {filteredEntretiens.length}
                                    </span>
                                </h3>

                                <div className="flex items-center gap-4">
                                    {filteredEntretiens.length > 0 && (
                                        <span className="text-sm text-gray-600">
                                            Affichage de {filteredEntretiens.length} sur {entretiens.length} entretiens
                                        </span>
                                    )}

                                    {/* Nouveau Entretien Button */}
                                    <a
                                        href={route('entretiens.create')}
                                        className="inline-flex items-center px-8 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        + Nouveau Entretien
                                    </a>
                                </div>
                            </div>
                        </div>


                        {filteredEntretiens.length === 0 ? (
                            <div className="text-center py-16">
                                <ClipboardList className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg font-medium mb-2">
                                    {searchTerm || filterType !== 'all' || filterStatut !== 'all'
                                        ? 'Aucun entretien ne correspond à vos critères'
                                        : 'Aucun entretien trouvé'}
                                </p>
                                <p className="text-gray-400 text-sm mb-6">
                                    {searchTerm || filterType !== 'all' || filterStatut !== 'all'
                                        ? 'Essayez de modifier vos filtres'
                                        : 'Commencez par créer un nouvel entretien'}
                                </p>
                                {(searchTerm || filterType !== 'all' || filterStatut !== 'all') ? (
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Réinitialiser les filtres
                                    </button>
                                ) : (
                                    <Link
                                        href={route('entretiens.create')}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Créer un entretien
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Salarié
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Poste Visé
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Date / Type
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Évaluateur
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Score
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Statut
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredEntretiens.map((entretien) => (
                                            <tr key={entretien.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                            {entretien.salarie.prenom[0]}{entretien.salarie.nom[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900">
                                                                {entretien.salarie.prenom} {entretien.salarie.nom}
                                                            </div>
                                                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                                                <User className="w-3 h-3" />
                                                                {entretien.salarie.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {entretien.poste_vise}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Poste actuel: {entretien.salarie.poste}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        {entretien.date_entretien_formatted}
                                                    </div>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                        {entretien.type_entretien_libelle}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-700 font-medium">
                                                        {entretien.evaluateur_principal}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-bold border-2 ${getScoreColor(entretien.couleur_score)}`}>
                                                            {entretien.pourcentage_score}%
                                                        </div>
                                                        <span className="text-xs text-gray-500 text-center font-medium">
                                                            {entretien.appreciation}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatutColor(entretien.statut)}`}>
                                                        {getStatutIcon(entretien.statut)}
                                                        {entretien.statut_libelle}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={route('entretiens.show', entretien.id)}
                                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors group"
                                                            title="Voir les détails"
                                                        >
                                                            <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                        </Link>
                                                        <a
                                                            href={route('entretiens.export', entretien.id)}
                                                            target="_blank"
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                                                            title="Exporter en PDF"
                                                        >
                                                            <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                        </a>
                                                        <button
                                                            onClick={() => handleDelete(entretien.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}