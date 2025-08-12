import { NavFooter } from "@/components/nav-footer"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { NavItem, SharedData } from "@/types"
import { Link, usePage } from "@inertiajs/react"
import {
    LayoutDashboard,
    Route,
    Users,
    DollarSign,
    FileText,
    Megaphone,
    TrendingUp,
    Wrench,
    ClipboardList,
    Shield,
    Search,
    AlertTriangle,
    Lightbulb,
    Leaf,
    Package,
    Settings,
    Share2,
    Monitor,
    PenTool,
    Scale,
    Truck,
    ShoppingCart,
    Globe,
    BarChart3,
} from 'lucide-react';
import BetconsultingDashLogo from "./betconsulting-dash-logo"

export function AppSidebar() {
  const { auth } = usePage<SharedData>().props

  const roleDashboardMap: Record<string, string> = {
    admin: "/direction-generale/dashboard",
    "marches-marketing": "/marches-marketing/dashboard",
    "etudes-techniques": "/etudes-techniques/dashboard",
    "suivi-controle": "/suivi-controle/dashboard",
    "qualite-audit": "/qualite-audit/dashboard",
    "innovation-transition": "/innovation-transition/dashboard",
    "ressources-humaines": "/ressources-humaines/dashboard",
    "financier-comptabilite": "/financier-comptabilite/dashboard",
    "logistique-generaux": "/logistique-generaux/dashboard",
    "communication-digitale": "/communication-digitale/dashboard",
    juridique: "/juridique/dashboard",
    "fournisseurs-traitants": "/fournisseurs-traitants/dashboard",
  }

  const dashboardHref =
    auth?.user?.role && roleDashboardMap[auth.user.role] ? roleDashboardMap[auth.user.role] : "/dashboard"

  const mainNavItems: NavItem[] = [
      {
          title: 'Dashboard',
          href: dashboardHref,
          icon: LayoutDashboard,
      },

      // Ressources Humaines
      ...(auth?.user?.role === 'ressources-humaines'
          ? [
                {
                    title: 'Tracking',
                    href: '/ressources-humaines/tracking',
                    icon: Route,
                },
                {
                    title: 'Gestion du personnel',
                    href: '/ressources-humaines/gestion-personnel',
                    icon: Users,
                },
            ]
          : []),

      // Financier & Comptabilité
      ...(auth?.user?.role === 'financier-comptabilite'
          ? [
                {
                    title: 'Budget',
                    href: '/financier-comptabilite/budget',
                    icon: DollarSign,
                },
                {
                    title: 'Rapports financiers',
                    href: '/financier-comptabilite/rapports',
                    icon: BarChart3,
                },
            ]
          : []),

      // Marchés Marketing
      ...(auth?.user?.role === 'marches-marketing'
          ? [
                {
                    title: 'Campagnes',
                    href: '/marches-marketing/campagnes',
                    icon: Megaphone,
                },
                {
                    title: 'Analyse marché',
                    href: '/marches-marketing/analyse',
                    icon: TrendingUp,
                },
            ]
          : []),

      // Études Techniques
      ...(auth?.user?.role === 'etudes-techniques'
          ? [
                {
                    title: 'Projets techniques',
                    href: '/etudes-techniques/projets',
                    icon: Wrench,
                },
                {
                    title: 'Rapports techniques',
                    href: '/etudes-techniques/rapports',
                    icon: FileText,
                },
            ]
          : []),

      // Suivi & Contrôle
      ...(auth?.user?.role === 'suivi-controle'
          ? [
                {
                    title: 'Suivi projets',
                    href: '/suivi-controle/suivi-projets',
                    icon: ClipboardList,
                },
                {
                    title: 'Contrôles qualité',
                    href: '/suivi-controle/qualite',
                    icon: Shield,
                },
            ]
          : []),

      // Qualité & Audit
      ...(auth?.user?.role === 'qualite-audit'
          ? [
                {
                    title: 'Audits',
                    href: '/qualite-audit/audits',
                    icon: Search,
                },
                {
                    title: 'Non-conformités',
                    href: '/qualite-audit/non-conformites',
                    icon: AlertTriangle,
                },
            ]
          : []),

      // Innovation & Transition
      ...(auth?.user?.role === 'innovation-transition'
          ? [
                {
                    title: 'Projets innovants',
                    href: '/innovation-transition/projets',
                    icon: Lightbulb,
                },
                {
                    title: 'Transition écologique',
                    href: '/innovation-transition/transition-ecologique',
                    icon: Leaf,
                },
            ]
          : []),

      // Logistique & Services Généraux
      ...(auth?.user?.role === 'logistique-generaux'
          ? [
                {
                    title: 'Gestion stocks',
                    href: '/logistique-generaux/stocks',
                    icon: Package,
                },
                {
                    title: 'Moyens généraux',
                    href: '/logistique-generaux/moyens',
                    icon: Settings,
                },
            ]
          : []),

      // Communication Digitale
      ...(auth?.user?.role === 'communication-digitale'
          ? [
                {
                    title: 'Réseaux sociaux',
                    href: '/communication-digitale/reseaux-sociaux',
                    icon: Share2,
                },
                {
                    title: 'Campagnes digitales',
                    href: '/communication-digitale/campagnes',
                    icon: Monitor,
                },
            ]
          : []),

      // Juridique
      ...(auth?.user?.role === 'juridique'
          ? [
                {
                    title: 'Contrats',
                    href: '/juridique/contrats',
                    icon: PenTool,
                },
                {
                    title: 'Contentieux',
                    href: '/juridique/contentieux',
                    icon: Scale,
                },
            ]
          : []),

      // Fournisseurs & Traitants
      ...(auth?.user?.role === 'fournisseurs-traitants'
          ? [
                {
                    title: 'Gestion fournisseurs',
                    href: '/fournisseurs-traitants/gestion',
                    icon: Truck,
                },
                {
                    title: 'Suivi commandes',
                    href: '/fournisseurs-traitants/commandes',
                    icon: ShoppingCart,
                },
            ]
          : []),

      // Direction Générale (admin)
      ...(auth?.user?.role === 'admin'
          ? [
                {
                    title: 'Vue globale',
                    href: '/direction-generale/vue-globale',
                    icon: Globe,
                },
                {
                    title: 'Rapports stratégiques',
                    href: '/direction-generale/rapports',
                    icon: BarChart3,
                },
            ]
          : []),
  ];

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <SidebarMenuButton size="lg" asChild>
                <Link href={dashboardHref} prefetch className="flex w-full items-center justify-center">
                  <BetconsultingDashLogo className="w-[140px]" />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavFooter items={[]} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
