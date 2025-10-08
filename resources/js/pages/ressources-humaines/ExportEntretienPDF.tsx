import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';

interface Salarie {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    poste: string;
    telephone?: string;
    date_embauche?: string;
}

interface ScoreItem {
    note: number;
    commentaire?: string;
}

interface Entretien {
    id: number;
    salarie: Salarie;
    poste_vise: string;
    date_entretien: string;
    date_entretien_formatted: string;
    type_entretien: string;
    type_entretien_libelle: string;
    evaluateur_principal: string;
    expert_technique?: string;
    responsable_rh?: string;
    scores_techniques: Record<string, ScoreItem>;
    scores_comportementaux: Record<string, ScoreItem>;
    scores_adequation: Record<string, ScoreItem>;
    score_technique: number;
    score_comportemental: number;
    score_adequation: number;
    score_total: number;
    pourcentage_score: number;
    appreciation: string;
    points_forts?: string;
    points_vigilance?: string;
    recommandation?: string;
    statut: string;
    statut_libelle: string;
    created_at: string;
}

interface Props {
    entretien: Entretien;
}

export default function ExportEntretienPDF({ entretien }: Props) {
    const criteresLabels = {
        techniques: {
            formation_certifications: 'Formation & Certifications',
            maitrise_logiciels: 'Maîtrise des Logiciels',
            expertise_technique: 'Expertise Technique',
            connaissance_marche: 'Connaissance du Marché',
            gestion_projets: 'Gestion de Projets',
            innovation_veille: 'Innovation & Veille',
        },
        comportementaux: {
            communication_redaction: 'Communication & Rédaction',
            travail_equipe: 'Travail en Équipe',
            rigueur_precision: 'Rigueur & Précision',
            gestion_stress: 'Gestion du Stress',
            autonomie_initiative: 'Autonomie & Initiative',
        },
        adequation: {
            motivation_engagement: 'Motivation & Engagement',
            disponibilite_mobilite: 'Disponibilité & Mobilité',
            potentiel_evolution: 'Potentiel d\'Évolution',
            connaissance_entreprise: 'Connaissance de l\'Entreprise',
        },
    };

    useEffect(() => {
        // Auto-trigger print dialog after page loads
        const timer = setTimeout(() => {
            window.print();
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const renderScoreBar = (note: number, maxNote: number = 5) => {
        const percentage = (note / maxNote) * 100;
        return (
            <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden',
            }}>
                <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: '#374151',
                }}>
                </div>
            </div>
        );
    };

    return (
        <>
            <Head title={`Entretien - ${entretien.salarie.prenom} ${entretien.salarie.nom}`} />
            
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 1.5cm;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .page-break {
                        page-break-before: always;
                    }
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: 'Arial', 'Helvetica', sans-serif;
                    color: #1f2937;
                    line-height: 1.6;
                    background: white;
                }

                .container {
                    max-width: 210mm;
                    margin: 0 auto;
                    padding: 20px;
                    background: white;
                }

                .header {
                    border-bottom: 3px solid #1f2937;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }

                .header-title {
                    font-size: 28px;
                    font-weight: bold;
                    color: #1f2937;
                    margin-bottom: 5px;
                }

                .header-subtitle {
                    font-size: 14px;
                    color: #6b7280;
                }

                .section {
                    margin-bottom: 30px;
                }

                .section-title {
                    font-size: 18px;
                    font-weight: bold;
                    color: #1f2937;
                    border-bottom: 2px solid #e5e7eb;
                    padding-bottom: 8px;
                    margin-bottom: 15px;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .info-item {
                    margin-bottom: 12px;
                }

                .info-label {
                    font-size: 11px;
                    color: #6b7280;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                }

                .info-value {
                    font-size: 14px;
                    color: #1f2937;
                    font-weight: 500;
                }

                .score-summary {
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    padding: 20px;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }

                .score-main {
                    text-align: center;
                }

                .score-circle {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    border: 4px solid #1f2937;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 10px;
                }

                .score-percentage {
                    font-size: 24px;
                    font-weight: bold;
                    color: #1f2937;
                }

                .score-label {
                    font-size: 12px;
                    color: #6b7280;
                    font-weight: 600;
                }

                .score-appreciation {
                    font-size: 14px;
                    font-weight: bold;
                    color: #1f2937;
                    margin-top: 5px;
                }

                .score-item {
                    text-align: center;
                    flex: 1;
                }

                .score-value {
                    font-size: 20px;
                    font-weight: bold;
                    color: #1f2937;
                    margin-bottom: 5px;
                }

                .criteria-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }

                .criteria-item {
                    margin-bottom: 15px;
                }

                .criteria-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 6px;
                }

                .criteria-name {
                    font-size: 13px;
                    color: #374151;
                    font-weight: 500;
                }

                .criteria-score {
                    font-size: 13px;
                    font-weight: bold;
                    color: #1f2937;
                }

                .evaluators {
                    display: flex;
                    gap: 15px;
                }

                .evaluator {
                    flex: 1;
                    padding: 12px;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                }

                .synthesis-box {
                    padding: 15px;
                    background: #f9fafb;
                    border-left: 4px solid #374151;
                    margin-bottom: 15px;
                }

                .synthesis-title {
                    font-size: 14px;
                    font-weight: bold;
                    color: #1f2937;
                    margin-bottom: 10px;
                }

                .synthesis-content {
                    font-size: 13px;
                    color: #374151;
                    white-space: pre-wrap;
                    line-height: 1.6;
                }

                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    text-align: center;
                    font-size: 11px;
                    color: #9ca3af;
                }

                .table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }

                .table th,
                .table td {
                    padding: 10px;
                    text-align: left;
                    border-bottom: 1px solid #e5e7eb;
                }

                .table th {
                    background: #f9fafb;
                    font-size: 12px;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                }

                .table td {
                    font-size: 13px;
                    color: #374151;
                }
                .logo {
                    display: flex;
                    max-width: 150px;   /* Adjust width for print */
                    height: auto;       /* Keep aspect ratio */
                    margin-bottom: 10px;
                }

            `}</style>

            <div className="container">
                {/* Header */}
                <div className="header">
                    <img 
                        src="/images/btp-logo.png" 
                        alt="BTP Logo" 
                        className="logo"
                    />
                    <div className="header-title">Rapport d'Entretien d'Évaluation</div>
                    <div className="header-subtitle">
                        Document confidentiel - Ressources Humaines
                    </div>
                </div>

                {/* Informations Générales */}
                <div className="section">
                    <div className="section-title">Informations Générales</div>
                    <div className="info-grid">
                        <div>
                            <div className="info-item">
                                <div className="info-label">Candidat</div>
                                <div className="info-value">
                                    {entretien.salarie.prenom} {entretien.salarie.nom}
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Poste Actuel</div>
                                <div className="info-value">{entretien.salarie.poste}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Email</div>
                                <div className="info-value">{entretien.salarie.email}</div>
                            </div>
                            {entretien.salarie.telephone && (
                                <div className="info-item">
                                    <div className="info-label">Téléphone</div>
                                    <div className="info-value">{entretien.salarie.telephone}</div>
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="info-item">
                                <div className="info-label">Poste Visé</div>
                                <div className="info-value">{entretien.poste_vise}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Date d'Entretien</div>
                                <div className="info-value">{entretien.date_entretien_formatted}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Type d'Entretien</div>
                                <div className="info-value">{entretien.type_entretien_libelle}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Statut</div>
                                <div className="info-value">{entretien.statut_libelle}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Composition du Jury */}
                <div className="section">
                    <div className="section-title">Composition du Jury</div>
                    <div className="evaluators">
                        <div className="evaluator">
                            <div className="info-label">Évaluateur Principal</div>
                            <div className="info-value">{entretien.evaluateur_principal}</div>
                        </div>
                        {entretien.expert_technique && (
                            <div className="evaluator">
                                <div className="info-label">Expert Technique</div>
                                <div className="info-value">{entretien.expert_technique}</div>
                            </div>
                        )}
                        {entretien.responsable_rh && (
                            <div className="evaluator">
                                <div className="info-label">Responsable RH</div>
                                <div className="info-value">{entretien.responsable_rh}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Résultats Globaux */}
                <div className="section">
                    <div className="section-title">Résultats Globaux</div>
                    <div className="score-summary">
                        <div className="score-main">
                            <div className="score-circle">
                                <span className="score-percentage">
                                    {entretien.pourcentage_score}%
                                </span>
                            </div>
                            <div className="score-label">Score Total</div>
                            <div className="score-appreciation">{entretien.appreciation}</div>
                        </div>
                        <div className="score-item">
                            <div className="score-value">{entretien.score_technique}/20</div>
                            <div className="score-label">Compétences Techniques</div>
                        </div>
                        <div className="score-item">
                            <div className="score-value">{entretien.score_comportemental}/12</div>
                            <div className="score-label">Compétences Comportementales</div>
                        </div>
                        <div className="score-item">
                            <div className="score-value">{entretien.score_adequation}/8</div>
                            <div className="score-label">Adéquation au Poste</div>
                        </div>
                    </div>
                </div>

                {/* Détail des Compétences Techniques */}
                <div className="section page-break">
                    <div className="section-title">Compétences Techniques</div>
                    <div className="criteria-grid">
                        {Object.entries(entretien.scores_techniques).map(([key, value]) => (
                            <div key={key} className="criteria-item">
                                <div className="criteria-header">
                                    <span className="criteria-name">
                                        {criteresLabels.techniques[key as keyof typeof criteresLabels.techniques]}
                                    </span>
                                    <span className="criteria-score">{value.note}/5</span>
                                </div>
                                {renderScoreBar(value.note)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Détail des Compétences Comportementales */}
                <div className="section">
                    <div className="section-title">Compétences Comportementales</div>
                    <div className="criteria-grid">
                        {Object.entries(entretien.scores_comportementaux).map(([key, value]) => (
                            <div key={key} className="criteria-item">
                                <div className="criteria-header">
                                    <span className="criteria-name">
                                        {criteresLabels.comportementaux[key as keyof typeof criteresLabels.comportementaux]}
                                    </span>
                                    <span className="criteria-score">{value.note}/5</span>
                                </div>
                                {renderScoreBar(value.note)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Détail de l'Adéquation au Poste */}
                <div className="section">
                    <div className="section-title">Adéquation au Poste</div>
                    <div className="criteria-grid">
                        {Object.entries(entretien.scores_adequation).map(([key, value]) => (
                            <div key={key} className="criteria-item">
                                <div className="criteria-header">
                                    <span className="criteria-name">
                                        {criteresLabels.adequation[key as keyof typeof criteresLabels.adequation]}
                                    </span>
                                    <span className="criteria-score">{value.note}/5</span>
                                </div>
                                {renderScoreBar(value.note)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Synthèse */}
                <div className="section page-break">
                    <div className="section-title">Synthèse de l'Évaluation</div>
                    
                    {entretien.points_forts && (
                        <div className="synthesis-box">
                            <div className="synthesis-title">Points Forts</div>
                            <div className="synthesis-content">{entretien.points_forts}</div>
                        </div>
                    )}

                    {entretien.points_vigilance && (
                        <div className="synthesis-box">
                            <div className="synthesis-title">Points de Vigilance</div>
                            <div className="synthesis-content">{entretien.points_vigilance}</div>
                        </div>
                    )}

                    {entretien.recommandation && (
                        <div className="synthesis-box">
                            <div className="synthesis-title">Recommandation Finale</div>
                            <div className="synthesis-content">{entretien.recommandation}</div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="footer">
                    <div>Document généré le {new Date().toLocaleDateString('fr-FR')}</div>
                    <div>Entretien réalisé le {entretien.date_entretien_formatted}</div>
                    <div style={{ marginTop: '10px' }}>
                        Ce document est confidentiel et ne peut être divulgué sans autorisation
                    </div>
                </div>
            </div>
        </>
    );
}