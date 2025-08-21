"use client"

import { Head } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  Tooltip,
} from "recharts"
import { useState, useEffect } from "react"

const Dashboard = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  const staticData = {
    projects: 47,
    transformation: 73,
    technologies: 15,
    roi: 28,
    teams: 92,
    delivered: 164,
  }

  const quarterlyProjectData = [
    { name: "Q1 2024", projets: 23, budget: 2.4, equipes: 8, livraisons: 18 },
    { name: "Q2 2024", projets: 35, budget: 3.8, equipes: 12, livraisons: 28 },
    { name: "Q3 2024", projets: 28, budget: 3.2, equipes: 10, livraisons: 24 },
    { name: "Q4 2024", projets: 42, budget: 4.6, equipes: 15, livraisons: 38 },
    { name: "Q1 2025", projets: 47, budget: 5.2, equipes: 18, livraisons: 42 },
  ]

  const technologyAdoptionData = [
    { name: "Véhicules Électriques", value: 68, color: "#06e198ff", details: "Tesla Model S, BMW i4, Audi e-tron" },
    { name: "Véhicules Hybrides", value: 32, color: "#3e96e9ff", details: "Toyota Prius, Honda Insight, Ford Fusion" },
  ]

  const vehicleTechPerformance = [
    { name: "Batteries Li-ion", performance: 89, adoption: 95, cout: 78, innovation: 92 },
    { name: "Conduite Autonome", performance: 76, adoption: 45, cout: 85, innovation: 98 },
    { name: "Connectivité 5G", performance: 82, adoption: 67, cout: 72, innovation: 88 },
    { name: "Systèmes ADAS", performance: 91, adoption: 78, cout: 69, innovation: 85 },
    { name: "Moteurs Électriques", performance: 94, adoption: 88, cout: 75, innovation: 87 },
  ]

  const monthlyInnovationTrends = [
    { mois: "Jan", electrique: 24, hybride: 18, autonome: 12, connecte: 15 },
    { mois: "Fév", electrique: 32, hybride: 25, autonome: 18, connecte: 22 },
    { mois: "Mar", electrique: 28, hybride: 22, autonome: 15, connecte: 19 },
    { mois: "Avr", electrique: 38, hybride: 30, autonome: 24, connecte: 28 },
    { mois: "Mai", electrique: 45, hybride: 35, autonome: 28, connecte: 32 },
    { mois: "Jun", electrique: 52, hybride: 42, autonome: 35, connecte: 38 },
  ]

  const projectStatusData = [
    { name: "Véhicules Électriques", value: 78, fill: "#10B981", projets: 23, budget: "€2.4M" },
    { name: "Conduite Autonome", value: 65, fill: "#3B82F6", projets: 18, budget: "€3.8M" },
    { name: "Connectivité IoT", value: 52, fill: "#F59E0B", projets: 15, budget: "€1.9M" },
    { name: "Systèmes Hybrides", value: 43, fill: "#8B5CF6", projets: 12, budget: "€1.5M" },
  ]

  const vehicleInnovationKPIs = [
    {
      category: "Développement Électrique",
      projets_actifs: 23,
      budget_alloue: "€2.4M",
      equipes: 8,
      progression: 78,
      technologies: ["Batteries Li-ion", "Moteurs électriques", "Systèmes de charge"],
    },
    {
      category: "Conduite Autonome",
      projets_actifs: 18,
      budget_alloue: "€3.8M",
      equipes: 12,
      progression: 65,
      technologies: ["LiDAR", "Caméras 360°", "IA de navigation"],
    },
    {
      category: "Connectivité Véhiculaire",
      projets_actifs: 15,
      budget_alloue: "€1.9M",
      equipes: 6,
      progression: 82,
      technologies: ["5G", "V2X", "Infotainment"],
    },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}${entry.dataKey.includes("budget") ? "M€" : entry.dataKey.includes("performance") ? "%" : ""}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const breadcrumbs = [
    {
        title: 'Innovation & Transition Digitale Véhiculaire',
        href: 'innovation-transition/Dashboard',
    },
];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Innovation & Transition Digitale Véhiculaire" />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        {/* ... existing background elements ... */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>

        <div className="relative z-10 max-w-7xl mx-auto p-6 lg:p-8">
          {/* ... existing header ... */}
          

          

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div
              className={`bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white border-opacity-30 hover:shadow-2xl transform transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
              style={{ transitionDelay: "350ms" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full flex items-center justify-center mr-4 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Équipes R&D</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                      {staticData.teams}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Spécialisées véhicules</p>
                  <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                    <div className="w-4/5 h-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white border-opacity-30 hover:shadow-2xl transform transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
              style={{ transitionDelay: "400ms" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full flex items-center justify-center mr-4 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Prototypes Livrés</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">
                      {staticData.delivered}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Cette année</p>
                  <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                    <div className="w-5/6 h-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white border-opacity-30 hover:shadow-2xl transform transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
              style={{ transitionDelay: "450ms" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full flex items-center justify-center mr-4 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Budget Alloué</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">
                      €12.8M
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Utilisé: 78%</p>
                  <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                    <div className="w-4/5 h-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white border-opacity-30 hover:shadow-2xl transform transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
              style={{ transitionDelay: "500ms" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full flex items-center justify-center mr-4 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Brevets Déposés</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">
                      34
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">+12 ce trimestre</p>
                  <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                    <div className="w-3/4 h-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div
              className={`bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white border-opacity-30 transform transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
              style={{ transitionDelay: "550ms" }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">Évolution Projets Véhiculaires par Trimestre</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={quarterlyProjectData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="projets"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: "#3B82F6", strokeWidth: 2, r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="budget"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex justify-between text-sm text-gray-600">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>Projets
                </span>
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>Budget (M€)
                </span>
              </div>
            </div>

            <div
              className={`bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white border-opacity-30 transform transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
              style={{ transitionDelay: "600ms" }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">Répartition Technologies Véhiculaires</h2>
              <div className="flex items-center justify-center h-64">
                <div className="relative">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie data={technologyAdoptionData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                        {technologyAdoptionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">{technologyAdoptionData[0].value}%</div>
                      <div className="text-2xl font-bold text-gray-800">{technologyAdoptionData[1].value}%</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {technologyAdoptionData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                      {item.name}
                    </span>
                    <span className="font-semibold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div
              className={`bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white border-opacity-30 transform transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
              style={{ transitionDelay: "700ms" }}
            >
              <h2 className="text-lg font-bold text-gray-800 mb-6">Tendances Innovation Mensuelle</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyInnovationTrends}>
                    <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="electrique"
                      stackId="1"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="hybride"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="autonome"
                      stackId="1"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>Électrique
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>Hybride
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>Autonome
                </span>
              </div>
            </div>

            <div
              className={`bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white border-opacity-30 transform transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
              style={{ transitionDelay: "750ms" }}
            >
              <h2 className="text-lg font-bold text-gray-800 mb-6">Statut Projets par Catégorie</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={projectStatusData}>
                    <RadialBar dataKey="value" cornerRadius={10} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {projectStatusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: item.fill }}></div>
                      {item.name}
                    </span>
                    <span className="font-semibold">{item.projets} projets</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
            <div
              className={`bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white border-opacity-30 hover:shadow-2xl hover:scale-105 transform transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Projets Véhiculaires</p>
                  <p className="text-sm font-medium text-gray-600">Actifs</p>
                </div>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {staticData.projects}
              </p>
              <p className="text-xs text-gray-500 mt-2">+15% vs trimestre précédent</p>
            </div>

            <div
              className={`bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white border-opacity-30 hover:shadow-2xl hover:scale-105 transform transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
              style={{ transitionDelay: "100ms" }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Électrification</p>
                  <p className="text-sm font-medium text-gray-600">Complète</p>
                </div>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">
                {staticData.transformation}%
              </p>
              <p className="text-xs text-gray-500 mt-2">Objectif 2025: 85%</p>
            </div>

            <div
              className={`bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white border-opacity-30 hover:shadow-2xl hover:scale-105 transform transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
              style={{ transitionDelay: "200ms" }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Technologies</p>
                  <p className="text-sm font-medium text-gray-600">Émergentes</p>
                </div>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">
                {staticData.technologies}
              </p>
              <p className="text-xs text-gray-500 mt-2">IA, 5G, Batteries solides</p>
            </div>

            <div
              className={`bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white border-opacity-30 hover:shadow-2xl hover:scale-105 transform transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
              style={{ transitionDelay: "300ms" }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">ROI Moyen</p>
                  <p className="text-sm font-medium text-gray-600">Projets</p>
                </div>
              </div>
              <p className="text-4xl font-bold bg-grey bg-clip-text text-transparent">
                {staticData.roi}%
              </p>
              <p className="text-xs text-gray-500 mt-2">Retour sur 18 mois</p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default Dashboard
