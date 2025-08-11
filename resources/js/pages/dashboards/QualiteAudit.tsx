import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

const breadcrumbs = [
    {
        title: 'Dashboard Qualité & Audit Technique',
        href: '/qualite-audit/dashboard',
    },
];

export default function QualiteAudit() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Qualité & Audit Technique" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-2xl font-bold">Dashboard Qualité & Audit Technique</h1>
                {/* Contenu spécifique au rôle admin */}
            </div>
        </AppLayout>
    );
}
