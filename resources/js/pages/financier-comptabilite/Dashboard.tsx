import AppLayout from "@/layouts/app-layout"
import { Car, Package, DollarSign, CreditCard, TrendingUp, Plus } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const breadcrumbs = [
  {
    title: "Dashboard Financier & Comptabilité",
    href: "/financier-comptabilite/dashboard",
  },
]

// Sample data for charts
const incomeExpenseData = [
  { month: "Jan", income: 45000, expenses: 32000 },
  { month: "Fév", income: 52000, expenses: 38000 },
  { month: "Mar", income: 48000, expenses: 35000 },
  { month: "Avr", income: 61000, expenses: 42000 },
  { month: "Mai", income: 55000, expenses: 39000 },
  { month: "Jun", income: 67000, expenses: 45000 },
]

const expenseBreakdown = [
  { name: "Carburant", value: 35, color: "#10B981" },
  { name: "Maintenance", value: 25, color: "#F59E0B" },
  { name: "Salaires", value: 30, color: "#3B82F6" },
  { name: "Projets", value: 10, color: "#8B5CF6" },
]

const recentTransactions = [
  { id: 1, date: "2024-01-15", type: "Facture", description: "Transport Projet Sahara", amount: 15000, status: "Payé" },
  { id: 2, date: "2024-01-14", type: "Dépense", description: "Carburant Véhicule #23", amount: -850, status: "Payé" },
  {
    id: 3,
    date: "2024-01-13",
    type: "Facture",
    description: "Livraison Casablanca",
    amount: 8500,
    status: "En attente",
  },
  {
    id: 4,
    date: "2024-01-12",
    type: "Dépense",
    description: "Maintenance Véhicule #15",
    amount: -1200,
    status: "Payé",
  },
]

const projects = [
  { name: "Projet Sahara", client: "Client A", budget: 50000, spent: 32000, status: "En cours" },
  { name: "Transport Agadir", client: "Client B", budget: 25000, spent: 18000, status: "En cours" },
  { name: "Livraison Express", client: "Client C", budget: 15000, spent: 15000, status: "Terminé" },
]

const notifications = [
  { id: 1, message: "Facture #1205 est en retard", type: "warning", time: "2h" },
  { id: 2, message: "Projet Sahara mis à jour", type: "info", time: "4h" },
  { id: 3, message: "Véhicule #34 nécessite une maintenance", type: "alert", time: "6h" },
]

export default function FinancierComptabilite() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        {/* Header KPIs */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-balance">Dashboard Financier & Comptabilité</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Active Vehicles Card */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/70 hover:backdrop-blur-3xl">
              <div className="flex items-center justify-between mb-4">
                <Car className="w-8 h-8 text-emerald-600" />
                <span className="text-xs text-emerald-600 font-medium">+5% ce mois</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">24</div>
              <div className="text-sm text-gray-600">Véhicules Actifs</div>
            </div>

            {/* Ongoing Projects Card */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/70 hover:backdrop-blur-3xl">
              <div className="flex items-center justify-between mb-4">
                <Package className="w-8 h-8 text-blue-600" />
                <span className="text-xs text-blue-600 font-medium">+12% ce mois</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">18</div>
              <div className="text-sm text-gray-600">Projets en Cours</div>
            </div>

            {/* Monthly Revenue Card */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/70 hover:backdrop-blur-3xl">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-amber-600" />
                <span className="text-xs text-amber-600 font-medium">+8% ce mois</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">67K</div>
              <div className="text-sm text-gray-600">Revenus Mensuels</div>
            </div>

            {/* Monthly Expenses Card */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/70 hover:backdrop-blur-3xl">
              <div className="flex items-center justify-between mb-4">
                <CreditCard className="w-8 h-8 text-red-600" />
                <span className="text-xs text-red-600 font-medium">+3% ce mois</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">45K</div>
              <div className="text-sm text-gray-600">Dépenses Mensuelles</div>
            </div>

            {/* Profit Margin Card */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/70 hover:backdrop-blur-3xl">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-emerald-600" />
                <span className="text-xs text-emerald-600 font-medium">+2% ce mois</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">33%</div>
              <div className="text-sm text-gray-600">Marge Bénéficiaire</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Income vs Expenses Chart */}
          <div className="bg-white/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/50 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Revenus vs Dépenses (6 derniers mois)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={incomeExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid rgba(229, 231, 235, 0.8)",
                      borderRadius: "12px",
                      color: "#1F2937",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                  <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} name="Revenus" />
                  <Line type="monotone" dataKey="expenses" stroke="#F59E0B" strokeWidth={3} name="Dépenses" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense Breakdown Chart */}
          <div className="bg-white/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/50 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Répartition des Dépenses</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid rgba(229, 231, 235, 0.8)",
                      borderRadius: "12px",
                      color: "#1F2937",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {expenseBreakdown.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-700">
                    {item.name} ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data & Activity Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Recent Transactions */}
          <div className="xl:col-span-2 bg-white/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/50 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Transactions Récentes</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-sm font-medium text-gray-600 pb-3">Date</th>
                    <th className="text-left text-sm font-medium text-gray-600 pb-3">Type</th>
                    <th className="text-left text-sm font-medium text-gray-600 pb-3">Description</th>
                    <th className="text-right text-sm font-medium text-gray-600 pb-3">Montant</th>
                    <th className="text-center text-sm font-medium text-gray-600 pb-3">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-white/50 transition-colors">
                      <td className="py-4 text-sm text-gray-600">{transaction.date}</td>
                      <td className="py-4 text-sm text-gray-600">{transaction.type}</td>
                      <td className="py-4 text-sm text-gray-900">{transaction.description}</td>
                      <td
                        className={`py-4 text-sm text-right font-medium ${transaction.amount > 0 ? "text-emerald-600" : "text-red-600"}`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount.toLocaleString()} DH
                      </td>
                      <td className="py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.status === "Payé"
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : "bg-amber-100 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vehicle Utilization */}
          <div className="bg-white/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/50 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Utilisation de la Flotte</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-600 mb-2">78%</div>
                <div className="text-sm text-gray-600">Flotte en utilisation</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 rounded-full"
                  style={{ width: "78%" }}
                ></div>
              </div>
              <div className="space-y-3 mt-6">
                <div className="flex items-center justify-between p-3 bg-white/40 backdrop-blur-xl rounded-lg">
                  <span className="text-sm text-gray-600">Véhicules actifs</span>
                  <span className="text-sm font-medium text-emerald-600">24/31</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/40 backdrop-blur-xl rounded-lg">
                  <span className="text-sm text-gray-600">Maintenance requise</span>
                  <span className="text-sm font-medium text-amber-600">3</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/40 backdrop-blur-xl rounded-lg">
                  <span className="text-sm text-gray-600">Disponibles</span>
                  <span className="text-sm font-medium text-blue-600">4</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Overview */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Aperçu des Projets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <div
                key={index}
                className="bg-white/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/70 hover:backdrop-blur-3xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">{project.name}</h4>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === "En cours"
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-4">{project.client}</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budget vs Dépensé</span>
                    <span className="text-gray-900 font-medium">
                      {project.spent.toLocaleString()} / {project.budget.toLocaleString()} DH
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(project.spent / project.budget) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section - Quick Actions & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/50 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Actions Rapides</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center gap-3 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
                <Plus className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Nouvelle Facture</span>
              </button>
              <button className="flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20">
                <CreditCard className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-700">Ajouter Dépense</span>
              </button>
              <button className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                <Car className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Assigner Véhicule</span>
              </button>
              <button className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                <Package className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Démarrer Projet</span>
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/50 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Notifications</h3>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-4 bg-white/40 backdrop-blur-xl rounded-xl hover:bg-white/60 transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      notification.type === "warning"
                        ? "bg-amber-500"
                        : notification.type === "alert"
                          ? "bg-red-500"
                          : "bg-blue-500"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">Il y a {notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
