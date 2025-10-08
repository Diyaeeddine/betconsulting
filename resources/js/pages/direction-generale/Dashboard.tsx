import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import AppLayout from '@/layouts/app-layout';
import {
    Award,
    BarChart3,
    Calculator,
    ClipboardCheck,
    CreditCard,
    Crown,
    DollarSign,
    Download,
    FileText,
    Globe,
    Handshake,
    Lightbulb,
    Megaphone,
    Scale,
    Target,
    TrendingDown,
    TrendingUp,
    Truck,
    Users,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ComposedChart,
    Line,
    LineChart,
    Pie,
    PieChart,
    ReferenceDot,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';

const breadcrumbs = [
    {
        title: 'Dashboard Admin',
        href: '/admin/dashboard',
    },
];

export default function Dashboard() {
    const featureCards = [
        {
            icon: Crown,
            title: 'Direction Générale',
            description: 'Administration et supervision générale',
            color: 'text-blue-600',
        },
        {
            icon: TrendingUp,
            title: 'Marchés & Marketing',
            description: 'Analyse des marchés et stratégies',
            color: 'text-blue-600',
        },
        {
            icon: Calculator,
            title: 'Études Techniques',
            description: 'Analyses et études spécialisées',
            color: 'text-blue-600',
        },
        {
            icon: ClipboardCheck,
            title: 'Suivi & Contrôle',
            description: 'Supervision des travaux et projets',
            color: 'text-blue-600',
        },
        {
            icon: Award,
            title: 'Qualité & Audit',
            description: 'Contrôle qualité et audits techniques',
            color: 'text-blue-600',
        },
        {
            icon: Lightbulb,
            title: 'Innovation & Digital',
            description: 'Transformation digitale et innovation',
            color: 'text-blue-600',
        },
        {
            icon: Users,
            title: 'Ressources Humaines',
            description: 'Gestion du personnel et RH',
            color: 'text-blue-600',
        },
        {
            icon: DollarSign,
            title: 'Financier & Comptabilité',
            description: 'Gestion financière et comptable',
            color: 'text-blue-600',
        },
        {
            icon: Truck,
            title: 'Logistique Généraux',
            description: 'Logistique et moyens généraux',
            color: 'text-blue-600',
        },
        {
            icon: Megaphone,
            title: 'Communication Digitale',
            description: 'Communication et marketing digital',
            color: 'text-blue-600',
        },
        {
            icon: Scale,
            title: 'Juridique',
            description: 'Affaires juridiques et conformité',
            color: 'text-blue-600',
        },
        {
            icon: Handshake,
            title: 'Fournisseurs & Sous-Traitants',
            description: 'Gestion des partenaires externes',
            color: 'text-blue-600',
        },
    ];

    const accountSummaryData = [
        { month: 'Jan', value: 107 },
        { month: 'Fév', value: 258 },
        { month: 'Mar', value: 306 },
        { month: 'Avr', value: 206 },
        { month: 'Mai', value: 403 },
        { month: 'Jun', value: 105 },
        { month: 'Jul', value: 558 },
        { month: 'Aoû', value: 453 },
        { month: 'Sep', value: 553 },
        { month: 'Oct', value: 655 },
        { month: 'Nov', value: 853 },
        { month: 'Déc', value: 951 },
    ];

    const accountTotal = accountSummaryData.reduce((sum, item) => sum + item.value, 0);
    const accountAverage = Math.round(accountTotal / accountSummaryData.length);
    const accountMax = Math.max(...accountSummaryData.map((item) => item.value));
    const accountMin = Math.min(...accountSummaryData.map((item) => item.value));
    const lastAccountValue = accountSummaryData[accountSummaryData.length - 1]?.value || 0;
    const prevAccountValue = accountSummaryData[accountSummaryData.length - 2]?.value || 0;
    const accountGrowth = prevAccountValue > 0 ? ((lastAccountValue - prevAccountValue) / prevAccountValue) * 100 : 0;

    const ticketsData = [
        { name: 'Nouveau', value: 150, fill: '#3b82f6' },
        { name: 'En cours', value: 100, fill: '#60a5fa' },
        { name: 'Terminé', value: 83, fill: '#e5e7eb' },
    ];

    const totalTickets = ticketsData.reduce((sum, item) => sum + item.value, 0);
    const completionRate = Math.round((ticketsData[2].value / totalTickets) * 100);
    const activeTickets = ticketsData[0].value + ticketsData[1].value;

    const revenueData = [
        { month: 'Jan', value: 200 },
        { month: 'Fév', value: 250 },
        { month: 'Mar', value: 400 },
        { month: 'Avr', value: 600 },
        { month: 'Mai', value: 500 },
        { month: 'Jun', value: 700 },
        { month: 'Jul', value: 750 },
        { month: 'Aoû', value: 750 },
        { month: 'Sep', value: 750 },
        { month: 'Oct', value: 750 },
        { month: 'Nov', value: 750 },
        { month: 'Déc', value: 750 },
    ];
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.value, 0);
    const averageMonthly = Math.round(totalRevenue / revenueData.length);
    const lastMonth = revenueData[revenueData.length - 1]?.value || 0;
    const previousMonth = revenueData[revenueData.length - 2]?.value || 0;
    const monthlyGrowth = previousMonth > 0 ? ((lastMonth - previousMonth) / previousMonth) * 100 : 0;
    const targetProgress = Math.min((totalRevenue / 8000) * 100, 100); // Target of 8000 total

    const isGrowthPositive = monthlyGrowth >= 0;

    const salesData = [
        { year: '2018', value: 30 },
        { year: '2019', value: 50 },
        { year: '2020', value: 40 },
        { year: '2021', value: 70 },
        { year: '2022', value: 60 },
        { year: '2023', value: 80 },
        { year: '2024', value: 90 },
    ];

    const salesGrowthRate = salesData.length > 1 ? ((salesData[salesData.length - 1].value - salesData[0].value) / salesData[0].value) * 100 : 0;
    const avgYearlyGrowth = salesGrowthRate / (salesData.length - 1);
    const projected2025 = Math.round(salesData[salesData.length - 1].value * (1 + avgYearlyGrowth / 100));

    const targetData = [
        { month: 'Jan', ventes: 100, revenus: 80 },
        { month: 'Fév', ventes: 150, revenus: 120 },
        { month: 'Mar', ventes: 200, revenus: 260 },
        { month: 'Avr', ventes: 550, revenus: 300 },
        { month: 'Mai', ventes: 300, revenus: 640 },
        { month: 'Jun', ventes: 250, revenus: 180 },
        { month: 'Jul', ventes: 400, revenus: 220 },
        { month: 'Aoû', ventes: 450, revenus: 460 },
        { month: 'Sep', ventes: 200, revenus: 500 },
        { month: 'Oct', ventes: 550, revenus: 440 },
        { month: 'Nov', ventes: 600, revenus: 180 },
        { month: 'Déc', ventes: 450, revenus: 620 },
    ];
    const totalVentes = targetData.reduce((sum, item) => sum + item.ventes, 0);
    const totalRevenus = targetData.reduce((sum, item) => sum + item.revenus, 0);

    const incomeChartData = [
        { quarter: 'T3', income: 540, expenses: 540 },
        { quarter: 'T4', income: 430, expenses: 430 },
    ];

    const totalIncome = incomeChartData.reduce((sum, item) => sum + item.income, 0);
    const totalExpenses = incomeChartData.reduce((sum, item) => sum + item.expenses, 0);
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen bg-gray-50 p-6">
                {/* Header Section */}
                {/* <div className="mb-8 rounded bg-blue-600 p-8 text-white">
                    <h1 className="mb-6 text-center text-2xl font-semibold">Que recherchez-vous ?</h1>
                    <div className="mx-auto flex max-w-md gap-2">
                        <Input placeholder="Rechercher" className="flex-1 border-0 bg-white text-gray-900" />
                        <Button className="bg-orange-600 px-6 transition hover:bg-orange-700">Rechercher</Button>
                    </div>
                </div> */}

                {/* Feature Cards Grid */}
                <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {featureCards.map((card, index) => (
                        <Card key={index} className="cursor-pointer rounded p-4 transition-shadow hover:shadow-md">
                            <CardContent className="p-0 text-center">
                                <div className="mb-3">
                                    <card.icon className={`mx-auto h-8 w-8 ${card.color}`} />
                                </div>
                                <h3 className="mb-1 text-sm font-semibold">{card.title}</h3>
                                <p className="text-xs text-gray-500">{card.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* Account Summary */}
                    <Card className="rounded lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">Résumé du Compte</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col lg:flex-row">
                            <div className="w-full lg:w-[35%]">
                                <div className="mb-4 flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-blue-600" />
                                    <span className="text-2xl font-bold">${accountTotal.toLocaleString()}</span>
                                    {accountGrowth >= 0 ? (
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4 text-red-500" />
                                    )}
                                    <span className={`text-sm font-medium ${accountGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {Math.abs(accountGrowth).toFixed(1)}%
                                    </span>
                                </div>

                                <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3">
                                    <div className="text-center">
                                        <p className="text-lg font-semibold">${accountAverage}</p>
                                        <p className="text-xs text-gray-600">Moyenne</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-semibold">${accountMax}</p>
                                        <p className="text-xs text-gray-600">Maximum</p>
                                    </div>
                                </div>

                                <p className="mb-4 text-sm text-gray-600">
                                    Elite a gagné une traction sans précédent sur le marché. Vision est le plus TWO millions d'utilisateurs
                                    enregistrés et UN million d'utilisateurs actifs quotidiens au monde.
                                </p>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 lg:w-auto">
                                    <Download className="mr-2 h-4 w-4" />
                                    Télécharger les Rapports
                                </Button>
                            </div>

                            <div className="mt-5 w-full md:flex md:items-center md:justify-center lg:mt-0 lg:w-[65%]">
                                <ChartContainer
                                    config={{
                                        value: {
                                            label: 'Valeur',
                                            color: '#3b82f6',
                                        },
                                    }}
                                    className="h-48 w-full lg:h-40"
                                >
                                    <BarChart data={accountSummaryData} margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="month" axisLine={true} tickLine={false} tick={{ fontSize: 10 }} />
                                        <YAxis domain={['dataMin', 'dataMax']} />
                                        <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                                        <ChartTooltip
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    const value = payload[0].value as number;
                                                    const percentage = ((value / accountTotal) * 100).toFixed(1);
                                                    return (
                                                        <div className="rounded-lg border bg-white p-3 shadow-lg">
                                                            <p className="font-semibold text-gray-900">{label}</p>
                                                            <p className="text-blue-600">Valeur: ${value?.toLocaleString()}</p>
                                                            <p className="text-sm text-gray-500">{percentage}% du total</p>
                                                            <p className="text-sm text-gray-500">
                                                                {value > accountAverage
                                                                    ? '↗️ Au-dessus de la moyenne'
                                                                    : '↘️ En-dessous de la moyenne'}
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Income */}
                    <Card className="w-full rounded">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold">Revenus</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="mb-3 flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                <div>
                                    <p className="text-sm text-gray-600">Profit Net</p>
                                    <p className={`text-lg font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${netProfit}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Marge</p>
                                    <p className={`text-lg font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {profitMargin.toFixed(1)}%
                                    </p>
                                </div>
                            </div>

                            <div className="h-48 w-full">
                                <ChartContainer
                                    config={{
                                        income: {
                                            label: 'Revenus',
                                            color: '#93c5fd',
                                        },
                                        expenses: {
                                            label: 'Dépenses',
                                            color: '#3b82f6',
                                        },
                                    }}
                                    className="h-full w-full"
                                >
                                    <ComposedChart data={incomeChartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                        <defs>
                                            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#93c5fd" stopOpacity={0.8} />
                                                <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.2} />
                                            </linearGradient>
                                        </defs>

                                        <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                        <YAxis
                                            domain={[360, 660]}
                                            ticks={[360, 420, 480, 540, 600, 660]}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            dx={-10}
                                        />

                                        <Area type="monotone" dataKey="income" stroke="none" fill="url(#incomeGradient)" fillOpacity={1} />
                                        <Line type="monotone" dataKey="expenses" stroke="#3b82f6" strokeWidth={3} dot={false} />
                                        <ReferenceDot x="T3" y={540} r={4} fill="#3b82f6" stroke="#fff" strokeWidth={2} />
                                        <ReferenceDot x="T4" y={430} r={4} fill="#3b82f6" stroke="#fff" strokeWidth={2} />
                                        <ChartTooltip
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    const income = payload.find((p) => p.dataKey === 'income')?.value as number;
                                                    const expenses = payload.find((p) => p.dataKey === 'expenses')?.value as number;
                                                    const profit = income - expenses;
                                                    return (
                                                        <div className="rounded-lg border bg-white p-3 shadow-lg">
                                                            <p className="font-semibold text-gray-900">{label}</p>
                                                            <p className="text-blue-300">Revenus: ${income}</p>
                                                            <p className="text-blue-600">Dépenses: ${expenses}</p>
                                                            <hr className="my-1" />
                                                            <p className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                Profit: ${profit}
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                    </ComposedChart>
                                </ChartContainer>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg border border-blue-200 bg-white p-3">
                                    <div className="text-sm font-medium text-gray-900">T3 - $7200</div>
                                    <div className="mt-1 h-1 w-8 rounded-full bg-blue-500"></div>
                                </div>
                                <div className="rounded-lg border border-blue-200 bg-white p-3">
                                    <div className="text-sm font-medium text-gray-900">T4 - $4800</div>
                                    <div className="mt-1 h-1 w-8 rounded-full bg-blue-500"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tickets */}
                    <Card className="rounded lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg">Tickets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex items-center justify-center">
                                <ChartContainer
                                    config={{
                                        new: {
                                            label: 'Nouveau',
                                            color: '#3b82f6',
                                        },
                                        progress: {
                                            label: 'En cours',
                                            color: '#60a5fa',
                                        },
                                        completed: {
                                            label: 'Terminé',
                                            color: '#e5e7eb',
                                        },
                                    }}
                                    className="h-24 w-24"
                                >
                                    <PieChart>
                                        <Pie data={ticketsData} cx="50%" cy="50%" innerRadius={20} outerRadius={40} paddingAngle={2} dataKey="value">
                                            {ticketsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    const percentage = ((data.value / totalTickets) * 100).toFixed(1);
                                                    return (
                                                        <div className="rounded-lg border bg-white p-3 shadow-lg">
                                                            <p className="font-semibold text-gray-900">{data.name}</p>
                                                            <p className="text-blue-600">{data.value} tickets</p>
                                                            <p className="text-sm text-gray-500">{percentage}% du total</p>
                                                            {data.name === 'Terminé' && (
                                                                <p className="text-sm text-green-600">✅ Taux de completion: {completionRate}%</p>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                    </PieChart>
                                </ChartContainer>
                            </div>
                            <div className="mb-4 text-center">
                                <div className="text-2xl font-bold">{totalTickets}</div>
                                <Badge variant="secondary" className="mt-1 flex items-center gap-1">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                        <polyline points="17 6 23 6 23 12"></polyline>
                                    </svg>
                                    21% supérieur au mois dernier
                                </Badge>
                            </div>

                            <div className="mb-3 rounded-lg bg-gray-50 p-3">
                                <div className="flex justify-between text-sm">
                                    <span>Taux de completion</span>
                                    <span className="font-semibold text-green-600">{completionRate}%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Tickets actifs</span>
                                    <span className="font-semibold text-blue-600">{activeTickets}</span>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                                    <span>Nouveau ({ticketsData[0].value})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-blue-400"></div>
                                    <span>En cours ({ticketsData[1].value})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                                    <span>Terminé ({ticketsData[2].value})</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Revenue */}
                    <Card className="rounded-lg">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-semibold">Chiffre d'Affaires</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 px-0">
                            <div className="flex items-center justify-between px-6">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-blue-100 p-2">
                                        <CreditCard className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <span className="text-3xl font-bold">${totalRevenue.toLocaleString()}</span>
                                        <p className="text-sm text-gray-500">Total annuel</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`flex items-center gap-1 ${isGrowthPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        {isGrowthPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                        <span className="font-semibold">{Math.abs(monthlyGrowth).toFixed(1)}%</span>
                                    </div>
                                    <p className="text-xs text-gray-500">vs mois dernier</p>
                                </div>
                            </div>

                            <div className="mx-6 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-3">
                                <div className="text-center">
                                    <p className="text-lg font-semibold">${averageMonthly}</p>
                                    <p className="text-xs text-gray-600">Moyenne mensuelle</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-semibold">${lastMonth}</p>
                                    <p className="text-xs text-gray-600">Dernier mois</p>
                                </div>
                            </div>

                            <div className="h-40">
                                <ChartContainer
                                    config={{
                                        value: {
                                            label: 'Revenus',
                                            color: '#3b82f6',
                                        },
                                    }}
                                    className="h-full w-full"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={revenueData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fill: '#6b7280' }}
                                                tickFormatter={(value) => `$${value}`}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                                            />
                                            <ChartTooltip
                                                content={({ active, payload, label }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="rounded-lg border bg-white p-2 shadow-md">
                                                                <p className="font-medium">{label}</p>
                                                                <p className="text-blue-600">Revenus: ${payload[0].value?.toLocaleString()}</p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </div>

                            <div className="mx-6 rounded-lg border border-gray-200 p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-semibold">Objectif Annuel</span>
                                    </div>
                                    <span className="text-sm font-medium">{targetProgress.toFixed(0)}%</span>
                                </div>
                                <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
                                    <div
                                        className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                        style={{ width: `${targetProgress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-600">${totalRevenue.toLocaleString()} / $8,000 atteint</p>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Sales */}
                    <Card className="rounded">
                        <CardHeader>
                            <CardTitle className="text-lg">Ventes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 px-0">
                            <div className="mx-6 mb-4 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                <span className="text-2xl font-bold">$9800</span>
                                <div className="flex items-center gap-1 text-green-600">
                                    <TrendingUp className="h-4 w-4" />
                                    <span className="text-sm font-medium">{salesGrowthRate.toFixed(1)}%</span>
                                </div>
                            </div>
                            <p className="mx-6 mb-4 text-sm text-gray-600">Croissance des ventes la plus élevée des deux dernières années.</p>

                            <div className="mx-6 mb-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3">
                                <div className="text-center">
                                    <p className="text-sm font-semibold">Croissance annuelle</p>
                                    <p className="text-lg text-green-600">{avgYearlyGrowth.toFixed(1)}%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold">Projection 2025</p>
                                    <p className="text-lg text-blue-600">${projected2025}</p>
                                </div>
                            </div>

                            <div className="mb-4 flex h-32 w-full items-center">
                                <ChartContainer
                                    config={{
                                        value: {
                                            label: 'Ventes',
                                            color: '#3b82f6',
                                        },
                                    }}
                                    className="h-full w-full"
                                >
                                    <BarChart data={salesData}>
                                        <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                        <ChartTooltip
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    const currentValue = payload[0].value as number;
                                                    const currentIndex = salesData.findIndex((item) => item.year === label);
                                                    const previousValue = currentIndex > 0 ? salesData[currentIndex - 1].value : null;
                                                    const growth = previousValue ? ((currentValue - previousValue) / previousValue) * 100 : null;

                                                    return (
                                                        <div className="rounded-lg border bg-white p-3 shadow-lg">
                                                            <p className="font-semibold text-gray-900">{label}</p>
                                                            <p className="text-blue-600">Ventes: ${currentValue}</p>
                                                            {growth !== null && (
                                                                <p className={`text-sm ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {growth >= 0 ? '↗️' : '↘️'} {Math.abs(growth).toFixed(1)}% vs année précédente
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            </div>
                            <div className="mx-6 mt-2 rounded bg-gray-50 p-2 text-center">
                                <span className="text-sm font-semibold">Objectif - 75/100</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Target - Chart avec gradients */}
                    <Card className="rounded">
                        <CardHeader>
                            <CardTitle className="text-lg">Objectif</CardTitle>
                        </CardHeader>
                        <CardContent className="px-0">
                            <div className="mb-6 h-64 w-full">
                                <ChartContainer
                                    config={{
                                        ventes: {
                                            label: 'Ventes',
                                            color: '#3b82f6',
                                        },
                                        revenus: {
                                            label: 'Revenus',
                                            color: '#10b981',
                                        },
                                    }}
                                    className="h-full w-full"
                                >
                                    <AreaChart
                                        accessibilityLayer
                                        data={targetData}
                                        margin={{
                                            top: 10,
                                            left: 20,
                                            right: 20,
                                            bottom: 10,
                                        }}
                                    >
                                        <defs>
                                            <linearGradient id="ventesGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            </linearGradient>
                                            <linearGradient id="revenusGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                                                <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={true} strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis
                                            dataKey="month"
                                            tickLine={true}
                                            axisLine={true}
                                            tickMargin={8}
                                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                                            interval={1}
                                        />
                                        <YAxis tickLine={true} axisLine={true} tick={{ fontSize: 11 }} tickFormatter={(value) => `${value}`} />
                                        <ChartTooltip
                                            cursor={true}
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    const ventes = payload.find((p) => p.dataKey === 'ventes')?.value as number;
                                                    const revenus = payload.find((p) => p.dataKey === 'revenus')?.value as number;
                                                    const ratio = ventes > 0 ? (revenus / ventes).toFixed(2) : '0';
                                                    const performance = ventes > revenus ? 'Ventes supérieures' : 'Revenus supérieurs';

                                                    return (
                                                        <div className="rounded-lg border bg-white p-3 shadow-lg">
                                                            <p className="font-semibold text-gray-900">{label}</p>
                                                            <p className="text-blue-600">Ventes: {ventes?.toLocaleString()}</p>
                                                            <p className="text-green-600">Revenus: {revenus?.toLocaleString()}</p>
                                                            <hr className="my-1" />
                                                            <p className="text-sm text-gray-600">Ratio R/V: {ratio}</p>
                                                            <p className="text-sm font-medium">{performance}</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="ventes"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            fill="url(#ventesGradient)"
                                            fillOpacity={1}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenus"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            fill="url(#revenusGradient)"
                                            fillOpacity={1}
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            </div>
                            <div className="mx-2 grid grid-cols-2 gap-4">
                                <div className="rounded-lg bg-blue-50 p-3 text-center">
                                    <div className="text-sm font-semibold text-blue-600">Ventes - {totalVentes.toLocaleString()}</div>
                                </div>
                                <div className="rounded-lg bg-green-50 p-3 text-center">
                                    <div className="text-sm font-semibold text-green-600">Revenus - {totalRevenus.toLocaleString()}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Activity */}
                    <Card className="rounded">
                        <CardHeader>
                            <CardTitle className="text-lg">Activité</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                                    <Users className="h-5 w-5 text-gray-600" />
                                </div>
                                <div>
                                    <div className="font-semibold">Sophie Michiels</div>
                                    <div className="text-sm text-gray-500">Il y a 2 heures</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Issues */}
                    <Card className="rounded">
                        <CardHeader>
                            <CardTitle className="text-lg">Problèmes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Serveur en panne</span>
                                <Badge variant="destructive">Élevé</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reports */}
                    <Card className="rounded">
                        <CardHeader>
                            <CardTitle className="text-lg">Rapports</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm">Rapport d'Incendie</span>
                                    <Badge>Urgent</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}