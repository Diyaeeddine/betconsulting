import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { ChangeEvent, FormEvent, useState } from 'react';

interface Salarie {
    id: number;
    nom: string;
    prenom: string;
    matricule: string;
    email: string;
    telephone?: string;
    poste: string;
    service: string;
    date_embauche?: string;
    statut: string;
}

interface Horaires {
    debut: string;
    fin: string;
    jours_travail: string;
}

interface Statistiques {
    taches_aujourdhui: number;
    taches_totales: number;
    taches_terminees: number;
    taux_completion: number;
}

interface Props {
    salarie: Salarie;
    horaires: Horaires;
    statistiques: Statistiques;
}

interface CongeFormData {
    date_debut: string;
    date_fin: string;
    type: string;
    motif: string;
}

interface CertificatFormData {
    date_debut: string;
    date_fin: string;
    description: string;
    certificat: File | null;
}

export default function Profile({ salarie, horaires, statistiques }: Props) {
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [fichierCertificat, setFichierCertificat] = useState<File | null>(null);
    const [activeTab, setActiveTab] = useState<'conge' | 'certificat'>('conge');

    const {
        data: formConge,
        setData: setFormConge,
        post: postConge,
        processing: processingConge,
        reset: resetConge,
    } = useForm<CongeFormData>({
        date_debut: '',
        date_fin: '',
        type: '',
        motif: '',
    });

    const {
        data: formCertificat,
        setData: setFormCertificat,
        post: postCertificat,
        processing: processingCertificat,
        reset: resetCertificat,
    } = useForm<CertificatFormData>({
        date_debut: '',
        date_fin: '',
        description: '',
        certificat: null,
    });

    const initiales = `${salarie.prenom?.charAt(0) || ''}${salarie.nom?.charAt(0) || ''}`.toUpperCase();

    const afficherNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const soumettreConge = (e: FormEvent) => {
        e.preventDefault();
        postConge(route('salarie.conge.demander'), {
            onSuccess: () => {
                afficherNotification('Demande de congé envoyée avec succès', 'success');
                resetConge();
            },
            onError: () => {
                afficherNotification("Erreur lors de l'envoi de la demande", 'error');
            },
        });
    };

    const gererFichier = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFichierCertificat(file);
        setFormCertificat('certificat', file);
    };

    const soumettreCertificat = (e: FormEvent) => {
        e.preventDefault();
        postCertificat(route('salarie.certificat.demander'), {
            onSuccess: () => {
                afficherNotification('Certificat médical envoyé avec succès', 'success');
                resetCertificat();
                setFichierCertificat(null);
            },
            onError: () => {
                afficherNotification("Erreur lors de l'envoi du certificat", 'error');
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Mon Profil" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* En-tête avec informations principales */}
                    <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-xl">
                        <div className="p-8">
                            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/20 text-3xl font-bold text-white shadow-lg ring-4 ring-white/30 backdrop-blur-sm">
                                        {initiales}
                                    </div>
                                    <div className="text-white">
                                        <h1 className="mb-2 text-4xl font-bold">
                                            {salarie.prenom} {salarie.nom}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-4 text-blue-100">
                                            <span className="flex items-center gap-2">
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                {salarie.poste}
                                            </span>
                                            <span className="h-1 w-1 rounded-full bg-blue-200"></span>
                                            <span>{salarie.service}</span>
                                            <span className="h-1 w-1 rounded-full bg-blue-200"></span>
                                            <span>Mat: {salarie.matricule}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistiques principales en haut */}
                    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 opacity-10"></div>
                            <div className="relative">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-transform group-hover:scale-110">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                        />
                                    </svg>
                                </div>
                                <p className="mb-1 text-sm font-medium text-gray-600">Tâches aujourd'hui</p>
                                <p className="text-4xl font-bold text-gray-900">{statistiques.taches_aujourdhui}</p>
                                <p className="mt-2 text-xs text-gray-500">À traiter aujourd'hui</p>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-gradient-to-br from-green-500 to-green-600 opacity-10"></div>
                            <div className="relative">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 transition-transform group-hover:scale-110">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <p className="mb-1 text-sm font-medium text-gray-600">Tâches terminées</p>
                                <p className="text-4xl font-bold text-gray-900">{statistiques.taches_terminees}</p>
                                <p className="mt-2 text-xs text-gray-500">Sur toute la carrière</p>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 opacity-10"></div>
                            <div className="relative">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 transition-transform group-hover:scale-110">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                                        />
                                    </svg>
                                </div>
                                <p className="mb-1 text-sm font-medium text-gray-600">Tâches totales</p>
                                <p className="text-4xl font-bold text-gray-900">{statistiques.taches_totales}</p>
                                <p className="mt-2 text-xs text-gray-500">Depuis le début</p>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 opacity-10"></div>
                            <div className="relative">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 transition-transform group-hover:scale-110">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <p className="mb-1 text-sm font-medium text-gray-600">Taux de complétion</p>
                                <p className="text-4xl font-bold text-gray-900">{statistiques.taux_completion}%</p>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                                    <div
                                        className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                                        style={{ width: `${statistiques.taux_completion}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Informations personnelles et horaires */}
                        <div className="space-y-6">
                            {/* Informations personnelles */}
                            <div className="rounded-2xl bg-white p-6 shadow-lg">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Informations personnelles</h2>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100">
                                        <svg className="mt-0.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-gray-500">Email</p>
                                            <p className="truncate font-medium text-gray-900">{salarie.email}</p>
                                        </div>
                                    </div>
                                    {salarie.telephone && (
                                        <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100">
                                            <svg className="mt-0.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                />
                                            </svg>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-gray-500">Téléphone</p>
                                                <p className="font-medium text-gray-900">{salarie.telephone}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100">
                                        <svg className="mt-0.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-500">Date d'embauche</p>
                                            <p className="font-medium text-gray-900">{salarie.date_embauche}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100">
                                        <svg className="mt-0.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                            />
                                        </svg>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-500">Statut</p>
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                                    salarie.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {salarie.statut}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Horaires de travail */}
                            <div className="rounded-2xl bg-white p-6 shadow-lg">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Horaires de travail</h2>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                                                <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-600">Heure de début</p>
                                                <p className="text-lg font-bold text-gray-900">{horaires.debut}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-orange-50 to-red-50 p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                                                <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-600">Heure de fin</p>
                                                <p className="text-lg font-bold text-gray-900">{horaires.fin}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-4">
                                        <p className="mb-2 text-xs font-medium text-gray-600">Jours de travail</p>
                                        <p className="text-sm font-medium text-gray-900">{horaires.jours_travail}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Demandes de congés et certificats */}
                        <div className="lg:col-span-2">
                            <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
                                <div className="border-b border-gray-200">
                                    <div className="flex">
                                        <button
                                            onClick={() => setActiveTab('conge')}
                                            className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                                                activeTab === 'conge'
                                                    ? 'border-b-2 border-blue-600 bg-blue-50 text-blue-600'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                Demande de Congé
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('certificat')}
                                            className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                                                activeTab === 'certificat'
                                                    ? 'border-b-2 border-green-600 bg-green-50 text-green-600'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                                Certificat Médical
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-8">
                                    {activeTab === 'conge' ? (
                                        <form onSubmit={soumettreConge} className="space-y-6">
                                            <div>
                                                <p className="mb-6 text-sm text-gray-600">
                                                    Remplissez ce formulaire pour soumettre une demande de congé. Votre demande sera examinée par
                                                    votre responsable.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div>
                                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                        Date de début <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={formConge.date_debut}
                                                        onChange={(e) => setFormConge('date_debut', e.target.value)}
                                                        required
                                                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                        Date de fin <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={formConge.date_fin}
                                                        onChange={(e) => setFormConge('date_fin', e.target.value)}
                                                        required
                                                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                    Type de congé <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={formConge.type}
                                                    onChange={(e) => setFormConge('type', e.target.value)}
                                                    required
                                                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                >
                                                    <option value="">Sélectionner un type de congé</option>
                                                    <option value="conge_annuel">Congé annuel</option>
                                                    <option value="conge_maladie">Congé maladie</option>
                                                    <option value="conge_sans_solde">Congé sans solde</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-gray-700">Motif (optionnel)</label>
                                                <textarea
                                                    value={formConge.motif}
                                                    onChange={(e) => setFormConge('motif', e.target.value)}
                                                    rows={4}
                                                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                    placeholder="Décrivez la raison de votre demande de congé..."
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={processingConge}
                                                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
                                            >
                                                {processingConge ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            ></circle>
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                            ></path>
                                                        </svg>
                                                        Envoi en cours...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                                            />
                                                        </svg>
                                                        Soumettre la demande de congé
                                                    </span>
                                                )}
                                            </button>
                                        </form>
                                    ) : (
                                        <form onSubmit={soumettreCertificat} className="space-y-6">
                                            <div>
                                                <p className="mb-6 text-sm text-gray-600">
                                                    Téléchargez votre certificat médical avec les dates concernées. Les formats acceptés sont PDF, JPG
                                                    et PNG.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div>
                                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                        Date de début <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={formCertificat.date_debut}
                                                        onChange={(e) => setFormCertificat('date_debut', e.target.value)}
                                                        required
                                                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                        Date de fin <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={formCertificat.date_fin}
                                                        onChange={(e) => setFormCertificat('date_fin', e.target.value)}
                                                        required
                                                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-gray-700">Description (optionnel)</label>
                                                <textarea
                                                    value={formCertificat.description}
                                                    onChange={(e) => setFormCertificat('description', e.target.value)}
                                                    rows={3}
                                                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                                                    placeholder="Informations complémentaires sur votre arrêt médical..."
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                    Certificat médical <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        id="file-upload"
                                                        type="file"
                                                        className="sr-only"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={gererFichier}
                                                        required
                                                    />
                                                    <label
                                                        htmlFor="file-upload"
                                                        className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 transition-all hover:border-green-500 hover:bg-green-50"
                                                    >
                                                        {!fichierCertificat ? (
                                                            <>
                                                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 transition-colors group-hover:bg-green-100">
                                                                    <svg
                                                                        className="h-8 w-8 text-gray-400 group-hover:text-green-600"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                                        />
                                                                    </svg>
                                                                </div>
                                                                <p className="mb-2 text-sm font-semibold text-gray-700">
                                                                    Cliquez pour télécharger ou glissez-déposez
                                                                </p>
                                                                <p className="text-xs text-gray-500">PDF, JPG, PNG (max. 5MB)</p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                                                    <svg
                                                                        className="h-8 w-8 text-green-600"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                        />
                                                                    </svg>
                                                                </div>
                                                                <p className="mb-2 text-sm font-semibold text-green-700">Fichier sélectionné</p>
                                                                <p className="max-w-xs truncate text-xs font-medium text-gray-600">
                                                                    {fichierCertificat.name}
                                                                </p>
                                                                <p className="mt-2 text-xs text-gray-500">Cliquez pour changer</p>
                                                            </>
                                                        )}
                                                    </label>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={processingCertificat || !fichierCertificat}
                                                className="w-full rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 font-semibold text-white shadow-lg transition-all hover:from-green-700 hover:to-green-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
                                            >
                                                {processingCertificat ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            ></circle>
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                            ></path>
                                                        </svg>
                                                        Envoi en cours...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                            />
                                                        </svg>
                                                        Soumettre le certificat médical
                                                    </span>
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications toast */}
                {notification && (
                    <div className="animate-slide-in-right fixed right-4 bottom-4 z-50">
                        <div
                            className={`max-w-md min-w-md rounded-2xl p-6 shadow-2xl ${
                                notification.type === 'success'
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                    {notification.type === 'success' ? (
                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    ) : (
                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold">{notification.type === 'success' ? 'Succès!' : 'Erreur'}</p>
                                    <p className="text-sm opacity-90">{notification.message}</p>
                                </div>
                                <button
                                    onClick={() => setNotification(null)}
                                    className="flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-white/20"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
