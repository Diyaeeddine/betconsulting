import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { 
  Users, 
  Car, 
  Wrench, 
  Route, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  LucideIcon
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const breadcrumbs = [
  { title: 'Accueil', href: '/ressources-humaines/dashboard' },
  { title: 'Dashboard', href: '/ressources-humaines/dashboard' },
];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
  subtitle?: string;
}

interface ProgressBarProps {
  progress: number;
  label: string;
  status: string;
}

export default function RessourcesHumaines() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeProjects, setActiveProjects] = useState(12);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setActiveProjects(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);

  const projectsData = [
    { month: 'Jan', projets: 8, budget: 450000 },
    { month: 'Fév', projets: 12, budget: 680000 },
    { month: 'Mar', projets: 15, budget: 820000 },
    { month: 'Avr', projets: 18, budget: 950000 },
    { month: 'Mai', projets: 22, budget: 1200000 },
    { month: 'Juin', projets: 19, budget: 1100000 },
  ];

  const vehiculeStatusData = [
    { name: 'Disponible', value: 45, color: '#10B981' },
    { name: 'En Mission', value: 38, color: '#3B82F6' },
    { name: 'En Panne', value: 7, color: '#EF4444' },
    { name: 'Maintenance', value: 10, color: '#F59E0B' },
  ];

  const employeeData = [
    { department: 'Technique', actifs: 24, inactifs: 2 },
    { department: 'Commercial', actifs: 18, inactifs: 1 },
    { department: 'Logistique', actifs: 15, inactifs: 3 },
    { department: 'Admin', actifs: 12, inactifs: 0 },
    { department: 'QA', actifs: 8, inactifs: 1 },
  ];

  const progressionData = [
    { project: 'Projet Rabat', progress: 85, status: 'En cours' },
    { project: 'Projet Infrastructure Temara', progress: 92, status: 'Validation' },
    { project: 'Projet Agdal', progress: 67, status: 'En cours' },
    { project: 'Projet Hay riyadh', progress: 100, status: 'Terminé' },
    { project: 'Projet Alirfan', progress: 34, status: 'En cours' },
  ];

  const budgetTrends = [
    { week: 'S1', budgetUtilise: 125000, budgetTotal: 200000 },
    { week: 'S2', budgetUtilise: 180000, budgetTotal: 250000 },
    { week: 'S3', budgetUtilise: 220000, budgetTotal: 300000 },
    { week: 'S4', budgetUtilise: 195000, budgetTotal: 280000 },
  ];

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color = "blue", subtitle }) => (
    <div className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-gray-50 rounded-2xl border border-gray-200/70 p-6 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:border-blue-300/50">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-${color}-400/20 to-transparent rounded-full blur-2xl transform group-hover:scale-150 transition-transform duration-700`} />
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1 z-10">
          <p className="text-sm font-semibold text-gray-600 tracking-wide uppercase">{title}</p>
          <p className="text-4xl font-black text-gray-900 mt-2 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-2 font-medium">{subtitle}</p>}
        </div>
        <div className={`relative p-4 rounded-2xl bg-gradient-to-br from-${color}-500 to-${color}-600 shadow-lg shadow-${color}-500/30 group-hover:shadow-xl group-hover:shadow-${color}-500/40 transition-all duration-500 group-hover:scale-110`}>
          <Icon className="h-8 w-8 text-white" />
          <div className={`absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl group-hover:animate-pulse`} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-5 relative z-10">
          <div className="flex items-center px-3 py-1 bg-green-100 rounded-full">
            <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm font-bold text-green-700">+{trend}% ce mois</span>
          </div>
        </div>
      )}
    </div>
  );

  const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, status }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case 'Terminé': return { color: 'bg-gradient-to-r from-blue-500 to-blue-400', dotColor: 'bg-blue-500', bgColor: 'bg-blue-50' };
        case 'Validation': return { color: 'bg-gradient-to-r from-blue-500 to-blue-400', dotColor: 'bg-blue-500', bgColor: 'bg-blue-50' };
        case 'En cours': return { color: 'bg-gradient-to-r from-blue-500 to-blue-400', dotColor: 'bg-blue-500', bgColor: 'bg-blue-50' };
        default: return { color: 'bg-gradient-to-r from-blue-500 to-blue-400', dotColor: 'bg-blue-500', bgColor: 'bg-blue-50' };
      }
    };

    const config = getStatusConfig(status);

    return (
      <div className={`mb-6 p-4 rounded-xl border ${config.bgColor} border-gray-200/50 hover:shadow-lg transition-all duration-300`}>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold text-gray-800">{label}</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-700 px-2 py-1 bg-white rounded-full">{progress}%</span>
            <div className={`w-3 h-3 rounded-full ${config.dotColor} shadow-lg`}></div>
          </div>
        </div>
        <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full" />
          <div 
            className={`h-3 rounded-full transition-all duration-1000 ease-out ${config.color} shadow-lg relative overflow-hidden`}
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard Ressources Humaines & Gestion des Compétences" />
      
      <div className="min-h-screen bg-gradient-to-white from-gray-50 via-blue-50/30 to-purple-50/20"> 
        <div className="p-8 max-w-full overflow-x-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
            <StatCard
              title="Projets Actifs"
              value={activeProjects}
              icon={Route}
              trend="12"
              color="blue"
              subtitle="3 nouveaux cette semaine"
            />
            <StatCard
              title="Employés"
              value="89"
              icon={Users}
              trend="5"
              color="blue"
              subtitle="7 inactifs"
            />
            <StatCard
              title="Véhicules"
              value="78"
              icon={Car}
              trend="8"
              color="blue"
              subtitle="7 en maintenance"
            />
            <StatCard
              title="Matériels"
              value="156"
              icon={Wrench}
              trend="15"
              color="blue"
              subtitle="12 en mission"
            />
          </div>

          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8 mb-12">
            <div className="group bg-gradient-to-br from-white via-white to-blue-50/30 rounded-3xl border border-gray-200/70 p-8 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 ">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Évolution Projets & Budget
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg"></div>
                    <span className="text-sm font-semibold text-gray-700">Projets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full shadow-lg"></div>
                    <span className="text-sm font-semibold text-gray-700">Budget (DH)</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={projectsData}>
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeWidth={1} />
                  <XAxis dataKey="month" stroke="#64748b" fontWeight="600" />
                  <YAxis yAxisId="left" stroke="#64748b" fontWeight="600" />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontWeight="600" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                      backdropFilter: 'blur(16px)'
                    }}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="projets" 
                    stroke="#3B82F6" 
                    strokeWidth={4}
                    dot={{ fill: '#3B82F6', strokeWidth: 3, r: 8 }}
                    activeDot={{ r: 10, fill: '#3B82F6', stroke: '#ffffff', strokeWidth: 3 }}
                    fill="url(#blueGradient)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="budget" 
                    stroke="#10B981" 
                    strokeWidth={4}
                    dot={{ fill: '#10B981', strokeWidth: 3, r: 8 }}
                    activeDot={{ r: 10, fill: '#10B981', stroke: '#ffffff', strokeWidth: 3 }}
                    fill="url(#greenGradient)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            
            <div className="group bg-gradient-to-br from-white via-white to-purple-50/30 rounded-3xl border border-gray-200/70 p-8 shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">
                Statut des Véhicules
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <defs>
                    {vehiculeStatusData.map((entry, index) => (
                      <linearGradient key={index} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={1}/>
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.7}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={vehiculeStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={130}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {vehiculeStatusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#gradient${index})`}
                        stroke="#ffffff"
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                      backdropFilter: 'blur(16px)'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={50}
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '20px', fontSize: '14px', fontWeight: '600' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8 mb-12">
            <div className="group bg-gradient-to-br from-white via-white to-emerald-50/30 rounded-3xl border border-gray-200/70 p-8 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">
                Répartition des Employés
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={employeeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2575f7ff" stopOpacity={1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={1}/>
                    </linearGradient>
                    <linearGradient id="inactiveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={1}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                      
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeWidth={1} />
                  <XAxis dataKey="department" stroke="#64748b" fontWeight="600" />
                  <YAxis stroke="#64748b" fontWeight="600" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                      backdropFilter: 'blur(16px)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '14px', fontWeight: '600' }} />
                  <Bar 
                    dataKey="actifs" 
                    fill="url(#activeGradient)" 
                    name="Actifs" 
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar 
                    dataKey="inactifs" 
                    fill="url(#inactiveGradient)" 
                    name="Inactifs" 
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="group bg-gradient-to-br from-white via-white to-orange-50/30 rounded-3xl border border-gray-200/70 p-8 shadow-lg hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">
                Utilisation Budget (4 dernières semaines)
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={budgetTrends}>
                  <defs>
                    <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeWidth={1} />
                  <XAxis dataKey="week" stroke="#64748b" fontWeight="600" />
                  <YAxis stroke="#64748b" fontWeight="600" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                      backdropFilter: 'blur(16px)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="budgetUtilise" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#budgetGradient)" 
                    strokeWidth={4}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="budgetTotal" 
                    stroke="#94A3B8" 
                    strokeDasharray="8 8"
                    fill="none"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 2xl:grid-cols-3 gap-8">
            <div className="2xl:col-span-2 bg-gradient-to-br from-white via-white to-blue-50/30 rounded-3xl border border-gray-200/70 p-8 shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Progression des Projets
                </h3>
                <button className="px-4 py-2 text-sm bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:shadow-lg hover:shadow-xl">
                  Voir tout
                </button>
              </div>
              <div className="space-y-2">
                {progressionData.map((project, index) => (
                  <ProgressBar
                    key={index}
                    progress={project.progress}
                    label={project.project}
                    status={project.status}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-gradient-to-br from-white via-white to-indigo-50/30 rounded-3xl border border-gray-200/70 p-8 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">
                  Statistiques Rapides
                </h3>
                <div className="space-y-5">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-white shadow-sm from-gray-50 to-blue-50/50 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-300">
                    <span className="text-sm font-semibold text-gray-700">Taux d'utilisation véhicules</span>
                    <span className="text-lg font-black text-blue-600">87%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-white shadow-sm from-gray-50 to-blue-50/50 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-300">
                    <span className="text-sm font-semibold text-gray-700">Efficacité projets</span>
                    <span className="text-lg font-black text-blue-600">92%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-white shadow-sm from-gray-50 to-blue-50/50 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-300">
                    <span className="text-sm font-semibold text-gray-700">Satisfaction clients</span>
                    <span className="text-lg font-black text-blue-600">4.8/5</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-white shadow-sm from-gray-50 to-blue-50/50 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-300">
                    <span className="text-sm font-semibold text-gray-700">Coût moyen/projet</span>
                    <span className="text-lg font-black text-blue-600">65,000 DH</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};