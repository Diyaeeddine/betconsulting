import AppLayout from '@/layouts/app-layout';
import { router, useForm, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Upload, FileText, Download, Trash2, Eye, CheckCircle, XCircle, AlertCircle, Search, Filter, User, Shield, Calendar } from 'lucide-react';

export default function CNSSDocuments() {
    const [activeTab, setActiveTab] = useState('asd');
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
            title: 'Documents CNSS',
            href: '/ressources-humaines/cnss-documents',
        },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        member_id: '',
        document_type: 'asd',
        file: null,
        period_start: '',
        period_end: '',
        comments: '',
        validation_status: 'validated',
    });

    const cnssTypes = [
        { value: 'asd', label: 'Attestation ASD', description: 'Attestation de Situation Déclarative' },
        { value: 'historique', label: 'Historique CNSS', description: 'Historique des affiliations et déclarations' },
        { value: 'bd', label: 'BD CNSS', description: 'Bordereau de Déclaration CNSS' },
    ];

    const teamMembers = [
        {
            id: 1,
            name: 'Youssef El Amrani',
            role: 'Chef de Projet',
            matricule_cnss: 'M123456789',
            asd_status: 'validated',
            asd_file: 'ASD_Youssef_ElAmrani_Q12024.pdf',
            asd_period: 'T1 2024',
            asd_upload_date: '2024-03-10',
            historique_status: 'validated',
            historique_file: 'Historique_CNSS_Youssef.pdf',
            historique_upload_date: '2024-03-10',
            bd_status: 'validated',
            bd_file: 'BD_CNSS_Youssef_Q12024.pdf',
            bd_period: 'T1 2024',
            bd_upload_date: '2024-03-10',
            validated_by: 'Sarah Bennani',
            validation_date: '2024-03-11',
        },
        {
            id: 2,
            name: 'Fatima Zahra Benjelloun',
            role: 'Ingénieur Principal',
            matricule_cnss: 'M987654321',
            asd_status: 'validated',
            asd_file: 'ASD_Fatima_Benjelloun_Q12024.pdf',
            asd_period: 'T1 2024',
            asd_upload_date: '2024-03-11',
            historique_status: 'pending',
            historique_file: null,
            historique_upload_date: null,
            bd_status: 'validated',
            bd_file: 'BD_CNSS_Fatima_Q12024.pdf',
            bd_period: 'T1 2024',
            bd_upload_date: '2024-03-11',
            validated_by: 'Sarah Bennani',
            validation_date: '2024-03-12',
        },
        {
            id: 3,
            name: 'Mohammed Tazi',
            role: 'Conducteur de Travaux',
            matricule_cnss: 'M456789123',
            asd_status: 'validated',
            asd_file: 'ASD_Mohammed_Tazi_Q12024.pdf',
            asd_period: 'T1 2024',
            asd_upload_date: '2024-03-11',
            historique_status: 'validated',
            historique_file: 'Historique_CNSS_Mohammed.pdf',
            historique_upload_date: '2024-03-11',
            bd_status: 'pending',
            bd_file: null,
            bd_period: null,
            bd_upload_date: null,
            validated_by: 'Sarah Bennani',
            validation_date: '2024-03-12',
        },
        {
            id: 4,
            name: 'Karim Alaoui',
            role: 'Topographe',
            matricule_cnss: 'M789456123',
            asd_status: 'pending',
            asd_file: null,
            asd_period: null,
            asd_upload_date: null,
            historique_status: 'pending',
            historique_file: null,
            historique_upload_date: null,
            bd_status: 'pending',
            bd_file: null,
            bd_period: null,
            bd_upload_date: null,
            validated_by: null,
            validation_date: null,
        },
        {
            id: 5,
            name: 'Salma Idrissi',
            role: 'Ingénieur Qualité',
            matricule_cnss: 'M321654987',
            asd_status: 'rejected',
            asd_file: 'ASD_Salma_Idrissi_Q42023.pdf',
            asd_period: 'T4 2023',
            asd_upload_date: '2024-03-13',
            asd_rejection_reason: 'Document expiré - doit être T1 2024',
            historique_status: 'validated',
            historique_file: 'Historique_CNSS_Salma.pdf',
            historique_upload_date: '2024-03-13',
            bd_status: 'validated',
            bd_file: 'BD_CNSS_Salma_Q12024.pdf',
            bd_period: 'T1 2024',
            bd_upload_date: '2024-03-13',
            validated_by: 'Sarah Bennani',
            validation_date: '2024-03-14',
        },
    ];

    const handleFileChange = (e) => {
        setData('file', e.target.files[0]);
    };

    const handleSubmit = () => {
        post('/ressources-humaines/cnss-documents/upload', {
            onSuccess: () => {
                reset();
                setShowUploadModal(false);
                setSelectedMember(null);
            },
        });
    };

    const handleValidate = (memberId, docType, status) => {
        router.post('/ressources-humaines/cnss-documents/validate', {
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

    const getDocumentStatus = (member, type) => {
        switch (type) {
            case 'asd':
                return { status: member.asd_status, file: member.asd_file, upload_date: member.asd_upload_date, period: member.asd_period, rejection: member.asd_rejection_reason };
            case 'historique':
                return { status: member.historique_status, file: member.historique_file, upload_date: member.historique_upload_date };
            case 'bd':
                return { status: member.bd_status, file: member.bd_file, upload_date: member.bd_upload_date, period: member.bd_period };
            default:
                return {};
        }
    };

    const filteredMembers = teamMembers.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            member.matricule_cnss.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesFilter = true;
        if (filterStatus !== 'all') {
            const docStatus = getDocumentStatus(member, activeTab);
            matchesFilter = docStatus.status === filterStatus;
        }
        return matchesSearch && matchesFilter;
    });

    const getStats = (type) => {
        const total = teamMembers.length;
        let validated = 0, pending = 0, rejected = 0;
        
        teamMembers.forEach(member => {
            const docStatus = getDocumentStatus(member, type);
            if (docStatus.status === 'validated') validated++;
            else if (docStatus.status === 'pending') pending++;
            else if (docStatus.status === 'rejected') rejected++;
        });
        
        return { total, validated, pending, rejected };
    };

    const currentStats = getStats(activeTab);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Documents CNSS - RH" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Gestion des Documents CNSS
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Téléchargez et validez les documents CNSS des membres de l'équipe projet
                        </p>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
                        <div className="flex items-start">
                            <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">
                                    Rôle RH - Documents CNSS officiels
                                </p>
                                <p className="text-sm text-blue-700 mt-1">
                                    Vous êtes responsable de télécharger les documents CNSS officiels directement depuis le portail CNSS. Vérifiez la validité et la période de chaque document avant validation.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow mb-8">
                        <div className="border-b border-gray-200">
                            <nav className="flex -mb-px overflow-x-auto">
                                {cnssTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        onClick={() => setActiveTab(type.value)}
                                        className={`flex flex-col px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                            activeTab === type.value
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <span>{type.label}</span>
                                        <span className="text-xs text-gray-500 mt-1">{type.description}</span>
                                    </button>
                                ))}
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
                                        placeholder="Rechercher par nom ou matricule..."
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
                                {filteredMembers.map((member) => {
                                    const docStatus = getDocumentStatus(member, activeTab);
                                    return (
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
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <Shield className="w-4 h-4 text-gray-400" />
                                                            <p className="text-xs text-gray-500">
                                                                Matricule CNSS: {member.matricule_cnss}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <FileText className="w-5 h-5 text-gray-400" />
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {docStatus.file || `Aucun document ${cnssTypes.find(t => t.value === activeTab)?.label} téléchargé`}
                                                            </span>
                                                        </div>
                                                        {docStatus.upload_date && (
                                                            <p className="text-xs text-gray-500 ml-8">
                                                                Téléchargé le {docStatus.upload_date}
                                                            </p>
                                                        )}
                                                        {docStatus.period && (
                                                            <div className="flex items-center space-x-2 ml-8 mt-1">
                                                                <Calendar className="w-3 h-3 text-gray-400" />
                                                                <p className="text-xs text-gray-500">
                                                                    Période: {docStatus.period}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {docStatus.rejection && (
                                                            <p className="text-sm text-red-600 mt-2 ml-8">
                                                                Raison du rejet: {docStatus.rejection}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        {getStatusBadge(docStatus.status)}
                                                        {docStatus.file && (
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
                                                            setData('document_type', activeTab);
                                                            setShowUploadModal(true);
                                                        }}
                                                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                                    >
                                                        {docStatus.file ? 'Remplacer le document' : 'Télécharger le document'}
                                                    </button>
                                                    {docStatus.file && docStatus.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleValidate(member.id, activeTab, 'validated')}
                                                                className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                                                            >
                                                                Valider
                                                            </button>
                                                            <button
                                                                onClick={() => handleValidate(member.id, activeTab, 'rejected')}
                                                                className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                                            >
                                                                Rejeter
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {member.validated_by && (
                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                    <p className="text-xs text-gray-600">
                                                        Validé par {member.validated_by} le {member.validation_date}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {showUploadModal && selectedMember && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg max-w-xl w-full">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Télécharger {cnssTypes.find(t => t.value === activeTab)?.label}
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Pour: {selectedMember.name} - {selectedMember.role}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Matricule CNSS: {selectedMember.matricule_cnss}
                                    </p>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Fichier {cnssTypes.find(t => t.value === activeTab)?.label} *
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

                                    {(activeTab === 'asd' || activeTab === 'bd') && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Période début
                                                </label>
                                                <input
                                                    type="date"
                                                    value={data.period_start}
                                                    onChange={(e) => setData('period_start', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Période fin
                                                </label>
                                                <input
                                                    type="date"
                                                    value={data.period_end}
                                                    onChange={(e) => setData('period_end', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    )}

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