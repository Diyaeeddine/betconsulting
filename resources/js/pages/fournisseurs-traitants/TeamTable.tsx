import AppLayout from '@/layouts/app-layout';
import { router, useForm, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit, Trash2, User, CheckCircle, XCircle, AlertCircle, Search, Filter, UserCheck } from 'lucide-react';

export default function TeamTable() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

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
            title: 'Équipe Projet',
            href: '/fournisseurs-traitants/team-table',
        },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        role: '',
        member_name: '',
        qualification: '',
        experience_years: '',
        availability: '',
        allocation_percentage: '',
        responsibilities: '',
    });

    const teamMembers = [
        {
            id: 1,
            role: 'Chef de Projet',
            member_name: 'Youssef El Amrani',
            qualification: 'Ingénieur Civil - EHTP',
            experience_years: 15,
            availability: 'full-time',
            allocation_percentage: 100,
            responsibilities: 'Direction générale du projet, coordination équipes',
            cv_status: 'validated',
            diploma_status: 'validated',
            cnss_status: 'validated',
            contract_status: 'validated',
            rh_validation: 'validated',
            added_date: '2024-03-10',
        },
        {
            id: 2,
            role: 'Ingénieur Principal',
            member_name: 'Fatima Zahra Benjelloun',
            qualification: 'Ingénieur Génie Civil - EMI',
            experience_years: 12,
            availability: 'full-time',
            allocation_percentage: 100,
            responsibilities: 'Études techniques, supervision travaux',
            cv_status: 'validated',
            diploma_status: 'validated',
            cnss_status: 'pending',
            contract_status: 'validated',
            rh_validation: 'pending',
            added_date: '2024-03-11',
        },
        {
            id: 3,
            role: 'Conducteur de Travaux',
            member_name: 'Mohammed Tazi',
            qualification: 'Technicien Supérieur TP',
            experience_years: 8,
            availability: 'full-time',
            allocation_percentage: 100,
            responsibilities: 'Conduite chantier, gestion équipes terrain',
            cv_status: 'validated',
            diploma_status: 'pending',
            cnss_status: 'validated',
            contract_status: 'pending',
            rh_validation: 'pending',
            added_date: '2024-03-11',
        },
        {
            id: 4,
            role: 'Topographe',
            member_name: 'Karim Alaoui',
            qualification: 'Technicien Topographie',
            experience_years: 10,
            availability: 'part-time',
            allocation_percentage: 50,
            responsibilities: 'Relevés topographiques, implantation',
            cv_status: 'pending',
            diploma_status: 'pending',
            cnss_status: 'pending',
            contract_status: 'pending',
            rh_validation: 'pending',
            added_date: '2024-03-12',
        },
        {
            id: 5,
            role: 'Ingénieur Qualité',
            member_name: 'Salma Idrissi',
            qualification: 'Ingénieur Qualité - ENSAM',
            experience_years: 6,
            availability: 'full-time',
            allocation_percentage: 100,
            responsibilities: 'Contrôle qualité, audits, documentation',
            cv_status: 'rejected',
            diploma_status: 'validated',
            cnss_status: 'validated',
            contract_status: 'validated',
            rh_validation: 'rejected',
            rejection_reason: 'CV incomplet - expérience non documentée',
            added_date: '2024-03-13',
        },
    ];

    const roles = [
        'Chef de Projet',
        'Ingénieur Principal',
        'Conducteur de Travaux',
        'Topographe',
        'Ingénieur Qualité',
        'Technicien',
        'Chef de Chantier',
        'Métreur',
        'Dessinateur',
    ];

    const handleSubmit = () => {
        post('/fournisseurs-traitants/team-table/store', {
            onSuccess: () => {
                reset();
                setShowAddModal(false);
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
                    <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        <span>Validé RH</span>
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        <span>En attente RH</span>
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        <XCircle className="w-3 h-3" />
                        <span>Rejeté RH</span>
                    </span>
                );
            default:
                return null;
        }
    };

    const getCompletionPercentage = (member) => {
        const statuses = [member.cv_status, member.diploma_status, member.cnss_status, member.contract_status];
        const validated = statuses.filter(s => s === 'validated').length;
        return (validated / statuses.length) * 100;
    };

    const filteredMembers = teamMembers.filter(member => {
        const matchesSearch = member.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            member.role.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || member.rh_validation === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: teamMembers.length,
        validated: teamMembers.filter(m => m.rh_validation === 'validated').length,
        pending: teamMembers.filter(m => m.rh_validation === 'pending').length,
        rejected: teamMembers.filter(m => m.rh_validation === 'rejected').length,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Équipe Projet" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Équipe Projet
                                </h1>
                                <p className="mt-2 text-gray-600">
                                    Construisez votre équipe projet - Les documents seront validés par RH
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Ajouter un membre</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                            <p className="text-sm text-gray-600">Validés RH</p>
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
                                        placeholder="Rechercher un membre ou rôle..."
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

                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Composition de l'Équipe
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Membre
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Expérience
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Disponibilité
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Documents RH
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Statut
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredMembers.map((member) => (
                                        <tr key={member.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {member.member_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {member.role}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {member.qualification}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{member.experience_years} ans</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {member.availability === 'full-time' ? 'Temps plein' : 'Temps partiel'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {member.allocation_percentage}%
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex items-center space-x-1" title="CV">
                                                        {getStatusIcon(member.cv_status)}
                                                        <span className="text-xs text-gray-600">CV</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1" title="Diplôme">
                                                        {getStatusIcon(member.diploma_status)}
                                                        <span className="text-xs text-gray-600">Dip</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1" title="CNSS">
                                                        {getStatusIcon(member.cnss_status)}
                                                        <span className="text-xs text-gray-600">CNSS</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1" title="Contrat">
                                                        {getStatusIcon(member.contract_status)}
                                                        <span className="text-xs text-gray-600">Cont</span>
                                                    </div>
                                                </div>
                                                <div className="mt-2">
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                        <div
                                                            className={`h-1.5 rounded-full ${
                                                                getCompletionPercentage(member) === 100
                                                                    ? 'bg-green-500'
                                                                    : 'bg-blue-500'
                                                            }`}
                                                            style={{ width: `${getCompletionPercentage(member)}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {getCompletionPercentage(member)}% complété
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getValidationBadge(member.rh_validation)}
                                                {member.rejection_reason && (
                                                    <p className="text-xs text-red-600 mt-1">
                                                        {member.rejection_reason}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <button className="text-blue-600 hover:text-blue-900">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button className="text-red-600 hover:text-red-900">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {showAddModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Ajouter un membre d'équipe
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Les documents CV, diplômes, CNSS et contrats seront gérés par RH
                                    </p>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Rôle dans le projet *
                                        </label>
                                        <select
                                            value={data.role}
                                            onChange={(e) => setData('role', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Sélectionner un rôle</option>
                                            {roles.map((role) => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                        {errors.role && (
                                            <p className="text-sm text-red-600 mt-1">{errors.role}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nom complet *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.member_name}
                                            onChange={(e) => setData('member_name', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Ex: Mohammed Alami"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Qualification / Diplôme *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.qualification}
                                            onChange={(e) => setData('qualification', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Ex: Ingénieur Civil - EHTP"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Années d'expérience *
                                            </label>
                                            <input
                                                type="number"
                                                value={data.experience_years}
                                                onChange={(e) => setData('experience_years', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="10"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Taux d'allocation (%) *
                                            </label>
                                            <input
                                                type="number"
                                                value={data.allocation_percentage}
                                                onChange={(e) => setData('allocation_percentage', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="100"
                                                min="0"
                                                max="100"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Disponibilité *
                                        </label>
                                        <select
                                            value={data.availability}
                                            onChange={(e) => setData('availability', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Sélectionner</option>
                                            <option value="full-time">Temps plein</option>
                                            <option value="part-time">Temps partiel</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Responsabilités
                                        </label>
                                        <textarea
                                            value={data.responsibilities}
                                            onChange={(e) => setData('responsibilities', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Description des responsabilités et missions..."
                                        />
                                    </div>

                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="flex items-start space-x-3">
                                            <UserCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-900">
                                                    Documents gérés par RH
                                                </p>
                                                <p className="text-xs text-blue-700 mt-1">
                                                    Le service RH se chargera de télécharger et valider: CV, diplômes, attestations CNSS et contrats de travail
                                                </p>
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
                                        {processing ? 'Ajout...' : 'Ajouter le membre'}
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