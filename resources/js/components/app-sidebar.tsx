import { NavFooter } from "@/components/nav-footer"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenuButton } from "@/components/ui/sidebar"
import type { NavItem, SharedData } from "@/types"
import { FolderKanban, LayoutDashboard, TrendingUp,MessageCircleCode,Send, UserPlus,FileCheck, BadgeCheck, FileSliders,FileText, AlertCircle, MapPin,Calendar,LayoutGrid, Globe,BookOpen, SquareArrowOutUpRight, ShoppingCart, Briefcase, Settings,Users,Rss,Building2,Clock3,Ban,CircleX,CircleCheckBig,Gavel,Paperclip,CalendarClock,Handshake, } from "lucide-react"
import { Link, usePage } from "@inertiajs/react"
import BetconsultingDashLogo from "./betconsulting-dash-logo"
import { Route, Car, Wrench } from "lucide-react"
import { Notifications } from "./ui/notifications"  

export function AppSidebar() {
  const { auth } = usePage<SharedData>().props

  // Type assertion to fix the permissions issue
  const userPermissions = (auth?.user?.permissions as string[]) || [];

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
  auth?.user?.role && roleDashboardMap[auth.user.role]
    ? roleDashboardMap[auth.user.role]
    : "/dashboard";

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: dashboardHref,
    icon: LayoutDashboard,
  },

  // Ressources Humaines
  ...(auth?.user?.role === "ressources-humaines"
    ? [
        {
          title: "Résultats Appels d'Offres",
          href: "/ressources-humaines/global-marches",
          icon: BookOpen,
        },
        {
          title: "Bons de Commande",
          href: "/ressources-humaines/bons-commandes",
          icon: ShoppingCart,
        },
        {
          title: "Résultats Bon de Commande",
          href: "/ressources-humaines/resultats-bon-commande-page",
          icon: BookOpen,
        },
        {
          title: "Tracking",
          href: "/ressources-humaines/tracking",
          icon: Route, // kept your icon
        },
        {
          title: "Projets",
          href: "/ressources-humaines/projets",
          icon: FolderKanban, // kept your icon
        },
        {
          title: "Véhicules",
          href: "/ressources-humaines/vehicules",
          icon: Car,
        },
        {
          title: "Matériels",
          href: "/ressources-humaines/materiels",
          icon: Wrench,
        },
        {
          title: "Progressions",
          href: "/ressources-humaines/progressions",
          icon: TrendingUp, // kept your icon
        },
        {
          title: "Formations",
          href: "/ressources-humaines/formations",
          icon: BookOpen,
        },
        {
          title: "Sous traitents",
          href: "/ressources-humaines/sousTrais",
          icon: Users,
        },
        {
          title: "Accès",
          href: "/ressources-humaines/access",
          icon: UserPlus,
        },
        {
          title: 'Marchés Publics',
          href: '/ressources-humaines/marche-public-page',
          icon: BookOpen,
        },
        {
        title: "Validation Documents",
        href: "/ressources-humaines/MethodologyValidation",
        icon: BadgeCheck, // Import: import { FileCheck } from 'lucide-react';
        },
        {
        title: "Validation Références",
        href: "/ressources-humaines/references",
        icon: FileText,
        },
        {
        title: "Documents CNSS",
        href: "/ressources-humaines/CNSSDocuments",
        icon: FileText,
        },

        {
        title: "Contrats Déclarations",
        href: "/ressources-humaines/ContractsDeclarations",
        icon: FileText,
        },
        
        {
        title: "CV Diplômes",
        href: "/ressources-humaines/CVsDiplomas",
        icon: FileText,
        },

        {
        title: "Validation",
        href: "/ressources-humaines/TeamValidation",
        icon: FileText,
        },

        {
        title: "Entretien",
        href: "/ressources-humaines/entretiens",
        icon: MessageCircleCode,
        },
        {
        title: "Profils Demandés",
        href: "/ressources-humaines/profils/demandes",
        icon: MessageCircleCode,
        },


      ]
    : []),

  // suivi-controle des travaux
  ...(auth?.user?.role === "suivi-controle"
    ? [
        {
          title: "Terrains",
          href: "/suivi-controle/terrains",
          icon: MapPin,
        },
        {
          title: "Planings",
          href: "/suivi-controle/Planing",
          icon: Calendar,
        },
        {
          title: "Suivi Projets",
          href: "/suivi-controle/Tracking",
          icon: LayoutGrid,
        },
      ]
    : []),


    // suivi-controle des travaux
  ...(auth?.user?.role === "logistique-generaux"
    ? [
        {
          title: "Les documents",
          href: "/logistique-generaux/documents",
          icon: MapPin,
        },
        
      ]
    : []),

        // fournisseurs-traitants
...(auth?.user?.role === "fournisseurs-traitants"
  ? [
      {
        title: "Méthodologie",
        href: "/fournisseurs-traitants/MethodologiePlanning",
        icon: CalendarClock,
      },
      {
        title: "Offre Technique",
        href: "/fournisseurs-traitants/OffreTechnique",
        icon: Wrench,
      },
      {
        title: "Accords ST",
        href: "/fournisseurs-traitants/AccordsST",
        icon: Handshake,
      },
      {
        title: "Table d'équipe",
        href: "/fournisseurs-traitants/TeamTable",
        icon: Users,
      },
      {
        title: "les Références",
        href: "/fournisseurs-traitants/References",
        icon: FileSliders,
      },





      
      

    ]
  : []),


  // Marchés & Marketing
  ...(auth?.user?.role === "marches-marketing"
    ? [
        {
          title: "Lettres (test)",
          icon: UserPlus,
          items: [
            {
              title: "Lettre de Maintien",
              href: "/marches-marketing/lettres/maintien",
              icon: FileText,
            },
            {
              title: "Lettre d'Écartement",
              href: "/marches-marketing/lettres/ecartement",
              icon: AlertCircle,
            },
          ],
        },
        {
          title: "Global Marchés",
          href: "/marches-marketing/global-marches",
          icon: BookOpen,
        },
        {
          title: "Suivi de marchés",
          href: "/marches-marketing/suivi",
          icon: TrendingUp,
        },
        {
          title: "Global marchés",
          href: "/marches-marketing/marches",
          icon: Globe,
        },
        {
          title: "Portail",
          href: "/marches-marketing/portail",
          icon: SquareArrowOutUpRight,
        },
        {
          title: "Documentation",
          href: "/documents",
          icon: Paperclip,
        },
        {
          title: "Traitement de dossier",
          href: "/marches-marketing/traitementdossier",
          icon: Briefcase,
        },
        {
          title: "Traitement de marchés",
          href: "/marches-marketing/traitementmarches",
          icon: Settings,
        },
        {
          title: "Demande Profils",
          href: "/marches-marketing/profils/demander",
          icon: Send,
        },
      ]
    : []),
    

  // Permissions-based menus - using the typed userPermissions
  ...(userPermissions.includes("module marche public")
    ? [
        {
          title: "Marchés publics",
          icon: Rss,
          href: "/marches-publics",
        },
      ]
    : []),

  ...(userPermissions.includes("module marche global")
    ? [
        {
          title: "Global marches",
          icon: Globe,
          href: "/global-marches",
        },
      ]
    : []),

  ...(userPermissions.includes("les marches")
    ? [
        {
          title: "Les marchés",
          icon: Building2,
          items: [
            { title: "En cours", href: "/marches/encours", icon: Clock3 },
            { title: "Annulée", href: "/marches/annulee", icon: Ban },
            { title: "Rejetée", href: "/marches/rejetee", icon: CircleX },
            { title: "Terminée", href: "/marches/terminee", icon: CircleCheckBig },
          ],
        },
      ]
    : []),

  ...(auth?.user?.role === "admin"
    ? [
        {
          title: "Boite de descisions",
          icon: Gavel,
          href: "/direction-generale/boite-decision",
        },
      ]
    : []),

  ...(userPermissions.includes("module documentation")
    ? [
        {
          title: "Documentations",
          icon: Paperclip,
          href: "/documents",
        },
      ]
    : []),
];


  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="relative z-10">
        <div className="flex w-full items-center justify-between px-2">
          <SidebarMenuButton size="lg" asChild className="w-auto p-0">
            <Link href={dashboardHref} prefetch>
              <BetconsultingDashLogo className="w-[140px]" />
            </Link>
          </SidebarMenuButton>

          <Notifications />
        </div>
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