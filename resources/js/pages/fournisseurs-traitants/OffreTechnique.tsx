import AppLayout from '@/layouts/app-layout';
import { router, useForm, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { FileText, Calendar, Users, FileCheck, Building2, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function OffreTechniqueOverview() {
    const [activeTab, setActiveTab] = useState('methodologie');

    const breadcrumbs = [
        {
            title: 'Accueil',
            href: '/',
        },
        {
            title: 'Offre Technique',
            href: '/fournisseurs-traitants/offre-technique',
        },
    ];

    const tabs = [
        {
            id: 'methodologie',
            name: 'Méthodologie & Planning',
            icon: FileText,
            description: 'Documents méthodologiques, planning et organigramme',
            route: '/fournisseurs-traitants/methodologie-planning',
        },
        {
            id: 'references',
            name: 'Attestations de Références',
            icon: FileCheck,
            description: 'Preuves de projets antérieurs',
            route: '/fournisseurs-traitants/references',
        },
        {
            id: 'equipe',
            name: 'Équipe Projet',
            icon: Users,
            description: 'Composition et structure de l\'équipe',
            route: '/fournisseurs-traitants/team-table',
        },
        {
            id: 'soustraitants',
            name: 'Conventions Sous-traitants',
            icon: Building2,
            description: 'Accords avec les sous-traitants spécialisés',
            route: '/fournisseurs-traitants/subcontractor-agreements',
        },
    ];

    const sections = [
        {
            title: 'Méthodologie & Organisation',
            items: [
                { name: 'Document de méthodologie', status: 'completed', date: '2024-03-15' },
                { name: 'Planning d\'exécution', status: 'pending', date: null },
                { name: 'Chronogramme', status: 'pending', date: null },
                { name: 'Organigramme', status: 'in-progress', date: '2024-03-14' },
            ],
        },
        {
            title: 'Attestations & Références',
            items: [
                { name: 'Référence projet 1', status: 'completed', date: '2024-03-14' },
                { name: 'Référence projet 2', status: 'completed', date: '2024-03-13' },
                { name: 'Référence projet 3', status: 'completed', date: '2024-03-12' },
                { name: 'Référence projet 4', status: 'pending', date: null },
                { name: 'Référence projet 5', status: 'pending', date: null },
            ],
        },
        {
            title: 'Équipe Projet',
            items: [
                { name: 'Chef de projet', status: 'completed', date: '2024-03-11' },
                { name: 'Ingénieur principal', status: 'completed', date: '2024-03-11' },
                { name: 'Conducteur de travaux', status: 'completed', date: '2024-03-10' },
                { name: 'Techniciens (x5)', status: 'in-progress', date: '2024-03-09' },
                { name: 'Personnel support (x2)', status: 'pending', date: null },
            ],
        },
        {
            title: 'Conventions Sous-traitants',
            items: [
                { name: 'Convention topographe', status: 'completed', date: '2024-03-08' },
                { name: 'Convention laboratoire', status: 'completed', date: '2024-03-07' },
                { name: 'Convention expert géotechnique', status: 'pending', date: null },
                { name: 'Convention bureau d\'études', status: 'pending', date: null },
            ],
        },
    ];

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'in-progress':
                return <Clock className="w-5 h-5 text-blue-500" />;
            case 'pending':
                return <XCircle className="w-5 h-5 text-gray-400" />;
            default:
                return null;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed':
                return 'Complété';
            case 'in-progress':
                return 'En cours';
            case 'pending':
                return 'En attente';
            default:
                return '';
        }
    };

    const getCompletionPercentage = (items) => {
        const completed = items.filter(item => item.status === 'completed').length;
        return Math.round((completed / items.length) * 100);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Offre Technique - Fournisseurs & Sous-traitants" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Offre Technique - Vue d'Ensemble
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Gérez tous les aspects de votre offre technique depuis cette interface centralisée
                        </p>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="bg-white rounded-lg shadow mb-8">
                        <div className="border-b border-gray-200">
                            <nav className="flex -mb-px overflow-x-auto">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                            activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <tab.icon className="w-5 h-5" />
                                        <span>{tab.name}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="p-6">
                            {tabs.map((tab) => (
                                <div
                                    key={tab.id}
                                    className={activeTab === tab.id ? 'block' : 'hidden'}
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                                {tab.name}
                                            </h2>
                                            <p className="text-gray-600">{tab.description}</p>
                                        </div>
                                        <button
                                            onClick={() => router.visit(tab.route)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Accéder à la page
                                        </button>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <p className="text-sm text-gray-600">
                                            Cliquez sur "Accéder à la page" pour gérer les documents et informations de cette section.
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Progress Overview */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Progression Globale
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {sections.map((section, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {section.title}
                                            </h3>
                                            <span className="text-sm font-medium text-blue-600">
                                                {getCompletionPercentage(section.items)}%
                                            </span>
                                        </div>
                                        
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all"
                                                style={{ width: `${getCompletionPercentage(section.items)}%` }}
                                            ></div>
                                        </div>

                                        <div className="space-y-3">
                                            {section.items.map((item, itemIndex) => (
                                                <div
                                                    key={itemIndex}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        {getStatusIcon(item.status)}
                                                        <span className="text-sm text-gray-700">
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span
                                                            className={`text-xs font-medium px-2 py-1 rounded ${
                                                                item.status === 'completed'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : item.status === 'in-progress'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                        >
                                                            {getStatusText(item.status)}
                                                        </span>
                                                        {item.date && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {item.date}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}