import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import BackIcon from "@/components/ui/BackIcon";

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
  return (
    <header className="fixed top-0 z-10 flex h-16 w-full items-center justify-between border-b border-sidebar-border/50 bg-white px-4 md:px-6">
      
      {/* Left side: Sidebar + Breadcrumbs */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      {/* Right side: Back icon */}
      <div className="flex items-center">
        <BackIcon />
      </div>

    </header>
  );
}
