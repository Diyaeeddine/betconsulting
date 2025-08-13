import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Fragment } from 'react';

// Handles rendering a single nav item or submenu
function NavItemRenderer({ item, onToggle }: { item: NavItem; onToggle?: () => void }) {
  const page = usePage();

  // Always render parent button if items array exists (even if empty)
  if (item.items !== undefined) {
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          tooltip={{ children: item.title }}
          onClick={onToggle}
          asChild={false}
          type="button"
        >
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </SidebarMenuButton>

        {/* Render submenu only if there are submenu items */}
        {item.items.length > 0 && (
          <div className="ml-4">
            <NavMain items={item.items} isSubmenu={true} />
          </div>
        )}
      </SidebarMenuItem>
    );
  }

  // If item has href and no submenu, render link
  if (item.href) {
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          isActive={page.url.startsWith(item.href)}
          tooltip={{ children: item.title }}
        >
          <Link href={item.href} prefetch>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return null;
}

export function NavMain({
  items = [],
  isSubmenu = false,
  onProjectsToggle,
}: {
  items: NavItem[];
  isSubmenu?: boolean;
  onProjectsToggle?: () => void;
}) {
  const menuContent = items.map((item) => (
    <NavItemRenderer
      key={item.title}
      item={item}
      onToggle={item.title === 'Projets' ? onProjectsToggle : undefined}
    />
  ));

  return (
    <Fragment>
      {!isSubmenu && (
        <SidebarGroup className="px-2 py-0">
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>{menuContent}</SidebarMenu>
        </SidebarGroup>
      )}
      {isSubmenu && <SidebarMenu>{menuContent}</SidebarMenu>}
    </Fragment>
  );
}
