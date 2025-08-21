import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Target, Users, Euro, FileText, Calendar, Award } from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Dashboard Marchés & Marketing',
        href: '/marches-marketing/dashboard',
    },
];

export default function MarchesMarketing() {
    const kpiData = [
        { title: "Chiffre d'Affaires", value: '2.4M€', change: '+12%', icon: Euro, color: 'text-green-600' },
        { title: 'Prospects Actifs', value: '47', change: '+8', icon: Users, color: 'text-blue-600' },
        { title: 'Taux de Conversion', value: '23%', change: '+5%', icon: Target, color: 'text-purple-600' },
        { title: "Appels d'Offres", value: '12', change: '+3', icon: FileText, color: 'text-orange-600' },
    ];

    const pipelineData = [
        { name: 'Prospection', value: 15, color: '#8884d8' },
        { name: 'Qualification', value: 12, color: '#82ca9d' },
        { name: 'Proposition', value: 8, color: '#ffc658' },
        { name: 'Négociation', value: 5, color: '#ff7300' },
        { name: 'Signature', value: 3, color: '#00ff00' },
    ];

    const monthlyRevenue = [
        { month: 'Jan', revenue: 180000, target: 200000 },
        { month: 'Fév', revenue: 220000, target: 200000 },
        { month: 'Mar', revenue: 195000, target: 200000 },
        { month: 'Avr', revenue: 240000, target: 200000 },
        { month: 'Mai', revenue: 210000, target: 200000 },
        { month: 'Jun', revenue: 260000, target: 200000 },
    ];

    const sectorsData = [
        { sector: 'Bâtiment', projects: 15, revenue: 850000 },
        { sector: 'Infrastructure', projects: 8, revenue: 920000 },
        { sector: 'Industriel', projects: 6, revenue: 630000 },
        { sector: 'Environnement', projects: 4, revenue: 280000 },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Qualité & Audit Technique" />
            <div className="min-h-screen space-y-6 bg-gray-50 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Marchés & Marketing</h1>
                        <p className="text-gray-600">Tableau de bord commercial et développement</p>
                    </div>
                    <Badge variant="outline" className="px-3 py-1">
                        <Calendar className="mr-2 h-4 w-4" />
                        Juin 2024
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
                                <p className={`text-xs ${kpi.color}`}>
                                    <TrendingUp className="mr-1 inline h-3 w-3" />
                                    {kpi.change} vs mois dernier
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Pipeline Commercial */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pipeline Commercial</CardTitle>
                            <CardDescription>Répartition des prospects par étape</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pipelineData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {pipelineData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Évolution CA */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Évolution du Chiffre d'Affaires</CardTitle>
                            <CardDescription>Réalisé vs Objectif (en €)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={monthlyRevenue}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`${value.toLocaleString()}€`, '']} />
                                    <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} name="Réalisé" />
                                    <Line type="monotone" dataKey="target" stroke="#dc2626" strokeDasharray="5 5" name="Objectif" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Secteurs d'activité */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance par Secteur</CardTitle>
                        <CardDescription>Projets et revenus par domaine d'activité</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {sectorsData.map((sector, index) => (
                                <div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                                    <div className="flex items-center space-x-4">
                                        <Award className="h-8 w-8 text-blue-600" />
                                        <div>
                                            <h3 className="font-semibold">{sector.sector}</h3>
                                            <p className="text-sm text-gray-600">{sector.projects} projets actifs</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-green-600">{sector.revenue.toLocaleString()}€</p>
                                        <Progress value={(sector.revenue / 1000000) * 100} className="mt-1 w-24" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
