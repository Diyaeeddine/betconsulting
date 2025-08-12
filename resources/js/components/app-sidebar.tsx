import { useEffect, useState } from 'react';

import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

import { type NavItem, type SharedData } from '@/types';

import { Link, usePage } from '@inertiajs/react';

import {
    AlertTriangle,
    BarChart3,
    ClipboardList,
    DollarSign,
    FileText,
    FolderKanban,
    Globe,
    LayoutDashboard,
    Leaf,
    Lightbulb,
    MapPin,
    Megaphone,
    Monitor,
    Package,
    PenTool,
    Scale,
    Search,
    Settings,
    Share2,
    Shield,
    ShoppingCart,
    TrendingUp,
    Truck,
    Users,
    Wrench,
} from 'lucide-react';

import BetconsultingDashLogo from './betconsulting-dash-logo';

export function AppSidebar() {
    const page = usePage<SharedData>();
    const { auth, projects = [] } = page.props;
    const [isProjectsMenuOpen, setIsProjectsMenuOpen] = useState(false);

    useEffect(() => {
        if (page.url.startsWith('/projects')) {
            setIsProjectsMenuOpen(true);
        }
    }, [page.url]);

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

    const dashboardHref = roleDashboardMap[auth?.user?.role || ''] || '/dashboard';

    const projectsNavItems: NavItem[] = projects.map((project: any) => ({
        title: project.nom,
        href: `/projects/${project.id}`,
        icon: FolderKanban,
    }));

    const roleMenus: Record<string, NavItem[]> = {
        'ressources-humaines': [
            {
                title: 'Projets',
                icon: FolderKanban,
                items: isProjectsMenuOpen ? projectsNavItems : [],
            },
            {
                title: 'Maps',
                href: '/ressources-humaines/maps',
                icon: MapPin,
            },
            {
                title: 'Gestion du personnel',
                href: '/ressources-humaines/users',
                icon: Users,
            },
        ],
        'financier-comptabilite': [
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
        ],
        'marches-marketing': [
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
        ],
        'etudes-techniques': [
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
        ],
        'suivi-controle': [
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
        ],
        'qualite-audit': [
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
        ],
        'innovation-transition': [
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
        ],
        'logistique-generaux': [
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
        ],
        'communication-digitale': [
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
        ],
        juridique: [
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
        ],
        'fournisseurs-traitants': [
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
        ],
        admin: [
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
        ],
    };

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardHref,
            icon: LayoutDashboard,
        },
        ...(roleMenus[auth?.user?.role || ''] || []),
    ];

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardHref} prefetch className="flex w-full items-center justify-center">
                                <BetconsultingDashLogo className="w-[140px]" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} onProjectsToggle={() => setIsProjectsMenuOpen(!isProjectsMenuOpen)} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={[]} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
