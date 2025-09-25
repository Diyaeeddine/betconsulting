import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

const breadcrumbs = [
    {
        title: 'Dashboard Suivi & Contrôle des Travaux',
        href: '/suivi-controle/suiviProjet',
    },
];

export default function SuiviControle() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Suivi & Contrôle des Travaux" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-2xl font-bold">Dashboard Suivi & Contrôle des Travaux</h1>
                {/* Contenu spécifique au rôle admin */}
            </div>
        </AppLayout>
    );
}
