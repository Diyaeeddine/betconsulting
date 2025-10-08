import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';

interface Document {
    path: string;
    url: string;
    exists: boolean;
}

interface Salarie {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    poste: string;
    telephone: string;
    date_embauche: string;
}

interface ScoreItem {
    note: number;
    observations: string;
}

interface EntretienData {
    id: number;
    salarie: Salarie;
    poste_vise: string;
    date_entretien: string;
    date_entretien_formatted: string;
    type_entretien: string;
    type_entretien_libelle: string;
    evaluateur_principal: string;
    expert_technique: string;
    responsable_rh: string;
    scores_techniques: Record<string, ScoreItem>;
    scores_comportementaux: Record<string, ScoreItem>;
    scores_adequation: Record<string, ScoreItem>;
    score_technique: number;
    score_comportemental: number;
    score_adequation: number;
    score_total: number;
    pourcentage_score: number;
    appreciation: string;
    couleur_score: string;
    points_forts: string;
    points_vigilance: string;
    recommandation: string;
    statut: string;
    statut_libelle: string;
    documents: {
        contrat_cdi: Document | null;
        cv: Document | null;
        diplome: Document | null;
        certificat_travail: Document | null;
    };
    created_at: string;
    updated_at: string;
}

interface Props {
    entretien: EntretienData;
}

export default function DetailEntretien({ entretien }: Props) {
    const getDocumentIcon = (filename: string) => {
        const ext = filename?.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return '📄';
        if (['doc', 'docx'].includes(ext || '')) return '📝';
        if (['jpg', 'jpeg', 'png'].includes(ext || '')) return '🖼️';
        return '📎';
    };

    const handleDownload = (type: string) => {
        const baseUrl = window.location.origin;
        const url = `${baseUrl}/ressources-humaines/entretiens/${entretien.id}/download/${type}`;
        window.location.href = url;
    };

    const DocumentCard = ({ 
        label, 
        document, 
        type 
    }: { 
        label: string; 
        document: Document | null; 
        type: string;
    }) => {
        if (!document || !document.exists) {
            return (
                <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-700">{label}</p>
                            <p className="text-xs text-gray-500 mt-1">Non disponible</p>
                        </div>
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                </div>
            );
        }

        const filename = document.path.split('/').pop() || 'document';

        return (
            <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{getDocumentIcon(filename)}</span>
                        <div>
                            <p className="text-sm font-medium text-gray-900">{label}</p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">
                                {filename}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <a
                        href={document.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors text-center"
                    >
                        Aperçu
                    </a>
                    <button
                        onClick={() => handleDownload(type)}
                        className="flex-1 px-3 py-2 bg-green-50 text-green-600 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Télécharger
                    </button>
                </div>
            </div>
        );
    };

    const criteresTechniques = {
        formation_certifications: { title: 'Formation et Certifications', poids: 3 },
        maitrise_logiciels: { title: 'Maîtrise des Logiciels Métier', poids: 4 },
        expertise_technique: { title: 'Expertise Technique', poids: 4 },
        connaissance_marche: { title: 'Connaissance Marché Public', poids: 3 },
        gestion_projets: { title: 'Gestion de Projets', poids: 3 },
        innovation_veille: { title: 'Innovation et Veille Technique', poids: 3 },
    };

    const criteresComportementaux = {
        communication_redaction: { title: 'Communication et Rédaction', poids: 3 },
        travail_equipe: { title: 'Travail en Équipe', poids: 2 },
        rigueur_precision: { title: 'Rigueur et Précision', poids: 3 },
        gestion_stress: { title: 'Gestion du Stress', poids: 2 },
        autonomie_initiative: { title: 'Autonomie et Initiative', poids: 2 },
    };

    const criteresAdequation = {
        motivation_engagement: { title: 'Motivation et Engagement', poids: 2 },
        disponibilite_mobilite: { title: 'Disponibilité et Mobilité', poids: 2 },
        potentiel_evolution: { title: 'Potentiel Évolution', poids: 2 },
        connaissance_entreprise: { title: 'Connaissance de BTP Consulting', poids: 2 },
    };

    const getScoreColor = (pourcentage: number) => {
        if (pourcentage >= 80) return 'text-green-600 bg-green-100';
        if (pourcentage >= 60) return 'text-blue-600 bg-blue-100';
        if (pourcentage >= 50) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const ScoreDetailCard = ({ 
        title, 
        scores, 
        criteres, 
        color 
    }: { 
        title: string; 
        scores: Record<string, ScoreItem>; 
        criteres: Record<string, { title: string; poids: number }>; 
        color: string;
    }) => (
        <div className={`bg-${color}-50 p-6 rounded-lg mb-6`}>
            <h3 className={`text-xl font-semibold text-${color}-900 mb-4`}>{title}</h3>
            <div className="space-y-4">
                {Object.entries(criteres).map(([key, info]) => {
                    const score = scores[key];
                    if (!score) return null;
                    
                    const scoreValue = (score.note * info.poids / 5).toFixed(2);
                    
                    return (
                        <div key={key} className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="grid grid-cols-12 gap-4 items-start">
                                <div className="col-span-12 md:col-span-5">
                                    <h4 className="font-semibold text-gray-900">{info.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">Poids: {info.poids}</p>
                                </div>
                                <div className="col-span-4 md:col-span-2 text-center">
                                    <p className="text-xs text-gray-600 mb-1">Note</p>
                                    <span className={`inline-block px-3 py-1 bg-${color}-100 text-${color}-900 rounded-lg font-semibold`}>
                                        {score.note}/5
                                    </span>
                                </div>
                                <div className="col-span-4 md:col-span-2 text-center">
                                    <p className="text-xs text-gray-600 mb-1">Score</p>
                                    <span className={`inline-block px-3 py-1 bg-${color}-200 text-${color}-900 rounded-lg font-bold`}>
                                        {scoreValue}
                                    </span>
                                </div>
                                <div className="col-span-12 md:col-span-3">
                                    <p className="text-xs text-gray-600 mb-1">Observations</p>
                                    <p className="text-sm text-gray-700">
                                        {score.observations || 'Aucune observation'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <AppLayout>
            <Head title={`Entretien - ${entretien.salarie.prenom} ${entretien.salarie.nom}`} />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Détails de l'Entretien Professionnel
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    {entretien.salarie.prenom} {entretien.salarie.nom} - {entretien.poste_vise}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                                    {entretien.type_entretien_libelle}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                            <div>
                                <p className="text-sm text-gray-600">Date d'entretien</p>
                                <p className="text-lg font-semibold text-gray-900">{entretien.date_entretien_formatted}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Évaluateur principal</p>
                                <p className="text-lg font-semibold text-gray-900">{entretien.evaluateur_principal}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Expert technique</p>
                                <p className="text-lg font-semibold text-gray-900">{entretien.expert_technique || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Statut</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(entretien.pourcentage_score)}`}>
                                    {entretien.statut_libelle}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Documents Section */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-l-4 border-blue-600 pl-4">
                            Documents du Salarié
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DocumentCard 
                                label="Contrat CDI"
                                document={entretien.documents.contrat_cdi}
                                type="contrat_cdi"
                            />
                            <DocumentCard 
                                label="Curriculum Vitae"
                                document={entretien.documents.cv}
                                type="cv"
                            />
                            <DocumentCard 
                                label="Diplôme"
                                document={entretien.documents.diplome}
                                type="diplome"
                            />
                            <DocumentCard 
                                label="Certificat de Travail"
                                document={entretien.documents.certificat_travail}
                                type="certificat_travail"
                            />
                        </div>
                    </div>

                    {/* Scores Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-lg p-6 mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                            Résultats de l'Évaluation
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                                <p className="text-sm text-gray-600 mb-2">Score Technique</p>
                                <p className="text-4xl font-bold text-blue-600">{entretien.score_technique}</p>
                                <p className="text-xs text-gray-500 mt-1">/ 20</p>
                                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full" 
                                        style={{ width: `${(entretien.score_technique / 20) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                                <p className="text-sm text-gray-600 mb-2">Score Comportemental</p>
                                <p className="text-4xl font-bold text-green-600">{entretien.score_comportemental}</p>
                                <p className="text-xs text-gray-500 mt-1">/ 12</p>
                                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-green-600 h-2 rounded-full" 
                                        style={{ width: `${(entretien.score_comportemental / 12) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                                <p className="text-sm text-gray-600 mb-2">Score Adéquation</p>
                                <p className="text-4xl font-bold text-purple-600">{entretien.score_adequation}</p>
                                <p className="text-xs text-gray-500 mt-1">/ 8</p>
                                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-purple-600 h-2 rounded-full" 
                                        style={{ width: `${(entretien.score_adequation / 8) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-lg shadow-lg text-center">
                                <p className="text-sm text-white mb-2">TOTAL</p>
                                <p className="text-5xl font-bold text-white">{entretien.score_total}</p>
                                <p className="text-xs text-blue-100 mt-1">/ 40</p>
                                <p className="text-lg font-semibold text-white mt-2">{entretien.pourcentage_score}%</p>
                                <p className="text-sm font-semibold text-white mt-1">{entretien.appreciation}</p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Scores */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-l-4 border-blue-600 pl-4">
                            Grille d'Évaluation Détaillée
                        </h2>

                        <ScoreDetailCard 
                            title="A. COMPÉTENCES TECHNIQUES"
                            scores={entretien.scores_techniques}
                            criteres={criteresTechniques}
                            color="blue"
                        />

                        <ScoreDetailCard 
                            title="B. COMPÉTENCES COMPORTEMENTALES"
                            scores={entretien.scores_comportementaux}
                            criteres={criteresComportementaux}
                            color="green"
                        />

                        <ScoreDetailCard 
                            title="C. ADÉQUATION POSTE/ENTREPRISE"
                            scores={entretien.scores_adequation}
                            criteres={criteresAdequation}
                            color="purple"
                        />
                    </div>

                    {/* Synthèse Section */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-l-4 border-blue-600 pl-4">
                            Synthèse et Recommandations
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Points Forts
                                </h3>
                                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                        {entretien.points_forts || 'Non renseigné'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Points de Vigilance et Axes d'Amélioration
                                </h3>
                                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                        {entretien.points_vigilance || 'Non renseigné'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Recommandation Finale
                                </h3>
                                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                        {entretien.recommandation || 'Non renseigné'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Information complémentaire */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-l-4 border-blue-600 pl-4">
                            Informations Complémentaires
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-600 mb-2">Informations du Salarié</h3>
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Email:</span>
                                        <span className="text-sm font-medium text-gray-900">{entretien.salarie.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Téléphone:</span>
                                        <span className="text-sm font-medium text-gray-900">{entretien.salarie.telephone}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Poste actuel:</span>
                                        <span className="text-sm font-medium text-gray-900">{entretien.salarie.poste}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-600 mb-2">Dates</h3>
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Créé le:</span>
                                        <span className="text-sm font-medium text-gray-900">{entretien.created_at}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Modifié le:</span>
                                        <span className="text-sm font-medium text-gray-900">{entretien.updated_at}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between gap-4">
                        <button
                            onClick={() => router.visit(route('entretiens.index'))}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Retour à la liste
                        </button>
                        <div className="flex gap-4">
                            <button
                                onClick={() => router.get(route('entretiens.export', entretien.id))}
                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all font-medium shadow-lg flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Exporter en PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}