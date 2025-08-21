import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Eye, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

const breadcrumbs = [
    {
        title: 'Dashboard Ressources Humaines & Gestion des Compétences',
        href: '/ressources-humaines/dashboard',
    },
    {
        title: 'Gestion des Projets',
        href: '/ressources-humaines/Projets',
    },
];

interface User {
    id: number;
    name: string;
}

interface Projet {
    id: number;
    nom: string;
    description?: string;
    budget_total: number;
    budget_utilise?: number;
    date_debut?: string;
    date_fin?: string;
    statut: 'en_cours' | 'termine' | 'en_attente';
    client?: string;
    lieu_realisation?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    responsable_id: number;
    type_projet: 'suivi' | 'etude' | 'controle';
    responsable: User;
    created_at: string;
    updated_at: string;
}

interface Props {
    projets: Projet[];
    users: User[];
}

export default function Projets({ projets, users }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingProjet, setEditingProjet] = useState<Projet | null>(null);
    const [deletingProjet, setDeletingProjet] = useState<Projet | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);

 type FormData = {
    nom: string;
    description: string;
    budget_total: string;
    budget_utilise: string;
    date_debut: string;
    date_fin: string;
    statut: 'en_attente' | 'en_cours' | 'termine';
    client: string;
    lieu_realisation: string;
    latitude: string;
    longitude: string;
    radius: string;
    responsable_id: string;
    type_projet: 'suivi' | 'etude' | 'controle';
};

const { data, setData, post, put, processing, errors, reset } = useForm<FormData>({
    nom: '',
    description: '',
    budget_total: '',
    budget_utilise: '',
    date_debut: '',
    date_fin: '',
    statut: 'en_attente', 
    client: '',
    lieu_realisation: '',
    latitude: '',
    longitude: '',
    radius: '',
    responsable_id: '',
    type_projet: 'suivi', 
});

    // Initialize map when modal opens
    useEffect(() => {
        if (showModal && mapRef.current && !mapInstanceRef.current) {
            // Load Leaflet dynamically
            const loadLeaflet = async () => {
                const L = await import('leaflet');
                
                // Fix for default markers
                delete (L.Icon.Default.prototype as any)._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                });

                // Default center (Maroc : Rabat)
                const lat = data.latitude ? parseFloat(data.latitude) : 31.7917;
                const lng = data.longitude ? parseFloat(data.longitude) : -7.0926;

                if (mapRef.current) {
                mapInstanceRef.current = L.map(mapRef.current).setView([lat, lng], 6);
                }


                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: ' &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(mapInstanceRef.current);

                // Add marker if coordinates exist
                if (data.latitude && data.longitude) {
                    markerRef.current = L.marker([parseFloat(data.latitude), parseFloat(data.longitude)])
                        .addTo(mapInstanceRef.current);
                }

                // Handle map clicks
                mapInstanceRef.current.on('click', (e: any) => {
                    const { lat, lng } = e.latlng;
                    
                    // Update form data
                    setData('latitude', lat.toString());
                    setData('longitude', lng.toString());

                    // Remove existing marker
                    if (markerRef.current) {
                        mapInstanceRef.current.removeLayer(markerRef.current);
                    }

                    // Add new marker
                    markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);

                    // Get address (reverse geocoding)
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.display_name) {
                                setData('lieu_realisation', data.display_name);
                            }
                        })
                        .catch(console.error);
                });
            };

            loadLeaflet();
        }

        // Cleanup map when modal closes
        if (!showModal && mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
            markerRef.current = null;
        }
    }, [showModal]);

    // Update marker when coordinates change
    useEffect(() => {
        if (mapInstanceRef.current && data.latitude && data.longitude) {
            const lat = parseFloat(data.latitude);
            const lng = parseFloat(data.longitude);

            if (markerRef.current) {
                mapInstanceRef.current.removeLayer(markerRef.current);
            }

            markerRef.current = (window as any).L?.marker([lat, lng]).addTo(mapInstanceRef.current);
            mapInstanceRef.current.setView([lat, lng], 10);
        }
    }, [data.latitude, data.longitude]);

    const openCreateModal = () => {
        reset();
        setEditingProjet(null);
        setShowModal(true);
    };

    const openEditModal = (projet: Projet) => {
        setData({
            nom: projet.nom,
            description: projet.description || '',
            budget_total: projet.budget_total.toString(),
            budget_utilise: projet.budget_utilise?.toString() || '',
            date_debut: projet.date_debut || '',
            date_fin: projet.date_fin || '',
            statut: projet.statut,
            client: projet.client || '',
            lieu_realisation: projet.lieu_realisation || '',
            latitude: projet.latitude?.toString() || '',
            longitude: projet.longitude?.toString() || '',
            radius: projet.radius?.toString() || '',
            responsable_id: projet.responsable_id.toString(),
            type_projet: projet.type_projet,
        });
        setEditingProjet(projet);
        setShowModal(true);
    };

    const openDeleteModal = (projet: Projet) => {
        setDeletingProjet(projet);
        setShowDeleteModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingProjet) {
            put(`/ressources-humaines/projets/${editingProjet.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingProjet(null);
                    reset();
                }
            });
        } else {
            post('/ressources-humaines/projets', {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                }
            });
        }
    };

    const handleDelete = () => {
        if (deletingProjet) {
            router.delete(`/ressources-humaines/projets/${deletingProjet.id}`, {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setDeletingProjet(null);
                }
            });
        }
    };

    const getStatusBadge = (statut: string) => {
        const statusClasses = {
            en_cours: 'bg-blue-100 text-blue-800 border-blue-200',
            termine: 'bg-green-100 text-green-800 border-green-200',
            en_attente: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
        
        const statusLabels = {
            en_cours: 'En Cours',
            termine: 'Terminé',
            en_attente: 'En Attente'
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusClasses[statut as keyof typeof statusClasses]}`}>
                {statusLabels[statut as keyof typeof statusLabels]}
            </span>
        );
    };

    const getTypeBadge = (type: string) => {
        const typeClasses = {
            suivi: 'bg-purple-100 text-purple-800 border-purple-200',
            etude: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            controle: 'bg-orange-100 text-orange-800 border-orange-200'
        };

        const typeLabels = {
            suivi: 'Suivi',
            etude: 'Étude',
            controle: 'Contrôle'
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${typeClasses[type as keyof typeof typeClasses]}`}>
                {typeLabels[type as keyof typeof typeLabels]}
            </span>
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const getBudgetProgress = (total: number, utilise: number | null | undefined) => {
        if (!utilise || utilise === 0) return 0;
        return Math.min((utilise / total) * 100, 100);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Projets - Ressources Humaines" />

            {/* Load Leaflet CSS */}
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
                integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
                crossOrigin=""
            />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestion des Projets</h1>
                        <p className="mt-1 text-gray-600">Gérez tous les projets de l'entreprise</p>
                    </div>
                    <Button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-md transition-colors hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        Nouveau Projet
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2">
                                <Eye className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Projets</p>
                                <p className="text-2xl font-bold text-gray-900">{projets.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-green-100 p-2">
                                <Calendar className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">En Cours</p>
                                <p className="text-2xl font-bold text-gray-900">{projets.filter((p) => p.statut === 'en_cours').length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-purple-100 p-2">
                                <DollarSign className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Budget Total</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(projets.reduce((sum, p) => sum + p.budget_total, 0))}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-orange-100 p-2">
                                <MapPin className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Terminés</p>
                                <p className="text-2xl font-bold text-gray-900">{projets.filter((p) => p.statut === 'termine').length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Projet</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Client</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Responsable</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Statut</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Budget</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Dates</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {projets.map((projet) => (
                                    <tr key={projet.id} className="transition-colors hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{projet.nom}</div>
                                                {projet.description && (
                                                    <div className="max-w-xs truncate text-sm text-gray-500">{projet.description}</div>
                                                )}
                                                {projet.lieu_realisation && (
                                                    <div className="mt-1 flex items-center gap-1">
                                                        <MapPin className="h-3 w-3 text-gray-400" />
                                                        <span className="text-xs text-gray-500">{projet.lieu_realisation}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{projet.client || '-'}</td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{projet.responsable?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getTypeBadge(projet.type_projet)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(projet.statut)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">{formatCurrency(projet.budget_total)}</div>
                                                {projet.budget_utilise && (
                                                    <div className="mt-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-1.5 w-12 rounded-full bg-gray-200">
                                                                <div
                                                                    className="h-1.5 rounded-full bg-blue-600"
                                                                    style={{
                                                                        width: `${getBudgetProgress(projet.budget_total, projet.budget_utilise)}%`,
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs text-gray-500">{formatCurrency(projet.budget_utilise)}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                            <div>
                                                <div>Début: {formatDate(projet.date_debut || '')}</div>
                                                <div>Fin: {formatDate(projet.date_fin || '')}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(projet)}
                                                    className="rounded p-1 text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-900"
                                                    title="Modifier"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(projet)}
                                                    className="rounded p-1 text-red-600 transition-colors hover:bg-red-100 hover:text-red-900"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {projets.length === 0 && (
                        <div className="py-12 text-center">
                            <div className="text-gray-500">
                                <Eye className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun projet</h3>
                                <p className="mt-1 text-sm text-gray-500">Commencez par créer un nouveau projet.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-600">
                        <div className="m-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6">
                            <h3 className="mb-4 text-lg font-medium text-gray-900">{editingProjet ? 'Modifier le projet' : 'Nouveau projet'}</h3>

                                                    <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nom du projet *</label>
                                    <input
                                        type="text"
                                        value={data.nom}
                                        onChange={(e) => setData('nom', e.target.value)}
                                        className="block w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl bg-gray-50/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white hover:bg-white hover:border-gray-300"
                                        placeholder="Entrez le nom du projet"
                                        required
                                    />
                                    {errors.nom && <div className="mt-2 text-sm text-red-500 font-medium">{errors.nom}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Client</label>
                                    <input
                                        type="text"
                                        value={data.client}
                                        onChange={(e) => setData('client', e.target.value)}
                                        className="block w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl bg-gray-50/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white hover:bg-white hover:border-gray-300"
                                        placeholder="Nom du client"
                                    />
                                    {errors.client && <div className="mt-2 text-sm text-red-500 font-medium">{errors.client}</div>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="block w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl bg-gray-50/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white hover:bg-white hover:border-gray-300 resize-none"
                                        placeholder="Description détaillée du projet"
                                    />
                                    {errors.description && <div className="mt-2 text-sm text-red-500 font-medium">{errors.description}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Budget total *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.budget_total}
                                        onChange={(e) => setData('budget_total', e.target.value)}
                                        className="block w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl bg-gray-50/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white hover:bg-white hover:border-gray-300"
                                        placeholder="0.00 €"
                                        required
                                    />
                                    {errors.budget_total && <div className="mt-2 text-sm text-red-500 font-medium">{errors.budget_total}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Budget utilisé</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.budget_utilise}
                                        onChange={(e) => setData('budget_utilise', e.target.value)}
                                        className="block w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl bg-gray-50/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white hover:bg-white hover:border-gray-300"
                                        placeholder="0.00 €"
                                    />
                                    {errors.budget_utilise && <div className="mt-2 text-sm text-red-500 font-medium">{errors.budget_utilise}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date de début</label>
                                    <input
                                        type="date"
                                        value={data.date_debut}
                                        onChange={(e) => setData('date_debut', e.target.value)}
                                        className="block w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl bg-gray-50/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white hover:bg-white hover:border-gray-300"
                                    />
                                    {errors.date_debut && <div className="mt-2 text-sm text-red-500 font-medium">{errors.date_debut}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date de fin</label>
                                    <input
                                        type="date"
                                        value={data.date_fin}
                                        onChange={(e) => setData('date_fin', e.target.value)}
                                        className="block w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl bg-gray-50/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white hover:bg-white hover:border-gray-300"
                                    />
                                    {errors.date_fin && <div className="mt-2 text-sm text-red-500 font-medium">{errors.date_fin}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Statut *</label>
                                    <select
                                        value={data.statut}
                                        onChange={(e) => setData('statut', e.target.value as any)}
                                        className="block w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl bg-gray-50/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white hover:bg-white hover:border-gray-300 cursor-pointer"
                                        required
                                    >
                                        <option value="en_attente">En Attente</option>
                                        <option value="en_cours">En Cours</option>
                                        <option value="termine">Terminé</option>
                                    </select>
                                    {errors.statut && <div className="mt-2 text-sm text-red-500 font-medium">{errors.statut}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type de projet *</label>
                                    <select
                                        value={data.type_projet}
                                        onChange={(e) => setData('type_projet', e.target.value as any)}
                                        className="block w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl bg-gray-50/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white hover:bg-white hover:border-gray-300 cursor-pointer"
                                        required
                                    >
                                        <option value="suivi">Suivi</option>
                                        <option value="etude">Étude</option>
                                        <option value="controle">Contrôle</option>
                                    </select>
                                    {errors.type_projet && <div className="mt-2 text-sm text-red-500 font-medium">{errors.type_projet}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Responsable *</label>
                                    <select
                                        value={data.responsable_id}
                                        onChange={(e) => setData('responsable_id', e.target.value)}
                                        className="block w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl bg-gray-50/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white hover:bg-white hover:border-gray-300 cursor-pointer"
                                        required
                                    >
                                        <option value="">Sélectionner un responsable</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.responsable_id && <div className="mt-2 text-sm text-red-500 font-medium">{errors.responsable_id}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Lieu de réalisation</label>
                                    <input
                                        type="text"
                                        value={data.lieu_realisation}
                                        onChange={(e) => setData('lieu_realisation', e.target.value)}
                                        className="block w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl bg-gray-50/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white hover:bg-white hover:border-gray-300"
                                        placeholder="Adresse du projet"
                                    />
                                    {errors.lieu_realisation && <div className="mt-2 text-sm text-red-500 font-medium">{errors.lieu_realisation}</div>}
                                </div>

                                {/* Localisation par carte */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Localisation du projet (cliquez sur la carte pour sélectionner)
                                    </label>
                                    <div
                                        ref={mapRef}
                                        className="h-64 w-full rounded-xl border-2 border-gray-200 bg-gradient-to-br from-blue-50 to-green-50 shadow-inner"
                                        style={{ minHeight: '300px' }}
                                    />
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Latitude</label>
                                            <input
                                                type="text"
                                                value={data.latitude}
                                                readOnly
                                                className="block w-full px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg bg-gray-50 shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Longitude</label>
                                            <input
                                                type="text"
                                                value={data.longitude}
                                                readOnly
                                                className="block w-full px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg bg-gray-50 shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Rayon (km)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={data.radius}
                                        onChange={(e) => setData('radius', e.target.value)}
                                        className="block w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl bg-gray-50/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white hover:bg-white hover:border-gray-300"
                                        placeholder="10.0"
                                    />
                                    {errors.radius && <div className="mt-2 text-sm text-red-500 font-medium">{errors.radius}</div>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-gray-100 pt-6 mt-8">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingProjet(null);
                                        reset();
                                    }}
                                    className="px-6 py-2.5 text-gray-700 font-medium border border-gray-200 rounded-xl bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 text-white font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {processing ? 'En cours...' : editingProjet ? 'Mettre à jour' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

                 
                {/* Delete Modal */}
                {showDeleteModal && deletingProjet && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-600">
                        <div className="m-4 w-full max-w-md rounded-lg bg-white p-6">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                                    <Trash2 className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Supprimer le projet</h3>
                                    <p className="text-sm text-gray-500">Cette action est irréversible.</p>
                                </div>
                            </div>

                            <p className="mb-6 text-gray-700">
                                Êtes-vous sûr de vouloir supprimer le projet <strong>"{deletingProjet.nom}"</strong> ?
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeletingProjet(null);
                                    }}
                                    className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}