import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { SharedData, type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Notifications } from './ui/notifications';
import { NotificationsSalaries } from './ui/notificationssalaries';
import { usePage } from '@inertiajs/react';

export function AppSidebarHeader({ breadcrumbs = [], auth: authProp }: { breadcrumbs?: BreadcrumbItemType[]; auth?: { type?: string } }) {
    const sidebar = useSidebar();
    const { auth } = usePage<SharedData>().props;
    
    const isOpen = sidebar.open ?? false;

    return (
        <div
            className="fixed top-0 right-0 z-30 flex items-center justify-between gap-4 border-b bg-white p-4 transition-all duration-300"
            style={{
                left: isOpen ? '256px' : '72px', // 🧩 valeurs précises (ajustées)
                width: isOpen ? 'calc(100% - 256px)' : 'calc(100% - 72px)',
            }}
        >
            <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="mr-6 flex-shrink-0">{auth?.type === 'salarie' ? <NotificationsSalaries /> : <Notifications />}</div>
        </div>
    );
}
