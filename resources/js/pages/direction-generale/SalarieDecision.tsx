import React, { useState, useEffect, useMemo } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download,
  Calendar,
  User,
  Briefcase,
  TrendingUp,
  Clock,
  AlertCircle,
  FileText,
  CheckSquare,
  XSquare
} from 'lucide-react';

interface Salarie {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  poste: string;
  telephone: string;
}

interface Entretien {
  id: number;
  salarie: Salarie;
  salarie_nom: string;
  poste_vise: string;
  date_entretien: string;
  date_entretien_formatted: string;
  type_entretien: string;
  type_entretien_libelle: string;
  score_total: number;
  pourcentage_score: number;
  appreciation: string;
  couleur_score: string;
  recommandation: string;
  statut: string;
  created_at: string;
}

interface PageProps  {
  entretiens: Entretien[];
  [key: string]: any;
}

export default function SalarieDecision() {
  const { entretiens } = usePage<PageProps>().props;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRecommandation, setFilterRecommandation] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'nom'>('date');
  const [selectedEntretien, setSelectedEntretien] = useState<Entretien | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [validationForm, setValidationForm] = useState({
    commentaire_validation: '',
    accepter_salarie: true
  });
  const [rejectionForm, setRejectionForm] = useState({
    motif_rejet: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered and sorted entretiens
  const filteredEntretiens = useMemo(() => {
    let filtered = entretiens.filter(e => {
      const matchesSearch = 
        e.salarie_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.poste_vise.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.salarie.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || e.type_entretien === filterType;
      const matchesRecommandation = filterRecommandation === 'all' || e.recommandation === filterRecommandation;
      
      return matchesSearch && matchesType && matchesRecommandation;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score_total - a.score_total;
        case 'nom':
          return a.salarie_nom.localeCompare(b.salarie_nom);
        case 'date':
        default:
          return new Date(b.date_entretien).getTime() - new Date(a.date_entretien).getTime();
      }
    });

    return filtered;
  }, [entretiens, searchTerm, filterType, filterRecommandation, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: entretiens.length,
      excellent: entretiens.filter(e => e.pourcentage_score >= 80).length,
      moyen: entretiens.filter(e => e.pourcentage_score >= 60 && e.pourcentage_score < 80).length,
      faible: entretiens.filter(e => e.pourcentage_score < 60).length,
      fortement_recommande: entretiens.filter(e => e.recommandation === 'fortement_recommande').length,
    };
  }, [entretiens]);

  const getScoreColor = (couleur: string) => {
    switch (couleur) {
      case 'green': return 'bg-green-100 text-green-800 border-green-300';
      case 'blue': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'red': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRecommandationBadge = (recommandation: string) => {
    const config = {
      fortement_recommande: { label: 'Fortement Recommandé', class: 'bg-green-100 text-green-800' },
      recommande: { label: 'Recommandé', class: 'bg-blue-100 text-blue-800' },
      reserve: { label: 'Réservé', class: 'bg-yellow-100 text-yellow-800' },
      non_recommande: { label: 'Non Recommandé', class: 'bg-red-100 text-red-800' }
    };
    return config[recommandation as keyof typeof config] || { label: recommandation, class: 'bg-gray-100 text-gray-800' };
  };

  const handleViewDetails = (entretien: Entretien) => {
    router.visit(`/direction-generale/entretiens/${entretien.id}`);
  };

  const handleValidate = (entretien: Entretien) => {
    setSelectedEntretien(entretien);
    setValidationForm({ commentaire_validation: '', accepter_salarie: true });
    setShowValidationModal(true);
  };

  const handleReject = (entretien: Entretien) => {
    setSelectedEntretien(entretien);
    setRejectionForm({ motif_rejet: '' });
    setShowRejectionModal(true);
  };

  const submitValidation = () => {
    if (!selectedEntretien) return;
    
    setIsSubmitting(true);
    router.post(
      `/direction-generale/entretiens/${selectedEntretien.id}/valider`,
      validationForm,
      {
        onSuccess: () => {
          setShowValidationModal(false);
          setSelectedEntretien(null);
        },
        onFinish: () => setIsSubmitting(false)
      }
    );
  };

  const submitRejection = () => {
    if (!selectedEntretien || !rejectionForm.motif_rejet.trim()) return;
    
    setIsSubmitting(true);
    router.post(
      `/direction-generale/entretiens/${selectedEntretien.id}/rejeter`,
      rejectionForm,
      {
        onSuccess: () => {
          setShowRejectionModal(false);
          setSelectedEntretien(null);
        },
        onFinish: () => setIsSubmitting(false)
      }
    );
  };

  return (
    <AppLayout>
      <Head title="Validation des Entretiens" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Décisions sur les Candidatures
            </h1>
            <p className="text-gray-600">
              Validez ou rejetez les entretiens des candidats en attente
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Excellents</p>
                  <p className="text-2xl font-bold text-green-600">{stats.excellent}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Moyens</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.moyen}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Faibles</p>
                  <p className="text-2xl font-bold text-red-600">{stats.faible}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-emerald-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Fortement Rec.</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.fortement_recommande}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les types</option>
                <option value="premier">Premier entretien</option>
                <option value="technique">Entretien technique</option>
                <option value="final">Entretien final</option>
              </select>

              {/* Recommandation Filter */}
              <select
                value={filterRecommandation}
                onChange={(e) => setFilterRecommandation(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Toutes recommandations</option>
                <option value="fortement_recommande">Fortement Recommandé</option>
                <option value="recommande">Recommandé</option>
                <option value="reserve">Réservé</option>
                <option value="non_recommande">Non Recommandé</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'nom')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Trier par date</option>
                <option value="score">Trier par score</option>
                <option value="nom">Trier par nom</option>
              </select>
            </div>
          </div>

          {/* Entretiens List */}
          <div className="space-y-4">
            {filteredEntretiens.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun entretien trouvé
                </h3>
                <p className="text-gray-600">
                  {searchTerm || filterType !== 'all' || filterRecommandation !== 'all'
                    ? 'Essayez de modifier vos filtres de recherche'
                    : 'Il n\'y a pas d\'entretiens en attente de validation'}
                </p>
              </div>
            ) : (
              filteredEntretiens.map((entretien) => (
                <div
                  key={entretien.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {entretien.salarie_nom}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {entretien.poste_vise}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {entretien.date_entretien_formatted}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {entretien.type_entretien_libelle}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Score and Badges */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`px-4 py-2 rounded-lg border-2 ${getScoreColor(entretien.couleur_score)}`}>
                          <div className="text-2xl font-bold">
                            {entretien.score_total}/40
                          </div>
                          <div className="text-xs">
                            {entretien.pourcentage_score}% - {entretien.appreciation}
                          </div>
                        </div>
                        
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRecommandationBadge(entretien.recommandation).class}`}>
                          {getRecommandationBadge(entretien.recommandation).label}
                        </span>
                      </div>

                      {/* Contact Info */}
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                        <span>📧 {entretien.salarie.email}</span>
                        <span>📱 {entretien.salarie.telephone}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleViewDetails(entretien)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Détails
                      </button>
                      
                      <button
                        onClick={() => handleValidate(entretien)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Valider
                      </button>
                      
                      <button
                        onClick={() => handleReject(entretien)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Rejeter
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Validation Modal */}
      {showValidationModal && selectedEntretien && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Valider l'entretien
            </h3>
            
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Candidat:</strong> {selectedEntretien.salarie_nom}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Poste:</strong> {selectedEntretien.poste_vise}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Score:</strong> {selectedEntretien.score_total}/40 ({selectedEntretien.pourcentage_score}%)
              </p>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={validationForm.accepter_salarie}
                  onChange={(e) => setValidationForm({ ...validationForm, accepter_salarie: e.target.checked })}
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Accepter le candidat dans l'entreprise
                </span>
              </label>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire (optionnel)
              </label>
              <textarea
                value={validationForm.commentaire_validation}
                onChange={(e) => setValidationForm({ ...validationForm, commentaire_validation: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ajoutez un commentaire sur votre décision..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowValidationModal(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={submitValidation}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Validation...
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4" />
                    Confirmer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedEntretien && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Rejeter l'entretien
            </h3>
            
            <div className="mb-4 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Candidat:</strong> {selectedEntretien.salarie_nom}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Poste:</strong> {selectedEntretien.poste_vise}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Score:</strong> {selectedEntretien.score_total}/40 ({selectedEntretien.pourcentage_score}%)
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif du rejet <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionForm.motif_rejet}
                onChange={(e) => setRejectionForm({ ...rejectionForm, motif_rejet: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Expliquez pourquoi vous rejetez cet entretien..."
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectionModal(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={submitRejection}
                disabled={isSubmitting || !rejectionForm.motif_rejet.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Rejet...
                  </>
                ) : (
                  <>
                    <XSquare className="w-4 h-4" />
                    Confirmer le rejet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}