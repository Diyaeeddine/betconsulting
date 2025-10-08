import AppLayout from '@/layouts/app-layout';
import { router, usePage } from '@inertiajs/react';
import { Archive, ArrowLeft, Calendar, Clock, Download, Eye, FileText } from 'lucide-react';
import React from 'react';

const breadcrumbs = [
    {
        title: 'Documents',
        href: '/documents',
    },
    {
        title: 'Documents archivés',
        href: '/documents/archives',
    },
];

interface Doc {
    id: number;
    type: string;
    periodicite: string;
    file_path: string;
    date_expiration: string | null;
    updated_at: string;
}

interface PageProps {
    archivedDocuments: Doc[];
    [key: string]: any;
}

const DocumentsArchive: React.FC = () => {
    const { archivedDocuments } = usePage<PageProps>().props;

    const getPeriodicityBadgeColor = (periodicite: string) => {
        switch (periodicite) {
            case 'mensuel':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'trimestriel':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'semestriel':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'annuel':
                return 'bg-sky-50 text-sky-700 border-sky-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3">
                                    <Archive className="h-8 w-8 text-blue-600" />
                                    <h1 className="text-3xl font-semibold text-gray-900">Documents archivés</h1>
                                </div>
                                <p className="mt-2 text-gray-600">Consultez les documents archivés et téléchargez-les si nécessaire</p>
                            </div>
                            <button
                                onClick={() => router.visit(route('documents.index'))}
                                className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Retour aux documents
                            </button>
                        </div>
                    </div>

                    {/* Liste des archives */}
                    {archivedDocuments.length === 0 ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                            <Archive className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-gray-500">Aucun document archivé trouvé</p>
                            <p className="text-sm text-gray-400">Les documents archivés apparaîtront ici</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {archivedDocuments.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm"
                                >
                                    <div className="flex items-start gap-3">
                                        <FileText className="mt-0.5 h-5 w-5 text-gray-400" />
                                        <div>
                                            <h4 className="font-medium text-gray-900">{doc.type}</h4>
                                            <div className="mt-2 space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${getPeriodicityBadgeColor(doc.periodicite)}`}
                                                    >
                                                        {doc.periodicite}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    {doc.date_expiration && (
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            <span className="text-red-600">
                                                                Expiré le {new Date(doc.date_expiration).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        <span>Archivé le {new Date(doc.updated_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={`/storage/${doc.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            Voir
                                        </a>
                                        <a
                                            href={`/storage/${doc.file_path}`}
                                            download
                                            className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            Télécharger
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default DocumentsArchive;
