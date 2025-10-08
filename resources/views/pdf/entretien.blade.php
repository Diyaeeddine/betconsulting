<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Entretien - {{ $entretien->salarie->prenom }} {{ $entretien->salarie->nom }}</title>
    <style>
        @page {
            size: A4;
            margin: 15mm 12mm;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #1f2937;
            line-height: 1.3;
            background: white;
            font-size: 9px;
        }

        .container {
            max-width: 100%;
            background: white;
        }

        .header {
            border-bottom: 2.5px solid #1f2937;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }

        .header-title {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 2px;
            letter-spacing: 0.3px;
        }

        .header-subtitle {
            font-size: 9px;
            color: #6b7280;
            font-style: italic;
        }

        .section {
            margin-bottom: 12px;
        }

        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #1f2937;
            border-bottom: 1.5px solid #e5e7eb;
            padding-bottom: 3px;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .info-grid {
            width: 100%;
            margin-bottom: 8px;
        }

        .info-grid table {
            width: 100%;
        }

        .info-grid td {
            width: 50%;
            vertical-align: top;
            padding-right: 10px;
        }

        .info-item {
            margin-bottom: 5px;
        }

        .info-label {
            font-size: 7px;
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 1px;
        }

        .info-value {
            font-size: 9px;
            color: #1f2937;
            font-weight: 500;
        }

        .score-summary {
            padding: 10px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            margin-bottom: 10px;
        }

        .score-summary table {
            width: 100%;
        }

        .score-main {
            text-align: center;
            width: 28%;
        }

        .score-circle {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 3px solid #1f2937;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 4px;
        }

        .score-percentage {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
        }

        .score-label {
            font-size: 7px;
            color: #6b7280;
            font-weight: 600;
        }

        .score-appreciation {
            font-size: 9px;
            font-weight: bold;
            color: #1f2937;
            margin-top: 2px;
        }

        .score-item {
            text-align: center;
            width: 24%;
        }

        .score-value {
            font-size: 14px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 2px;
        }

        .criteria-grid {
            width: 100%;
        }

        .criteria-grid table {
            width: 100%;
        }

        .criteria-grid td {
            width: 33.33%;
            padding-right: 8px;
            vertical-align: top;
        }

        .criteria-item {
            margin-bottom: 6px;
        }

        .criteria-header {
            margin-bottom: 2px;
        }

        .criteria-name {
            font-size: 8px;
            color: #374151;
            font-weight: 500;
            display: inline-block;
            width: 70%;
        }

        .criteria-score {
            font-size: 8px;
            font-weight: bold;
            color: #1f2937;
            float: right;
        }

        .score-bar {
            width: 100%;
            height: 5px;
            background-color: #e5e7eb;
            border-radius: 2px;
            overflow: hidden;
            clear: both;
        }

        .score-bar-fill {
            height: 100%;
            background-color: #374151;
        }

        .evaluators {
            width: 100%;
        }

        .evaluators table {
            width: 100%;
        }

        .evaluator {
            padding: 6px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 3px;
        }

        .synthesis-box {
            padding: 8px;
            background: #f9fafb;
            border-left: 3px solid #374151;
            margin-bottom: 8px;
        }

        .synthesis-title {
            font-size: 9px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 3px;
            text-transform: uppercase;
        }

        .synthesis-content {
            font-size: 8px;
            color: #374151;
            line-height: 1.4;
        }

        .footer {
            margin-top: 12px;
            padding-top: 8px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 7px;
            color: #9ca3af;
        }

        .clearfix::after {
            content: "";
            display: table;
            clear: both;
        }

        .two-columns {
            width: 100%;
        }

        .two-columns td {
            width: 50%;
            vertical-align: top;
            padding-right: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-title">RAPPORT D'ENTRETIEN D'ÉVALUATION</div>
            <div class="header-subtitle">
                Document confidentiel - Ressources Humaines
            </div>
        </div>

        <!-- Informations Générales -->
        <div class="section">
            <div class="section-title">Informations Générales</div>
            <div class="info-grid">
                <table>
                    <tr>
                        <td>
                            <div class="info-item">
                                <div class="info-label">Candidat</div>
                                <div class="info-value">
                                    {{ $entretien->salarie->prenom }} {{ $entretien->salarie->nom }}
                                </div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Poste Actuel</div>
                                <div class="info-value">{{ $entretien->salarie->poste }}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Email</div>
                                <div class="info-value">{{ $entretien->salarie->email }}</div>
                            </div>
                        </td>
                        <td>
                            <div class="info-item">
                                <div class="info-label">Poste Visé</div>
                                <div class="info-value">{{ $entretien->poste_vise }}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Date d'Entretien</div>
                                <div class="info-value">{{ $entretien->date_entretien->format('d/m/Y') }}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Type</div>
                                <div class="info-value">{{ $entretien->type_entretien_libelle }}</div>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- Composition du Jury -->
        <div class="section">
            <div class="section-title">Composition du Jury</div>
            <div class="evaluators">
                <table>
                    <tr>
                        <td style="width: {{ $entretien->expert_technique && $entretien->responsable_rh ? '33%' : ($entretien->expert_technique || $entretien->responsable_rh ? '50%' : '100%') }};">
                            <div class="evaluator">
                                <div class="info-label">Évaluateur Principal</div>
                                <div class="info-value">{{ $entretien->evaluateur_principal }}</div>
                            </div>
                        </td>
                        @if($entretien->expert_technique)
                        <td style="width: {{ $entretien->responsable_rh ? '33%' : '50%' }};">
                            <div class="evaluator">
                                <div class="info-label">Expert Technique</div>
                                <div class="info-value">{{ $entretien->expert_technique }}</div>
                            </div>
                        </td>
                        @endif
                        @if($entretien->responsable_rh)
                        <td style="width: {{ $entretien->expert_technique ? '33%' : '50%' }};">
                            <div class="evaluator">
                                <div class="info-label">Responsable RH</div>
                                <div class="info-value">{{ $entretien->responsable_rh }}</div>
                            </div>
                        </td>
                        @endif
                    </tr>
                </table>
            </div>
        </div>

        <!-- Résultats Globaux -->
        <div class="section">
            <div class="section-title">Résultats Globaux</div>
            <div class="score-summary">
                <table>
                    <tr>
                        <td class="score-main">
                            <div class="score-circle">
                                <span class="score-percentage">
                                    {{ $entretien->pourcentage_score }}%
                                </span>
                            </div>
                            <div class="score-label">SCORE TOTAL</div>
                            <div class="score-appreciation">{{ $entretien->appreciation }}</div>
                        </td>
                        <td class="score-item">
                            <div class="score-value">{{ $entretien->score_technique }}/20</div>
                            <div class="score-label">Compétences<br>Techniques</div>
                        </td>
                        <td class="score-item">
                            <div class="score-value">{{ $entretien->score_comportemental }}/12</div>
                            <div class="score-label">Compétences<br>Comportementales</div>
                        </td>
                        <td class="score-item">
                            <div class="score-value">{{ $entretien->score_adequation }}/8</div>
                            <div class="score-label">Adéquation<br>au Poste</div>
                        </td>
                    </tr>
                </table>
            </div>
        </div>

        @php
            $criteresLabels = [
                'techniques' => [
                    'formation_certifications' => 'Formation & Certifications',
                    'maitrise_logiciels' => 'Maîtrise des Logiciels',
                    'expertise_technique' => 'Expertise Technique',
                    'connaissance_marche' => 'Connaissance du Marché',
                    'gestion_projets' => 'Gestion de Projets',
                    'innovation_veille' => 'Innovation & Veille',
                ],
                'comportementaux' => [
                    'communication_redaction' => 'Communication & Rédaction',
                    'travail_equipe' => 'Travail en Équipe',
                    'rigueur_precision' => 'Rigueur & Précision',
                    'gestion_stress' => 'Gestion du Stress',
                    'autonomie_initiative' => 'Autonomie & Initiative',
                ],
                'adequation' => [
                    'motivation_engagement' => 'Motivation & Engagement',
                    'disponibilite_mobilite' => 'Disponibilité & Mobilité',
                    'potentiel_evolution' => 'Potentiel d\'Évolution',
                    'connaissance_entreprise' => 'Connaissance de l\'Entreprise',
                ],
            ];

            $scoresTechniques = is_array($entretien->scores_techniques) ? $entretien->scores_techniques : json_decode($entretien->scores_techniques, true);
            $scoresComportementaux = is_array($entretien->scores_comportementaux) ? $entretien->scores_comportementaux : json_decode($entretien->scores_comportementaux, true);
            $scoresAdequation = is_array($entretien->scores_adequation) ? $entretien->scores_adequation : json_decode($entretien->scores_adequation, true);
        @endphp

        <!-- Detailed Scores in Two Columns -->
        <table class="two-columns">
            <tr>
                <td>
                    <!-- Détail des Compétences Techniques -->
                    <div class="section">
                        <div class="section-title">Compétences Techniques</div>
                        <div class="criteria-grid">
                            <table>
                                @foreach(array_chunk($scoresTechniques, 3, true) as $chunk)
                                <tr>
                                    @foreach($chunk as $key => $value)
                                    <td>
                                        <div class="criteria-item">
                                            <div class="criteria-header clearfix">
                                                <span class="criteria-name">
                                                    {{ $criteresLabels['techniques'][$key] ?? $key }}
                                                </span>
                                                <span class="criteria-score">{{ $value['note'] }}/5</span>
                                            </div>
                                            <div class="score-bar">
                                                <div class="score-bar-fill" style="width: {{ ($value['note'] / 5) * 100 }}%;"></div>
                                            </div>
                                        </div>
                                    </td>
                                    @endforeach
                                    @while(count($chunk) < 3)
                                    <td></td>
                                    @php $chunk[] = null; @endphp
                                    @endwhile
                                </tr>
                                @endforeach
                            </table>
                        </div>
                    </div>

                    <!-- Détail des Compétences Comportementales -->
                    <div class="section">
                        <div class="section-title">Compétences Comportementales</div>
                        <div class="criteria-grid">
                            <table>
                                @foreach(array_chunk($scoresComportementaux, 3, true) as $chunk)
                                <tr>
                                    @foreach($chunk as $key => $value)
                                    <td>
                                        <div class="criteria-item">
                                            <div class="criteria-header clearfix">
                                                <span class="criteria-name">
                                                    {{ $criteresLabels['comportementaux'][$key] ?? $key }}
                                                </span>
                                                <span class="criteria-score">{{ $value['note'] }}/5</span>
                                            </div>
                                            <div class="score-bar">
                                                <div class="score-bar-fill" style="width: {{ ($value['note'] / 5) * 100 }}%;"></div>
                                            </div>
                                        </div>
                                    </td>
                                    @endforeach
                                    @while(count($chunk) < 3)
                                    <td></td>
                                    @php $chunk[] = null; @endphp
                                    @endwhile
                                </tr>
                                @endforeach
                            </table>
                        </div>
                    </div>
                </td>
                <td>
                    <!-- Détail de l'Adéquation au Poste -->
                    <div class="section">
                        <div class="section-title">Adéquation au Poste</div>
                        <div class="criteria-grid">
                            <table>
                                @foreach(array_chunk($scoresAdequation, 2, true) as $chunk)
                                <tr>
                                    @foreach($chunk as $key => $value)
                                    <td>
                                        <div class="criteria-item">
                                            <div class="criteria-header clearfix">
                                                <span class="criteria-name">
                                                    {{ $criteresLabels['adequation'][$key] ?? $key }}
                                                </span>
                                                <span class="criteria-score">{{ $value['note'] }}/5</span>
                                            </div>
                                            <div class="score-bar">
                                                <div class="score-bar-fill" style="width: {{ ($value['note'] / 5) * 100 }}%;"></div>
                                            </div>
                                        </div>
                                    </td>
                                    @endforeach
                                    @if(count($chunk) == 1)
                                    <td></td>
                                    @endif
                                </tr>
                                @endforeach
                            </table>
                        </div>
                    </div>

                    <!-- Synthèse -->
                    <div class="section">
                        <div class="section-title">Synthèse de l'Évaluation</div>
                        
                        @if($entretien->points_forts)
                        <div class="synthesis-box">
                            <div class="synthesis-title">Points Forts</div>
                            <div class="synthesis-content">{{ $entretien->points_forts }}</div>
                        </div>
                        @endif

                        @if($entretien->points_vigilance)
                        <div class="synthesis-box">
                            <div class="synthesis-title">Points de Vigilance</div>
                            <div class="synthesis-content">{{ $entretien->points_vigilance }}</div>
                        </div>
                        @endif

                        @if($entretien->recommandation)
                        <div class="synthesis-box">
                            <div class="synthesis-title">Recommandation</div>
                            <div class="synthesis-content">{{ $entretien->recommandation }}</div>
                        </div>
                        @endif
                    </div>
                </td>
            </tr>
        </table>

        <!-- Footer -->
        <div class="footer">
            <div>Document généré le {{ now()->format('d/m/Y à H:i') }} | Entretien réalisé le {{ $entretien->date_entretien->format('d/m/Y') }}</div>
            <div style="margin-top: 3px;">
                Document confidentiel - Toute divulgation non autorisée est interdite
            </div>
        </div>
    </div>
</body>
</html>