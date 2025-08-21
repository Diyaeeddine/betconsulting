import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const breadcrumbs = [
  {
    title: "Tableau de bord audit SEO",
    href: "/qualite-audit/dashboard",
  },
]

const siteHealthData = [
  { name: "Santé", value: 59, color: "hsl(var(--chart-1))" },
  { name: "Restant", value: 41, color: "hsl(var(--muted))" },
]

const crawledPagesData = {
  total: 3510,
  segments: [
    { name: "Saines", value: 5, color: "hsl(var(--chart-1))" },
    { name: "Cassées", value: 5, color: "hsl(var(--destructive))" },
    { name: "Ont des problèmes", value: 3365, color: "hsl(var(--chart-4))" },
    { name: "Redirections", value: 140, color: "hsl(var(--chart-2))" },
    { name: "Bloquées", value: 8, color: "hsl(var(--chart-5))" },
  ],
}

const thematicReports = [
  { name: "Crawlabilité", value: 72 },
  { name: "Https", value: 95 },
  { name: "SEO international", value: 77 },
  { name: "Core web vitals", value: 35 },
  { name: "Performance du site", value: 87 },
  { name: "Liens internes", value: 88 },
  { name: "Balisage", value: 98 },
]

export default function QualiteAudit() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tableau de bord audit SEO" />

      <div className="min-h-screen bg-background">
        <div className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/3 to-accent/3 opacity-30"></div>
          <div className="relative max-w-7xl mx-auto p-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  Audit SEO en temps réel
                </div>
                <h1 className="text-4xl font text-foreground mb-4 leading-tight">
                  Tableau de bord audit SEO pour gérer les défis du trafic du site
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-4xl">
                  Ce tableau de bord présente le suivi des défis qui peuvent potentiellement créer des problèmes pour
                  générer du trafic vers le site web de l'entreprise. Les métriques clés incluses ici sont la santé du
                  site, les pages explorées, les erreurs, les avertissements, les avis, etc.
                </p>
              </div>
              <div className="relative">
                <div className="w-32 h-20 bg-gradient-to-r from-primary to-accent rounded-xl shadow-lg opacity-90"></div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full shadow-md"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              <div className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <h3 className="text-xl font-bold text-card-foreground">Santé du site</h3>
                </div>
                <div className="relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={siteHealthData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        startAngle={90}
                        endAngle={-90}
                        dataKey="value"
                      >
                        {siteHealthData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font text-card-foreground">59%</div>
                      <div className="text-sm text-primary font-semibold bg-primary/10 px-2 py-1 rounded-full">+5%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                  <h3 className="text-xl font-bold text-card-foreground">Pages explorées</h3>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-3xl font text-card-foreground">
                    {crawledPagesData.total.toLocaleString()}
                  </div>
                  <div className="flex-1">
                    <div className="flex h-3 bg-muted rounded-full overflow-hidden shadow-inner">
                      {crawledPagesData.segments.map((segment, index) => (
                        <div
                          key={index}
                          className="h-full transition-all duration-300 hover:opacity-80"
                          style={{
                            width: `${(segment.value / crawledPagesData.total) * 100}%`,
                            backgroundColor: segment.color,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {crawledPagesData.segments.map((segment, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: segment.color }} />
                        <span className="text-card-foreground font-medium">{segment.name}</span>
                      </div>
                      <span className="text-muted-foreground font-semibold">{segment.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 group">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-card-foreground">Erreurs</h3>
                    <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                      <div className="w-5 h-5 bg-destructive rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-3xl font text-card-foreground">3,085</div>
                  <div className="text-sm text-destructive font-medium mt-2">Nécessite attention</div>
                </div>
                <div className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 group">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-card-foreground">Avertissements</h3>
                    <div className="w-10 h-10 bg-chart-4/10 rounded-lg flex items-center justify-center group-hover:bg-chart-4/20 transition-colors">
                      <div className="w-5 h-5 bg-chart-4 rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-3xl font text-card-foreground">51,205</div>
                  <div className="text-sm text-chart-4 font-medium mt-2">À surveiller</div>
                </div>
                <div className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 group">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-card-foreground">Avis</h3>
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <div className="w-5 h-5 bg-primary rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-3xl font text-card-foreground">24,723</div>
                  <div className="text-sm text-primary font-medium mt-2">Optimisations possibles</div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                  <h3 className="text-xl font-bold text-card-foreground">Rapports thématiques</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {thematicReports.map((report, index) => (
                    <div key={index} className="text-center group">
                      <div className="text-sm font-semibold text-card-foreground mb-4 group-hover:text-primary transition-colors">
                        {report.name}
                      </div>
                      <div className="relative w-20 h-20 mx-auto mb-3">
                        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="hsl(var(--muted))"
                            strokeWidth="2"
                          />
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={
                              report.value >= 80
                                ? "hsl(var(--chart-1))"
                                : report.value >= 60
                                  ? "hsl(var(--chart-2))"
                                  : "hsl(var(--chart-4))"
                            }
                            strokeWidth="3"
                            strokeDasharray={`${report.value}, 100`}
                            className="transition-all duration-500 group-hover:stroke-[4]"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font text-card-foreground">{report.value}%</span>
                        </div>
                      </div>
                      <div
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          report.value >= 80
                            ? "bg-chart-1/10 text-chart-1"
                            : report.value >= 60
                              ? "bg-chart-2/10 text-chart-2"
                              : "bg-chart-4/10 text-chart-4"
                        }`}
                      >
                        {report.value >= 80 ? "Excellent" : report.value >= 60 ? "Bon" : "À améliorer"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-muted/30 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <p className="text-center text-sm text-muted-foreground">
                Ce graphique est lié à Excel et se met à jour automatiquement en fonction des données. Cliquez
                simplement dessus avec le bouton gauche et sélectionnez 'Modifier les données'.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
