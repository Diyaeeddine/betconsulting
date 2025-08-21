// resources/js/pages/dashboards/EtudesTechniques.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    BarChart3,
    Calculator,
    Calendar,
    CheckCircle,
    Clock,
    Download,
    Eye,
    FileText,
    Plus,
    Search,
    Settings,
    Shield,
    Target,
    TrendingDown,
    TrendingUp,
    Users,
    XCircle,
    Zap,
} from 'lucide-react';
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const breadcrumbs = [
    {
        title: 'Dashboard Qualité & Audit Technique',
        href: '/etudes-techniques/dashboard',
    },
];

// Données fictives pour le dashboard Qualité & Audit
const qualityKpis = [
    {
        title: 'Taux de Conformité',
        value: '94.2%',
        change: '+2.1%',
        trend: 'up',
        icon: Shield,
        description: 'vs mois précédent',
        target: '95%',
    },
    {
        title: 'Audits Réalisés',
        value: '47',
        change: '+8',
        trend: 'up',
        icon: Search,
        description: 'ce mois-ci',
        target: '50',
    },
    {
        title: 'Non-Conformités',
        value: '12',
        change: '-3',
        trend: 'up',
        icon: AlertTriangle,
        description: 'en cours',
        target: '< 15',
    },
    {
        title: 'Actions Correctives',
        value: '89%',
        change: '+5.2%',
        trend: 'up',
        icon: CheckCircle,
        description: 'taux de résolution',
        target: '90%',
    },
];

const qualityTrends = [
    { month: 'Jan', conformite: 92, defauts: 18, audits: 42 },
    { month: 'Fév', conformite: 91, defauts: 22, audits: 38 },
    { month: 'Mar', conformite: 93, defauts: 15, audits: 45 },
    { month: 'Avr', conformite: 94, defauts: 14, audits: 48 },
    { month: 'Mai', conformite: 94.2, defauts: 12, audits: 47 },
    { month: 'Jun', conformite: 95, defauts: 10, audits: 52 },
];

const auditTypes = [
    { name: 'Audit Interne', value: 35, color: '#0088FE' },
    { name: 'Audit Externe', value: 25, color: '#00C49F' },
    { name: 'Audit Processus', value: 20, color: '#FFBB28' },
    { name: 'Audit Produit', value: 15, color: '#FF8042' },
    { name: 'Audit Système', value: 5, color: '#8884D8' },
];

const currentAudits = [
    {
        id: 'AUD-2024-001',
        title: 'Audit ISO 9001 - Production',
        type: 'Interne',
        status: 'En cours',
        progress: 75,
        auditor: 'Sophie Martin',
        startDate: '2024-01-15',
        endDate: '2024-01-30',
        priority: 'Haute',
    },
    {
        id: 'AUD-2024-002',
        title: 'Audit Sécurité IT',
        type: 'Externe',
        status: 'Planifié',
        progress: 0,
        auditor: 'Jean Dupont',
        startDate: '2024-02-01',
        endDate: '2024-02-15',
        priority: 'Moyenne',
    },
    {
        id: 'AUD-2024-003',
        title: 'Audit Processus RH',
        type: 'Interne',
        status: 'Terminé',
        progress: 100,
        auditor: 'Marie Dubois',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        priority: 'Basse',
    },
    {
        id: 'AUD-2024-004',
        title: 'Audit Qualité Fournisseurs',
        type: 'Externe',
        status: 'En cours',
        progress: 45,
        auditor: 'Pierre Laurent',
        startDate: '2024-01-20',
        endDate: '2024-02-05',
        priority: 'Haute',
    },
];

const nonConformities = [
    {
        id: 'NC-2024-001',
        title: 'Non-respect procédure de test',
        severity: 'Majeure',
        department: 'Production',
        status: 'Ouverte',
        assignee: 'Thomas Moreau',
        dueDate: '2024-02-15',
        createdDate: '2024-01-10',
    },
    {
        id: 'NC-2024-002',
        title: 'Documentation obsolète',
        severity: 'Mineure',
        department: 'Qualité',
        status: 'En cours',
        assignee: 'Lisa Bernard',
        dueDate: '2024-02-10',
        createdDate: '2024-01-08',
    },
    {
        id: 'NC-2024-003',
        title: 'Calibrage équipement en retard',
        severity: 'Critique',
        department: 'Maintenance',
        status: 'Fermée',
        assignee: 'Marc Petit',
        dueDate: '2024-01-25',
        createdDate: '2024-01-05',
    },
];

const qualityAlerts = [
    {
        type: 'critical',
        title: 'Équipement de mesure non calibré',
        description: '3 équipements nécessitent un calibrage urgent',
        time: 'Il y a 1h',
        department: 'Laboratoire',
    },
    {
        type: 'warning',
        title: 'Retard dans audit externe',
        description: "L'audit ISO 14001 a été reporté de 2 semaines",
        time: 'Il y a 3h',
        department: 'Qualité',
    },
    {
        type: 'info',
        title: 'Formation qualité programmée',
        description: 'Session de formation ISO 9001 prévue demain',
        time: 'Il y a 5h',
        department: 'RH',
    },
    {
        type: 'success',
        title: 'Certification obtenue',
        description: 'Certification ISO 45001 renouvelée avec succès',
        time: 'Il y a 1 jour',
        department: 'HSE',
    },
];

export default function EtudesTechniques() {
    const kpiData = [
        { title: 'Études en Cours', value: '28', change: '+4', icon: FileText, color: 'text-blue-600' },
        { title: 'Taux de Validation', value: '94%', change: '+2%', icon: CheckCircle, color: 'text-green-600' },
        { title: 'Délai Moyen', value: '18j', change: '-3j', icon: Clock, color: 'text-purple-600' },
        { title: 'Charge Équipe', value: '87%', change: '+5%', icon: Users, color: 'text-orange-600' },
    ];

    const projectsStatus = [
        { name: 'En Attente', value: 5, color: '#fbbf24' },
        { name: 'En Cours', value: 18, color: '#3b82f6' },
        { name: 'En Révision', value: 8, color: '#f59e0b' },
        { name: 'Validées', value: 12, color: '#10b981' },
        { name: 'Livrées', value: 7, color: '#6b7280' },
    ];

    const workloadData = [
        { week: 'S22', structural: 85, hydraulic: 70, electrical: 90, geotechnical: 60 },
        { week: 'S23', structural: 90, hydraulic: 75, electrical: 85, geotechnical: 65 },
        { week: 'S24', structural: 88, hydraulic: 80, electrical: 92, geotechnical: 70 },
        { week: 'S25', structural: 92, hydraulic: 85, electrical: 88, geotechnical: 75 },
        { week: 'S26', structural: 87, hydraulic: 78, electrical: 95, geotechnical: 68 },
    ];

    const studyTypes = [
        { type: 'Structure Béton', count: 12, avgDuration: 15, complexity: 'Élevée' },
        { type: 'VRD', count: 8, avgDuration: 12, complexity: 'Moyenne' },
        { name: 'Électricité', count: 6, avgDuration: 8, complexity: 'Faible' },
        { type: 'Géotechnique', count: 4, avgDuration: 20, complexity: 'Élevée' },
    ];

    const urgentProjects = [
        { name: 'Résidence Les Jardins', deadline: '2024-07-15', progress: 75, priority: 'Haute' },
        { name: 'Centre Commercial Nord', deadline: '2024-07-20', progress: 60, priority: 'Moyenne' },
        { name: 'Usine Pharmaceutique', deadline: '2024-07-25', progress: 85, priority: 'Haute' },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen space-y-6 bg-gray-50 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Études Techniques</h1>
                        <p className="text-gray-600">Suivi des études et charge de travail</p>
                    </div>
                    <Badge variant="outline" className="px-3 py-1">
                        <Zap className="mr-2 h-4 w-4" />
                        Bureau d'Études
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
                                <p className={`text-xs ${kpi.color}`}>{kpi.change} vs période précédente</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Statut des Projets */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Statut des Études</CardTitle>
                            <CardDescription>Répartition par état d'avancement</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={projectsStatus}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {projectsStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Charge de Travail par Spécialité */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Charge de Travail par Spécialité</CardTitle>
                            <CardDescription>Pourcentage d'occupation par semaine</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={workloadData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="week" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`${value}%`, '']} />
                                    <Line type="monotone" dataKey="structural" stroke="#2563eb" name="Structure" />
                                    <Line type="monotone" dataKey="hydraulic" stroke="#059669" name="Hydraulique" />
                                    <Line type="monotone" dataKey="electrical" stroke="#dc2626" name="Électricité" />
                                    <Line type="monotone" dataKey="geotechnical" stroke="#7c3aed" name="Géotechnique" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Types d'Études */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Types d'Études en Cours</CardTitle>
                            <CardDescription>Répartition par spécialité technique</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {studyTypes.map((study, index) => (
                                    <div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                        <div className="flex items-center space-x-3">
                                            <Calculator className="h-6 w-6 text-blue-600" />
                                            <div>
                                                <h3 className="font-semibold">{study.type}</h3>
                                                <p className="text-sm text-gray-600">{study.count} études actives</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge
                                                variant={
                                                    study.complexity === 'Élevée'
                                                        ? 'destructive'
                                                        : study.complexity === 'Moyenne'
                                                          ? 'default'
                                                          : 'secondary'
                                                }
                                            >
                                                {study.complexity}
                                            </Badge>
                                            <p className="mt-1 text-sm text-gray-600">{study.avgDuration}j moyen</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Projets Urgents */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Projets Prioritaires</CardTitle>
                            <CardDescription>Études nécessitant une attention particulière</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {urgentProjects.map((project, index) => (
                                    <div key={index} className="rounded-lg border p-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <h3 className="font-semibold">{project.name}</h3>
                                            <Badge variant={project.priority === 'Haute' ? 'destructive' : 'default'}>{project.priority}</Badge>
                                        </div>
                                        <div className="mb-2 flex items-center space-x-2 text-sm text-gray-600">
                                            <Calendar className="h-4 w-4" />
                                            <span>Échéance: {project.deadline}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Progress value={project.progress} className="flex-1" />
                                            <span className="text-sm font-medium">{project.progress}%</span>
                                        </div>
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
