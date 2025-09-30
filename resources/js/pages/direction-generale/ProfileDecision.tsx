import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { router, usePage } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, Building, Calendar, CheckCircle, Clock, Eye, Mail, MapPin, Phone, User, Users, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Salarie {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    adresse?: string;
    date_naissance?: string;
    poste?: string;
    departement?: string;
    date_embauche?: string;
    created_at: string;
}

interface Props {
    salaries: Salarie[];
}

interface PageProps {
    flash: {
        success?: string;
        error?: string;
        info?: string;
    };
    [key: string]: unknown; // Add index signature to satisfy Inertia's PageProps constraint
}

export default function ProfileDecision({ salaries }: Props) {
    const [loading, setLoading] = useState<number | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<Salarie | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState<{
        show: boolean;
        salarie: Salarie | null;
        action: 'accept' | 'reject';
    }>({ show: false, salarie: null, action: 'accept' });
    const [alerts, setAlerts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>>([]);

    const { flash } = usePage<PageProps>().props;

    const breadcrumbs = [
        {
            title: 'Boite de decision',
            href: '/direction-generale/boite-decision',
        },
        {
            title: 'Décisions Profils',
            href: '/direction-generale/boite-decision-profile',
        },
    ];

    // Gérer les messages flash de Laravel
    useEffect(() => {
        const newAlerts = [];

        if (flash.success) {
            newAlerts.push({
                id: Date.now().toString(),
                type: 'success' as const,
                message: flash.success,
            });
        }

        if (flash.error) {
            newAlerts.push({
                id: Date.now().toString() + '1',
                type: 'error' as const,
                message: flash.error,
            });
        }

        if (flash.info) {
            newAlerts.push({
                id: Date.now().toString() + '2',
                type: 'info' as const,
                message: flash.info,
            });
        }

        if (newAlerts.length > 0) {
            setAlerts(newAlerts);

            // Auto-supprimer après 5 secondes
            setTimeout(() => {
                setAlerts([]);
            }, 5000);
        }
    }, [flash]);

    const showConfirmation = (salarie: Salarie, action: 'accept' | 'reject') => {
        setShowConfirmDialog({
            show: true,
            salarie,
            action,
        });
    };

    const handleDecision = async () => {
        if (!showConfirmDialog.salarie) return;

        const { salarie, action } = showConfirmDialog;
        setLoading(salarie.id);
        setShowConfirmDialog({ show: false, salarie: null, action: 'accept' });

        try {
            await router.post(
                `/direction-generale/profile-decision/${salarie.id}`,
                {
                    decision: action,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Message géré par le serveur Laravel
                    },
                    onError: (errors) => {
                        console.error('Erreurs de validation:', errors);
                        setAlerts([
                            {
                                id: Date.now().toString(),
                                type: 'error',
                                message: 'Erreur de validation. Veuillez vérifier les données.',
                            },
                        ]);
                    },
                },
            );
        } catch (error) {
            console.error('Erreur lors de la décision:', error);
            setAlerts([
                {
                    id: Date.now().toString(),
                    type: 'error',
                    message: "Une erreur inattendue s'est produite. Veuillez réessayer.",
                },
            ]);
        } finally {
            setLoading(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const removeAlert = (alertId: string) => {
        setAlerts(alerts.filter((alert) => alert.id !== alertId));
    };

    const ConfirmDialog = () => {
        const { salarie, action } = showConfirmDialog;
        if (!salarie) return null;

        return (
            <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
                <div className="w-full max-w-md rounded-lg bg-white p-6">
                    <div className="mb-4 flex items-center">
                        {action === 'accept' ? (
                            <CheckCircle className="mr-3 h-6 w-6 text-green-600" />
                        ) : (
                            <XCircle className="mr-3 h-6 w-6 text-red-600" />
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">Confirmer {action === 'accept' ? "l'acceptation" : 'le rejet'}</h3>
                    </div>

                    <div className="mb-6">
                        <p className="mb-2 text-gray-700">
                            Êtes-vous sûr de vouloir <strong>{action === 'accept' ? 'accepter' : 'rejeter'}</strong> le profil de :
                        </p>
                        <div className="rounded-lg bg-gray-50 p-3">
                            <p className="font-medium text-gray-900">
                                {salarie.prenom} {salarie.nom}
                            </p>
                            <p className="text-sm text-gray-600">{salarie.email}</p>
                            {salarie.poste && <p className="text-sm text-gray-600">{salarie.poste}</p>}
                        </div>

                        {action === 'accept' && (
                            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
                                <p className="text-sm text-green-800">
                                    ✓ Le profil sera marqué comme accepté
                                    <br />✓ Le salarié pourra accéder au système
                                </p>
                            </div>
                        )}

                        {action === 'reject' && (
                            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                                <p className="text-sm text-red-800">
                                    ✗ Le profil sera marqué comme rejeté
                                    <br />✗ Le salarié ne pourra pas accéder au système
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <Button variant="outline" onClick={() => setShowConfirmDialog({ show: false, salarie: null, action: 'accept' })}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleDecision}
                            className={action === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                            disabled={loading === salarie.id}
                        >
                            {loading === salarie.id ? 'Traitement...' : action === 'accept' ? 'Accepter' : 'Rejeter'}
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    const ProfileModal = ({ profile, onClose }: { profile: Salarie; onClose: () => void }) => (
        <div className="bg-opacity-50 fixed inset-0 z-40 flex items-center justify-center bg-black p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white">
                <div className="p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">Détails du Profil</h2>
                        <button onClick={onClose} className="text-gray-400 transition-colors hover:text-gray-600">
                            <XCircle className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-500">Nom complet</label>
                                <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-900">
                                        {profile.prenom} {profile.nom}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-500">Email</label>
                                <div className="flex items-center space-x-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-900">{profile.email}</span>
                                </div>
                            </div>
                        </div>

                        {profile.telephone && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-500">Téléphone</label>
                                <div className="flex items-center space-x-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-900">{profile.telephone}</span>
                                </div>
                            </div>
                        )}

                        {profile.adresse && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-500">Adresse</label>
                                <div className="flex items-center space-x-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-900">{profile.adresse}</span>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            {profile.date_naissance && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Date de naissance</label>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-900">{formatDate(profile.date_naissance)}</span>
                                    </div>
                                </div>
                            )}

                            {profile.poste && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Poste</label>
                                    <div className="flex items-center space-x-2">
                                        <Building className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-900">{profile.poste}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {profile.departement && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-500">Département</label>
                                <span className="text-gray-900">{profile.departement}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">Date de demande</label>
                            <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-900">{formatDate(profile.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-3 border-t pt-6">
                        <Button
                            onClick={() => {
                                onClose();
                                showConfirmation(profile, 'reject');
                            }}
                            variant="outline"
                            className="flex items-center space-x-2 border-red-200 text-red-600 hover:bg-red-50"
                            disabled={loading === profile.id}
                        >
                            <XCircle className="h-4 w-4" />
                            <span>Rejeter</span>
                        </Button>
                        <Button
                            onClick={() => {
                                onClose();
                                showConfirmation(profile, 'accept');
                            }}
                            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                            disabled={loading === profile.id}
                        >
                            <CheckCircle className="h-4 w-4" />
                            <span>Accepter</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                {/* Alertes en haut de la page */}
                {alerts.length > 0 && (
                    <div className="fixed top-6 right-6 z-50 w-96 space-y-3">
                        {alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`rounded-lg border-l-4 p-4 shadow-lg transition-all duration-300 ${
                                    alert.type === 'success'
                                        ? 'border border-green-200 border-green-500 bg-green-50'
                                        : alert.type === 'error'
                                          ? 'border border-red-200 border-red-500 bg-red-50'
                                          : 'border border-blue-200 border-blue-500 bg-blue-50'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3">
                                        <div className="mt-0.5 flex-shrink-0">
                                            {alert.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                                            {alert.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
                                            {alert.type === 'info' && <AlertTriangle className="h-5 w-5 text-blue-600" />}
                                        </div>
                                        <div className="flex-1">
                                            <p
                                                className={`text-sm font-medium ${
                                                    alert.type === 'success'
                                                        ? 'text-green-800'
                                                        : alert.type === 'error'
                                                          ? 'text-red-800'
                                                          : 'text-blue-800'
                                                }`}
                                            >
                                                {alert.type === 'success' ? 'Succès' : alert.type === 'error' ? 'Erreur' : 'Information'}
                                            </p>
                                            <p
                                                className={`mt-1 text-sm ${
                                                    alert.type === 'success'
                                                        ? 'text-green-700'
                                                        : alert.type === 'error'
                                                          ? 'text-red-700'
                                                          : 'text-blue-700'
                                                }`}
                                            >
                                                {alert.message}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeAlert(alert.id)}
                                        className={`ml-4 flex-shrink-0 rounded-full p-1 transition-colors ${
                                            alert.type === 'success'
                                                ? 'text-green-400 hover:bg-green-100 hover:text-green-600'
                                                : alert.type === 'error'
                                                  ? 'text-red-400 hover:bg-red-100 hover:text-red-600'
                                                  : 'text-blue-400 hover:bg-blue-100 hover:text-blue-600'
                                        }`}
                                    >
                                        <XCircle className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mx-auto max-w-7xl">
                    {/* En-tête */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="mb-2 text-3xl font-bold text-gray-900">Validation des Profils</h1>
                                <p className="text-gray-600">Gérez les demandes d'inscription des nouveaux salariés</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Badge variant="secondary" className="flex items-center space-x-2">
                                    <Users className="h-4 w-4" />
                                    <span>{salaries.length} en attente</span>
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Liste des profils */}
                    {salaries.length === 0 ? (
                        <Card className="py-12 text-center">
                            <CardContent>
                                <Users className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                                <h3 className="mb-2 text-lg font-medium text-gray-900">Aucun profil en attente</h3>
                                <p className="text-gray-500">Il n'y a actuellement aucun profil nécessitant votre validation.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {salaries.map((salarie) => (
                                <Card key={salarie.id} className="border border-gray-200 bg-white transition-shadow duration-200 hover:shadow-lg">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-lg font-bold text-white">
                                                    {salarie.prenom.charAt(0)}
                                                    {salarie.nom.charAt(0)}
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl text-gray-900">
                                                        {salarie.prenom} {salarie.nom}
                                                    </CardTitle>
                                                    <CardDescription className="mt-1 flex items-center space-x-2">
                                                        <Mail className="h-4 w-4" />
                                                        <span>{salarie.email}</span>
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700">
                                                <Clock className="mr-1 h-3 w-3" />
                                                En attente
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="mb-6 grid gap-4 md:grid-cols-3">
                                            {salarie.poste && (
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Building className="h-4 w-4" />
                                                    <span>{salarie.poste}</span>
                                                </div>
                                            )}
                                            {salarie.departement && (
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Users className="h-4 w-4" />
                                                    <span>{salarie.departement}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4" />
                                                <span>Demandé le {formatDate(salarie.created_at)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Button
                                                variant="outline"
                                                onClick={() => setSelectedProfile(salarie)}
                                                className="flex items-center space-x-2"
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span>Voir détails</span>
                                            </Button>

                                            <div className="flex space-x-3">
                                                <Button
                                                    onClick={() => showConfirmation(salarie, 'reject')}
                                                    variant="outline"
                                                    className="flex items-center space-x-2 border-red-200 text-red-600 hover:bg-red-50"
                                                    disabled={loading === salarie.id}
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    <span>Rejeter</span>
                                                </Button>
                                                <Button
                                                    onClick={() => showConfirmation(salarie, 'accept')}
                                                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                                                    disabled={loading === salarie.id}
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span>Accepter</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de détails */}
            {selectedProfile && <ProfileModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />}

            {/* Dialog de confirmation */}
            {showConfirmDialog.show && <ConfirmDialog />}
        </AppLayout>
    );
}
