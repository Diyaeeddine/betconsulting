import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { HardHat, AlertTriangle, CheckCircle, Clock, MapPin, Activity, Calendar } from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Dashboard Suivi & Contrôle des Travaux',
        href: '/suivi-controle/dashboard',
    },
];

export default function SuiviControle() {
    const kpiData = [
        { title: 'Chantiers Actifs', value: '15', change: '+2', icon: HardHat, color: 'text-blue-600' },
        { title: 'Taux de Conformité', value: '96%', change: '+1%', icon: CheckCircle, color: 'text-green-600' },
        { title: 'Incidents Ouverts', value: '3', change: '-2', icon: AlertTriangle, color: 'text-red-600' },
        { title: 'Retard Moyen', value: '2.1j', change: '-0.5j', icon: Clock, color: 'text-orange-600' },
    ];

    const siteStatus = [
        { name: 'En Cours', value: 12, color: '#3b82f6' },
        { name: 'En Pause', value: 2, color: '#f59e0b' },
        { name: 'Terminés', value: 8, color: '#10b981' },
        { name: 'En Retard', value: 3, color: '#ef4444' },
    ];

    const weeklyProgress = [
        { week: 'S22', planned: 85, actual: 82, quality: 95 },
        { week: 'S23', planned: 88, actual: 90, quality: 93 },
        { week: 'S24', planned: 92, actual: 89, quality: 97 },
        { week: 'S25', planned: 90, actual: 88, quality: 94 },
        { week: 'S26', planned: 95, actual: 93, quality: 96 },
    ];

    const activeSites = [
        { name: 'Résidence Horizon', progress: 75, phase: 'Gros Œuvre', risk: 'Faible', deadline: '2024-09-15' },
        { name: 'Centre Logistique Sud', progress: 45, phase: 'Fondations', risk: 'Moyen', deadline: '2024-11-30' },
        { name: 'Bureaux Tech Park', progress: 90, phase: 'Finitions', risk: 'Faible', deadline: '2024-07-20' },
        { name: 'Usine Agroalimentaire', progress: 60, phase: 'Structure', risk: 'Élevé', deadline: '2024-10-10' },
    ];

    const qualityMetrics = [
        { metric: 'Conformité Béton', value: 98, target: 95, status: 'good' },
        { metric: 'Respect Planning', value: 87, target: 90, status: 'warning' },
        { metric: 'Sécurité Chantier', value: 100, target: 100, status: 'good' },
        { metric: 'Qualité Finitions', value: 92, target: 90, status: 'good' },
    ];

    const incidentTypes = [
        { type: 'Sécurité', count: 1, severity: 'Mineure' },
        { type: 'Qualité', count: 2, severity: 'Majeure' },
        { type: 'Planning', count: 0, severity: '-' },
        { type: 'Matériaux', count: 1, severity: 'Mineure' },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Suivi & Contrôle des Travaux" />
            <div className="min-h-screen space-y-6 bg-gray-50 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Suivi & Contrôle des Travaux</h1>
                        <p className="text-gray-600">Supervision des chantiers et contrôle qualité</p>
                    </div>
                    <Badge variant="outline" className="px-3 py-1">
                        <Activity className="mr-2 h-4 w-4" />
                        Temps Réel
                    </Badge>
                </div>

                {/* KPIs principaux */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {kpiData.map((kpi, index) => (
                        <Card key={index} className="transition-shadow hover:shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">{kpi.title}</CardTitle>
                                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{kpi.value}</div>
                                <p className={`text-xs ${kpi.color}`}>{kpi.change} vs semaine dernière</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Statut des Chantiers */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Statut des Chantiers</CardTitle>
                            <CardDescription>Répartition par état d'avancement</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={siteStatus}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {siteStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Avancement Hebdomadaire */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Avancement vs Planifié</CardTitle>
                            <CardDescription>Suivi hebdomadaire des performances</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={weeklyProgress}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="week" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`${value}%`, '']} />
                                    <Line type="monotone" dataKey="planned" stroke="#6b7280" strokeDasharray="5 5" name="Planifié" />
                                    <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={3} name="Réalisé" />
                                    <Line type="monotone" dataKey="quality" stroke="#059669" name="Qualité" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Chantiers Actifs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Chantiers en Cours</CardTitle>
                        <CardDescription>Suivi détaillé des projets actifs</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {activeSites.map((site, index) => (
                                <div key={index} className="rounded-lg border bg-white p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <MapPin className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <h3 className="font-semibold">{site.name}</h3>
                                                <p className="text-sm text-gray-600">Phase: {site.phase}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant={site.risk === 'Faible' ? 'secondary' : site.risk === 'Moyen' ? 'default' : 'destructive'}>
                                                Risque {site.risk}
                                            </Badge>
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">{site.deadline}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Progress value={site.progress} className="flex-1" />
                                        <span className="text-sm font-medium">{site.progress}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Métriques Qualité */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Indicateurs Qualité</CardTitle>
                            <CardDescription>Performance vs objectifs</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {qualityMetrics.map((metric, index) => (
                                    <div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                        <div>
                                            <h3 className="font-medium">{metric.metric}</h3>
                                            <p className="text-sm text-gray-600">Objectif: {metric.target}%</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold">{metric.value}%</div>
                                            <CheckCircle className={`h-4 w-4 ${metric.status === 'good' ? 'text-green-600' : 'text-orange-600'}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Incidents */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Suivi des Incidents</CardTitle>
                            <CardDescription>Classification par type et sévérité</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {incidentTypes.map((incident, index) => (
                                    <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="flex items-center space-x-3">
                                            <AlertTriangle className={`h-5 w-5 ${incident.count > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                                            <div>
                                                <h3 className="font-medium">{incident.type}</h3>
                                                <p className="text-sm text-gray-600">{incident.count} incident(s)</p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={
                                                incident.severity === 'Majeure'
                                                    ? 'destructive'
                                                    : incident.severity === 'Mineure'
                                                      ? 'default'
                                                      : 'secondary'
                                            }
                                        >
                                            {incident.severity}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
