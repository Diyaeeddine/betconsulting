import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

const breadcrumbs = [
    {
        title: 'Dashboard Ressources Humaines & Gestion des Compétences',
        href: '/ressources-humaines/users',
    },
];

export default function RessourcesHumainesUsers() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Ressources Humaines & Gestion des Compétences" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* <h1 className="text-2xl font-bold">Dashboard Ressources Humaines & Gestion des Compétences</h1> */}
                {/* Contenu spécifique au rôle admin */}
            </div>
        </AppLayout>
    );
}
