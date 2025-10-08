import AppLayout from '@/layouts/app-layout';
import { router, useForm, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Upload, FileText, Download, Trash2, Eye, CheckCircle, XCircle, AlertCircle, Search, Filter, User, FileCheck, Calendar } from 'lucide-react';

export default function ContractsDeclarations() {
    const [activeTab, setActiveTab] = useState('contracts');
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
            title: 'Contrats & Attestations',
            href: '/ressources-humaines/contracts-declarations',
        },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        member_id: '',
        document_type: 'contract',
        file: null,
        contract_type: '',
        start_date: '',
        end_date: '',
        declaration_type: '',
        comments: '',
        validation_status: 'validated',
    });

    const documentTypes = [
        { value: 'contracts', label: 'Contrats de Travail', description: 'Contrats CDI, CDD, et avenants' },
        { value: 'attestations', label: 'Attestations de Travail', description: 'Attestations d\'emploi et de salaire' },
        { value: 'availability', label: 'Déclarations de Disponibilité', description: 'Disponibilité temps plein/partiel' },
        { value: 'exclusivity', label: 'Déclarations d\'Exclusivité', description: 'Engagement exclusif au projet' },
    ];

    const contractTypes = [
        { value: 'cdi', label: 'CDI - Contrat à Durée Indéterminée' },
        { value: 'cdd', label: 'CDD - Contrat à Durée Déterminée' },
        { value: 'avenant', label: 'Avenant au contrat' },
    ];

    const teamMembers = [
        {
            id: 1,
            name: 'Youssef El Amrani',
            role: 'Chef de Projet',
            contract_status: 'validated',
            contract_file: 'Contrat_CDI_Youssef_ElAmrani.pdf',
            contract_type: 'CDI',
            contract_start_date: '2020-01-15',
            contract_upload_date: '2024-03-10',
            attestation_status: 'validated',
            attestation_file: 'Attestation_Travail_Youssef.pdf',
            attestation_upload_date: '2024-03-10',
            availability_status: 'validated',
            availability_file: 'Declaration_Disponibilite_Youssef.pdf',
            availability_type: 'Temps plein - 100%',
            availability_upload_date: '2024-03-10',
            exclusivity_status: 'validated',
            exclusivity_file: 'Declaration_Exclusivite_Youssef.pdf',
            exclusivity_upload_date: '2024-03-10',
            validated_by: 'Sarah Bennani',
            validation_date: '2024-03-11',
        },
        {
            id: 2,
            name: 'Fatima Zahra Benjelloun',
            role: 'Ingénieur Principal',
            contract_status: 'validated',
            contract_file: 'Contrat_CDI_Fatima_Benjelloun.pdf',
            contract_type: 'CDI',
            contract_start_date: '2021-03-01',
            contract_upload_date: '2024-03-11',
            attestation_status: 'validated',
            attestation_file: 'Attestation_Travail_Fatima.pdf',
            attestation_upload_date: '2024-03-11',
            availability_status: 'pending',
            availability_file: null,
            availability_type: null,
            availability_upload_date: null,
            exclusivity_status: 'validated',
            exclusivity_file: 'Declaration_Exclusivite_Fatima.pdf',
            exclusivity_upload_date: '2024-03-11',
            validated_by: 'Sarah Bennani',
            validation_date: '2024-03-12',
        },
        {
            id: 3,
            name: 'Mohammed Tazi',
            role: 'Conducteur de Travaux',
            contract_status: 'validated',
            contract_file: 'Contrat_CDD_Mohammed_Tazi.pdf',
            contract_type: 'CDD',
            contract_start_date: '2023-06-01',
            contract_end_date: '2024-12-31',
            contract_upload_date: '2024-03-11',
            attestation_status: 'pending',
            attestation_file: null,
            attestation_upload_date: null,
            availability_status: 'validated',
            availability_file: 'Declaration_Disponibilite_Mohammed.pdf',
            availability_type: 'Temps plein - 100%',
            availability_upload_date: '2024-03-11',
            exclusivity_status: 'validated',
            exclusivity_file: 'Declaration_Exclusivite_Mohammed.pdf',
            exclusivity_upload_date: '2024-03-11',
            validated_by: 'Sarah Bennani',
            validation_date: '2024-03-12',
        },
        {
            id: 4,
            name: 'Karim Alaoui',
            role: 'Topographe',
            contract_status: 'pending',
            contract_file: null,
            contract_type: null,
            contract_start_date: null,
            contract_upload_date: null,
            attestation_status: 'pending',
            attestation_file: null,
            attestation_upload_date: null,
            availability_status: 'pending',
            availability_file: null,
            availability_type: null,
            availability_upload_date: null,
            exclusivity_status: 'pending',
            exclusivity_file: null,
            exclusivity_upload_date: null,
            validated_by: null,
            validation_date: null,
        },
        {
            id: 5,
            name: 'Salma Idrissi',
            role: 'Ingénieur Qualité',
            contract_status: 'rejected',
            contract_file: 'Contrat_CDI_Salma_Idrissi.pdf',
            contract_type: 'CDI',
            contract_start_date: '2022-09-15',
            contract_upload_date: '2024-03-13',
            contract_rejection_reason: 'Contrat non signé par les deux parties',
            attestation_status: 'validated',
            attestation_file: 'Attestation_Travail_Salma.pdf',
            attestation_upload_date: '2024-03-13',
            availability_status: 'validated',
            availability_file: 'Declaration_Disponibilite_Salma.pdf',
            availability_type: 'Temps plein - 100%',
            availability_upload_date: '2024-03-13',
            exclusivity_status: 'validated',
            exclusivity_file: 'Declaration_Exclusivite_Salma.pdf',
            exclusivity_upload_date: '2024-03-13',
            validated_by: 'Sarah Bennani',
            validation_date: '2024-03-14',
        },
    ];

    const handleFileChange = (e) => {
        setData('file', e.target.files[0]);
    };

    const handleSubmit = () => {
        post('/ressources-humaines/contracts-declarations/upload', {
            onSuccess: () => {
                reset();
                setShowUploadModal(false);
                setSelectedMember(null);
            },
        });
    };

    const handleValidate = (memberId, docType, status) => {
        router.post('/ressources-humaines/contracts-declarations/validate', {
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
            case 'contracts':
                return { 
                    status: member.contract_status, 
                    file: member.contract_file, 
                    upload_date: member.contract_upload_date,
                    contract_type: member.contract_type,
                    start_date: member.contract_start_date,
                    end_date: member.contract_end_date,
                    rejection: member.contract_rejection_reason
                };
            case 'attestations':
                return { 
                    status: member.attestation_status, 
                    file: member.attestation_file, 
                    upload_date: member.attestation_upload_date 
                };
            case 'availability':
                return { 
                    status: member.availability_status, 
                    file: member.availability_file, 
                    upload_date: member.availability_upload_date,
                    type: member.availability_type
                };
            case 'exclusivity':
                return { 
                    status: member.exclusivity_status, 
                    file: member.exclusivity_file, 
                    upload_date: member.exclusivity_upload_date 
                };
            default:
                return {};
        }
    };

    const filteredMembers = teamMembers.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            member.role.toLowerCase().includes(searchTerm.toLowerCase());
        
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
            <Head title="Contrats & Attestations - RH" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Gestion des Contrats & Attestations
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Téléchargez et validez les contrats de travail et déclarations des membres de l'équipe projet
                        </p>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
                        <div className="flex items-start">
                            <FileCheck className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">
                                    Rôle RH - Documents contractuels officiels
                                </p>
                                <p className="text-sm text-blue-700 mt-1">
                                    Vous êtes responsable de gérer tous les contrats de travail, attestations d'emploi et déclarations (disponibilité et exclusivité). Vérifiez que tous les documents sont signés et conformes.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow mb-8">
                        <div className="border-b border-gray-200">
                            <nav className="flex -mb-px overflow-x-auto">
                                {documentTypes.map((type) => (
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
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <FileText className="w-5 h-5 text-gray-400" />
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {docStatus.file || `Aucun document téléchargé`}
                                                            </span>
                                                        </div>
                                                        {docStatus.upload_date && (
                                                            <p className="text-xs text-gray-500 ml-8">
                                                                Téléchargé le {docStatus.upload_date}
                                                            </p>
                                                        )}
                                                        {docStatus.contract_type && (
                                                            <div className="flex items-center space-x-2 ml-8 mt-1">
                                                                <FileCheck className="w-3 h-3 text-gray-400" />
                                                                <p className="text-xs text-gray-500">
                                                                    Type: {docStatus.contract_type}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {docStatus.start_date && (
                                                            <div className="flex items-center space-x-2 ml-8 mt-1">
                                                                <Calendar className="w-3 h-3 text-gray-400" />
                                                                <p className="text-xs text-gray-500">
                                                                    Date début: {docStatus.start_date}
                                                                    {docStatus.end_date && ` - Date fin: ${docStatus.end_date}`}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {docStatus.type && (
                                                            <div className="flex items-center space-x-2 ml-8 mt-1">
                                                                <FileCheck className="w-3 h-3 text-gray-400" />
                                                                <p className="text-xs text-gray-500">
                                                                    {docStatus.type}
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
                            <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Télécharger {documentTypes.find(t => t.value === activeTab)?.label}
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Pour: {selectedMember.name} - {selectedMember.role}
                                    </p>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Fichier *
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

                                    {activeTab === 'contracts' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Type de contrat *
                                                </label>
                                                <select
                                                    value={data.contract_type}
                                                    onChange={(e) => setData('contract_type', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Sélectionner un type</option>
                                                    {contractTypes.map((type) => (
                                                        <option key={type.value} value={type.value}>
                                                            {type.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Date début *
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={data.start_date}
                                                        onChange={(e) => setData('start_date', e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Date fin (si CDD)
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={data.end_date}
                                                        onChange={(e) => setData('end_date', e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {activeTab === 'availability' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Type de disponibilité *
                                            </label>
                                            <select
                                                value={data.declaration_type}
                                                onChange={(e) => setData('declaration_type', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Sélectionner</option>
                                                <option value="full-time-100">Temps plein - 100%</option>
                                                <option value="part-time-50">Temps partiel - 50%</option>
                                                <option value="part-time-75">Temps partiel - 75%</option>
                                            </select>
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