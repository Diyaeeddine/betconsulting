import AppLayout from '@/layouts/app-layout';
import { router, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { 
  FileText, Download, CheckCircle, XCircle, Eye, Clock, 
  AlertCircle, User, Calendar, FileCheck, Filter, Search,
  MessageSquare, ThumbsUp, ThumbsDown, Loader2
} from 'lucide-react';

interface Document {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  status: 'draft' | 'submitted' | 'validated' | 'rejected';
  uploaded_at: string;
  validated_at?: string;
  validator_comment?: string;
}

interface PageProps {
  documents: {
    pending: Document[];
    validated: Document[];
    rejected: Document[];
  };
  stats: {
    total_pending: number;
    total_validated: number;
    total_rejected: number;
    pending_urgent: number;
  };
}

export default function MethodologyValidation() {
  const { documents, stats } = usePage<PageProps>().props;
  const [activeTab, setActiveTab] = useState<'pending' | 'validated' | 'rejected'>('pending');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [validationComment, setValidationComment] = useState('');
  const [validationAction, setValidationAction] = useState<'validate' | 'reject' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const breadcrumbs = [
    { title: 'Accueil', href: '/ressources-humaines/dashboard' },
    { title: 'Validation Documents', href: '/ressources-humaines/MethodologyValidation' },
  ];

  const documentTypes = {
    methodologie: { label: 'Méthodologie', icon: FileText, color: 'blue' },
    planning: { label: 'Planning', icon: Calendar, color: 'green' },
    chronogram: { label: 'Chronogramme', icon: Clock, color: 'purple' },
    organigramme: { label: 'Organigramme', icon: User, color: 'orange' },
    auto_control: { label: 'Auto-Contrôle', icon: FileCheck, color: 'red' },
  };

  const handleValidation = (docId: number, action: 'validate' | 'reject') => {
    setProcessing(true);
    
    router.post(
      route('methodologie.validate'),
      {
        document_id: docId,
        action: action,
        comment: validationComment,
      },
      {
        onSuccess: () => {
          setSelectedDoc(null);
          setValidationComment('');
          setValidationAction(null);
          setProcessing(false);
        },
        onError: () => {
          setProcessing(false);
        },
      }
    );
  };

  const handleDownload = (doc: Document) => {
    window.open(route('methodologie.rh.download', doc.id), '_blank');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const getFilteredDocuments = (docs: Document[]) => {
    return docs.filter(doc => {
      const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.user_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || doc.type === filterType;
      return matchesSearch && matchesType;
    });
  };

  const currentDocs = getFilteredDocuments(documents[activeTab] || []);

  const ValidationModal = () => {
    if (!selectedDoc || !validationAction) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {validationAction === 'validate' ? '✅ Valider le document' : '❌ Rejeter le document'}
              </h3>
              <button
                onClick={() => {
                  setSelectedDoc(null);
                  setValidationAction(null);
                  setValidationComment('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Document Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Document</p>
                  <p className="font-medium text-gray-900">{selectedDoc.file_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium text-gray-900">
                    {documentTypes[selectedDoc.type as keyof typeof documentTypes]?.label}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Soumis par</p>
                  <p className="font-medium text-gray-900">{selectedDoc.user_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedDoc.uploaded_at)}</p>
                </div>
              </div>
            </div>

            {/* Comment Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire {validationAction === 'reject' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={validationComment}
                onChange={(e) => setValidationComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={
                  validationAction === 'validate'
                    ? 'Ajoutez un commentaire (optionnel)...'
                    : 'Expliquez pourquoi ce document est rejeté...'
                }
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedDoc(null);
                  setValidationAction(null);
                  setValidationComment('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleValidation(selectedDoc.id, validationAction)}
                disabled={processing || (validationAction === 'reject' && !validationComment)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  validationAction === 'validate'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    {validationAction === 'validate' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {validationAction === 'validate' ? 'Valider' : 'Rejeter'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Validation Documents Méthodologie" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Validation des Documents</h1>
            <p className="mt-2 text-gray-600">
              Validez ou rejetez les documents soumis par les fournisseurs et sous-traitants
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_pending}</p>
                </div>
                <Clock className="w-10 h-10 text-orange-500 opacity-20" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Urgent</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{stats.pending_urgent}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-red-500 opacity-20" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Validés</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.total_validated}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500 opacity-20" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejetés</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_rejected}</p>
                </div>
                <XCircle className="w-10 h-10 text-red-500 opacity-20" />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-4 px-6" aria-label="Tabs">
                {[
                  { id: 'pending', label: 'En attente', count: stats.total_pending, color: 'orange' },
                  { id: 'validated', label: 'Validés', count: stats.total_validated, color: 'green' },
                  { id: 'rejected', label: 'Rejetés', count: stats.total_rejected, color: 'red' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      py-4 px-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                      ${activeTab === tab.id
                        ? `border-${tab.color}-600 text-${tab.color}-600`
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                      }
                    `}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        activeTab === tab.id ? `bg-${tab.color}-100 text-${tab.color}-700` : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom de fichier ou utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tous les types</option>
                  {Object.entries(documentTypes).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Documents List */}
            <div className="p-6">
              {currentDocs.length > 0 ? (
                <div className="space-y-3">
                  {currentDocs.map((doc) => {
                    const typeInfo = documentTypes[doc.type as keyof typeof documentTypes];
                    const Icon = typeInfo?.icon || FileText;

                    return (
                      <div
                        key={doc.id}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`p-3 rounded-lg bg-${typeInfo?.color}-50`}>
                              <Icon className={`w-6 h-6 text-${typeInfo?.color}-600`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-900 truncate">
                                {doc.file_name}
                              </h4>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {doc.user_name}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(doc.uploaded_at)}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span>{formatFileSize(doc.file_size)}</span>
                                <span className="text-gray-400">•</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${typeInfo?.color}-100 text-${typeInfo?.color}-700`}>
                                  {typeInfo?.label}
                                </span>
                              </div>
                              {doc.validator_comment && (
                                <div className="mt-2 flex items-start gap-2 text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                                  <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  <p className="italic">{doc.validator_comment}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDownload(doc)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Télécharger"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {activeTab === 'pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedDoc(doc);
                                    setValidationAction('validate');
                                  }}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1"
                                  title="Valider"
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedDoc(doc);
                                    setValidationAction('reject');
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                                  title="Rejeter"
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm || filterType !== 'all'
                      ? 'Aucun document ne correspond à vos critères de recherche'
                      : activeTab === 'pending'
                      ? 'Aucun document en attente de validation'
                      : activeTab === 'validated'
                      ? 'Aucun document validé'
                      : 'Aucun document rejeté'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Validation Modal */}
      <ValidationModal />
    </AppLayout>
  );
}