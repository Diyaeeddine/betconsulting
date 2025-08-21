// resources/js/pages/dashboards/DirectionGenerale.jsx
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

const breadcrumbs = [
    {
        title: 'Dashboard Communication Digitale & Documentation',
        href: '/communication-digitale/dashboard',
    },
];

export default function CommunicationDigitale() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Communication Digitale & Documentation" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-2xl font-bold">Dashboard Communication Digitale & Documentation</h1>
                {/* Contenu spécifique au rôle admin */}
            </div>
        </AppLayout>
    );
}
