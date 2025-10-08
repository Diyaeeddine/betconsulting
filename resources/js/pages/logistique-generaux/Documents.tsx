import React, { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { router, useForm, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Document {
    id: number;
    type: string;
    periodicite: string;
    file_path: string;
    date_expiration: string | null;
    user_id: number;
    archived: boolean;
    is_complementary: boolean;
    created_at: string;
    updated_at: string;
    user: User;
}

interface DocumentsPageProps extends PageProps {
    documents: Document[];
    availableTypes: string[];
    fixedPeriodicities: Record<string, string>;
}

export default function Documents({ auth, documents, availableTypes, fixedPeriodicities }: DocumentsPageProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRenewModal, setShowRenewModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const { flash } = usePage().props as any;

    const breadcrumbs = [
        {
            title: 'Dashboard Logistique & Moyens Généraux',
            href: '/logistique-generaux/dashboard',
        },
        {
            title: 'Les documents',
            href: '/logistique-generaux/documents',
        },
    ];

    const { data, setData, post, reset, errors, processing } = useForm({
        type: '',
        file: null as File | null,
    });

    const { data: renewData, setData: setRenewData, post: postRenew, reset: resetRenew, errors: renewErrors, processing: renewProcessing } = useForm({
        file: null as File | null,
    });

    // Filter documents based on search
    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => 
            doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.periodicite.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [documents, searchTerm]);

    // Calculate days until expiration
    const getDaysUntilExpiration = (expirationDate: string | null) => {
        if (!expirationDate) return null;
        const today = new Date();
        const expiration = new Date(expirationDate);
        const diffTime = expiration.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Get status color
    const getStatusColor = (days: number | null) => {
        if (days === null) return 'gray';
        if (days < 0) return 'red';
        if (days <= 7) return 'orange';
        if (days <= 30) return 'yellow';
        return 'green';
    };

    // Handle add document
    const handleAddDocument = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('logistique-generaux.documents.store'), {
            onSuccess: () => {
                reset();
                setShowAddModal(false);
            },
        });
    };

    // Handle renew document
    const handleRenewDocument = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDocument) return;
        postRenew(route('logistique-generaux.documents.renew', selectedDocument.id), {
            onSuccess: () => {
                resetRenew();
                setShowRenewModal(false);
                setSelectedDocument(null);
            },
        });
    };

    // Handle delete
    const handleDelete = (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
            router.delete(route('logistique-generaux.documents.delete', id));
        }
    };

    // Handle download
    const handleDownload = (filePath: string) => {
        window.open(`/storage/${filePath}`, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Documents Standards" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {flash.error}
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Header Actions */}
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex-1 max-w-lg">
                                    <input
                                        type="text"
                                        placeholder="Rechercher par type, périodicité ou utilisateur..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="ml-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Ajouter un document
                                </button>
                            </div>

                            {/* Documents Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Périodicité</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'expiration</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ajouté par</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'ajout</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredDocuments.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                                    Aucun document trouvé
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredDocuments.map((doc) => {
                                                const daysUntilExpiration = getDaysUntilExpiration(doc.date_expiration);
                                                const statusColor = getStatusColor(daysUntilExpiration);
                                                
                                                return (
                                                    <tr key={doc.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {doc.type}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                                {doc.periodicite}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {doc.date_expiration ? new Date(doc.date_expiration).toLocaleDateString('fr-FR') : 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            {daysUntilExpiration !== null && (
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium
                                                                    ${statusColor === 'red' ? 'bg-red-100 text-red-800' : ''}
                                                                    ${statusColor === 'orange' ? 'bg-orange-100 text-orange-800' : ''}
                                                                    ${statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
                                                                    ${statusColor === 'green' ? 'bg-green-100 text-green-800' : ''}
                                                                `}>
                                                                    {daysUntilExpiration < 0 
                                                                        ? `Expiré il y a ${Math.abs(daysUntilExpiration)} j` 
                                                                        : `${daysUntilExpiration} jours restants`}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {doc.user.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                                            <button
                                                                onClick={() => handleDownload(doc.file_path)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                Télécharger
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedDocument(doc);
                                                                    setShowRenewModal(true);
                                                                }}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                Renouveler
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(doc.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Supprimer
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Document Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Ajouter un document</h3>
                        <form onSubmit={handleAddDocument}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type de document</label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Sélectionner un type</option>
                                    {availableTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type} ({fixedPeriodicities[type]})
                                        </option>
                                    ))}
                                </select>
                                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fichier</label>
                                <input
                                    type="file"
                                    onChange={(e) => setData('file', e.target.files?.[0] || null)}
                                    accept=".pdf,.jpg,.png,.doc,.docx,.xlsx"
                                    className="w-full"
                                    required
                                />
                                {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        reset();
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Ajout...' : 'Ajouter'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Renew Document Modal */}
            {showRenewModal && selectedDocument && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Renouveler: {selectedDocument.type}</h3>
                        <form onSubmit={handleRenewDocument}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau fichier</label>
                                <input
                                    type="file"
                                    onChange={(e) => setRenewData('file', e.target.files?.[0] || null)}
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx"
                                    className="w-full"
                                    required
                                />
                                {renewErrors.file && <p className="mt-1 text-sm text-red-600">{renewErrors.file}</p>}
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRenewModal(false);
                                        setSelectedDocument(null);
                                        resetRenew();
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={renewProcessing}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    {renewProcessing ? 'Renouvellement...' : 'Renouveler'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}