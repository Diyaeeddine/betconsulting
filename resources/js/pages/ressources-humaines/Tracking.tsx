import { Head } from '@inertiajs/react';
import { Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface Props {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
}

export default function Tracking({ auth }: Props) {
    return (
        <>
            <Head title="Direction Générale - Tracking" />

            <div className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Suivi des Activités</h1>
                        <p className="mt-2 text-gray-600">Monitoring en temps réel des opérations</p>
                    </div>

                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center">
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <Activity className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Activités en cours</p>
                                    <p className="text-2xl font-bold text-gray-900">18</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center">
                                <div className="rounded-lg bg-green-100 p-2">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Terminées</p>
                                    <p className="text-2xl font-bold text-gray-900">42</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center">
                                <div className="rounded-lg bg-yellow-100 p-2">
                                    <Clock className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">En attente</p>
                                    <p className="text-2xl font-bold text-gray-900">7</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center">
                                <div className="rounded-lg bg-red-100 p-2">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Urgentes</p>
                                    <p className="text-2xl font-bold text-gray-900">3</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">Activités Récentes</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {[
                                    { id: 1, title: 'Révision budget Q2', status: 'En cours', priority: 'Haute', time: '2h' },
                                    { id: 2, title: 'Analyse performance équipes', status: 'Terminé', priority: 'Moyenne', time: '4h' },
                                    {
                                        id: 3,
                                        title: 'Préparation conseil administration',
                                        status: 'En cours',
                                        priority: 'Haute',
                                        time: '1h',
                                    },
                                    {
                                        id: 4,
                                        title: 'Validation stratégie marketing',
                                        status: 'En attente',
                                        priority: 'Basse',
                                        time: '30min',
                                    },
                                ].map((activity) => (
                                    <div key={activity.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                                        <div className="flex items-center space-x-4">
                                            <div
                                                className={`h-3 w-3 rounded-full ${
                                                    activity.status === 'En cours'
                                                        ? 'bg-blue-500'
                                                        : activity.status === 'Terminé'
                                                          ? 'bg-green-500'
                                                          : 'bg-yellow-500'
                                                }`}
                                            ></div>
                                            <div>
                                                <p className="font-medium text-gray-900">{activity.title}</p>
                                                <p className="text-sm text-gray-600">Priorité: {activity.priority}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">{activity.status}</p>
                                            <p className="text-sm text-gray-600">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
