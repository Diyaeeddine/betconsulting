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
    CheckCircle,
    Clock,
    Download,
    Eye,
    Plus,
    Search,
    Settings,
    Shield,
    Target,
    TrendingDown,
    TrendingUp,
    XCircle,
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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Qualité & Audit Technique" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard Qualité & Audit Technique</h1>
                        <p className="text-muted-foreground">Suivi des indicateurs qualité et gestion des audits</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Rapport Qualité
                        </Button>
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Nouvel Audit
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {qualityKpis.map((kpi, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                                <kpi.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{kpi.value}</div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center">
                                        {kpi.trend === 'up' ? (
                                            <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                                        ) : (
                                            <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                                        )}
                                        <span className={kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}>{kpi.change}</span>
                                        <span className="ml-1">{kpi.description}</span>
                                    </div>
                                    <span className="rounded bg-muted px-2 py-1 text-xs">Cible: {kpi.target}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Tendances Qualité</CardTitle>
                            <CardDescription>Évolution des indicateurs qualité sur 6 mois</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={qualityTrends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="conformite" stroke="#22c55e" name="Conformité (%)" strokeWidth={2} />
                                    <Line type="monotone" dataKey="defauts" stroke="#ef4444" name="Défauts" strokeWidth={2} />
                                    <Line type="monotone" dataKey="audits" stroke="#3b82f6" name="Audits" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Types d'Audits</CardTitle>
                            <CardDescription>Répartition des audits par type</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={auditTypes}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {auditTypes.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs Section */}
                <Tabs defaultValue="audits" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="audits">Audits</TabsTrigger>
                        <TabsTrigger value="nonconformities">Non-Conformités</TabsTrigger>
                        <TabsTrigger value="alerts">Alertes Qualité</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                    </TabsList>

                    <TabsContent value="audits" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Audits en Cours</CardTitle>
                                <CardDescription>Suivi des audits planifiés et en cours d'exécution</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Audit</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead>Progression</TableHead>
                                            <TableHead>Auditeur</TableHead>
                                            <TableHead>Échéance</TableHead>
                                            <TableHead>Priorité</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentAudits.map((audit, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-mono text-sm">{audit.id}</TableCell>
                                                <TableCell className="font-medium">{audit.title}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{audit.type}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            audit.status === 'Terminé'
                                                                ? 'default'
                                                                : audit.status === 'En cours'
                                                                  ? 'secondary'
                                                                  : 'outline'
                                                        }
                                                    >
                                                        {audit.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Progress value={audit.progress} className="w-[60px]" />
                                                        <span className="text-sm text-muted-foreground">{audit.progress}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{audit.auditor}</TableCell>
                                                <TableCell>{audit.endDate}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            audit.priority === 'Haute'
                                                                ? 'destructive'
                                                                : audit.priority === 'Moyenne'
                                                                  ? 'secondary'
                                                                  : 'outline'
                                                        }
                                                    >
                                                        {audit.priority}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="nonconformities" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Non-Conformités</CardTitle>
                                <CardDescription>Gestion des non-conformités et actions correctives</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Sévérité</TableHead>
                                            <TableHead>Département</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead>Assigné à</TableHead>
                                            <TableHead>Échéance</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {nonConformities.map((nc, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-mono text-sm">{nc.id}</TableCell>
                                                <TableCell className="font-medium">{nc.title}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            nc.severity === 'Critique'
                                                                ? 'destructive'
                                                                : nc.severity === 'Majeure'
                                                                  ? 'secondary'
                                                                  : 'outline'
                                                        }
                                                    >
                                                        {nc.severity}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{nc.department}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            nc.status === 'Fermée'
                                                                ? 'default'
                                                                : nc.status === 'En cours'
                                                                  ? 'secondary'
                                                                  : 'destructive'
                                                        }
                                                    >
                                                        {nc.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{nc.assignee}</TableCell>
                                                <TableCell>{nc.dueDate}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm">
                                                        <Settings className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="alerts" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Alertes Qualité</CardTitle>
                                <CardDescription>Notifications importantes concernant la qualité</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {qualityAlerts.map((alert, index) => (
                                    <div key={index} className="flex items-start space-x-4 rounded-lg border p-4">
                                        {alert.type === 'critical' && <XCircle className="mt-0.5 h-5 w-5 text-red-500" />}
                                        {alert.type === 'warning' && <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-500" />}
                                        {alert.type === 'success' && <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />}
                                        {alert.type === 'info' && <Clock className="mt-0.5 h-5 w-5 text-blue-500" />}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">{alert.title}</h4>
                                                <Badge variant="outline" className="text-xs">
                                                    {alert.department}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{alert.description}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">{alert.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Objectifs Qualité</CardTitle>
                                    <CardDescription>Progression vers les objectifs qualité 2024</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Taux de Conformité</span>
                                            <span className="text-sm text-muted-foreground">94.2% / 95%</span>
                                        </div>
                                        <Progress value={94.2} />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Audits Planifiés</span>
                                            <span className="text-sm text-muted-foreground">47 / 60</span>
                                        </div>
                                        <Progress value={78.3} />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Actions Correctives</span>
                                            <span className="text-sm text-muted-foreground">89% / 90%</span>
                                        </div>
                                        <Progress value={89} />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Satisfaction Client</span>
                                            <span className="text-sm text-muted-foreground">4.2 / 4.5</span>
                                        </div>
                                        <Progress value={93.3} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Indicateurs Clés</CardTitle>
                                    <CardDescription>Métriques importantes du mois</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between rounded border p-3">
                                        <div>
                                            <p className="text-sm font-medium">Temps moyen audit</p>
                                            <p className="text-2xl font-bold text-blue-600">12.5j</p>
                                        </div>
                                        <BarChart3 className="h-8 w-8 text-blue-500" />
                                    </div>
                                    <div className="flex items-center justify-between rounded border p-3">
                                        <div>
                                            <p className="text-sm font-medium">Coût qualité</p>
                                            <p className="text-2xl font-bold text-orange-600">2.1%</p>
                                        </div>
                                        <Target className="h-8 w-8 text-orange-500" />
                                    </div>
                                    <div className="flex items-center justify-between rounded border p-3">
                                        <div>
                                            <p className="text-sm font-medium">Réclamations clients</p>
                                            <p className="text-2xl font-bold text-green-600">-15%</p>
                                        </div>
                                        <TrendingDown className="h-8 w-8 text-green-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
