import AppLayout from '@/layouts/app-layout';
import { router, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, Archive, Calendar, Eye, FileText, Folder, Plus, RefreshCw, Upload, X } from 'lucide-react';
import React, { useRef, useState } from 'react';

const breadcrumbs = [
    {
        title: 'Documents',
        href: '/documents',
    },
];

interface Document {
    id: number;
    type: string;
    periodicite: string;
    file_path: string;
    date_expiration: string | null;
    archived: boolean;
}

interface PageProps {
    documents: Document[];
    errors?: Record<string, string>;
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: any;
}

const fixedDocs: Record<string, string> = {
    'RC Mod.09': 'annuel',
    'RC Mod.07': 'trimestriel',
    'Attestation fiscal': 'annuel',
    Agrément: 'annuel',
    "Chiffre d'affaires": 'annuel',
    'Attestation CNSS': 'annuel',
    'Attestation salaries declares': 'mensuel',
    'Bordereaux CNSS': 'mensuel',
    'Déclaration salaires': 'mensuel',
    'Attestation affiliation CNSS': 'trimestriel',
};

// Seuils personnalisés
const thresholds: Record<string, number> = {
    mensuel: 7,
    trimestriel: 14,
    semestriel: 30,
    annuel: 60,
};

// Déterminer statut expiration
const getExpirationStatus = (date: string | null, periodicite: string) => {
    if (!date) return 'valid';

    const expDate = new Date(date);
    const today = new Date();

    if (expDate < today) {
        return 'expired';
    }

    const threshold = thresholds[periodicite?.toLowerCase()] ?? 30;
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= threshold / 2) {
        return 'critical'; // 🔴
    }
    if (diffDays <= threshold) {
        return 'warning'; // 🟠
    }

    return 'valid'; // ✅
};

const Documents: React.FC = () => {
    const { documents, errors = {}, flash = {} } = usePage<PageProps>().props;
    const [showForm, setShowForm] = useState(false);
    const [isComplementary, setIsComplementary] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, reset, processing } = useForm({
        type: 'RC Mod.09',
        periodicite: 'annuel',
        file: null as File | null,
    });

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.file) {
            alert('Veuillez sélectionner un fichier');
            return;
        }

        if (!isComplementary && fixedDocs[data.type]) {
            setData('periodicite', fixedDocs[data.type]);
        }

        post('/documents', {
            onSuccess: () => {
                reset();
                setShowForm(false);
                setIsComplementary(false);
            },
        });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('file', e.target.files[0]);
        }
    };

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
                                    <FileText className="h-8 w-8 text-blue-600" />
                                    <h1 className="text-3xl font-semibold text-gray-900">Documents permanents</h1>
                                </div>
                                <p className="mt-2 text-gray-600">Organisez et gérez vos documents obligatoires</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => router.visit(route('documents.archives'))}
                                    className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                >
                                    <Archive className="h-4 w-4" />
                                    Archives
                                </button>
                                <button
                                    onClick={() => router.visit(route('documents.complementaires.index'))}
                                    className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                >
                                    <Folder className="h-4 w-4" />
                                    Documents complémentaires
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Messages flash */}
                    {flash.success && (
                        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-4">
                            <p className="text-sm text-green-800">{flash.success}</p>
                        </div>
                    )}
                    {flash.error && (
                        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
                            <p className="text-sm text-red-800">{flash.error}</p>
                        </div>
                    )}

                    {/* Bouton ajouter */}
                    {!showForm && (
                        <div className="mb-6">
                            <button
                                onClick={() => {
                                    setIsComplementary(false);
                                    setShowForm(true);
                                    setData('type', 'RC Mod.09');
                                    setData('periodicite', 'annuel');
                                }}
                                className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4" />
                                Ajouter un document
                            </button>
                        </div>
                    )}

                    {/* Formulaire upload */}
                    {showForm && (
                        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <form onSubmit={handleUpload}>
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {isComplementary ? 'Ajouter un document complémentaire' : 'Ajouter un Documents permanent'}
                                    </h3>
                                    <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-500">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Type */}
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Type de document</label>
                                        <select
                                            value={data.type}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setData('type', val);
                                                setData('periodicite', fixedDocs[val]);
                                            }}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                        >
                                            {Object.keys(fixedDocs).map((doc) => (
                                                <option key={doc} value={doc}>
                                                    {doc}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Fichier */}
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Fichier</label>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx"
                                            onChange={handleFileSelect}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        {data.file && <p className="mt-1 text-sm text-gray-600">Fichier sélectionné: {data.file.name}</p>}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            <Upload className="h-4 w-4" />
                                            {processing ? 'Envoi...' : 'Uploader'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Liste documents */}
                    <div className="space-y-3">
                        {documents.length === 0 ? (
                            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-gray-500">Aucun document trouvé</p>
                                <p className="text-sm text-gray-400">Commencez par ajouter un document</p>
                            </div>
                        ) : (
                            documents.map((doc) => {
                                const status = getExpirationStatus(doc.date_expiration, doc.periodicite);
                                return (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm"
                                    >
                                        <div className="flex items-start gap-3">
                                            <FileText className="mt-0.5 h-5 w-5 text-gray-400" />
                                            <div>
                                                <h4 className="font-medium text-gray-900">{doc.type}</h4>
                                                <div className="mt-1 flex items-center gap-3">
                                                    <span
                                                        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${getPeriodicityBadgeColor(doc.periodicite)}`}
                                                    >
                                                        {doc.periodicite}
                                                    </span>
                                                    {doc.date_expiration && (
                                                        <div className="flex items-center gap-1">
                                                            {status === 'expired' ? (
                                                                <>
                                                                    <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                                                                    <span className="text-xs text-red-600">
                                                                        Expiré le {new Date(doc.date_expiration).toLocaleDateString()}
                                                                    </span>
                                                                </>
                                                            ) : status === 'critical' ? (
                                                                <>
                                                                    <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                                                                    <span className="text-xs text-red-600">
                                                                        Expire bientôt ({new Date(doc.date_expiration).toLocaleDateString()})
                                                                    </span>
                                                                </>
                                                            ) : status === 'warning' ? (
                                                                <>
                                                                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                                                    <span className="text-xs text-amber-600">
                                                                        Expire bientôt ({new Date(doc.date_expiration).toLocaleDateString()})
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                                    <span className="text-xs text-gray-500">
                                                                        Expire le {new Date(doc.date_expiration).toLocaleDateString()}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
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
                                            <button
                                                onClick={() => {
                                                    const input = document.createElement('input');
                                                    input.type = 'file';
                                                    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx';
                                                    input.onchange = (e: any) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            const form = new FormData();
                                                            form.append('file', file);
                                                            router.post(`/documents/${doc.id}/renew`, form);
                                                        }
                                                    };
                                                    input.click();
                                                }}
                                                className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                                    status === 'expired'
                                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                                        : status === 'critical'
                                                          ? 'bg-red-500 text-white hover:bg-red-600'
                                                          : status === 'warning'
                                                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                                                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                <RefreshCw className="h-3.5 w-3.5" />
                                                Renouveler
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Documents;
