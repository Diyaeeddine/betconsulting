import { useState, useEffect } from 'react';

import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { type SharedData, type NavItem } from '@/types';

import { Link, usePage } from '@inertiajs/react';

import { LayoutGrid, FolderKanban, MapPin, Users } from 'lucide-react';

import BetconsultingDashLogo from './betconsulting-dash-logo';

export function AppSidebar() {
  const page = usePage<SharedData>();
  const { auth, projects = [] } = page.props;

  // State for projects submenu open/close
  const [isProjectsMenuOpen, setIsProjectsMenuOpen] = useState(false);

  // Auto-open projects submenu if current URL starts with /projects
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

  const dashboardHref =
    auth?.user?.role && roleDashboardMap[auth.user.role]
      ? roleDashboardMap[auth.user.role]
      : '/dashboard';

  const projectsNavItems: NavItem[] = projects.map((project: any) => ({
    title: project.nom,
    href: `/projects/${project.id}`,
    icon: FolderKanban,
  }));

  const mainNavItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: dashboardHref,
      icon: LayoutGrid,
    },
    {
      title: 'Projets',
      icon: FolderKanban,
      items: isProjectsMenuOpen ? projectsNavItems : [],
      // No href here to prevent navigation on toggle click
    },
    {
      title: 'Maps',
      href: '/ressources-humaines/maps',
      icon: MapPin,
    },
    {
      title: 'Users',
      href: '/ressources-humaines/users',
      icon: Users,
    },
  ];

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                href={dashboardHref}
                prefetch
                className="flex w-full items-center justify-center"
              >
                <BetconsultingDashLogo className="w-[140px]" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain
          items={mainNavItems}
          onProjectsToggle={() => setIsProjectsMenuOpen(!isProjectsMenuOpen)}
        />
      </SidebarContent>

      <SidebarFooter>
        <NavFooter items={[]} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
