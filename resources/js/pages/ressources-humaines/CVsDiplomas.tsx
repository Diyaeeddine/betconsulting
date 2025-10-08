import AppLayout from '@/layouts/app-layout';
import { router, useForm, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Upload, FileText, Download, Trash2, Eye, CheckCircle, XCircle, AlertCircle, Search, Filter, User, GraduationCap } from 'lucide-react';

export default function CVsDiplomas() {
    const [activeTab, setActiveTab] = useState('cvs');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    const breadcrumbs = [
        {
            title: 'Accueil',
            href: '/',
        },
        {
            title: 'Ressources Humaines',
            href: '/ressources-humaines/dashboard',
        },
        {
            title: 'CVs & Diplômes',
            href: '/ressources-humaines/cvs-diplomas',
        },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        member_id: '',
        document_type: 'cv',
        file: null,
        comments: '',
        validation_status: 'validated',
    });

    const teamMembers = [
        {
            id: 1,
            name: 'Youssef El Amrani',
            role: 'Chef de Projet',
            qualification: 'Ingénieur Civil - EHTP',
            cv_status: 'validated',
            cv_file: 'CV_Youssef_ElAmrani.pdf',
            cv_upload_date: '2024-03-10',
            diploma_status: 'validated',
            diploma_file: 'Diplome_EHTP_Youssef.pdf',
            diploma_upload_date: '2024-03-10',
            validated_by: 'Sarah Bennani',
            validation_date: '2024-03-11',
        },
        {
            id: 2,
            name: 'Fatima Zahra Benjelloun',
            role: 'Ingénieur Principal',
            qualification: 'Ingénieur Génie Civil - EMI',
            cv_status: 'validated',
            cv_file: 'CV_Fatima_Benjelloun.pdf',
            cv_upload_date: '2024-03-11',
            diploma_status: 'validated',
            diploma_file: 'Diplome_EMI_Fatima.pdf',
            diploma_upload_date: '2024-03-11',
            validated_by: 'Sarah Bennani',
            validation_date: '2024-03-12',
        },
        {
            id: 3,
            name: 'Mohammed Tazi',
            role: 'Conducteur de Travaux',
            qualification: 'Technicien Supérieur TP',
            cv_status: 'validated',
            cv_file: 'CV_Mohammed_Tazi.pdf',
            cv_upload_date: '2024-03-11',
            diploma_status: 'pending',
            diploma_file: null,
            diploma_upload_date: null,
            validated_by: 'Sarah Bennani',
            validation_date: '2024-03-12',
        },
        {
            id: 4,
            name: 'Karim Alaoui',
            role: 'Topographe',
            qualification: 'Technicien Topographie',
            cv_status: 'pending',
            cv_file: null,
            cv_upload_date: null,
            diploma_status: 'pending',
            diploma_file: null,
            diploma_upload_date: null,
            validated_by: null,
            validation_date: null,
        },
        {
            id: 5,
            name: 'Salma Idrissi',
            role: 'Ingénieur Qualité',
            qualification: 'Ingénieur Qualité - ENSAM',
            cv_status: 'rejected',
            cv_file: 'CV_Salma_Idrissi_v1.pdf',
            cv_upload_date: '2024-03-13',
            cv_rejection_reason: 'CV incomplet - expérience professionnelle non détaillée',
            diploma_status: 'validated',
            diploma_file: 'Diplome_ENSAM_Salma.pdf',
            diploma_upload_date: '2024-03-13',
            validated_by: 'Sarah Bennani',
            validation_date: '2024-03-14',
        },
    ];

    const handleFileChange = (e) => {
        setData('file', e.target.files[0]);
    };

    const handleSubmit = () => {
        post('/ressources-humaines/cvs-diplomas/upload', {
            onSuccess: () => {
                reset();
                setShowUploadModal(false);
                setSelectedMember(null);
            },
        });
    };

    const handleValidate = (memberId, docType, status) => {
        router.post('/ressources-humaines/cvs-diplomas/validate', {
            member_id: memberId,
            document_type: docType,
            status: status,
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'validated':
                return (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        <span>Validé</span>
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        <span>En attente</span>
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        <XCircle className="w-3 h-3" />
                        <span>Rejeté</span>
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        <span>Non fourni</span>
                    </span>
                );
        }
    };

    const filteredMembers = teamMembers.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            member.role.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesFilter = true;
        if (filterStatus !== 'all') {
            if (activeTab === 'cvs') {
                matchesFilter = member.cv_status === filterStatus;
            } else {
                matchesFilter = member.diploma_status === filterStatus;
            }
        }
        return matchesSearch && matchesFilter;
    });

    const cvStats = {
        total: teamMembers.length,
        validated: teamMembers.filter(m => m.cv_status === 'validated').length,
        pending: teamMembers.filter(m => m.cv_status === 'pending').length,
        rejected: teamMembers.filter(m => m.cv_status === 'rejected').length,
    };

    const diplomaStats = {
        total: teamMembers.length,
        validated: teamMembers.filter(m => m.diploma_status === 'validated').length,
        pending: teamMembers.filter(m => m.diploma_status === 'pending').length,
        rejected: teamMembers.filter(m => m.diploma_status === 'rejected').length,
    };

    const currentStats = activeTab === 'cvs' ? cvStats : diplomaStats;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="CVs & Diplômes - RH" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Gestion des CVs & Diplômes
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Téléchargez et validez les CVs et diplômes des membres de l'équipe projet
                        </p>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
                        <div className="flex items-start">
                            <User className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">
                                    Rôle RH - Gestion documentaire
                                </p>
                                <p className="text-sm text-blue-700 mt-1">
                                    Vous êtes responsable de télécharger, vérifier et valider tous les CVs et diplômes des membres d'équipe ajoutés par les fournisseurs. Assurez-vous de la conformité et de l'authenticité des documents.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow mb-8">
                        <div className="border-b border-gray-200">
                            <nav className="flex -mb-px">
                                <button
                                    onClick={() => setActiveTab('cvs')}
                                    className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === 'cvs'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <FileText className="w-5 h-5" />
                                    <span>Curriculum Vitae</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('diplomas')}
                                    className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === 'diplomas'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <GraduationCap className="w-5 h-5" />
                                    <span>Diplômes</span>
                                </button>
                            </nav>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-4 gap-4 mb-6">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{currentStats.total}</p>
                                    <p className="text-sm text-gray-600">Total</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">{currentStats.validated}</p>
                                    <p className="text-sm text-gray-600">Validés</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-yellow-600">{currentStats.pending}</p>
                                    <p className="text-sm text-gray-600">En attente</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-red-600">{currentStats.rejected}</p>
                                    <p className="text-sm text-gray-600">Rejetés</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Rechercher un membre..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Filter className="w-5 h-5 text-gray-400" />
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">Tous les statuts</option>
                                        <option value="validated">Validés</option>
                                        <option value="pending">En attente</option>
                                        <option value="rejected">Rejetés</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {filteredMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {member.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">{member.role}</p>
                                                    <p className="text-xs text-gray-500">{member.qualification}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {activeTab === 'cvs' ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <FileText className="w-5 h-5 text-gray-400" />
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {member.cv_file || 'Aucun CV téléchargé'}
                                                            </span>
                                                        </div>
                                                        {member.cv_upload_date && (
                                                            <p className="text-xs text-gray-500 ml-8">
                                                                Téléchargé le {member.cv_upload_date}
                                                            </p>
                                                        )}
                                                        {member.cv_rejection_reason && (
                                                            <p className="text-sm text-red-600 mt-2 ml-8">
                                                                Raison du rejet: {member.cv_rejection_reason}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        {getStatusBadge(member.cv_status)}
                                                        {member.cv_file && (
                                                            <>
                                                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                                    <Eye className="w-5 h-5" />
                                                                </button>
                                                                <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                                                    <Download className="w-5 h-5" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-end space-x-3">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedMember(member);
                                                            setData('member_id', member.id);
                                                            setData('document_type', 'cv');
                                                            setShowUploadModal(true);
                                                        }}
                                                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                                    >
                                                        {member.cv_file ? 'Remplacer le CV' : 'Télécharger le CV'}
                                                    </button>
                                                    {member.cv_file && member.cv_status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleValidate(member.id, 'cv', 'validated')}
                                                                className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                                                            >
                                                                Valider
                                                            </button>
                                                            <button
                                                                onClick={() => handleValidate(member.id, 'cv', 'rejected')}
                                                                className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                                            >
                                                                Rejeter
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <GraduationCap className="w-5 h-5 text-gray-400" />
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {member.diploma_file || 'Aucun diplôme téléchargé'}
                                                            </span>
                                                        </div>
                                                        {member.diploma_upload_date && (
                                                            <p className="text-xs text-gray-500 ml-8">
                                                                Téléchargé le {member.diploma_upload_date}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        {getStatusBadge(member.diploma_status)}
                                                        {member.diploma_file && (
                                                            <>
                                                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                                    <Eye className="w-5 h-5" />
                                                                </button>
                                                                <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                                                    <Download className="w-5 h-5" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-end space-x-3">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedMember(member);
                                                            setData('member_id', member.id);
                                                            setData('document_type', 'diploma');
                                                            setShowUploadModal(true);
                                                        }}
                                                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                                    >
                                                        {member.diploma_file ? 'Remplacer le diplôme' : 'Télécharger le diplôme'}
                                                    </button>
                                                    {member.diploma_file && member.diploma_status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleValidate(member.id, 'diploma', 'validated')}
                                                                className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                                                            >
                                                                Valider
                                                            </button>
                                                            <button
                                                                onClick={() => handleValidate(member.id, 'diploma', 'rejected')}
                                                                className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                                            >
                                                                Rejeter
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {member.validated_by && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <p className="text-xs text-gray-600">
                                                    Validé par {member.validated_by} le {member.validation_date}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {showUploadModal && selectedMember && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg max-w-xl w-full">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Télécharger {data.document_type === 'cv' ? 'le CV' : 'le diplôme'}
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Pour: {selectedMember.name} - {selectedMember.role}
                                    </p>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Fichier {data.document_type === 'cv' ? 'CV' : 'Diplôme'} *
                                        </label>
                                        <label className="flex items-center justify-center px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                                            <div className="text-center">
                                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-sm text-gray-600">
                                                    {data.file ? data.file.name : 'Cliquez pour sélectionner un fichier'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    PDF uniquement (Max. 5MB)
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                accept=".pdf"
                                            />
                                        </label>
                                        {errors.file && (
                                            <p className="text-sm text-red-600 mt-1">{errors.file}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Statut de validation
                                        </label>
                                        <select
                                            value={data.validation_status}
                                            onChange={(e) => setData('validation_status', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="validated">Validé</option>
                                            <option value="pending">En attente de validation</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Commentaires (optionnel)
                                        </label>
                                        <textarea
                                            value={data.comments}
                                            onChange={(e) => setData('comments', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Ajoutez des commentaires sur le document..."
                                        />
                                    </div>
                                </div>
                                <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
                                    <button
                                        onClick={() => {
                                            setShowUploadModal(false);
                                            setSelectedMember(null);
                                            reset();
                                        }}
                                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={processing || !data.file}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                                    >
                                        {processing ? 'Téléchargement...' : 'Télécharger'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}