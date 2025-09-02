import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenuButton } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Building2, FolderKanban, LayoutDashboard, TrendingUp, UserPlus } from "lucide-react"
import { Link, usePage } from '@inertiajs/react';
import BetconsultingDashLogo from './betconsulting-dash-logo';
import { Route, Car, Wrench} from "lucide-react"
import { Notifications } from './ui/notifications';

export function AppSidebar() {
    
    const { auth } = usePage<SharedData>().props;
    const roleDashboardMap: Record<string, string> = {
        'admin': '/direction-generale/dashboard',
        'marches-marketing': '/marches-marketing/dashboard',
        'etudes-techniques': '/etudes-techniques/dashboard',
        'suivi-controle': '/suivi-controle/dashboard',
        'qualite-audit': '/qualite-audit/dashboard',
        'innovation-transition': '/innovation-transition/dashboard',
        'ressources-humaines': '/ressources-humaines/dashboard',
        'financier-comptabilite': '/financier-comptabilite/dashboard',
        'logistique-generaux': '/logistique-generaux/dashboard',
        'communication-digitale': '/communication-digitale/dashboard',
        'juridique': '/juridique/dashboard',
        'fournisseurs-traitants': '/fournisseurs-traitants/dashboard',
    };

    const dashboardHref = auth?.user?.role && roleDashboardMap[auth.user.role] ? roleDashboardMap[auth.user.role] : '/dashboard';

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardHref,
            icon: LayoutDashboard,
        },

        ...(auth?.user?.role === 'ressources-humaines'
            ? [
                  {
                      title: 'Tracking',
                      href: '/ressources-humaines/tracking',
                      icon: Route,
                  },
                  {
                      title: 'Projets',
                      href: '/ressources-humaines/projets',
                      icon: FolderKanban,
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
                      icon: TrendingUp,
                  },
                  {
                      title: 'Profiles',
                      href: '/ressources-humaines/access',
                      icon: UserPlus,
                  },
              ]
            : []),
        ...(auth?.user?.role === 'marches-marketing'
            ? [
                  {
                      title: 'Les marchés',
                      href: '/marches-marketing/marches',
                      icon: Building2,
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
    );
}