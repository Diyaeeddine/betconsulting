import AppLayout from '@/layouts/app-layout';
import { router, useForm, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { FileText, Calendar, Users, FileCheck, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard() {
    const breadcrumbs = [
        {
            title: 'Accueil',
            href: '/',
        },
        {
            title: 'Tableau de Bord',
            href: '/dashboard/fournisseurs-traitants',
        },
    ];

    const stats = [
        {
            title: 'Méthodologie & Planning',
            value: '75%',
            icon: FileText,
            status: 'En cours',
            color: 'bg-blue-500',
        },
        {
            title: 'Attestations de Références',
            value: '3/5',
            icon: FileCheck,
            status: 'En attente',
            color: 'bg-yellow-500',
        },
        {
            title: 'Équipe Projet',
            value: '8/10',
            icon: Users,
            status: 'En cours',
            color: 'bg-blue-500',
        },
        {
            title: 'Conventions Sous-traitants',
            value: '2/4',
            icon: FileText,
            status: 'En attente',
            color: 'bg-yellow-500',
        },
    ];

    const recentActivities = [
        {
            title: 'Document de méthodologie téléchargé',
            date: '2024-03-15',
            status: 'completed',
        },
        {
            title: 'Attestation de référence ajoutée',
            date: '2024-03-14',
            status: 'completed',
        },
        {
            title: 'Membre d\'équipe ajouté',
            date: '2024-03-13',
            status: 'completed',
        },
        {
            title: 'En attente: Convention laboratoire',
            date: '2024-03-12',
            status: 'pending',
        },
    ];

    const pendingTasks = [
        {
            title: 'Compléter le planning d\'exécution',
            priority: 'high',
            dueDate: '2024-03-20',
        },
        {
            title: 'Ajouter 2 attestations de références',
            priority: 'high',
            dueDate: '2024-03-22',
        },
        {
            title: 'Télécharger l\'organigramme',
            priority: 'medium',
            dueDate: '2024-03-25',
        },
        {
            title: 'Convention avec topographe',
            priority: 'medium',
            dueDate: '2024-03-28',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Fournisseurs & Sous-traitants" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Tableau de Bord - Fournisseurs & Sous-traitants
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Gérez votre offre technique, méthodologie et documentation projet
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`${stat.color} p-3 rounded-lg`}>
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <span
                                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                                            stat.status === 'Complété'
                                                ? 'bg-green-100 text-green-800'
                                                : stat.status === 'En cours'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                    >
                                        {stat.status}
                                    </span>
                                </div>
                                <h3 className="text-sm font-medium text-gray-600 mb-1">
                                    {stat.title}
                                </h3>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Pending Tasks */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Tâches en Attente
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {pendingTasks.map((task, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-start space-x-3">
                                                <AlertCircle
                                                    className={`w-5 h-5 mt-0.5 ${
                                                        task.priority === 'high'
                                                            ? 'text-red-500'
                                                            : 'text-yellow-500'
                                                    }`}
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {task.title}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Échéance: {task.dueDate}
                                                    </p>
                                                </div>
                                            </div>
                                            <span
                                                className={`text-xs font-medium px-2 py-1 rounded ${
                                                    task.priority === 'high'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                            >
                                                {task.priority === 'high' ? 'Urgent' : 'Moyen'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activities */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Activités Récentes
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {recentActivities.map((activity, index) => (
                                        <div key={index} className="flex items-start space-x-3">
                                            {activity.status === 'completed' ? (
                                                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                                            ) : (
                                                <Clock className="w-5 h-5 text-yellow-500 mt-0.5" />
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {activity.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {activity.date}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8 bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Actions Rapides
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <button
                                onClick={() => router.visit('/fournisseurs-traitants/methodologie-planning')}
                                className="flex items-center justify-center space-x-2 p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                <FileText className="w-5 h-5" />
                                <span className="font-medium">Méthodologie</span>
                            </button>
                            <button
                                onClick={() => router.visit('/fournisseurs-traitants/references')}
                                className="flex items-center justify-center space-x-2 p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                            >
                                <FileCheck className="w-5 h-5" />
                                <span className="font-medium">Références</span>
                            </button>
                            <button
                                onClick={() => router.visit('/fournisseurs-traitants/team-table')}
                                className="flex items-center justify-center space-x-2 p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                            >
                                <Users className="w-5 h-5" />
                                <span className="font-medium">Équipe</span>
                            </button>
                            <button
                                onClick={() => router.visit('/fournisseurs-traitants/subcontractor-agreements')}
                                className="flex items-center justify-center space-x-2 p-4 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                            >
                                <FileText className="w-5 h-5" />
                                <span className="font-medium">Sous-traitants</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}