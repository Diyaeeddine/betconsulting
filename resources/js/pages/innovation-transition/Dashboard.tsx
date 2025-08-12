"use client";

import { useState } from "react";
import AppLayout from "../../layouts/app-layout";
import MetricCard from "../../components/ui/MetricCard";
import StatsGrid from "../../components/ui/StatsGrid";
import ChartContainer from "../../components/ui/ChartContainer";
import ExportButton from "../../components/ui/ExportButton";
import TicketTrendChart from "../../components/charts/TicketTrendChart";
import SatisfactionChart from "../../components/charts/SatisfactionChart";
import AgentPerformanceChart from "../../components/charts/AgentPerformanceChart";
import ProblemeFrequentChart from "../../components/charts/ProblemeFrequentChart";
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  BoltIcon,
  FaceSmileIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

// Types
type PeriodType = "7d" | "30d" | "90d";
type ExportFormat = "excel" | "pdf";
type AlertType = "error" | "warning" | "success";

interface PageProps {
  auth?: {
    user?: {
      id: number;
      name: string;
      email: string;
    };
  };
}

interface DashboardProps extends PageProps {
  metrics?: Metriques;
  alerts?: Alert[];
  // Autres props spécifiques au dashboard
}
interface Metriques {
  totalTickets: number;
  ticketsOuverts: number;
  ticketsEnAttente: number;
  ticketsResolus: number;
  tempsResolutionMoyen: number;
  tauxSatisfaction: number;
  problemesCritiques: number;
}

interface TendanceTicket {
  date: string;
  nouveaux: number;
  resolus: number;
  enAttente: number;
}

interface SatisfactionData {
  periode: string;
  satisfaction: number;
  objectif: number;
}

interface PerformanceAgent {
  agent: string;
  ticketsTraites: number;
  tempsResolution: number;
  satisfaction: number;
}

interface ProblemeFrequent {
  categorie: string;
  nombre: number;
  pourcentage: number;
}

interface MetricTableRow {
  metric: string;
  currentValue: string;
  target: string;
  status: "Atteint" | "Non atteint" | "En cours";
  statusColor: "green" | "red" | "yellow";
}

interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  timestamp: string;
}

// Données par défaut
const defaultMetriques: Metriques = {
  totalTickets: 1247,
  ticketsOuverts: 89,
  ticketsEnAttente: 34,
  ticketsResolus: 1124,
  tempsResolutionMoyen: 4.2,
  tauxSatisfaction: 94.5,
  problemesCritiques: 12,
};

const defaultTendanceTickets: TendanceTicket[] = [
  { date: "01/08", nouveaux: 45, resolus: 38, enAttente: 12 },
  { date: "02/08", nouveaux: 52, resolus: 41, enAttente: 15 },
  { date: "03/08", nouveaux: 38, resolus: 47, enAttente: 8 },
  { date: "04/08", nouveaux: 61, resolus: 35, enAttente: 18 },
  { date: "05/08", nouveaux: 43, resolus: 52, enAttente: 11 },
  { date: "06/08", nouveaux: 55, resolus: 48, enAttente: 14 },
  { date: "07/08", nouveaux: 49, resolus: 44, enAttente: 16 },
];

const defaultSatisfactionData: SatisfactionData[] = [
  { periode: "Sem 1", satisfaction: 92, objectif: 90 },
  { periode: "Sem 2", satisfaction: 94, objectif: 90 },
  { periode: "Sem 3", satisfaction: 89, objectif: 90 },
  { periode: "Sem 4", satisfaction: 96, objectif: 90 },
];

const defaultPerformanceAgents: PerformanceAgent[] = [
  { agent: "Ahmed B.", ticketsTraites: 156, tempsResolution: 3.8, satisfaction: 96 },
  { agent: "Fatima K.", ticketsTraites: 142, tempsResolution: 4.1, satisfaction: 94 },
  { agent: "Youssef M.", ticketsTraites: 138, tempsResolution: 4.5, satisfaction: 92 },
  { agent: "Aicha L.", ticketsTraites: 134, tempsResolution: 3.9, satisfaction: 95 },
];

const defaultProblemesFrequents: ProblemeFrequent[] = [
  { categorie: "Problèmes réseau", nombre: 245, pourcentage: 35 },
  { categorie: "Logiciels", nombre: 189, pourcentage: 27 },
  { categorie: "Matériel", nombre: 134, pourcentage: 19 },
  { categorie: "Accès/Permissions", nombre: 98, pourcentage: 14 },
  { categorie: "Autres", nombre: 35, pourcentage: 5 },
];

const defaultAlerts: Alert[] = [
  {
    id: "1",
    type: "error",
    title: "Problème critique détecté",
    message: "Serveur de base de données principal en surcharge - Intervention immédiate requise",
    timestamp: "Il y a 5 minutes"
  },
  {
    id: "2",
    type: "warning",
    title: "Maintenance programmée",
    message: "Mise à jour système prévue demain de 14h à 16h - Services temporairement indisponibles",
    timestamp: "Il y a 2 heures"
  },
  {
    id: "3",
    type: "success",
    title: "Objectif de satisfaction atteint",
    message: "Le taux de satisfaction client a dépassé l'objectif de 90% ce mois-ci (94.5%)",
    timestamp: "Il y a 1 jour"
  }
];

// Composant Alert
interface AlertItemProps {
  alert: Alert;
}

const AlertItem = ({ alert }: AlertItemProps) => {
  const getAlertConfig = (type: AlertType) => {
    switch (type) {
      case "error":
        return {
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconColor: "text-red-400",
          titleColor: "text-red-800",
          messageColor: "text-red-700",
          timestampColor: "text-red-600",
          icon: <ExclamationTriangleIcon className="w-5 h-5" />
        };
      case "warning":
        return {
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          iconColor: "text-yellow-400",
          titleColor: "text-yellow-800",
          messageColor: "text-yellow-700",
          timestampColor: "text-yellow-600",
          icon: <ExclamationTriangleIcon className="w-5 h-5" />
        };
      case "success":
        return {
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconColor: "text-green-400",
          titleColor: "text-green-800",
          messageColor: "text-green-700",
          timestampColor: "text-green-600",
          icon: <CheckCircleIcon className="w-5 h-5" />
        };
    }
  };

  const config = getAlertConfig(alert.type);

  return (
    <div className={`flex items-start p-4 ${config.bgColor} border ${config.borderColor} rounded-lg`}>
      <div className="flex-shrink-0">
        <div className={`${config.iconColor} mt-0.5`}>
          {config.icon}
        </div>
      </div>
      <div className="ml-3 flex-1">
        <h4 className={`text-sm font-medium ${config.titleColor}`}>
          {alert.title}
        </h4>
        <p className={`text-sm ${config.messageColor} mt-1`}>
          {alert.message}
        </p>
        <p className={`text-xs ${config.timestampColor} mt-2`}>
          {alert.timestamp}
        </p>
      </div>
    </div>
  );
};

// Composant StatusBadge
interface StatusBadgeProps {
  status: MetricTableRow['status'];
  color: MetricTableRow['statusColor'];
}

const StatusBadge = ({ status, color }: StatusBadgeProps) => {
  const colorClasses = {
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800"
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colorClasses[color]}`}>
      {status}
    </span>
  );
};


export default function Dashboard({ auth }: DashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("30d");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Données - à remplacer par vos vraies données depuis le contrôleur
  const metriques = defaultMetriques;
  const tendanceTickets = defaultTendanceTickets;
  const satisfactionData = defaultSatisfactionData;
  const performanceAgents = defaultPerformanceAgents;
  const problemesFrequents = defaultProblemesFrequents;
  const alerts = defaultAlerts;

  // Données du tableau récapitulatif
  const metricsTableData: MetricTableRow[] = [
    {
      metric: "Temps de résolution moyen",
      currentValue: `${metriques.tempsResolutionMoyen}h`,
      target: "≤ 6h",
      status: "Atteint",
      statusColor: "green"
    },
    {
      metric: "Taux de satisfaction",
      currentValue: `${metriques.tauxSatisfaction}%`,
      target: "≥ 90%",
      status: "Atteint",
      statusColor: "green"
    },
    {
      metric: "Tickets en attente",
      currentValue: metriques.ticketsEnAttente.toString(),
      target: "≤ 50",
      status: "Atteint",
      statusColor: "green"
    }
  ];

  const handleExport = async (format: ExportFormat): Promise<void> => {
    setIsExporting(true);
    try {
      // Ici vous ajouteriez la logique d'export
      // Exemple: await Inertia.post('/innovation-transition/export', { format, period: selectedPeriod });
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Exporting in ${format} format for period ${selectedPeriod}`);
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const refreshData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Ici vous rechargeriez les données
      // Exemple: Inertia.reload({ only: ['metrics', 'charts'] });
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Data refreshed for period:", selectedPeriod);
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPeriod(event.target.value as PeriodType);
    // Optionnel: déclencher un rechargement automatique des données
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header avec titre, informations utilisateur et contrôles */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Support Technique</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-600">Innovation & Transition Digitale - Suivi des performances</p>
              {auth?.user && (
                <span className="text-sm text-gray-500">
                  • Connecté en tant que <strong>{auth.user.name}</strong>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Afficher l'utilisateur connecté */}
            {auth?.user && (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{auth.user.name}</p>
                <p className="text-xs text-gray-500">{auth.user.email}</p>
              </div>
            )}

            <select
              value={selectedPeriod}
              onChange={handlePeriodChange}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
            </select>

            <button
              onClick={refreshData}
              disabled={isLoading}
              type="button"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {isLoading ? "Actualisation..." : "Actualiser"}
            </button>

            <ExportButton onExport={handleExport} isLoading={isExporting} />
          </div>
        </div>

        {/* KPIs Principaux */}
        <StatsGrid columns={4}>
          <MetricCard
            title="Total Tickets"
            value={metriques.totalTickets.toLocaleString()}
            change={{ value: 12, type: "increase" }}
            icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
            color="blue"
          />

          <MetricCard
            title="Tickets Ouverts"
            value={metriques.ticketsOuverts}
            change={{ value: 8, type: "decrease" }}
            icon={<ClockIcon className="w-6 h-6" />}
            color="red"
          />

          <MetricCard
            title="Temps Résolution Moyen"
            value={`${metriques.tempsResolutionMoyen}h`}
            change={{ value: 15, type: "decrease" }}
            icon={<BoltIcon className="w-6 h-6" />}
            color="green"
          />

          <MetricCard
            title="Taux Satisfaction"
            value={`${metriques.tauxSatisfaction}%`}
            change={{ value: 3, type: "increase" }}
            icon={<FaceSmileIcon className="w-6 h-6" />}
            color="green"
          />
        </StatsGrid>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Évolution des tickets */}
          <ChartContainer title="Évolution des Tickets" className="lg:col-span-2">
            <TicketTrendChart data={tendanceTickets} />
          </ChartContainer>

          {/* Problèmes fréquents */}
          <ChartContainer title="Problèmes les Plus Fréquents">
            <ProblemeFrequentChart data={problemesFrequents} />
          </ChartContainer>

          {/* Taux de satisfaction */}
          <ChartContainer title="Évolution Satisfaction Client">
            <SatisfactionChart data={satisfactionData} />
          </ChartContainer>
        </div>

        {/* Performance des agents */}
        <ChartContainer title="Performance des Agents Support">
          <AgentPerformanceChart data={performanceAgents} />
        </ChartContainer>

        {/* Tableau récapitulatif */}
        <ChartContainer title="Résumé Détaillé des Métriques">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Métrique
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valeur Actuelle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Objectif
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metricsTableData.map((row, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.metric}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.currentValue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.target}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={row.status} color={row.statusColor} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartContainer>

        {/* Alertes et notifications */}
        <ChartContainer title="Alertes & Notifications Récentes">
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        </ChartContainer>
      </div>
    </AppLayout>
  );
}
