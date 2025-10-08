import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import BackButton from "@/components/ui/BackIcon";
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        
        <div className="h-16 md:h-12" />
        {children}
    </AppLayoutTemplate>
);
