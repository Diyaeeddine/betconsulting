import AppLayout from '@/layouts/app-layout';
import { router, useForm, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Upload, FileText, Download, Trash2, Eye, CheckCircle, AlertCircle, Plus, Building2, Calendar, DollarSign, Edit, Users } from 'lucide-react';

export default function SubcontractorAgreements() {
    const [showAddModal, setShowAddModal] = useState(false);

    const breadcrumbs = [
        {
            title: 'Accueil',
            href: '/',
        },
        {
            title: 'Offre Technique',
            href: '/fournisseurs-traitants/offre-technique',
        },
        {
            title: 'Conventions Sous-traitants',
            href: '/fournisseurs-traitants/subcontractor-agreements',
        },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        subcontractor_type: '',
        company_name: '',
        contact_person: '',
        contact_phone: '',
        contact_email: '',
        service_description: '',
        contract_value: '',
        start_date: '',
        end_date: '',
        contract_file: null,
        insurance_file: null,
        registration_file: null,
    });

    const subcontractorTypes = [
        { value: 'topographe', label: 'Topographe', icon: '📐' },
        { value: 'laboratoire', label: 'Laboratoire d\'essais', icon: '🔬' },
        { value: 'geotechnique', label: 'Expert Géotechnique', icon: '🏔️' },
        { value: 'bureau_etudes', label: 'Bureau d\'études', icon: '📊' },
        { value: 'engins', label: 'Location d\'engins', icon: '🚜' },
        { value: 'electricite', label: 'Électricité', icon: '⚡' },
        { value: 'plomberie', label: 'Plomberie', icon: '🔧' },
        { value: 'securite', label: 'Sécurité', icon: '🛡️' },
        { value: 'autre', label: 'Autre', icon: '📋' },
    ];

    const agreements = [
        {
            id: 1,
            subcontractor_type: 'topographe',
            company_name: 'GéoTopo Maroc',
            contact_person: 'Hassan Berrada',
            contact_phone: '0661-234567',
            contact_email: 'h.berrada@geotopo.ma',
            service_description: 'Relevés topographiques et implantation des ouvrages',
            contract_value: '450000',
            start_date: '2024-04-01',
            end_date: '2024-12-31',
            status: 'validated',
            contract_file: 'Convention_GeoTopo_2024.pdf',
            insurance_file: 'Assurance_GeoTopo.pdf',
            registration_file: 'RC_GeoTopo.pdf',
            uploaded_date: '2024-03-08',
            validated_by: 'Service RH',
            validated_date: '2024-03-10',
        },
        {
            id: 2,
            subcontractor_type: 'laboratoire',
            company_name: 'Labo Control TP',
            contact_person: 'Samira Idrissi',
            contact_phone: '0522-445566',
            contact_email: 'contact@labocontrol.ma',
            service_description: 'Essais de contrôle qualité matériaux et sols',
            contract_value: '680000',
            start_date: '2024-04-01',
            end_date: '2025-03-31',
            status: 'validated',
            contract_file: 'Convention_LaboControl_2024.pdf',
            insurance_file: 'Assurance_LaboControl.pdf',
            registration_file: 'RC_LaboControl.pdf',
            uploaded_date: '2024-03-07',
            validated_by: 'Service RH',
            validated_date: '2024-03-09',
        },
        {
            id: 3,
            subcontractor_type: 'geotechnique',
            company_name: 'Expert Géo Solutions',
            contact_person: 'Karim Tazi',
            contact_phone: '0537-889900',
            contact_email: 'k.tazi@expertgeo.ma',
            service_description: 'Études géotechniques et reconnaissance des sols',
            contract_value: '920000',
            start_date: '2024-03-15',
            end_date: '2024-09-30',
            status: 'pending',
            contract_file: 'Convention_ExpertGeo_2024.pdf',
            insurance_file: 'Assurance_ExpertGeo.pdf',
            registration_file: null,
            uploaded_date: '2024-03-12',
            validated_by: null,
            validated_date: null,
        },
        {
            id: 4,
            subcontractor_type: 'bureau_etudes',
            company_name: 'BET Ingénierie Plus',
            contact_person: 'Nadia Alami',
            contact_phone: '0522-667788',
            contact_email: 'contact@betingenierie.ma',
            service_description: 'Études d\'exécution et plans de détails',
            contract_value: '1250000',
            start_date: '2024-04-15',
            end_date: '2024-12-31',
            status: 'pending',
            contract_file: 'Convention_BET_2024.pdf',
            insurance_file: null,
            registration_file: 'RC_BET.pdf',
            uploaded_date: '2024-03-14',
            validated_by: null,
            validated_date: null,
        },
    ];

    const handleFileChange = (field, e) => {
        setData(field, e.target.files[0]);
    };

    const handleSubmit = () => {
        post('/fournisseurs-traitants/subcontractor-agreements/store', {
            onSuccess: () => {
                reset();
                setShowAddModal(false);
            },
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'validated':
                return (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        <span>Validé par RH</span>
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        <span>En attente de validation</span>
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        <span>Rejeté</span>
                    </span>
                );
            default:
                return null;
        }
    };

    const getTypeLabel = (type) => {
        const found = subcontractorTypes.find(t => t.value === type);
        return found ? `${found.icon} ${found.label}` : type;
    };

    const stats = {
        total: agreements.length,
        validated: agreements.filter(a => a.status === 'validated').length,
        pending: agreements.filter(a => a.status === 'pending').length,
        totalValue: agreements.reduce((sum, a) => sum + parseFloat(a.contract_value), 0),
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Conventions Sous-traitants" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Conventions Sous-traitants
                                </h1>
                                <p className="mt-2 text-gray-600">
                                    Gérez vos accords avec les sous-traitants spécialisés
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Ajouter une convention</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <Building2 className="w-8 h-8 text-blue-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            <p className="text-sm text-gray-600">Total Conventions</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="text-2xl font-bold text-green-600">{stats.validated}</p>
                            <p className="text-sm text-gray-600">Validées</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <AlertCircle className="w-8 h-8 text-yellow-600" />
                            </div>
                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            <p className="text-sm text-gray-600">En attente</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <DollarSign className="w-8 h-8 text-purple-600" />
                            </div>
                            <p className="text-2xl font-bold text-purple-600">
                                {(stats.totalValue / 1000000).toFixed(2)}M
                            </p>
                            <p className="text-sm text-gray-600">Valeur Totale (DH)</p>
                        </div>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
                        <div className="flex items-start">
                            <Users className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">
                                    Information importante
                                </p>
                                <p className="text-sm text-blue-700 mt-1">
                                    Toutes les conventions seront examinées par le service RH pour vérification de conformité (RC, assurance, qualifications). Assurez-vous de télécharger tous les documents requis.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Liste des Conventions
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-6">
                                {agreements.map((agreement) => (
                                    <div
                                        key={agreement.id}
                                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <span className="text-2xl">
                                                        {subcontractorTypes.find(t => t.value === agreement.subcontractor_type)?.icon}
                                                    </span>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {agreement.company_name}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            {subcontractorTypes.find(t => t.value === agreement.subcontractor_type)?.label}
                                                        </p>
                                                    </div>
                                                </div>
                                                {getStatusBadge(agreement.status)}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="space-y-3">
                                                <div className="flex items-start space-x-3">
                                                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{agreement.contact_person}</p>
                                                        <p className="text-sm text-gray-600">{agreement.contact_phone}</p>
                                                        <p className="text-sm text-gray-600">{agreement.contact_email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start space-x-3">
                                                    <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {parseFloat(agreement.contract_value).toLocaleString()} DH
                                                        </p>
                                                        <p className="text-sm text-gray-600">Montant du contrat</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-start space-x-3">
                                                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {agreement.start_date} → {agreement.end_date}
                                                        </p>
                                                        <p className="text-sm text-gray-600">Période du contrat</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start space-x-3">
                                                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Téléchargé le {agreement.uploaded_date}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-4 bg-gray-50 rounded-lg p-3">
                                            <p className="text-sm font-medium text-gray-900 mb-1">Description des services:</p>
                                            <p className="text-sm text-gray-700">{agreement.service_description}</p>
                                        </div>

                                        <div className="border-t border-gray-200 pt-4">
                                            <p className="text-sm font-medium text-gray-900 mb-3">Documents joints:</p>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                                                    agreement.contract_file ? 'bg-green-50' : 'bg-gray-100'
                                                }`}>
                                                    {agreement.contract_file ? (
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <AlertCircle className="w-4 h-4 text-gray-400" />
                                                    )}
                                                    <span className="text-sm text-gray-700">Convention signée</span>
                                                </div>
                                                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                                                    agreement.insurance_file ? 'bg-green-50' : 'bg-gray-100'
                                                }`}>
                                                    {agreement.insurance_file ? (
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <AlertCircle className="w-4 h-4 text-gray-400" />
                                                    )}
                                                    <span className="text-sm text-gray-700">Assurance RC</span>
                                                </div>
                                                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                                                    agreement.registration_file ? 'bg-green-50' : 'bg-gray-100'
                                                }`}>
                                                    {agreement.registration_file ? (
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <AlertCircle className="w-4 h-4 text-gray-400" />
                                                    )}
                                                    <span className="text-sm text-gray-700">Registre Commerce</span>
                                                </div>
                                            </div>
                                        </div>

                                        {agreement.validated_by && (
                                            <div className="mt-4 bg-green-50 rounded-lg p-3">
                                                <p className="text-sm text-green-800">
                                                    ✓ Validé par {agreement.validated_by} le {agreement.validated_date}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center space-x-3 mt-4">
                                            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                                                <Eye className="w-4 h-4" />
                                                <span className="text-sm font-medium">Voir les documents</span>
                                            </button>
                                            <button className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                                                <Download className="w-4 h-4" />
                                                <span className="text-sm font-medium">Télécharger</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {showAddModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Ajouter une nouvelle convention
                                    </h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Type de sous-traitant *
                                        </label>
                                        <select
                                            value={data.subcontractor_type}
                                            onChange={(e) => setData('subcontractor_type', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Sélectionner un type</option>
                                            {subcontractorTypes.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.icon} {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nom de l'entreprise *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.company_name}
                                            onChange={(e) => setData('company_name', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Ex: GéoTopo Maroc"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Personne de contact *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.contact_person}
                                                onChange={(e) => setData('contact_person', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Nom complet"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Téléphone *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.contact_phone}
                                                onChange={(e) => setData('contact_phone', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="0661-234567"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={data.contact_email}
                                                onChange={(e) => setData('contact_email', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="contact@entreprise.ma"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description des services *
                                        </label>
                                        <textarea
                                            value={data.service_description}
                                            onChange={(e) => setData('service_description', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Description détaillée des services à fournir..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Montant (DH) *
                                            </label>
                                            <input
                                                type="number"
                                                value={data.contract_value}
                                                onChange={(e) => setData('contract_value', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="450000"
                                            />
                                        </div>
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
                                                Date fin *
                                            </label>
                                            <input
                                                type="date"
                                                value={data.end_date}
                                                onChange={(e) => setData('end_date', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-4">
                                        <h3 className="text-sm font-medium text-gray-900 mb-4">Documents requis</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Convention signée *
                                                </label>
                                                <label className="flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                                                    <div className="text-center">
                                                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                                        <p className="text-sm text-gray-600">
                                                            {data.contract_file ? data.contract_file.name : 'Convention avec cachet et signature'}
                                                        </p>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        onChange={(e) => handleFileChange('contract_file', e)}
                                                        className="hidden"
                                                        accept=".pdf"
                                                    />
                                                </label>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Assurance Responsabilité Civile *
                                                </label>
                                                <label className="flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                                                    <div className="text-center">
                                                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                                        <p className="text-sm text-gray-600">
                                                            {data.insurance_file ? data.insurance_file.name : 'Attestation d\'assurance valide'}
                                                        </p>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        onChange={(e) => handleFileChange('insurance_file', e)}
                                                        className="hidden"
                                                        accept=".pdf"
                                                    />
                                                </label>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Registre de Commerce
                                                </label>
                                                <label className="flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                                                    <div className="text-center">
                                                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                                        <p className="text-sm text-gray-600">
                                                            {data.registration_file ? data.registration_file.name : 'Copie du registre de commerce'}
                                                        </p>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        onChange={(e) => handleFileChange('registration_file', e)}
                                                        className="hidden"
                                                        accept=".pdf"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
                                    <button
                                        onClick={() => {
                                            setShowAddModal(false);
                                            reset();
                                        }}
                                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={processing}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                                    >
                                        {processing ? 'Enregistrement...' : 'Enregistrer'}
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