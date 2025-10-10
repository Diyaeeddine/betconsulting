import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
    Plus, 
    Trash2, 
    Send, 
    Users, 
    Calendar,
    AlertCircle,
    CheckCircle2,
    Clock,
    TrendingUp,
    Briefcase,
    Award,
    X
} from 'lucide-react';

interface Profil {
    categorie_profil: string;
    poste_profil: string;
    quantite: number;
    niveau_experience: string;
    competences_requises: string[];
}

interface Props {
    categories: Record<string, string>;
    postes: Record<string, string>;
    demandes: any[];
}

export default function DemanderProfils({ categories, postes, demandes }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        titre_demande: '',
        description: '',
        urgence: 'normale' as 'normale' | 'urgent' | 'critique',
        date_souhaitee: '',
        profils: [] as Profil[],
    });

    const [competenceInput, setCompetenceInput] = useState<Record<number, string>>({});
    const [showSuccess, setShowSuccess] = useState(false);

    const addProfil = () => {
        setData('profils', [
            ...data.profils,
            {
                categorie_profil: '',
                poste_profil: '',
                quantite: 1,
                niveau_experience: 'junior',
                competences_requises: [],
            },
        ]);
    };

    const removeProfil = (index: number) => {
        setData('profils', data.profils.filter((_, i) => i !== index));
    };

    const updateProfil = (index: number, field: keyof Profil, value: any) => {
        const updated = [...data.profils];
        updated[index] = { ...updated[index], [field]: value };
        setData('profils', updated);
    };

    const addCompetence = (index: number) => {
        const competence = competenceInput[index]?.trim();
        if (!competence) return;
        
        const updated = [...data.profils];
        updated[index].competences_requises = [
            ...updated[index].competences_requises,
            competence
        ];
        setData('profils', updated);
        setCompetenceInput({ ...competenceInput, [index]: '' });
    };

    const removeCompetence = (profilIndex: number, compIndex: number) => {
        const updated = [...data.profils];
        updated[profilIndex].competences_requises.splice(compIndex, 1);
        setData('profils', updated);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('marches.profils.store'), {
            onSuccess: () => {
                reset();
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            },
        });
    };

    const getStatutColor = (statut: string) => {
        const colors = {
            en_attente: 'bg-amber-50 text-amber-700 border-amber-200',
            en_cours: 'bg-blue-50 text-blue-700 border-blue-200',
            validee: 'bg-green-50 text-green-700 border-green-200',
            refusee: 'bg-red-50 text-red-700 border-red-200',
            completee: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
        return colors[statut as keyof typeof colors] || colors.en_attente;
    };

    const getUrgenceColor = (urgence: string) => {
        const colors = {
            normale: 'bg-gray-100 text-gray-700',
            urgent: 'bg-orange-100 text-orange-700',
            critique: 'bg-red-100 text-red-700',
        };
        return colors[urgence as keyof typeof colors] || colors.normale;
    };

    return (
        <AppLayout>
            <Head title="Demander des Profils" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
                <div className="max-w-6xl mx-auto space-y-6">
                    
                    {/* Success Message */}
                    {showSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 className="text-green-600" size={24} />
                            <p className="text-green-800 font-medium">Demande envoyée avec succès ! 🎉</p>
                        </div>
                    )}

                    {/* Header */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                    <Users className="text-white" size={28} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white">Demande de Profils</h1>
                                    <p className="text-blue-100 text-sm mt-1">
                                        Créez une nouvelle demande de ressources humaines
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={submit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Briefcase className="text-blue-600" size={22} />
                                <h2 className="text-lg font-semibold text-gray-900">Informations Générales</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Titre de la demande *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.titre_demande}
                                        onChange={(e) => setData('titre_demande', e.target.value)}
                                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Ex: Besoin d'ingénieurs BIM pour projet X"
                                        required
                                    />
                                    {errors.titre_demande && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle size={14} />
                                            {errors.titre_demande}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Niveau d'urgence
                                        </label>
                                        <select
                                            value={data.urgence}
                                            onChange={(e) => setData('urgence', e.target.value as any)}
                                            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            <option value="normale">Normale</option>
                                            <option value="urgent">Urgent</option>
                                            <option value="critique">Critique</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date souhaitée
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="date"
                                                value={data.date_souhaitee}
                                                onChange={(e) => setData('date_souhaitee', e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-end">
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 w-full">
                                            <div className="text-xs text-blue-600 font-medium">Profils demandés</div>
                                            <div className="text-2xl font-bold text-blue-700">{data.profils.length}</div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description (optionnel)
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Ajoutez des détails sur le contexte ou les besoins spécifiques..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Profils Section */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Award className="text-purple-600" size={22} />
                                    <h2 className="text-lg font-semibold text-gray-900">Profils Recherchés</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={addProfil}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    <Plus size={18} />
                                    <span className="font-medium">Ajouter un profil</span>
                                    </button>
                            </div>

                            {data.profils.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                    <Users className="mx-auto text-gray-400 mb-3" size={48} />
                                    <p className="text-gray-500 font-medium">Aucun profil ajouté</p>
                                    <p className="text-gray-400 text-sm mt-1">Cliquez sur "Ajouter un profil" pour commencer</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {data.profils.map((profil, index) => (
                                        <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                                                        {index + 1}
                                                    </div>
                                                    <span className="font-semibold text-gray-700">Profil #{index + 1}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeProfil(index)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Catégorie *
                                                    </label>
                                                    <select
                                                        value={profil.categorie_profil}
                                                        onChange={(e) => updateProfil(index, 'categorie_profil', e.target.value)}
                                                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                                                        required
                                                    >
                                                        <option value="">Sélectionner une catégorie</option>
                                                        {Object.entries(categories).map(([key, label]) => (
                                                            <option key={key} value={key}>{label}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Poste *
                                                    </label>
                                                    <select
                                                        value={profil.poste_profil}
                                                        onChange={(e) => updateProfil(index, 'poste_profil', e.target.value)}
                                                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                                                        required
                                                    >
                                                        <option value="">Sélectionner un poste</option>
                                                        {Object.entries(postes).map(([key, label]) => (
                                                            <option key={key} value={key}>{label}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Quantité *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="50"
                                                        value={profil.quantite}
                                                        onChange={(e) => updateProfil(index, 'quantite', parseInt(e.target.value) || 1)}
                                                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Niveau d'expérience *
                                                    </label>
                                                    <select
                                                        value={profil.niveau_experience}
                                                        onChange={(e) => updateProfil(index, 'niveau_experience', e.target.value)}
                                                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                                                    >
                                                        <option value="junior">Junior</option>
                                                        <option value="intermediaire">Intermédiaire</option>
                                                        <option value="senior">Senior</option>
                                                        <option value="expert">Expert</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Compétences requises
                                                </label>
                                                <div className="flex gap-2 mb-2">
                                                    <input
                                                        type="text"
                                                        value={competenceInput[index] || ''}
                                                        onChange={(e) => setCompetenceInput({ ...competenceInput, [index]: e.target.value })}
                                                        placeholder="Ex: Revit, AutoCAD, Python..."
                                                        className="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                addCompetence(index);
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => addCompetence(index)}
                                                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                                                    >
                                                        Ajouter
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {profil.competences_requises.map((comp, compIndex) => (
                                                        <span
                                                            key={compIndex}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
                                                        >
                                                            {comp}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeCompetence(index, compIndex)}
                                                                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {errors.profils && (
                                <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {errors.profils}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={processing || data.profils.length === 0}
                                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-base"
                            >
                                <Send size={20} />
                                {processing ? 'Envoi en cours...' : 'Envoyer la demande'}
                            </button>
                        </div>
                    </form>

                    {/* My Demands */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="text-green-600" size={22} />
                            <h2 className="text-lg font-semibold text-gray-900">Mes Demandes</h2>
                            <span className="ml-auto bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                {demandes.length} demande{demandes.length > 1 ? 's' : ''}
                            </span>
                        </div>

                        {demandes.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-xl">
                                <Clock className="mx-auto text-gray-400 mb-2" size={40} />
                                <p className="text-gray-500">Aucune demande pour le moment</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {demandes.map((demande) => (
                                    <div
                                        key={demande.id}
                                        className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all bg-gradient-to-r from-white to-gray-50"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-gray-900">{demande.titre_demande}</h3>
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getUrgenceColor(demande.urgence)}`}>
                                                        {demande.urgence}
                                                    </span>
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-lg border ${getStatutColor(demande.statut)}`}>
                                                        {demande.statut.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <Users size={16} />
                                                        {demande.details?.length || 0} profils
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={16} />
                                                        {new Date(demande.created_at).toLocaleDateString('fr-FR')}
                                                    </span>
                                                    {demande.date_souhaitee && (
                                                        <span className="flex items-center gap-1 text-blue-600">
                                                            <Clock size={16} />
                                                            Souhaité: {new Date(demande.date_souhaitee).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}