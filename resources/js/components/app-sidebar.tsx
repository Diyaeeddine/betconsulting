import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenuButton } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Ban,
    BookOpen,
    Building2,
    Car,
    CircleCheckBig,
    CircleX,
    ClipboardList,
    Clock3,
    Gavel,
    Globe,
    LayoutDashboard,
    LayoutGrid,
    Paperclip,
    Rss,
    ShoppingCart,
    Telescope,
    User,
    Users,
    Wrench,
} from 'lucide-react';
import BetconsultingDashLogo from './betconsulting-dash-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const roleDashboardMap: Record<string, string> = {
        admin: '/direction-generale/dashboard',
        'marches-marketing': '/marches-marketing/dashboard',
        'etudes-techniques': '/etudes-techniques/dashboard',
        'suivi-controle': '/suivi-controle/dashboard',
        'qualite-audit': '/qualite-audit/dashboard',
        'innovation-transition': '/innovation-transition/dashboard',
        'ressources-humaines': '/ressources-humaines/dashboard',
        'financier-comptabilite': '/financier-comptabilite/dashboard',
        'logistique-generaux': '/logistique-generaux/dashboard',
        'communication-digitale': '/communication-digitale/dashboard',
        juridique: '/juridique/dashboard',
        'fournisseurs-traitants': '/fournisseurs-traitants/dashboard',
        
    };

    const dashboardHref = auth?.user?.role && roleDashboardMap[auth.user.role] ? roleDashboardMap[auth.user.role] : '';
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardHref,
            icon: LayoutDashboard,
        },

        ...(auth?.user?.role === 'ressources-humaines'
            ? [
                  {
                      title: "Résultats Appels d'Offres",
                      href: '/ressources-humaines/appel-offer',
                      icon: BookOpen,
                  },
                  {
                      title: 'Bons de Commande',
                      href: '/ressources-humaines/bons-commandes',
                      icon: ShoppingCart,
                  },
                  {
                      title: 'Résultats Bon de Commande',
                      href: '/ressources-humaines/resultats-bon-commande-page',
                      icon: BookOpen,
                  },
                  {
                      title: 'Tracking',
                      href: '/ressources-humaines/tracking',
                      icon: LayoutGrid,
                  },
                  {
                      title: 'Projets',
                      href: '/ressources-humaines/projets',
                      icon: Users,
                  },
                  {
                      title: 'Véhicules',
                      href: '/ressources-humaines/vehicules',
                      icon: Car,
                  },
                  {
                      title: 'Matériels',
                      href: '/ressources-humaines/materiels',
                      icon: Wrench,
                  },
                  {
                      title: 'Progressions',
                      href: '/ressources-humaines/progressions',
                      icon: Car,
                  },
                  {
                      title: 'Formations',
                      href: '/ressources-humaines/formations',
                      icon: BookOpen,
                  },
                  {
                      title: 'Utilisateurs',
                      href: '/ressources-humaines/users',
                      icon: Users,
                  },
                  {
                      title: 'Sous traitents',
                      href: '/ressources-humaines/sousTrais',
                      icon: Users,
                  },
              ]
            : []),

        ...(auth?.user?.permissions?.includes('module marche public')
            ? [
                  {
                      title: 'Marchés publics',
                      icon: Rss,
                      href: '/marches-publics',
                  },
              ]
            : []),

        ...(auth?.user?.permissions?.includes('module marche global')
            ? [
                  {
                      title: 'Global marches',
                      icon: Globe,
                      href: '/global-marches',
                  },
              ]
            : []),
        ...(auth?.user?.permissions?.includes('les marches')
            ? [
                  {
                      title: 'Les marchés',
                      icon: Building2,
                      items: [
                          { title: 'En cours', href: '/marches/encours', icon: Clock3 },
                          { title: 'Annulée', href: '/marches/annulee', icon: Ban },
                          { title: 'Rejetée', href: '/marches/rejetee', icon: CircleX },
                          { title: 'Terminée', href: '/marches/terminee', icon: CircleCheckBig },
                      ],
                  },
              ]
            : []),
        ...(auth?.user?.role === 'admin'
            ? [
                  {
                      title: 'Boite de decisions',
                      icon: Gavel,
                      href: '/direction-generale/boite-decision',
                  },
              ]
            : []),
        ...(auth?.user?.permissions?.includes('module documentation')
            ? [
                  {
                      title: 'Documentations',
                      icon: Paperclip,
                      href: '/documents',
                  },
              ]
            : []),
        ...(auth?.user?.role === 'marches-marketing'
            ? [
                  {
                      title: 'Collaborateurs Marché',
                      href: '/marches-marketing/utilisateurs',
                      icon: Users,
                  },
                  {
                      title: 'Tracabilite',
                      href: '/marches-marketing/tracabilite',
                      icon: Telescope,
                  },
              ]
            : []),
        ...(auth?.user?.role === 'salarie'
            ? [
                  {
                      title: 'Profile',
                      href: '/salarie/profile',
                      icon: User,
                  },
                  {
                      title: 'Mes Taches',
                      href: '/salarie/marches/taches',
                      icon: ClipboardList,
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
                    {/* {auth?.type === 'salarie' ? <NotificationsSalaries /> : <Notifications />} */}
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
    );
}
