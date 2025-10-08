import AppLayout from '@/layouts/app-layout';
import { router, useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

interface Salarie {
    id: number;
    nom: string;
    prenom: string;
    poste: string;
    email: string;
}

interface Props {
    salaries: Salarie[];
}

interface ScoreItem {
    note: number;
    observations: string;
}

interface FormData {
  salarie_id: string;
  poste_vise: string;
  date_entretien: string;
  type_entretien: string;
  evaluateur_principal: string;
  expert_technique: string;
  responsable_rh: string;

  scores_techniques: {
    formation_certifications: ScoreItem;
    maitrise_logiciels: ScoreItem;
    expertise_technique: ScoreItem;
    connaissance_marche: ScoreItem;
    gestion_projets: ScoreItem;
    innovation_veille: ScoreItem;
  };

  scores_comportementaux: {
    communication_redaction: ScoreItem;
    travail_equipe: ScoreItem;
    rigueur_precision: ScoreItem;
    gestion_stress: ScoreItem;
    autonomie_initiative: ScoreItem;
  };

  scores_adequation: {
    motivation_engagement: ScoreItem;
    disponibilite_mobilite: ScoreItem;
    potentiel_evolution: ScoreItem;
    connaissance_entreprise: ScoreItem;
  };

  points_forts: string;
  points_vigilance: string;

  // Merged field: now typed union
  recommandation: 'fortement_recommande' | 'recommande' | 'reserve' | 'non_recommande' | '';

  contrat_cdi: File | null;
  cv: File | null;
  diplome: File | null;
  certificat_travail: File | null;
}

export default function Entretien({ salaries }: Props) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        salarie_id: '',
        poste_vise: '',
        date_entretien: new Date().toISOString().split('T')[0],
        type_entretien: 'premier',
        evaluateur_principal: '',
        expert_technique: '',
        responsable_rh: '',
        scores_techniques: {
            formation_certifications: { note: 0, observations: '' },
            maitrise_logiciels: { note: 0, observations: '' },
            expertise_technique: { note: 0, observations: '' },
            connaissance_marche: { note: 0, observations: '' },
            gestion_projets: { note: 0, observations: '' },
            innovation_veille: { note: 0, observations: '' },
        },
        scores_comportementaux: {
            communication_redaction: { note: 0, observations: '' },
            travail_equipe: { note: 0, observations: '' },
            rigueur_precision: { note: 0, observations: '' },
            gestion_stress: { note: 0, observations: '' },
            autonomie_initiative: { note: 0, observations: '' },
        },
        scores_adequation: {
            motivation_engagement: { note: 0, observations: '' },
            disponibilite_mobilite: { note: 0, observations: '' },
            potentiel_evolution: { note: 0, observations: '' },
            connaissance_entreprise: { note: 0, observations: '' },
        },
        points_forts: '',
        points_vigilance: '',
        recommandation: '',
        contrat_cdi: null,
        cv: null,
        diplome: null,
        certificat_travail: null,
    });

    const [fileNames, setFileNames] = useState({
        contrat_cdi: '',
        cv: '',
        diplome: '',
        certificat_travail: '',
    });

    const poids = {
        techniques: {
            formation_certifications: 3,
            maitrise_logiciels: 4,
            expertise_technique: 4,
            connaissance_marche: 3,
            gestion_projets: 3,
            innovation_veille: 3,
        },
        comportementaux: {
            communication_redaction: 3,
            travail_equipe: 2,
            rigueur_precision: 3,
            gestion_stress: 2,
            autonomie_initiative: 2,
        },
        adequation: {
            motivation_engagement: 2,
            disponibilite_mobilite: 2,
            potentiel_evolution: 2,
            connaissance_entreprise: 2,
        },
    };

    const calculateScore = (scores: Record<string, ScoreItem>, weights: Record<string, number>) => {
        return Object.entries(scores).reduce((total, [key, value]) => {
            const weight = weights[key] || 1;
            return total + (value.note * weight / 5);
        }, 0);
    };

    const scoreTechnique = calculateScore(data.scores_techniques, poids.techniques);
    const scoreComportemental = calculateScore(data.scores_comportementaux, poids.comportementaux);
    const scoreAdequation = calculateScore(data.scores_adequation, poids.adequation);
    const scoreTotal = scoreTechnique + scoreComportemental + scoreAdequation;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof fileNames) => {
        const file = e.target.files?.[0];
        if (file) {
            setData(field, file as any);
            setFileNames(prev => ({ ...prev, [field]: file.name }));
        }
    };

    const removeFile = (field: keyof typeof fileNames) => {
        setData(field, null as any);
        setFileNames(prev => ({ ...prev, [field]: '' }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('entretiens.store'), {
            forceFormData: true,
        });
    };

    const updateTechniqueScore = (key: keyof typeof data.scores_techniques, field: 'note' | 'observations', value: number | string) => {
        setData('scores_techniques', {
            ...data.scores_techniques,
            [key]: {
                ...data.scores_techniques[key],
                [field]: value,
            },
        });
    };

    const updateComportementalScore = (key: keyof typeof data.scores_comportementaux, field: 'note' | 'observations', value: number | string) => {
        setData('scores_comportementaux', {
            ...data.scores_comportementaux,
            [key]: {
                ...data.scores_comportementaux[key],
                [field]: value,
            },
        });
    };

    const updateAdequationScore = (key: keyof typeof data.scores_adequation, field: 'note' | 'observations', value: number | string) => {
        setData('scores_adequation', {
            ...data.scores_adequation,
            [key]: {
                ...data.scores_adequation[key],
                [field]: value,
            },
        });
    };

    const DocumentUploadField = ({ 
        label, 
        field, 
        accept, 
        required = false 
    }: { 
        label: string; 
        field: keyof typeof fileNames; 
        accept: string; 
        required?: boolean;
    }) => {
        const fileName = fileNames[field];
        const hasError = errors[field];

        return (
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                
                {!fileName ? (
                    <label className="cursor-pointer flex flex-col items-center justify-center py-6 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 bg-gray-50 hover:bg-gray-100 transition-colors">
                        <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm text-gray-600 mb-1">Cliquer pour télécharger</span>
                        <span className="text-xs text-gray-500">{accept}</span>
                        <input
                            type="file"
                            accept={accept}
                            onChange={(e) => handleFileChange(e, field)}
                            className="hidden"
                            required={required}
                        />
                    </label>
                ) : (
                    <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <svg className="w-8 h-8 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {fileName}
                                </p>
                                <p className="text-xs text-gray-500">Fichier téléchargé</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeFile(field)}
                            className="ml-3 p-2 hover:bg-red-50 rounded-full transition-colors"
                        >
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
                
                {hasError && (
                    <p className="mt-1 text-sm text-red-600">{hasError}</p>
                )}
            </div>
        );
    };

    return (
        <AppLayout>
            <Head title="Fiche d'Évaluation - Entretien Professionnel" />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
                        {/* Header */}
                        <div className="border-b pb-6 mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                📑 FICHE D'ÉVALUATION - ENTRETIEN PROFESSIONNEL
                            </h1>
                            <p className="text-gray-600">BTP Consulting - Bureau d'Études Techniques en Génie Civil</p>
                        </div>

                        {/* Section Documents */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-l-4 border-blue-600 pl-4">
                                📎 DOCUMENTS DU SALARIÉ
                            </h2>
                            
                            <div className="bg-blue-50 p-6 rounded-lg mb-6">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h3 className="font-semibold text-blue-900 mb-1">
                                            Documents requis pour le dossier
                                        </h3>
                                        <p className="text-sm text-blue-700">
                                            Veuillez télécharger les documents suivants pour compléter le dossier du salarié.
                                            Formats acceptés : PDF, DOC, DOCX, JPG, PNG (max 5 MB par fichier)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DocumentUploadField 
                                    label="Contrat CDI"
                                    field="contrat_cdi"
                                    accept=".pdf,.doc,.docx"
                                    
                                />
                                
                                <DocumentUploadField 
                                    label="Curriculum Vitae (CV)"
                                    field="cv"
                                    accept=".pdf,.doc,.docx"
                                    required
                                />
                                
                                <DocumentUploadField 
                                    label="Diplôme"
                                    field="diplome"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    required
                                />
                                
                                <DocumentUploadField 
                                    label="Certificat de Travail"
                                    field="certificat_travail"
                                    accept=".pdf,.doc,.docx"
                                />
                            </div>
                        </section>

                        {/* Section 1: Informations Générales */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-l-4 border-blue-600 pl-4">
                                1. INFORMATIONS GÉNÉRALES
                            </h2>

                            <div className="space-y-6">
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Identification du Candidat</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Salarié
                                            </label>
                                            <select
                                                value={data.salarie_id}
                                                onChange={(e) => setData('salarie_id', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Sélectionner un salarié</option>
                                                {salaries.map((salarie) => (
                                                    <option key={salarie.id} value={salarie.id}>
                                                        {salarie.prenom} {salarie.nom} - {salarie.poste}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Poste visé
                                            </label>
                                            <input
                                                type="text"
                                                value={data.poste_vise}
                                                onChange={(e) => setData('poste_vise', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Date de l'entretien
                                            </label>
                                            <input
                                                type="date"
                                                value={data.date_entretien}
                                                onChange={(e) => setData('date_entretien', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Type d'entretien
                                            </label>
                                            <div className="flex gap-4">
                                                {['premier', 'technique', 'final'].map((type) => (
                                                    <label key={type} className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            value={type}
                                                            checked={data.type_entretien === type}
                                                            onChange={(e) => setData('type_entretien', e.target.value)}
                                                            className="mr-2"
                                                        />
                                                        <span className="capitalize">{type}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Composition du Jury</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Évaluateur principal
                                            </label>
                                            <input
                                                type="text"
                                                value={data.evaluateur_principal}
                                                onChange={(e) => setData('evaluateur_principal', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Expert technique
                                            </label>
                                            <input
                                                type="text"
                                                value={data.expert_technique}
                                                onChange={(e) => setData('expert_technique', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Responsable RH
                                            </label>
                                            <input
                                                type="text"
                                                value={data.responsable_rh}
                                                onChange={(e) => setData('responsable_rh', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Grille d'Évaluation */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-l-4 border-blue-600 pl-4">
                                2. GRILLE D'ÉVALUATION DÉTAILLÉE
                            </h2>

                            {/* A. Compétences Techniques */}
                            <div className="mb-8 bg-blue-50 p-6 rounded-lg">
                                <h3 className="text-xl font-semibold text-blue-900 mb-4">
                                    A. COMPÉTENCES TECHNIQUES (20 points)
                                </h3>

                                {Object.entries({
                                    formation_certifications: {
                                        title: 'Formation et Certifications',
                                        subtitle: 'Pertinence du diplôme, Certifications techniques',
                                        poids: 3
                                    },
                                    maitrise_logiciels: {
                                        title: 'Maîtrise des Logiciels Métier',
                                        subtitle: 'Autodesk (AutoCAD, Revit, Robot), Logiciels de calcul, BIM',
                                        poids: 4
                                    },
                                    expertise_technique: {
                                        title: 'Expertise Technique',
                                        subtitle: 'Calcul de structures, Études géotechniques, Métré, Normes marocaines',
                                        poids: 4
                                    },
                                    connaissance_marche: {
                                        title: 'Connaissance Marché Public',
                                        subtitle: 'CCTP, DPGF, CCAG, Appels d\'offres, Réglementation',
                                        poids: 3
                                    },
                                    gestion_projets: {
                                        title: 'Gestion de Projets',
                                        subtitle: 'Planification, Coordination, Suivi budgétaire',
                                        poids: 3
                                    },
                                    innovation_veille: {
                                        title: 'Innovation et Veille Technique',
                                        subtitle: 'Nouvelles techniques, Amélioration continue, Solutions innovantes',
                                        poids: 3
                                    }
                                }).map(([key, info]) => (
                                    <div key={key} className="bg-white p-4 rounded-lg mb-4 shadow-sm">
                                        <div className="grid grid-cols-12 gap-4 items-start">
                                            <div className="col-span-12 md:col-span-4">
                                                <h4 className="font-semibold text-gray-900">{info.title}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{info.subtitle}</p>
                                            </div>
                                            <div className="col-span-3 md:col-span-1 text-center">
                                                <span className="text-sm font-medium text-gray-700">Poids: {info.poids}</span>
                                            </div>
                                            <div className="col-span-3 md:col-span-2">
                                                <label className="block text-xs text-gray-600 mb-1">Note (0-5)</label>
                                                <select
                                                    value={data.scores_techniques[key as keyof typeof data.scores_techniques].note}
                                                    onChange={(e) => updateTechniqueScore(key as keyof typeof data.scores_techniques, 'note', Number(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    {[0, 1, 2, 3, 4, 5].map(n => (
                                                        <option key={n} value={n}>{n}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-span-3 md:col-span-2 text-center">
                                                <label className="block text-xs text-gray-600 mb-1">Score</label>
                                                <span className="inline-block px-3 py-2 bg-blue-100 text-blue-900 rounded-lg font-semibold">
                                                    {(data.scores_techniques[key as keyof typeof data.scores_techniques].note * info.poids / 5).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="col-span-12 md:col-span-3">
                                                <label className="block text-xs text-gray-600 mb-1">Observations</label>
                                                <textarea
                                                    value={data.scores_techniques[key as keyof typeof data.scores_techniques].observations}
                                                    onChange={(e) => updateTechniqueScore(key as keyof typeof data.scores_techniques, 'observations', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                    rows={2}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                        
                        {/* B. Compétences Comportementales */}
                        <section>
                            <div className="mb-8 bg-green-50 p-6 rounded-lg">
                                <h3 className="text-xl font-semibold text-green-900 mb-4">
                                    B. COMPÉTENCES COMPORTEMENTALES (12 points)
                                </h3>

                                {Object.entries({
                                    communication_redaction: {
                                        title: 'Communication et Rédaction',
                                        subtitle: 'Rapports techniques, Présentation orale, Adaptation',
                                        poids: 3
                                    },
                                    travail_equipe: {
                                        title: 'Travail en Équipe',
                                        subtitle: 'Collaboration, Partage d\'informations, Résolution collective',
                                        poids: 2
                                    },
                                    rigueur_precision: {
                                        title: 'Rigueur et Précision',
                                        subtitle: 'Attention aux détails, Vérification, Respect des procédures',
                                        poids: 3
                                    },
                                    gestion_stress: {
                                        title: 'Gestion du Stress',
                                        subtitle: 'Résistance aux deadlines, Maintien de la qualité, Priorisation',
                                        poids: 2
                                    },
                                    autonomie_initiative: {
                                        title: 'Autonomie et Initiative',
                                        subtitle: 'Prise de décision, Propositions d\'amélioration, Responsabilisation',
                                        poids: 2
                                    }
                                }).map(([key, info]) => (
                                    <div key={key} className="bg-white p-4 rounded-lg mb-4 shadow-sm">
                                        <div className="grid grid-cols-12 gap-4 items-start">
                                            <div className="col-span-12 md:col-span-4">
                                                <h4 className="font-semibold text-gray-900">{info.title}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{info.subtitle}</p>
                                            </div>
                                            <div className="col-span-3 md:col-span-1 text-center">
                                                <span className="text-sm font-medium text-gray-700">Poids: {info.poids}</span>
                                            </div>
                                            <div className="col-span-3 md:col-span-2">
                                                <label className="block text-xs text-gray-600 mb-1">Note (0-5)</label>
                                                <select
                                                    value={data.scores_comportementaux[key as keyof typeof data.scores_comportementaux].note}
                                                    onChange={(e) => updateComportementalScore(key as keyof typeof data.scores_comportementaux, 'note', Number(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                >
                                                    {[0, 1, 2, 3, 4, 5].map(n => (
                                                        <option key={n} value={n}>{n}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-span-3 md:col-span-2 text-center">
                                                <label className="block text-xs text-gray-600 mb-1">Score</label>
                                                <span className="inline-block px-3 py-2 bg-green-100 text-green-900 rounded-lg font-semibold">
                                                    {(data.scores_comportementaux[key as keyof typeof data.scores_comportementaux].note * info.poids / 5).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="col-span-12 md:col-span-3">
                                                <label className="block text-xs text-gray-600 mb-1">Observations</label>
                                                <textarea
                                                    value={data.scores_comportementaux[key as keyof typeof data.scores_comportementaux].observations}
                                                    onChange={(e) => updateComportementalScore(key as keyof typeof data.scores_comportementaux, 'observations', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                                    rows={2}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="mb-8">
                             {/* C. Adéquation Poste/Entreprise */}
                            <div className="mb-8 bg-purple-50 p-6 rounded-lg">
                                <h3 className="text-xl font-semibold text-purple-900 mb-4">
                                    C. ADÉQUATION POSTE/ENTREPRISE (8 points)
                                </h3>

                                {Object.entries({
                                    motivation_engagement: {
                                        title: 'Motivation et Engagement',
                                        subtitle: 'Intérêt pour les projets BTP, Adhésion aux valeurs, Projet professionnel',
                                        poids: 2
                                    },
                                    disponibilite_mobilite: {
                                        title: 'Disponibilité et Mobilité',
                                        subtitle: 'Flexibilité horaire, Déplacements sur sites, Permis B',
                                        poids: 2
                                    },
                                    potentiel_evolution: {
                                        title: 'Potentiel Évolution',
                                        subtitle: 'Capacité à monter en compétences, Ambition réaliste, Ouverture aux formations',
                                        poids: 2
                                    },
                                    connaissance_entreprise: {
                                        title: 'Connaissance de BTP Consulting',
                                        subtitle: 'Recherche préalable, Compréhension des activités, Adéquation poste',
                                        poids: 2
                                    }
                                }).map(([key, info]) => (
                                    <div key={key} className="bg-white p-4 rounded-lg mb-4 shadow-sm">
                                        <div className="grid grid-cols-12 gap-4 items-start">
                                            <div className="col-span-12 md:col-span-4">
                                                <h4 className="font-semibold text-gray-900">{info.title}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{info.subtitle}</p>
                                            </div>
                                            <div className="col-span-3 md:col-span-1 text-center">
                                                <span className="text-sm font-medium text-gray-700">Poids: {info.poids}</span>
                                            </div>
                                            <div className="col-span-3 md:col-span-2">
                                                <label className="block text-xs text-gray-600 mb-1">Note (0-5)</label>
                                                <select
                                                    value={data.scores_adequation[key as keyof typeof data.scores_adequation].note}
                                                    onChange={(e) => updateAdequationScore(key as keyof typeof data.scores_adequation, 'note', Number(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                >
                                                    {[0, 1, 2, 3, 4, 5].map(n => (
                                                        <option key={n} value={n}>{n}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-span-3 md:col-span-2 text-center">
                                                <label className="block text-xs text-gray-600 mb-1">Score</label>
                                                <span className="inline-block px-3 py-2 bg-purple-100 text-purple-900 rounded-lg font-semibold">
                                                    {(data.scores_adequation[key as keyof typeof data.scores_adequation].note * info.poids / 5).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="col-span-12 md:col-span-3">
                                                <label className="block text-xs text-gray-600 mb-1">Observations</label>
                                                <textarea
                                                    value={data.scores_adequation[key as keyof typeof data.scores_adequation].observations}
                                                    onChange={(e) => updateAdequationScore(key as keyof typeof data.scores_adequation, 'observations', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                                    rows={2}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        

                        

                        {/* Section 3: Synthèse et Recommandation */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-l-4 border-blue-600 pl-4">
                                3. SYNTHÈSE ET RECOMMANDATION
                            </h2>

                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">RÉSULTATS DÉTAILLÉS</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                                        <p className="text-sm text-gray-600 mb-2">Score Technique</p>
                                        <p className="text-3xl font-bold text-blue-600">{scoreTechnique.toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">/ 20</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                                        <p className="text-sm text-gray-600 mb-2">Score Comportemental</p>
                                        <p className="text-3xl font-bold text-green-600">{scoreComportemental.toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">/ 12</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                                        <p className="text-sm text-gray-600 mb-2">Score Adéquation</p>
                                        <p className="text-3xl font-bold text-purple-600">{scoreAdequation.toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">/ 8</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-lg shadow-lg text-center">
                                        <p className="text-sm text-white mb-2">TOTAL GÉNÉRAL</p>
                                        <p className="text-4xl font-bold text-white">{scoreTotal.toFixed(2)}</p>
                                        <p className="text-xs text-blue-100">/ 40</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        ANALYSE DES POINTS FORTS
                                    </label>
                                    <textarea
                                        value={data.points_forts}
                                        onChange={(e) => setData('points_forts', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        rows={4}
                                        placeholder="Décrivez les points forts du candidat..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        POINTS DE VIGILANCE ET AXES D'AMÉLIORATION
                                    </label>
                                    <textarea
                                        value={data.points_vigilance}
                                        onChange={(e) => setData('points_vigilance', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        rows={4}
                                        placeholder="Décrivez les points de vigilance et axes d'amélioration..."
                                    />
                                </div>

                                // Replace the RECOMMANDATION FINALE section in your form with this:

<div>
    <label className="block text-sm font-semibold text-gray-900 mb-3">
        RECOMMANDATION FINALE <span className="text-red-500">*</span>
    </label>
    
    <div className="space-y-3">
  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-green-50 transition-colors has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
    <input
      type="radio"
      name="recommandation"
      value="fortement_recommande"
      checked={data.recommandation === 'fortement_recommande'}
      onChange={(e) =>
        setData('recommandation', e.target.value as FormData['recommandation'])
      }
      className="mt-1 mr-3 w-5 h-5 text-green-600"
      required
    />
    <div>
      <div className="font-semibold text-gray-900 mb-1">✅ Fortement Recommandé</div>
      <p className="text-sm text-gray-600">
        Candidat excellent, à recruter en priorité. Score ≥ 32/40 (≥80%)
      </p>
    </div>
  </label>

  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
    <input
      type="radio"
      name="recommandation"
      value="recommande"
      checked={data.recommandation === 'recommande'}
      onChange={(e) =>
        setData('recommandation', e.target.value as FormData['recommandation'])
      }
      className="mt-1 mr-3 w-5 h-5 text-blue-600"
      required
    />
    <div>
      <div className="font-semibold text-gray-900 mb-1">👍 Recommandé</div>
      <p className="text-sm text-gray-600">
        Bon candidat, possède les compétences requises. Score 24-32/40 (60-80%)
      </p>
    </div>
  </label>

  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-yellow-50 transition-colors has-[:checked]:border-yellow-500 has-[:checked]:bg-yellow-50">
    <input
      type="radio"
      name="recommandation"
      value="reserve"
      checked={data.recommandation === 'reserve'}
      onChange={(e) =>
        setData('recommandation', e.target.value as FormData['recommandation'])
      }
      className="mt-1 mr-3 w-5 h-5 text-yellow-600"
      required
    />
    <div>
      <div className="font-semibold text-gray-900 mb-1">⚠️ Avec Réserve</div>
      <p className="text-sm text-gray-600">
        Candidat acceptable avec des points d'amélioration. Score 20-24/40 (50-60%)
      </p>
    </div>
  </label>

  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-red-50 transition-colors has-[:checked]:border-red-500 has-[:checked]:bg-red-50">
    <input
      type="radio"
      name="recommandation"
      value="non_recommande"
      checked={data.recommandation === 'non_recommande'}
      onChange={(e) =>
        setData('recommandation', e.target.value as FormData['recommandation'])
      }
      className="mt-1 mr-3 w-5 h-5 text-red-600"
      required
    />
    <div>
      <div className="font-semibold text-gray-900 mb-1">❌ Non Recommandé</div>
      <p className="text-sm text-gray-600">
        Candidat ne correspond pas au profil recherché. Score {'<'} 20/40 ({'<'}50%)
      </p>
    </div>
  </label>
</div>

    
    {errors.recommandation && (
        <p className="mt-2 text-sm text-red-600">{errors.recommandation}</p>
    )}
</div>
                            </div>
                        </section>

                        {/* Boutons d'action */}
                        <div className="flex justify-end gap-4 pt-6 border-t">
                            <button
                                type="button"
                                onClick={() => router.visit(route('dashboard.ressources-humaines'))}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Enregistrement...' : 'Enregistrer l\'évaluation'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}