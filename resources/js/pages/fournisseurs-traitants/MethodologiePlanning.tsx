import AppLayout from '@/layouts/app-layout';
import { router, useForm, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Upload, FileText, Download, Trash2, Eye, CheckCircle, AlertCircle, Calendar, Network, Clock, FileCheck, Loader2 } from 'lucide-react';

interface Document {
  id: number;
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
    methodologie: Document[];
    planning: Document[];
    chronogram: Document[];
    organigramme: Document[];
    auto_control: Document[];
  };
  stats: {
    total: number;
    validated: number;
    pending: number;
    completion: number;
  };
}

export default function MethodologiePlanning() {
    
  const { documents, stats } = usePage<PageProps>().props;
  const [activeSection, setActiveSection] = useState('methodologie');
  const [uploadingSection, setUploadingSection] = useState<string | null>(null);

  const { data, setData, post, processing, errors, reset } = useForm({
    type: 'methodologie',
    file: null as File | null,
  });

  const breadcrumbs = [
    { title: 'Accueil', href: '/fournisseurs-traitants/dashboard' },
    { title: 'Offre Technique', href: '/fournisseurs-traitants/OffreTechnique' },
    { title: 'Méthodologie & Planning', href: '/fournisseurs-traitants/MethodologiePlanning' },
  ];

  const sections = [
    {
      id: 'methodologie',
      title: 'Méthodologie d\'Exécution',
      icon: FileText,
      description: 'Document détaillé de la méthodologie d\'exécution du projet',
      color: 'blue',
      acceptedFormats: '.pdf, .docx, .doc'
    },
    {
      id: 'planning',
      title: 'Planning d\'Exécution',
      icon: Calendar,
      description: 'Planning détaillé avec jalons et livrables',
      color: 'green',
      acceptedFormats: '.pdf, .xlsx, .mpp, .gan'
    },
    {
      id: 'chronogram',
      title: 'Chronogramme',
      icon: Clock,
      description: 'Chronogramme visuel du projet',
      color: 'purple',
      acceptedFormats: '.pdf, .xlsx, .png, .jpg'
    },
    {
      id: 'organigramme',
      title: 'Organigramme',
      icon: Network,
      description: 'Structure organisationnelle de l\'équipe projet',
      color: 'orange',
      acceptedFormats: '.pdf, .png, .jpg, .svg'
    },
    {
      id: 'auto_control',
      title: 'Auto-Contrôle',
      icon: FileCheck,
      description: 'Procédures et documents d\'auto-contrôle qualité',
      color: 'red',
      acceptedFormats: '.pdf, .docx, .xlsx'
    },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('file', file);
      setData('type', type);
    }
  };

  const handleUpload = (type: string) => {
    if (!data.file) return;

    setUploadingSection(type);
    post(route('methodologie.upload'), {
      onSuccess: () => {
        reset();
        setUploadingSection(null);
        const input = document.getElementById(`file-input-${type}`) as HTMLInputElement;
        if (input) input.value = '';
      },
      onError: () => {
        setUploadingSection(null);
      },
    });
  };

  const handleDelete = (docId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      router.delete(route('methodologie.delete', docId));
    }
  };

  const handleDownload = (doc: Document) => {
    window.open(route('methodologie.download', doc.id), '_blank');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { color: 'bg-gray-100 text-gray-700', icon: AlertCircle, text: 'Brouillon' },
      submitted: { color: 'bg-blue-100 text-blue-700', icon: Clock, text: 'En attente' },
      validated: { color: 'bg-green-100 text-green-700', icon: CheckCircle, text: 'Validé' },
      rejected: { color: 'bg-red-100 text-red-700', icon: AlertCircle, text: 'Rejeté' },
    };
    const badge = badges[status as keyof typeof badges];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const currentSection = sections.find(s => s.id === activeSection);
  const currentDocs = documents[activeSection as keyof typeof documents] || [];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Méthodologie & Planning" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Header with Stats */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Méthodologie & Planning</h1>
                <p className="mt-2 text-gray-600">
                  Gérez tous vos documents méthodologiques et de planification
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Documents</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                  </div>
                  <FileText className="w-10 h-10 text-blue-500 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Validés</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{stats.validated}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-500 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">En attente</p>
                    <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pending}</p>
                  </div>
                  <Clock className="w-10 h-10 text-orange-500 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Complétude</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">{stats.completion}%</p>
                  </div>
                  <FileCheck className="w-10 h-10 text-purple-500 opacity-20" />
                </div>
              </div>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 overflow-x-auto">
              <nav className="flex space-x-4 px-6" aria-label="Tabs">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  const sectionDocs = documents[section.id as keyof typeof documents] || [];
                  const hasValidated = sectionDocs.some(d => d.status === 'validated');

                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`
                        relative py-4 px-3 text-sm font-medium whitespace-nowrap
                        transition-colors duration-200 flex items-center gap-2
                        ${isActive
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {section.title}
                      {hasValidated && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {sectionDocs.length > 0 && (
                        <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                          {sectionDocs.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content Area */}
            <div className="p-6">
              {currentSection && (
                <>
                  {/* Section Header */}
                  <div className="mb-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-${currentSection.color}-50`}>
                        <currentSection.icon className={`w-6 h-6 text-${currentSection.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{currentSection.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{currentSection.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Formats acceptés: {currentSection.acceptedFormats}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Upload Area */}
                  <div className="mb-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                      <div className="flex items-center justify-center">
                        <label htmlFor={`file-input-${activeSection}`} className="cursor-pointer">
                          <div className="flex flex-col items-center">
                            <Upload className="w-12 h-12 text-gray-400 mb-3" />
                            <span className="text-sm font-medium text-gray-700">
                              Cliquez pour télécharger ou glissez-déposez
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              Taille maximale: 50MB
                            </span>
                          </div>
                          <input
                            id={`file-input-${activeSection}`}
                            type="file"
                            className="hidden"
                            accept={currentSection.acceptedFormats}
                            onChange={(e) => handleFileSelect(e, activeSection)}
                          />
                        </label>
                      </div>

                      {data.file && data.type === activeSection && (
                        <div className="mt-4 flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{data.file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(data.file.size)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleUpload(activeSection)}
                            disabled={processing || uploadingSection === activeSection}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {uploadingSection === activeSection ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Envoi en cours...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                Envoyer
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {errors.file && (
                        <p className="mt-2 text-sm text-red-600">{errors.file}</p>
                      )}
                    </div>
                  </div>

                  {/* Documents List */}
                  {currentDocs.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Documents téléchargés ({currentDocs.length})
                      </h4>
                      {currentDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <FileText className="w-5 h-5 text-gray-600" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {doc.file_name}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-gray-500">
                                    {formatFileSize(doc.file_size)}
                                  </span>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
                                  </span>
                                  <span className="text-xs text-gray-400">•</span>
                                  {getStatusBadge(doc.status)}
                                </div>
                                {doc.validator_comment && (
                                  <p className="text-xs text-gray-600 mt-2 italic">
                                    💬 {doc.validator_comment}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => handleDownload(doc)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Télécharger"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              {doc.status !== 'validated' && (
                                <button
                                  onClick={() => handleDelete(doc.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">Aucun document téléchargé pour cette section</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Commencez par télécharger votre premier document
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}