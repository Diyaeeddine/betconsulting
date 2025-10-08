import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
import { Building2, ChevronRight, User } from 'lucide-react';

export default function BoiteDecision() {
    const breadcrumbs = [
        {
            title: 'Boite de decision',
            href: '/direction-generale/boite-decision',
        },
    ];

    const decisionSections = [
        {
            title: 'Décisions Marché',
            description: "Gérer les décisions relatives aux marchés publics, appels d'offres et contrats commerciaux",
            href: '/direction-generale/boite-decision-marche',
            icon: Building2,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-white',
            borderColor: 'border-blue-200',
            hoverColor: 'hover:border-blue-300',
        },
        {
            title: 'Décisions Profil',
            description: 'Gérer les décisions concernant les profils, l’organisation et les entretiens.',
            href: '/direction-generale/entretiens/validation',
            icon: User,
            color: 'from-indigo-500 to-indigo-600',
            bgColor: 'bg-white',
            borderColor: 'border-indigo-200',
            hoverColor: 'hover:border-indigo-300',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen bg-white p-6">
                <div className="mx-auto max-w-4xl">
                    {/* En-tête */}
                    <div className="mb-12 text-center">
                        <h1 className="mb-4 text-4xl font-bold text-gray-900">Boîte de Décision</h1>
                        <p className="mx-auto max-w-2xl text-lg text-gray-600">Choisissez la section de décision que vous souhaitez gérer</p>
                    </div>

                    {/* Cartes de sélection */}
                    <div className="grid gap-8 md:grid-cols-2">
                        {decisionSections.map((section) => {
                            const IconComponent = section.icon;

                            return (
                                <Link key={section.title} href={section.href} className="block">
                                    <Card
                                        className={`${section.bgColor} ${section.borderColor} ${section.hoverColor} group cursor-pointer border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
                                    >
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center justify-between">
                                                <div className={`rounded-lg bg-gradient-to-r p-3 ${section.color} text-white`}>
                                                    <IconComponent className="h-8 w-8" />
                                                </div>
                                                <ChevronRight className="h-6 w-6 text-gray-400 transition-colors duration-300 group-hover:text-gray-600" />
                                            </div>
                                            <CardTitle className="mt-4 text-2xl font-semibold text-gray-900">{section.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="text-base leading-relaxed text-gray-700">
                                                {section.description}
                                            </CardDescription>

                                            {/* Bouton d'action */}
                                            <div className="mt-6">
                                                <div
                                                    className={`inline-flex items-center bg-gradient-to-r px-4 py-2 text-sm font-medium text-white ${section.color} rounded-lg transition-all duration-300 group-hover:shadow-md`}
                                                >
                                                    Accéder aux décisions
                                                    <ChevronRight className="ml-2 h-4 w-4" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Section d'information additionnelle */}
                    <div className="mt-12 text-center">
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-2 text-lg font-semibold text-gray-900">Informations</h3>
                            <p className="text-gray-600">
                                Sélectionnez une section pour consulter et traiter les décisions en attente. Vous pourrez revenir à tout moment à
                                cette page de sélection.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}