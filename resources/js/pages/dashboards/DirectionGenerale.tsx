import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ArrowLeft, Bell, DollarSign, MoreHorizontal, Search, Settings, Target, TrendingUp, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const breadcrumbs = [
    {
        title: 'Dashboard Admin',
        href: '/admin/dashboard',
    },
];

// Données pour les métriques principales
const mainMetrics = [
    {
        title: 'Budget Total',
        value: 'RM 2,450,000',
        percentage: '100%',
        status: 'Net',
        color: 'bg-blue-500',
    },
    {
        title: 'Coûts Engagés',
        value: 'RM 1,960,000',
        percentage: '80%',
        status: 'Net',
        color: 'bg-orange-500',
    },
    {
        title: 'Revenus Reçus',
        value: 'RM 1,470,000',
        percentage: '60%',
        status: 'Net',
        color: 'bg-green-500',
    },
    {
        title: 'Paiements Dus',
        value: 'RM 980,000',
        percentage: '40%',
        status: 'Net',
        color: 'bg-red-500',
    },
];

// Données pour le graphique de performance
const performanceData = [
    { month: 'Oct 23', revenue: 45, costs: 35, profit: 25, target: 40 },
    { month: 'Nov 23', revenue: 52, costs: 42, profit: 32, target: 45 },
    { month: 'Dec 23', revenue: 48, costs: 38, profit: 28, target: 42 },
    { month: 'Jan 24', revenue: 58, costs: 45, profit: 38, target: 50 },
    { month: 'Feb 24', revenue: 65, costs: 52, profit: 45, target: 55 },
    { month: 'Mar 24', revenue: 62, costs: 48, profit: 42, target: 52 },
    { month: 'Apr 24', revenue: 68, costs: 55, profit: 48, target: 58 },
    { month: 'May 24', revenue: 72, costs: 58, profit: 52, target: 62 },
];

// Données pour les métriques détaillées
const detailedMetrics = [
    { label: 'Projets Soumis', value: '54.5%', amount: 'RM 33.5m', color: 'bg-blue-500' },
    { label: 'Certificats Reçus', value: '54.5%', amount: 'RM 30.5m', color: 'bg-purple-500' },
    { label: 'Paiements Reçus', value: '36.4%', amount: 'RM 28.5m', color: 'bg-blue-600' },
    { label: 'Paiements Dus', value: '18.2%', amount: 'RM 5m', color: 'bg-teal-500' },
    { label: 'Matériel Livré', value: '72.7%', amount: '', color: 'bg-orange-500' },
    { label: 'Sous-traitance Certifiée', value: '49.2%', amount: '', color: 'bg-green-500' },
    { label: 'Site Transféré', value: '0.3%', amount: '', color: 'bg-gray-500' },
];

// Données pour Profit & Loss
const profitLossData = [
    { category: 'Revenus', amount: 1200000, color: '#3b82f6' },
    { category: 'Coût des Biens', amount: 850000, color: '#ef4444' },
    { category: 'Bénéfices Bruts', amount: 650000, color: '#3b82f6' },
    { category: 'Coûts Opérationnels', amount: 230000, color: '#ef4444' },
    { category: 'Bénéfice Net', amount: 420000, color: '#10b981' },
];

// Données pour Cash Flow
const cashFlowData = [
    { period: 'RM 9.7m', inflow: 4, outflow: -2, color: '#3b82f6' },
    { period: 'RM 4m', inflow: 3, outflow: -4, color: '#ef4444' },
    { period: 'RM 5.7m', inflow: 5, outflow: -1, color: '#3b82f6' },
    { period: 'RM 5m', inflow: 2, outflow: -3, color: '#ef4444' },
];

// Données pour Retention Overview
const retentionData = [
    { category: 'Réclamations Soumises', before: 43, after: 540000, color: '#3b82f6' },
    { category: 'Certificats Reçus', before: 57, after: 600000, color: '#3b82f6' },
    { category: 'Sous-traitance Certifiée', before: 43, after: 540000, color: '#3b82f6' },
];

export default function AdminDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Admin" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header avec navigation */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Projets</span>
                            <span>›</span>
                            <span>Actifs</span>
                            <span>›</span>
                            <span className="font-medium text-foreground">Projet Admin</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">Brut</Badge>
                        <Badge className="bg-orange-500 hover:bg-orange-600">Net</Badge>
                        <Button variant="ghost" size="sm">
                            <Search className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                            <Bell className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Métriques principales */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {mainMetrics.map((metric, index) => (
                        <Card key={index} className="relative overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardDescription className="text-xs text-muted-foreground">
                                        {metric.title}{' '}
                                        <Badge variant="outline" className="ml-1 text-xs">
                                            {metric.status}
                                        </Badge>
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg font-bold">
                                    {metric.value} ({metric.percentage})
                                </div>
                                <div className={`absolute bottom-0 left-0 h-1 ${metric.color}`} style={{ width: metric.percentage }} />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Tabs Navigation */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Vue d'ensemble
                        </TabsTrigger>
                        <TabsTrigger value="details">Détails Projet</TabsTrigger>
                        <TabsTrigger value="claims">Statut Réclamations</TabsTrigger>
                        <TabsTrigger value="vo">Statut VO</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        {/* Performance globale et métriques détaillées */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Graphique de performance */}
                            <Card className="lg:col-span-2">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <BarChart className="h-5 w-5" />
                                            Performance Globale
                                            <Badge variant="outline">Net</Badge>
                                        </CardTitle>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm">
                                            Mensuel
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            Annuel
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <ComposedChart data={performanceData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="revenue" fill="#f97316" />
                                            <Line type="monotone" dataKey="target" stroke="#3b82f6" strokeWidth={2} />
                                            <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Métriques détaillées */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Valeur Contrat <span className="text-muted-foreground">RM 97,501,099 (100%)</span>
                                        <Badge variant="outline" className="ml-2">
                                            Net
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {detailedMetrics.map((metric, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-3 w-3 rounded-sm ${metric.color}`} />
                                                <span className="cursor-pointer text-blue-600 hover:underline">{metric.label}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium">{metric.value}</div>
                                                {metric.amount && <div className="text-xs text-muted-foreground">{metric.amount}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Section inférieure avec 3 graphiques */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Profit & Loss */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4" />
                                        Profit & Loss
                                        <Badge variant="outline">Net</Badge>
                                    </CardTitle>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm">
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {profitLossData.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-sm">{item.category}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">RM {(item.amount / 1000).toFixed(0)}k</span>
                                                <div
                                                    className="h-6 rounded"
                                                    style={{
                                                        backgroundColor: item.color,
                                                        width: `${(item.amount / 1200000) * 100}px`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Cash Flow */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        Cash Flow
                                        <Badge variant="outline">Net</Badge>
                                    </CardTitle>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm">
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="h-3 w-3 rounded-sm bg-blue-500" />
                                                <span>Entrées</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-3 w-3 rounded-sm bg-red-500" />
                                                <span>Sorties</span>
                                            </div>
                                        </div>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <BarChart data={cashFlowData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="period" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="inflow" fill="#3b82f6" />
                                                <Bar dataKey="outflow" fill="#ef4444" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Retention Overview */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Vue Rétention
                                        <Badge variant="outline">Net</Badge>
                                    </CardTitle>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm">
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-sm bg-blue-400" />
                                            <span>Avant</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-sm bg-blue-600" />
                                            <span>Après</span>
                                        </div>
                                    </div>
                                    {retentionData.map((item, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>{item.category}</span>
                                                <span>{item.before}%</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="h-4 rounded bg-blue-400" style={{ width: `${item.before}%` }} />
                                                <div className="h-4 rounded bg-blue-600" style={{ width: `${item.before + 10}%` }} />
                                            </div>
                                            <div className="text-xs text-muted-foreground">RM {(item.after / 1000).toFixed(0)}k</div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="details">
                        <Card>
                            <CardHeader>
                                <CardTitle>Détails du Projet</CardTitle>
                                <CardDescription>Informations détaillées sur le projet en cours</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Contenu des détails du projet à venir...</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="claims">
                        <Card>
                            <CardHeader>
                                <CardTitle>Statut des Réclamations</CardTitle>
                                <CardDescription>Suivi des réclamations et leur statut</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Contenu du statut des réclamations à venir...</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="vo">
                        <Card>
                            <CardHeader>
                                <CardTitle>Statut VO</CardTitle>
                                <CardDescription>Variation Orders et leur statut</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Contenu du statut VO à venir...</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
