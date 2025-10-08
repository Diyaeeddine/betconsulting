import AppLayout from "@/layouts/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Download, FileText, BarChart3, Settings } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const kpiData = [
  {
    title: "Chiffre d'affaires total",
    value: "1.8 Md MAD",
    change: "+12% vs année précédente",
    changeType: "positive",
  },
  {
    title: "Marge moyenne",
    value: "18.5%",
    change: "+2.3% amélioration continue",
    changeType: "positive",
  },
  {
    title: "Délai moyen",
    value: "14.2 mois",
    change: "-1.8 mois optimisation des processus",
    changeType: "negative",
  },
  {
    title: "Taux de réussite AO",
    value: "68%",
    change: "+5% performance en hausse",
    changeType: "positive",
  },
]

const evolutionData = [
  { month: "Jan", value: 9 },
  { month: "Fév", value: 7 },
  { month: "Mar", value: 25 },
  { month: "Avr", value: 18 },
  { month: "Mai", value: 33 },
  { month: "Jun", value: 32 },
  { month: "Jul", value: 16 },
  { month: "Aoû", value: 35 },
  { month: "Sep", value: 18 },
  { month: "Oct", value: 25 },
  { month: "Nov", value: 22 },
  { month: "Déc", value: 24 },
]

const marchesData = [
  { month: "Jan", count: 3 },
  { month: "Fév", count: 2 },
  { month: "Mar", count: 5 },
  { month: "Avr", count: 4 },
  { month: "Mai", count: 6 },
  { month: "Jun", count: 5 },
  { month: "Jul", count: 3 },
  { month: "Aoû", count: 4 },
  { month: "Sep", count: 7 },
  { month: "Oct", count: 5 },
  { month: "Nov", count: 3 },
  { month: "Déc", count: 4 },
]

export default function Marches() {
const breadcrumbs = [
  { title: "Marchés & Marketing", href: "/marches-marketing/dashboard" },
  { title: "Global marchés", href: "/marches-marketing/marches" },
]


  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-6 p-6">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpiData.map((kpi, index) => (
            <Card key={index} className="relative">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                <div className="h-4 w-4 text-green-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
                    <polyline points="16,7 22,7 22,13" />
                  </svg>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className={`text-xs ${kpi.changeType === "positive" ? "text-green-600" : "text-blue-600"}`}>
                  {kpi.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Filtrer les données par période ou critères..." className="pl-10" />
          </div>
          <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
            <Filter className="h-4 w-4" />
            <span>Filtres</span>
          </Button>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="evolution" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="evolution">Évolution temporelle</TabsTrigger>
            <TabsTrigger value="repartition">Répartition</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="equipes">Équipes</TabsTrigger>
          </TabsList>

          <TabsContent value="evolution" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Evolution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Évolution mensuelle - Valeur (M MAD)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: "Valeur",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={evolutionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
                        <YAxis axisLine={false} tickLine={false} className="text-xs" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#8b5cf6"
                          fill="#8b5cf6"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Marches Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Nombre de marchés par mois</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: {
                        label: "Nombre",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={marchesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
                        <YAxis axisLine={false} tickLine={false} className="text-xs" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="repartition">
            <Card>
              <CardContent className="flex h-[400px] items-center justify-center">
                <p className="text-muted-foreground">Contenu de répartition à venir</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardContent className="flex h-[400px] items-center justify-center">
                <p className="text-muted-foreground">Contenu de performance à venir</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipes">
            <Card>
              <CardContent className="flex h-[400px] items-center justify-center">
                <p className="text-muted-foreground">Contenu d'équipes à venir</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions rapides */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Actions rapides</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="default" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Exporter rapport</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <FileText className="h-4 w-4" />
              <span>Rapport mensuel</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <BarChart3 className="h-4 w-4" />
              <span>Analyse approfondie</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <Settings className="h-4 w-4" />
              <span>Filtres avancés</span>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
