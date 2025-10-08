import AppLayout from '@/layouts/app-layout';
import { router, useForm, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, User, FileText, GraduationCap, Shield, FileCheck, Search, Filter, UserCheck, AlertTriangle } from 'lucide-react';

export default function TeamValidation() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showValidationModal, setShowValidationModal] = useState(false);
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
            title: 'Validation Équipe',
            href: '/ressources-humaines/team-validation',
        },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        member_id: '',
        validation_status: 'validated',
        rejection_reason: '',
        comments: '',
    });

    const teamMembers = [
        {
            id: 1,
            name: 'Youssef El Amrani',
            role: 'Chef de Projet',
            qualification: 'Ingénieur Civil - EHTP',
            experience_years: 15,
            availability: 'Temps plein',
            allocation_percentage: 100,
            cv_status: 'validated',
            diploma_status: 'validated',
            cnss_status: 'validated',
            contract_status: 'validated',
            attestation_status: 'validated',
            availability_declaration: 'validated',
            exclusivity_declaration: 'validated',
            documents_completion: 100,
            rh_validation: 'validated',
            validated_by: 'Sarah Bennani',
            validation_date: '2024-03-11',
            added_by_supplier: 'Fournisseur ABC',
        },
        {
            id: 2,
            name: 'Fatima Zahra Benjelloun',
            role: 'Ingénieur Principal',
            qualification: 'Ingénieur Génie Civil - EMI',
            experience_years: 12,
            availability: 'Temps plein',
            allocation_percentage: 100,
            cv_status: 'validated',
            diploma_status: 'validated',
            cnss_status: 'pending',
            contract_status: 'validated',
            attestation_status: 'validated',
            availability_declaration: 'pending',
            exclusivity_declaration: 'validated',
            documents_completion: 71,
            rh_validation: 'pending',
            validated_by: null,
            validation_date: null,
            added_by_supplier: 'Fournisseur ABC',
            pending_items: ['CNSS Documents', 'Déclaration de Disponibilité'],
        },
        {
            id: 3,
            name: 'Mohammed Tazi',
            role: 'Conducteur de Travaux',
            qualification: 'Technicien Supérieur TP',
            experience_years: 8,
            availability: 'Temps plein',
            allocation_percentage: 100,
            cv_status: 'validated',
            diploma_status: 'pending',
            cnss_status: 'validated',
            contract_status: 'pending',
            attestation_status: 'pending',
            availability_declaration: 'validated',
            exclusivity_declaration: 'validated',
            documents_completion: 57,
            rh_validation: 'pending',
            validated_by: null,
            validation_date: null,
            added_by_supplier: 'Fournisseur ABC',
            pending_items: ['Diplôme', 'Contrat de Travail', 'Attestation de Travail'],
        },
        {
            id: 4,
            name: 'Karim Alaoui',
            role: 'Topographe',
            qualification: 'Technicien Topographie',
            experience_years: 10,
            availability: 'Temps partiel',
            allocation_percentage: 50,
            cv_status: 'pending',
            diploma_status: 'pending',
            cnss_status: 'pending',
            contract_status: 'pending',
            attestation_status: 'pending',
            availability_declaration: 'pending',
            exclusivity_declaration: 'pending',
            documents_completion: 0,
            rh_validation: 'pending',
            validated_by: null,
            validation_date: null,
            added_by_supplier: 'Fournisseur ABC',
            pending_items: ['Tous les documents manquants'],
        },
        {
            id: 5,
            name: 'Salma Idrissi',
            role: 'Ingénieur Qualité',
            qualification: 'Ingénieur Qualité - ENSAM',
            experience_years: 6,
            availability: 'Temps plein',
            allocation_percentage: 100,
            cv_status: 'rejected',
            diploma_status: 'validated',
            cnss_status: 'validated',
            contract_status: 'rejected',
            attestation_status: 'validated',
            availability_declaration: 'validated',
            exclusivity_declaration: 'validated',
            documents_completion: 71,
            rh_validation: 'rejected',
            validated_by: 'Sarah Bennani',
            validation_date: '2024-03-14',
            rejection_reason: 'CV incomplet et contrat non signé',
            added_by_supplier: 'Fournisseur ABC',
        },
    ];

    const handleValidate = (memberId, status) => {
        if (status === 'rejected') {
            const member = teamMembers.find(m => m.id === memberId);
            setSelectedMember(member);
            setData('member_id', memberId);
            setData('validation_status', 'rejected');
            setShowValidationModal(true);
        } else {
            router.post('/ressources-humaines/team-validation/validate', {
                member_id: memberId,
                validation_status: status,
            });
        }
    };

    const handleSubmitValidation = () => {
        post('/ressources-humaines/team-validation/validate', {
            onSuccess: () => {
                reset();
                setShowValidationModal(false);
                setSelectedMember(null);
            },
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'validated':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'pending':
                return <AlertCircle className="w-4 h-4 text-yellow-500" />;
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <XCircle className="w-4 h-4 text-gray-400" />;
        }
    };

    const getValidationBadge = (status) => {
        switch (status) {
            case 'validated':
                return (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        <span>Validé RH</span>
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        <span>En attente validation</span>
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        <XCircle className="w-3 h-3" />
                        <span>Rejeté</span>
                    </span>
                );
            default:
                return null;
        }
    };

    const filteredMembers = teamMembers.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            member.role.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || member.rh_validation === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: teamMembers.length,
        validated: teamMembers.filter(m => m.rh_validation === 'validated').length,
        pending: teamMembers.filter(m => m.rh_validation === 'pending').length,
        rejected: teamMembers.filter(m => m.rh_validation === 'rejected').length,
        complete: teamMembers.filter(m => m.documents_completion === 100).length,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Validation Équipe - RH" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Validation de l'Équipe Projet
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Validez la composition de l'équipe et vérifiez la complétude des documents
                        </p>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
                        <div className="flex items-start">
                            <UserCheck className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">
                                    Rôle RH - Validation finale de l'équipe
                                </p>
                                <p className="text-sm text-blue-700 mt-1">
                                    Vous devez valider chaque membre de l'équipe après vérification de tous les documents (CV, diplômes, CNSS, contrats, attestations et déclarations). Un membre ne peut être validé que si tous ses documents sont complets et conformes.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <User className="w-8 h-8 text-blue-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            <p className="text-sm text-gray-600">Total Membres</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="text-2xl font-bold text-green-600">{stats.validated}</p>
                            <p className="text-sm text-gray-600">Validés</p>
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
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                            <p className="text-sm text-gray-600">Rejetés</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <FileCheck className="w-8 h-8 text-purple-600" />
                            </div>
                            <p className="text-2xl font-bold text-purple-600">{stats.complete}</p>
                            <p className="text-sm text-gray-600">Dossiers Complets</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow mb-6">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
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
                        </div>
                    </div>

                    <div className="space-y-6">
                        {filteredMembers.map((member) => (
                            <div
                                key={member.id}
                                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-start space-x-4 flex-1">
                                            <div className="flex-shrink-0 h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                                                <User className="w-8 h-8 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-xl font-semibold text-gray-900">
                                                        {member.name}
                                                    </h3>
                                                    {getValidationBadge(member.rh_validation)}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">{member.role}</p>
                                                <p className="text-sm text-gray-500">{member.qualification}</p>
                                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                                    <span>{member.experience_years} ans d'expérience</span>
                                                    <span>•</span>
                                                    <span>{member.availability} - {member.allocation_percentage}%</span>
                                                    <span>•</span>
                                                    <span className="text-xs text-gray-500">Ajouté par {member.added_by_supplier}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                                Documents Administratifs
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(member.cv_status)}
                                                        <span className="text-sm text-gray-700">Curriculum Vitae</span>
                                                    </div>
                                                    <button
                                                        onClick={() => router.visit('/ressources-humaines/cvs-diplomas')}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        Gérer
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(member.diploma_status)}
                                                        <span className="text-sm text-gray-700">Diplôme</span>
                                                    </div>
                                                    <button
                                                        onClick={() => router.visit('/ressources-humaines/cvs-diplomas')}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        Gérer
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(member.cnss_status)}
                                                        <span className="text-sm text-gray-700">Documents CNSS</span>
                                                    </div>
                                                    <button
                                                        onClick={() => router.visit('/ressources-humaines/cnss-documents')}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        Gérer
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                                Contrats & Déclarations
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(member.contract_status)}
                                                        <span className="text-sm text-gray-700">Contrat de Travail</span>
                                                    </div>
                                                    <button
                                                        onClick={() => router.visit('/ressources-humaines/contracts-declarations')}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        Gérer
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(member.attestation_status)}
                                                        <span className="text-sm text-gray-700">Attestation de Travail</span>
                                                    </div>
                                                    <button
                                                        onClick={() => router.visit('/ressources-humaines/contracts-declarations')}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        Gérer
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(member.availability_declaration)}
                                                        <span className="text-sm text-gray-700">Décl. Disponibilité</span>
                                                    </div>
                                                    <button
                                                        onClick={() => router.visit('/ressources-humaines/contracts-declarations')}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        Gérer
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(member.exclusivity_declaration)}
                                                        <span className="text-sm text-gray-700">Décl. Exclusivité</span>
                                                    </div>
                                                    <button
                                                        onClick={() => router.visit('/ressources-humaines/contracts-declarations')}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        Gérer
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">
                                                Complétude du dossier
                                            </span>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {member.documents_completion}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full transition-all ${
                                                    member.documents_completion === 100
                                                        ? 'bg-green-500'
                                                        : member.documents_completion >= 50
                                                        ? 'bg-blue-500'
                                                        : 'bg-yellow-500'
                                                }`}
                                                style={{ width: `${member.documents_completion}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {member.pending_items && member.pending_items.length > 0 && (
                                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                                            <div className="flex items-start">
                                                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                                                <div>
                                                    <p className="text-sm font-medium text-yellow-900">
                                                        Documents en attente
                                                    </p>
                                                    <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                                                        {member.pending_items.map((item, index) => (
                                                            <li key={index}>{item}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {member.rejection_reason && (
                                        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                                            <div className="flex items-start">
                                                <XCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                                                <div>
                                                    <p className="text-sm font-medium text-red-900">
                                                        Raison du rejet
                                                    </p>
                                                    <p className="text-sm text-red-700 mt-1">
                                                        {member.rejection_reason}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {member.validated_by && (
                                        <div className="bg-green-50 rounded-lg p-3 mb-6">
                                            <p className="text-sm text-green-800">
                                                ✓ Validé par {member.validated_by} le {member.validation_date}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-end space-x-3">
                                        {member.rh_validation === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleValidate(member.id, 'validated')}
                                                    disabled={member.documents_completion < 100}
                                                    className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                    <span>Valider le membre</span>
                                                </button>
                                                <button
                                                    onClick={() => handleValidate(member.id, 'rejected')}
                                                    className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                    <span>Rejeter</span>
                                                </button>
                                            </>
                                        )}
                                        {member.rh_validation === 'rejected' && (
                                            <button
                                                onClick={() => handleValidate(member.id, 'validated')}
                                                disabled={member.documents_completion < 100}
                                                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                                <span>Revalider le membre</span>
                                            </button>
                                        )}
                                        {member.rh_validation === 'validated' && (
                                            <div className="flex items-center space-x-2 text-green-600">
                                                <CheckCircle className="w-6 h-6" />
                                                <span className="font-medium">Membre validé</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {showValidationModal && selectedMember && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg max-w-xl w-full">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Rejeter le membre
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {selectedMember.name} - {selectedMember.role}
                                    </p>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Raison du rejet *
                                        </label>
                                        <textarea
                                            value={data.rejection_reason}
                                            onChange={(e) => setData('rejection_reason', e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Expliquez pourquoi ce membre est rejeté (documents manquants, non-conformité, etc.)"
                                        />
                                        {errors.rejection_reason && (
                                            <p className="text-sm text-red-600 mt-1">{errors.rejection_reason}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Commentaires additionnels
                                        </label>
                                        <textarea
                                            value={data.comments}
                                            onChange={(e) => setData('comments', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Commentaires ou recommandations..."
                                        />
                                    </div>
                                </div>
                                <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
                                    <button
                                        onClick={() => {
                                            setShowValidationModal(false);
                                            setSelectedMember(null);
                                            reset();
                                        }}
                                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleSubmitValidation}
                                        disabled={processing || !data.rejection_reason}
                                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                                    >
                                        {processing ? 'Rejet...' : 'Confirmer le rejet'}
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