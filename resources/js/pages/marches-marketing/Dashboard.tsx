import AppLayout from '@/layouts/app-layout';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Target, Award, Clock, MapPin, FileText } from 'lucide-react';

import { Head } from '@inertiajs/react';

const breadcrumbs = [
    {
        title: 'Dashboard Marchés & Marketing',
        href: '/marches-marketing/dashboard',
    },
];

export default function MarchesMarketing() {
const kpiData = {
    appelsDoffres: 45,
    tauxParticipation: 78,
    tauxReussite: 32,
    montantTotal: 2450000,
    delaiMoyen: 8.5,
    marchesGagnes: 14,
};

const tendanceAppelsOffres = [
    { mois: 'Jan', identifies: 38, participes: 28, gagnes: 9 },
    { mois: 'Fév', identifies: 42, participes: 31, gagnes: 11 },
    { mois: 'Mar', identifies: 45, participes: 35, gagnes: 14 },
    { mois: 'Avr', identifies: 41, participes: 33, gagnes: 12 },
    { mois: 'Mai', identifies: 48, participes: 37, gagnes: 15 },
    { mois: 'Jun', identifies: 45, participes: 35, gagnes: 14 },
];

const segmentationMarchesData = [
    { name: 'Infrastructure', value: 35, color: '#3b82f6' },
    { name: 'Bâtiment', value: 28, color: '#60a5fa' },
    { name: 'Génie Civil', value: 22, color: '#93c5fd' },
    { name: 'Réhabilitation', value: 15, color: '#dbeafe' },
];

const performanceRegions = [
    { region: 'Casablanca', marches: 6, montant: 980000 },
    { region: 'Rabat', marches: 4, montant: 720000 },
    { region: 'Marrakech', marches: 2, montant: 450000 },
    { region: 'Tanger', marches: 2, montant: 300000 },
];
interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: string;
}

const KPICard = ({ title, value, subtitle, icon: Icon, trend }: KPICardProps) => (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
                <Icon className="h-6 w-6 text-blue-500" />
            </div>
        </div>
        {trend && (
            <div className="mt-4 flex items-center">
                <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">{trend}</span>
            </div>
        )}
    </div>
);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Qualité & Audit Technique" />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard Marchés & Marketing</h1>
                        <p className="mt-2 text-gray-600">Suivi de la performance commerciale et du positionnement</p>
                    </div>

                    {/* KPIs principaux */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <KPICard
                            title="Appels d'offres identifiés"
                            value={kpiData.appelsDoffres}
                            subtitle="Ce mois-ci"
                            icon={FileText}
                            trend="+12% vs mois précédent"
                        />
                        <KPICard
                            title="Taux de participation"
                            value={`${kpiData.tauxParticipation}%`}
                            subtitle="Appels d'offres traités"
                            icon={Target} trend={undefined}                        />
                        <KPICard
                            title="Taux de réussite"
                            value={`${kpiData.tauxReussite}%`}
                            subtitle="Marchés gagnés/soumis"
                            icon={Award}
                            trend="+5% vs moyenne"
                        />
                        <KPICard
                            title="Montant total remporté"
                            value={`${(kpiData.montantTotal / 1000000).toFixed(1)}M MAD`}
                            subtitle="Sur les 6 derniers mois"
                            icon={TrendingUp} trend={undefined}                        />
                        <KPICard title="Délai moyen de réponse" value={`${kpiData.delaiMoyen} jours`} subtitle="Temps de traitement" icon={Clock} trend={undefined} />
                        <KPICard title="Marchés gagnés" value={kpiData.marchesGagnes} subtitle="En cours d'exécution" icon={MapPin} trend={undefined} />
                    </div>

                    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Tendance des appels d'offres */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Évolution des appels d'offres</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={tendanceAppelsOffres}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="mois" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="identifies" fill="#dbeafe" name="Identifiés" />
                                    <Bar dataKey="participes" fill="#60a5fa" name="Participés" />
                                    <Bar dataKey="gagnes" fill="#3b82f6" name="Gagnés" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Segmentation des marchés */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Répartition des marchés gagnés</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={segmentationMarchesData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {segmentationMarchesData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Performance par région */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Performance par région</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Région</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Nombre de marchés
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Montant total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Montant moyen
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {performanceRegions.map((region, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">{region.region}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{region.marches}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                                {(region.montant / 1000).toFixed(0)}K MAD
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                                {(region.montant / region.marches / 1000).toFixed(0)}K MAD
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
