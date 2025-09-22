import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Calendar, LayoutGrid,MapPin } from 'lucide-react';
import BetconsultingDashLogo from './betconsulting-dash-logo';
import {
  Users, Route,Car,Wrench, BookOpen} from "lucide-react"
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
            icon: LayoutGrid,
        },

        // Ressources Humaines
        ...(auth?.user?.role === 'ressources-humaines'
            ? [
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
                    title: 'Users',
                    href: '/ressources-humaines/users',
                    icon: Users,
                },
                {
                    title: 'Sous traitants',
                    href: '/ressources-humaines/sousTrais',
                    icon: Users,
                },
            ]
            : []),
        
        ...(auth?.user?.role === 'suivi-controle'
        ? [
            {
            title: 'Terrains',
            href: '/suivi-controle/terrains',
            icon: MapPin,
            },
            {
            title: 'Planings',
            href: '/suivi-controle/Planing',
            icon: Calendar,
            },
             {
            title: 'Tracking',
            href: '/suivi-controle/Tracking',
            icon: LayoutGrid,
            },
            {
            title: 'Suivi-Projet',
            href: '/suivi-controle/suiviProjet',
            icon: LayoutGrid,
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
    );
}
