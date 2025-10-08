import React from 'react';
import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import {
  Briefcase,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  MapPin,
  GraduationCap,
  Activity,
  BarChart3,
  Users,
  ChevronRight,
  Zap,
  MessageSquare,
  TrendingDown,
  Star,
  Flame,
  Trophy,
  BookOpen,
  Rocket,
  LineChart
} from 'lucide-react';

export default function SalarieDashboard() {
  const { auth } = usePage().props as any;

  const breadcrumbs = [
    {
      title: 'Dashboard Salarie',
      href: '/salarie/dashboard',
    },
  ];

  // Mock data
  const salarie = auth?.user || {
    nom: 'Alami',
    prenom: 'Hassan',
    email: 'hassan.alami@company.ma',
    poste: 'Développeur Full Stack',
    nom_profil: 'Développeur',
    salaire_mensuel: 12000,
    date_embauche: '2023-01-15',
    emplacement: 'bureau',
    statut: 'actif'
  };

  const stats = [
    {
      label: 'Projets Actifs',
      value: '5',
      icon: Briefcase,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-300',
      trend: '+2',
      trendUp: false,
      percentage: '-40%'
    },
    {
      label: 'Tâches Complètes',
      value: '47',
      icon: CheckCircle2,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-300',
      trend: '+12',
      trendUp: true,
      percentage: '+34%'
    },
    {
      label: 'Formations',
      value: '8',
      icon: GraduationCap,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-300',
      trend: '+3',
      trendUp: true,
      percentage: '+60%'
    },
    {
      label: 'Score Moyen',
      value: '87%',
      icon: Award,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      iconBg: 'bg-amber-300',
      trend: '+5%',
      trendUp: true,
      percentage: '+5.7%'
    }
  ];

  const upcomingEvents = [
    { id: 1, title: 'Formation React Avancé', date: '2025-10-12', time: '09:00', type: 'formation', icon: GraduationCap, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { id: 2, title: 'Réunion Projet Alpha', date: '2025-10-08', time: '14:00', type: 'reunion', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 3, title: 'Entretien Annuel', date: '2025-10-20', time: '10:00', type: 'entretien', icon: MessageSquare, color: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 4, title: 'Deadline Sprint', date: '2025-10-11', time: '18:00', type: 'deadline', icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
    { id: 5, title: 'Workshop DevOps', date: '2025-10-14', time: '11:00', type: 'formation', icon: Rocket, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  ];

  // Performance data for charts
  const performanceData = [
    { month: "Mai", score: 72 },
    { month: "Juin", score: 75 },
    { month: "Juil", score: 80 },
    { month: "Août", score: 85 },
    { month: "Sept", score: 83 },
    { month: "Oct", score: 87 },
  ];

  const weeklyActivity = [
    { day: 'Lun', hours: 8 },
    { day: 'Mar', hours: 7.5 },
    { day: 'Mer', hours: 8.5 },
    { day: 'Jeu', hours: 8 },
    { day: 'Ven', hours: 7 },
    { day: 'Sam', hours: 0 },
    { day: 'Dim', hours: 0 },
  ];

  const projectsOverview = [
    { name: 'Projet Alpha', progress: 85, status: 'En cours', team: 5, deadline: '2025-11-15', color: 'blue' },
    { name: 'Projet Beta', progress: 60, status: 'En cours', team: 3, deadline: '2025-10-30', color: 'green' },
    { name: 'Projet Gamma', progress: 35, status: 'En cours', team: 4, deadline: '2025-12-20', color: 'purple' },
  ];

  const getProjectColor = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      red: 'from-red-500 to-red-600',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard Salarié" />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* background bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-white/50">
                  <div className={`h-1.5 bg-gradient-to-r ${stat.color}`}></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-16 h-16 ${stat.iconBg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        {/* ICON: make it visible by using a plain color (white) inside the colored rounded bg */}
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium mb-2">{stat.label}</h3>
                    <div className="flex items-end justify-between">
                      <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${stat.trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {stat.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span className="text-sm font-bold">{stat.percentage}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{stat.trend} ce mois</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Performance Chart */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <LineChart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Performance</h2>
                    <p className="text-sm text-gray-600">Évolution des 6 derniers mois</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">
                    {performanceData[performanceData.length - 1].score}%
                  </p>
                  <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +5.7% vs mois dernier
                  </p>
                </div>
              </div>

              {/* Bars: make each bar container full-height so inner % heights work */}
              <div className="h-64 flex items-end justify-between gap-4">
                {performanceData.map((data, index) => (
                  // direct child of the h-64 container gets h-full so % heights inside work
                  <div key={index} className="flex-1 flex flex-col items-center h-full">
                    <div className="flex-1 w-full flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-xl hover:from-purple-600 hover:to-purple-500 transition-all cursor-pointer shadow-lg relative group"
                        style={{ height: `${data.score}%` }}
                        aria-hidden
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {data.score}%
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 font-medium">{data.month}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Activity */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Activité</h2>
                  <p className="text-sm text-gray-600">Cette semaine</p>
                </div>
              </div>

              <div className="space-y-3">
                {weeklyActivity.map((day, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{day.day}</span>
                      <span className="text-sm font-bold text-gray-900">{day.hours}h</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${(day.hours / 8.5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Total cette semaine</p>
                <p className="text-3xl font-bold text-gray-900">38.5h</p>
                <p className="text-sm text-green-600 font-medium mt-1">+2.5h vs semaine dernière</p>
              </div>
            </div>
          </div>

          {/* Projects Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Mes Projets</h2>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                  Voir tout <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {projectsOverview.map((project, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:border-blue-300 bg-gradient-to-r from-white to-gray-50">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{project.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {project.team} membres
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(project.deadline).toLocaleDateString('fr-MA')}
                          </span>
                        </div>
                      </div>
                      <span className="px-4 py-1.5 text-sm font-medium rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                        {project.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progression</span>
                        <span className="font-semibold text-gray-900">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${project.progress === 100 ? 'from-green-500 to-green-600' : 'from-blue-500 to-blue-600'} transition-all duration-500 rounded-full`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                        <Clock className="w-3 h-3" />
                        <span>Échéance: {new Date(project.deadline).toLocaleDateString('fr-MA')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Events & Quick Actions */}
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Événements</h2>
                </div>

                <div className="space-y-3">
                  {upcomingEvents.map((event) => {
                    const Icon = event.icon;
                    return (
                      <div key={event.id} className={`flex items-start gap-3 p-3 rounded-xl ${event.bgColor} hover:shadow-md transition-all border-2 border-transparent hover:border-gray-200`}>
                        <div className={`w-12 h-12 ${event.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 border-2 ${event.color.replace('text', 'border')}`}>
                          <Icon className={`w-5 h-5 ${event.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">{event.title}</h4>
                          <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(event.date).toLocaleDateString('fr-MA')}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-xl">
                  <BarChart3 className="w-10 h-10 mb-3 opacity-80" />
                  <p className="text-3xl font-bold mb-1">94%</p>
                  <p className="text-sm text-blue-100">Taux complétion</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-xl">
                  <Zap className="w-10 h-10 mb-3 opacity-80" />
                  <p className="text-3xl font-bold mb-1">38h</p>
                  <p className="text-sm text-green-100">Cette semaine</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-xl">
                  <Award className="w-10 h-10 mb-3 opacity-80" />
                  <p className="text-3xl font-bold mb-1">47</p>
                  <p className="text-sm text-purple-100">Tâches finies</p>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white shadow-xl">
                  <Rocket className="w-10 h-10 mb-3 opacity-80" />
                  <p className="text-3xl font-bold mb-1">5</p>
                  <p className="text-sm text-amber-100">Projets actifs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
