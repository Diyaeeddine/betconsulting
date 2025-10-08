import React, { useState, useEffect } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
    CheckCircle, 
    XCircle, 
    Clock, 
    Users, 
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    MessageSquare,
    Search,
    UserCheck,
    Briefcase,
    Plus,
    X
} from 'lucide-react';

interface Salarie {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    poste: string;
    statut: string;
}

interface ProfilAvailable {
    id: number;
    salarie: Salarie;
    categorie_profil: string;
    poste_profil: string;
    niveau_experience: string;
    competences_techniques: string[];
    actif: boolean;
}

interface DemandeDetail {
    id: number;
    categorie_profil: string;
    poste_profil: string;
    quantite: number;
    niveau_experience: string;
    competences_requises: string[];
    disponible: boolean;
    profils_disponibles: number;
}

interface Demande {
    commentaire_rh: any;
    id: number;
    titre_demande: string;
    description: string;
    urgence: string;
    date_souhaitee: string;
    statut: string;
    demandeur: any;
    traite_par: any;
    traite_le: string;
    details: DemandeDetail[];
    created_at: string;
}

interface Projet {
    id: number;
    nom: string;
    client: string;
    statut: string;
}

interface Props {
    demandes: Demande[];
    projets: Projet[];
}

export default function ProfilsDemandes({ demandes, projets }: Props) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [searchingDetail, setSearchingDetail] = useState<number | null>(null);
    const [availableProfils, setAvailableProfils] = useState<ProfilAvailable[]>([]);
    const [selectedProfils, setSelectedProfils] = useState<Record<number, number[]>>({});
    const [selectedProjet, setSelectedProjet] = useState<number | null>(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    
    const { data, setData, post, processing } = useForm({
        statut: '',
        commentaire_rh: '',
    });

    const updateStatut = (demandeId: number, statut: string) => {
        router.post(route('rh.profils.demandes.update', demandeId), {
            statut,
            commentaire_rh: data.commentaire_rh,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setData('commentaire_rh', '');
            },
        });
    };

    const searchAvailableProfils = (detailId: number, detail: DemandeDetail) => {
        setSearchingDetail(detailId);
        
        router.get(route('rh.profils.search'), {
            categorie_profil: detail.categorie_profil,
            poste_profil: detail.poste_profil,
            niveau_experience: detail.niveau_experience,
        }, {
            preserveState: true,
            preserveScroll: true,
            only: ['availableProfils'],
            onSuccess: (page: any) => {
                setAvailableProfils(page.props.availableProfils || []);
            },
        });
    };

    const toggleProfilSelection = (detailId: number, profilId: number) => {
        setSelectedProfils(prev => {
            const current = prev[detailId] || [];
            if (current.includes(profilId)) {
                return { ...prev, [detailId]: current.filter(id => id !== profilId) };
            } else {
                return { ...prev, [detailId]: [...current, profilId] };
            }
        });
    };

    const assignToProject = (demandeId: number) => {
        if (!selectedProjet) {
            alert('Veuillez sélectionner un projet');
            return;
        }

        const allSelectedProfils = Object.values(selectedProfils).flat();
        
        if (allSelectedProfils.length === 0) {
            alert('Veuillez sélectionner au moins un profil');
            return;
        }

        router.post(route('rh.profils.assign-to-project'), {
            demande_id: demandeId,
            projet_id: selectedProjet,
            profil_ids: allSelectedProfils,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowAssignModal(false);
                setSelectedProfils({});
                setSelectedProjet(null);
                setAvailableProfils([]);
            },
        });
    };

    const getStatutBadge = (statut: string) => {
        const styles = {
            en_attente: 'bg-amber-50 text-amber-700 border-amber-200',
            en_cours: 'bg-blue-50 text-blue-700 border-blue-200',
            validee: 'bg-green-50 text-green-700 border-green-200',
            refusee: 'bg-red-50 text-red-700 border-red-200',
            completee: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
        return styles[statut as keyof typeof styles] || styles.en_attente;
    };

    const getUrgenceBadge = (urgence: string) => {
        const styles = {
            normale: 'bg-gray-100 text-gray-700',
            urgent: 'bg-orange-100 text-orange-700',
            critique: 'bg-red-100 text-red-700',
        };
        return styles[urgence as keyof typeof styles] || styles.normale;
    };

    const getDisponibiliteIcon = (detail: DemandeDetail) => {
        if (detail.disponible) {
            return <CheckCircle size={18} className="text-green-500" />;
        } else if (detail.profils_disponibles > 0) {
            return <AlertTriangle size={18} className="text-orange-500" />;
        }
        return <XCircle size={18} className="text-red-500" />;
    };

    return (
        <AppLayout>
            <Head title="Demandes de Profils" />

            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
                <div className="max-w-7xl mx-auto space-y-6">
                    
                    {/* Header */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                        <Users className="text-white" size={28} />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-white">Demandes de Profils</h1>
                                        <p className="text-purple-100 text-sm mt-1">
                                            Gérer et assigner les ressources humaines
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl">
                                    <div className="text-white/80 text-xs">Total demandes</div>
                                    <div className="text-white text-2xl font-bold">{demandes.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Demandes List */}
                    <div className="space-y-4">
                        {demandes.map((demande) => (
                            <div key={demande.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                {/* Header */}
                                <div className="p-5 border-b bg-gradient-to-r from-gray-50 to-white">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {demande.titre_demande}
                                                </h3>
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getUrgenceBadge(demande.urgence)}`}>
                                                    {demande.urgence}
                                                </span>
                                                <span className={`px-3 py-1 text-xs font-medium rounded-lg border ${getStatutBadge(demande.statut)}`}>
                                                    {demande.statut.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <Users size={16} />
                                                    {demande.demandeur.name}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={16} />
                                                    {new Date(demande.created_at).toLocaleDateString('fr-FR')}
                                                </span>
                                                {demande.date_souhaitee && (
                                                    <span className="flex items-center gap-1 text-blue-600 font-medium">
                                                        {new Date(demande.date_souhaitee).toLocaleDateString('fr-FR')}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Briefcase size={16} />
                                                    {demande.details.reduce((sum, d) => sum + d.quantite, 0)} profils
                                                </span>
                                            </div>
                                            {demande.description && (
                                                <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg p-3 border">
                                                    {demande.description}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setExpandedId(expandedId === demande.id ? null : demande.id)}
                                            className="ml-3 p-2 hover:bg-gray-100 rounded-xl transition-all"
                                        >
                                            {expandedId === demande.id ? (
                                                <ChevronUp size={20} />
                                            ) : (
                                                <ChevronDown size={20} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {expandedId === demande.id && (
                                    <div className="p-5 bg-gray-50 space-y-4">
                                        {/* Profils Details */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                <UserCheck si
                                                ze={18} className="text-purple-600" />
                                                Profils Demandés
                                            </h4>
                                            <div className="space-y-3">
                                                {demande.details.map((detail) => (
                                                    <div
                                                        key={detail.id}
                                                        className="bg-white rounded-xl border border-gray-200 p-4 space-y-3"
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    {getDisponibiliteIcon(detail)}
                                                                    <span className="font-semibold text-gray-900">
                                                                        {detail.poste_profil.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                                    </span>
                                                                    <span className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg font-medium">
                                                                        {detail.niveau_experience}
                                                                    </span>
                                                                    <span className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded-lg">
                                                                        Qté: {detail.quantite}
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs text-gray-500 mb-2">
                                                                    {detail.categorie_profil.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                                </div>
                                                                {detail.competences_requises && detail.competences_requises.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                                        {detail.competences_requises.map((comp, idx) => (
                                                                            <span
                                                                                key={idx}
                                                                                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg"
                                                                            >
                                                                                {comp}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                {detail.disponible ? (
                                                                    <div className="text-green-600 font-semibold text-sm mb-2">
                                                                        ✓ {detail.profils_disponibles} disponibles
                                                                    </div>
                                                                ) : detail.profils_disponibles > 0 ? (
                                                                    <div className="text-orange-600 text-sm mb-2">
                                                                        ⚠ Seulement {detail.profils_disponibles}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-red-600 text-sm mb-2">
                                                                        ✗ Non disponible
                                                                    </div>
                                                                )}
                                                                <button
                                                                    onClick={() => searchAvailableProfils(detail.id, detail)}
                                                                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
                                                                >
                                                                    <Search size={16} />
                                                                    Rechercher
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Available Profils Results */}
                                                        {searchingDetail === detail.id && availableProfils.length > 0 && (
                                                            <div className="mt-3 pt-3 border-t">
                                                                <p className="text-xs font-medium text-gray-700 mb-2">
                                                                    Profils disponibles ({availableProfils.length})
                                                                </p>
                                                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                                                    {availableProfils.map((profil) => (
                                                                        <label
                                                                            key={profil.id}
                                                                            className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 hover:border-blue-400 cursor-pointer transition-all"
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={(selectedProfils[detail.id] || []).includes(profil.id)}
                                                                                onChange={() => toggleProfilSelection(detail.id, profil.id)}
                                                                                className="w-4 h-4 text-blue-600 rounded"
                                                                            />
                                                                            <div className="flex-1">
                                                                                <div className="font-medium text-gray-900 text-sm">
                                                                                    {profil.salarie.prenom} {profil.salarie.nom}
                                                                                </div>
                                                                                <div className="text-xs text-gray-600">
                                                                                    {profil.salarie.email}
                                                                                </div>
                                                                                {profil.competences_techniques && profil.competences_techniques.length > 0 && (
                                                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                                                        {profil.competences_techniques.slice(0, 3).map((comp, idx) => (
                                                                                            <span key={idx} className="text-xs px-2 py-0.5 bg-white rounded text-blue-700">
                                                                                                {comp}
                                                                                            </span>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <span className="text-xs px-2 py-1 bg-white rounded-lg text-purple-700 font-medium">
                                                                                {profil.niveau_experience}
                                                                            </span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Assignment Section */}
                                        {Object.values(selectedProfils).flat().length > 0 && (
                                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                                            <Briefcase size={18} className="text-blue-600" />
                                                            Assigner au projet
                                                        </h4>
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            {Object.values(selectedProfils).flat().length} profil(s) sélectionné(s)
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <select
                                                        value={selectedProjet || ''}
                                                        onChange={(e) => setSelectedProjet(Number(e.target.value))}
                                                        className="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                                                    >
                                                        <option value="">Sélectionner un projet</option>
                                                        {projets.map((projet) => (
                                                            <option key={projet.id} value={projet.id}>
                                                                {projet.nom} - {projet.client}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => assignToProject(demande.id)}
                                                        disabled={!selectedProjet}
                                                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                                                    >
                                                        <UserCheck size={18} />
                                                        Assigner
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Status Actions */}
                                        {demande.statut === 'en_attente' && (
                                            <div className="border-t pt-4">
                                                <div className="mb-3">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        <MessageSquare size={14} className="inline mr-1" />
                                                        Commentaire (optionnel)
                                                    </label>
                                                    <textarea
                                                        value={data.commentaire_rh}
                                                        onChange={(e) => setData('commentaire_rh', e.target.value)}
                                                        rows={2}
                                                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Ajouter un commentaire..."
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => updateStatut(demande.id, 'en_cours')}
                                                        disabled={processing}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all font-medium"
                                                    >
                                                        <Clock size={16} />
                                                        En cours
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatut(demande.id, 'validee')}
                                                        disabled={processing}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all font-medium"
                                                    >
                                                        <CheckCircle size={16} />
                                                        Valider
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatut(demande.id, 'refusee')}
                                                        disabled={processing}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all font-medium"
                                                    >
                                                        <XCircle size={16} />
                                                        Refuser
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {demande.statut === 'en_cours' && (
                                            <div className="border-t pt-4">
                                                <button
                                                    onClick={() => updateStatut(demande.id, 'completee')}
                                                    disabled={processing}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all font-semibold"
                                                >
                                                    <CheckCircle size={18} />
                                                    Marquer comme complétée
                                                </button>
                                            </div>
                                        )}

                                        {/* RH Comment Display */}
                                        {demande.commentaire_rh && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                                <p className="text-sm text-gray-800">
                                                    <MessageSquare size={14} className="inline mr-2 text-blue-600" />
                                                    <strong>Commentaire RH:</strong> {demande.commentaire_rh}
                                                </p>
                                                {demande.traite_par && (
                                                    <p className="text-xs text-gray-600 mt-2">
                                                        Par {demande.traite_par.name} - {new Date(demande.traite_le).toLocaleString('fr-FR')}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {demandes.length === 0 && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                                <Users size={48} className="mx-auto text-gray-400 mb-3" />
                                <p className="text-gray-500 font-medium">Aucune demande de profils</p>
                                <p className="text-gray-400 text-sm mt-1">Les nouvelles demandes apparaîtront ici</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}