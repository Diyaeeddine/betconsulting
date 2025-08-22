
import AppLayout from '@/layouts/app-layout';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    RadialBarChart,
    RadialBar,
} from 'recharts';
import { FileText, Clock, CheckCircle, AlertTriangle, Users, Calculator, TrendingUp, Layers, Target, DollarSign } from 'lucide-react';


const breadcrumbs = [
    {
        title: 'Dashboard Qualité & Audit Technique',
        href: '/etudes-techniques/dashboard',
    },
];

export default function EtudesTechniques() {
   const projetsData = [
       { mois: 'Jan', projets: 18, livres_temps: 14, revisions: 3, temps_moyen: 24 },
       { mois: 'Fév', projets: 22, livres_temps: 19, revisions: 4, temps_moyen: 22 },
       { mois: 'Mar', projets: 20, livres_temps: 17, revisions: 2, temps_moyen: 26 },
       { mois: 'Avr', projets: 25, livres_temps: 22, revisions: 5, temps_moyen: 21 },
       { mois: 'Mai', projets: 28, livres_temps: 25, revisions: 3, temps_moyen: 20 },
       { mois: 'Jun', projets: 24, livres_temps: 22, revisions: 2, temps_moyen: 19 },
   ];

   const budgetData = [
       { projet: 'Projet A', previsionnel: 180000, estime: 175000 },
       { projet: 'Projet B', previsionnel: 250000, estime: 265000 },
       { projet: 'Projet C', previsionnel: 320000, estime: 310000 },
       { projet: 'Projet D', previsionnel: 150000, estime: 155000 },
       { projet: 'Projet E', previsionnel: 420000, estime: 435000 },
   ];

   const chargeEquipeData = [
       { ingenieur: 'Jean D.', charge: 85, projets: 4, specialite: 'Structure' },
       { ingenieur: 'Marie L.', charge: 92, projets: 3, specialite: 'Fluides' },
       { ingenieur: 'Paul M.', charge: 78, projets: 5, specialite: 'Architecture' },
       { ingenieur: 'Sophie R.', charge: 88, projets: 4, specialite: 'VRD' },
       { ingenieur: 'Alex B.', charge: 82, projets: 6, specialite: 'Structure' },
   ];

   const typeProjetData = [
       { name: 'Bâtiment', value: 45, color: '#0088FE' },
       { name: 'Infrastructure', value: 30, color: '#00C49F' },
       { name: 'Industriel', value: 15, color: '#FFBB28' },
       { name: 'Rénovation', value: 10, color: '#FF8042' },
   ];

   const projetsEnCours = 24;
   const tauxRespectDelais = (
       (projetsData.reduce((acc, curr) => acc + curr.livres_temps, 0) / projetsData.reduce((acc, curr) => acc + curr.projets, 0)) *
       100
   ).toFixed(1);
   const tauxRevision = (
       (projetsData.reduce((acc, curr) => acc + curr.revisions, 0) / projetsData.reduce((acc, curr) => acc + curr.projets, 0)) *
       100
   ).toFixed(1);
   const tempsMoyenEtude = (projetsData.reduce((acc, curr) => acc + curr.temps_moyen, 0) / projetsData.length).toFixed(1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen space-y-6 bg-gray-50 p-6">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Dashboard Études Techniques</h1>
                    <p className="text-gray-600">Suivi de la qualité et de l'efficacité de la conception technique</p>
                </div>

                {/* KPIs principaux */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Projets en Étude</p>
                                    <p className="text-3xl font-bold text-blue-900">{projetsEnCours}</p>
                                    <p className="text-sm text-green-600">↗ +3 ce mois</p>
                                </div>
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600">Respect des Délais</p>
                                    <p className="text-3xl font-bold text-green-900">{tauxRespectDelais}%</p>
                                    <p className="text-sm text-green-600">↗ +4.2% ce mois</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-yellow-600">Taux de Révisions</p>
                                    <p className="text-3xl font-bold text-yellow-900">{tauxRevision}%</p>
                                    <p className="text-sm text-red-600">↘ -1.8% ce mois</p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-purple-200 bg-purple-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600">Temps Moyen (jours)</p>
                                    <p className="text-3xl font-bold text-purple-900">{tempsMoyenEtude}</p>
                                    <p className="text-sm text-green-600">↗ -2.5 jours</p>
                                </div>
                                <Clock className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Graphiques principaux */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Évolution des Projets et Délais
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={projetsData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="mois" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="projets" name="Projets totaux" fill="#8884d8" />
                                    <Bar dataKey="livres_temps" name="Livrés à temps" fill="#82ca9d" />
                                    <Bar dataKey="revisions" name="Révisions" fill="#ffc658" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Layers className="h-5 w-5" />
                                Répartition par Type de Projet
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={typeProjetData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${percent.toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {typeProjetData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Métriques détaillées */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5" />
                                Budget Prévisionnel vs Estimé
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={budgetData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="projet" />
                                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`} />
                                    <Tooltip
                                        formatter={(value: number | string) => {
                                            const num = Number(value); // cast en number
                                            return [`${(num / 1000).toFixed(0)}k€`, ''];
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="previsionnel" name="Prévisionnel" fill="#8884d8" />
                                    <Bar dataKey="estime" name="Estimé" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Temps Moyen d'Étude par Mois
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={projetsData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="mois" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`${value} jours`, 'Temps moyen']} />
                                    <Line
                                        type="monotone"
                                        dataKey="temps_moyen"
                                        stroke="#8884d8"
                                        strokeWidth={3}
                                        dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Charge de travail par équipe */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Charge de Travail par Ingénieur
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {chargeEquipeData.map((ing, index) => (
                                    <div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                        <div className="flex-1">
                                            <div className="mb-1 flex items-center justify-between">
                                                <span className="font-medium">{ing.ingenieur}</span>
                                                <span className="text-sm text-gray-600">{ing.charge}%</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-gray-200">
                                                <div
                                                    className={`h-2 rounded-full ${ing.charge > 90 ? 'bg-red-500' : ing.charge > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                    style={{ width: `${ing.charge}%` }}
                                                ></div>
                                            </div>
                                            <div className="mt-1 flex justify-between text-xs text-gray-500">
                                                <span>{ing.projets} projets</span>
                                                <span>{ing.specialite}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Résumé des Performances</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg bg-blue-50 p-4 text-center">
                                    <FileText className="mx-auto mb-2 h-8 w-8 text-blue-600" />
                                    <h3 className="font-semibold text-blue-900">Projets Actifs</h3>
                                    <p className="text-2xl font-bold text-blue-900">24</p>
                                    <p className="text-sm text-blue-600">En cours d'étude</p>
                                </div>
                                <div className="rounded-lg bg-green-50 p-4 text-center">
                                    <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600" />
                                    <h3 className="font-semibold text-green-900">Qualité</h3>
                                    <p className="text-2xl font-bold text-green-900">91%</p>
                                    <p className="text-sm text-green-600">Projets livrés à temps</p>
                                </div>
                                <div className="rounded-lg bg-purple-50 p-4 text-center">
                                    <Users className="mx-auto mb-2 h-8 w-8 text-purple-600" />
                                    <h3 className="font-semibold text-purple-900">Équipe</h3>
                                    <p className="text-2xl font-bold text-purple-900">85%</p>
                                    <p className="text-sm text-purple-600">Charge moyenne</p>
                                </div>
                                <div className="rounded-lg bg-yellow-50 p-4 text-center">
                                    <DollarSign className="mx-auto mb-2 h-8 w-8 text-yellow-600" />
                                    <h3 className="font-semibold text-yellow-900">Budget</h3>
                                    <p className="text-2xl font-bold text-yellow-900">-2.1%</p>
                                    <p className="text-sm text-yellow-600">Écart prév/estimé</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
