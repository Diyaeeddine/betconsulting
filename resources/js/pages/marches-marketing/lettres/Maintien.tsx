import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import React from 'react';

const breadcrumbs = [
  {
    title: 'Dashboard Marchés & Marketing',
    href: '/marches-marketing/dashboard',
  },
  {
    title: 'Lettres',
    href: '/marches-marketing/lettres',
  },
  {
    title: 'Lettre de Maintien',
    href: '/marches-marketing/lettres/maintien',
  },
];

const Maintien = () => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Lettre de Maintien" />
      
      <div className="space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">Lettre de Maintien</CardTitle>
                <CardDescription>
                  Appel d'offre N° 28/2025/DAH - Protection contre les inondations
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                En cours
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Document Card */}
        <Card>
          <CardContent className="p-0">
            <div className="bg-gray-50 p-8 flex justify-center">
              <div className="bg-white shadow-lg" style={{ width: '210mm', minHeight: '297mm' }}>
                {/* Document Container */}
                <div className="relative p-8 h-full" style={{ fontFamily: 'Times New Roman, serif' }}>
                  
                  {/* Large Watermark Background */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
                    <img
                        src="/images/btp-watermark.png"
                        alt="Watermark"
                        className="w-120 h-120 object-contain"
                    />
                    </div>
                    
                  {/* Content Container */}
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                      {/* Logo Placeholder */}
                      <div className="w-32 h-20 flex items-center justify-center text-xs text-gray-500">
                        <div className="text-center">
                            <img 
                            src="/images/btp-logo.png" 
                            alt="Logo BTP" 
                            className="mt-1 mx-auto max-h-full max-w-full object-contain opacity-50"
                            />
                        </div>
                      </div>

                      
                      {/* Date */}
                      <div className="text-right text-sm" style={{ fontFamily: 'Times New Roman, serif' }}>
                        Tétouan, le 21/08/2025
                      </div>
                    </div>
                    
                    {/* Company Name */}
                    <div className="text-center font-bold text-base mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                      BTP CONSULTING SARL
                    </div>
                    
                    {/* Recipient */}
                    <div className="text-center mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
                      <div className="font-bold text-base mb-2">A</div>
                      <div className="font-bold text-base">
                        DIRECTION DES AMENAGEMENTS HYDRAULIQUES
                      </div>
                    </div>
                    
                    {/* Subject */}
                    <div className="mb-6 text-sm" style={{ fontFamily: 'Times New Roman, serif' }}>
                      <div className="flex items-start">
                        <span className="font-bold underline mr-1">Objet</span>
                        <span className="mr-2">:</span>
                        <div className="font-bold flex-1">
                          Maintien relatif à l'appel d'offre N° 28/2025/DAH relatif à l'étude et suivi d'exécution des travaux de protection contre les inondations de la commune OULED MRAH province de Settat
                        </div>
                      </div>
                    </div>
                    
                    {/* Body Text */}
                    <div className="mb-8 text-justify text-sm leading-relaxed" style={{ fontFamily: 'Times New Roman, serif' }}>
                      En réponse à votre lettre du 20/08/2025 concernant la prorogation de l'offre présentée dans le cadre de l'appel d'offres cité en objet, nous vous confirmons notre accord de maintenir notre offre jusqu'à l'approbation du marché
                    </div>
                    
                    {/* Closing */}
                    <div className="mb-12 text-sm" style={{ fontFamily: 'Times New Roman, serif' }}>
                      Veuillez agréer, l'expression de nos salutations les plus distinguées.
                    </div>
                    
                    {/* Signature Block */}
                    <div className="text-center" style={{ fontFamily: 'Times New Roman, serif' }}>
                      <div className="font-bold mb-8 text-sm">Mourad LJAZOULI, Gérant</div>
                      <div className="italic text-sm">Signature</div>
                    </div>
                  </div>
                  
                  {/* Footer Section */}
                  <div className="absolute bottom-0 left-0 right-0">
                    {/* Orange-Blue Line */}
                    <div className="bg-gradient-to-r from-orange-400 to-orange-400 h-0.5 mb-4"></div>
                    
                    {/* Company Footer Info */}
                    <div className="text-center px-8 pb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                      <div className="text-blue-500 font-bold text-base mb-2">BTP CONSULTING s.a.r.l</div>
                      <div className="text-xs text-blue-500 leading-tight space-y-0.5">
                        <div>Bureau d'Etudes Technique Agréé sous n°: 01/1</div>
                        <div>Tél : 07 08 08 08 70 / Fax : 05 39 71 34 10 / E-mail : contact@btpconsulting.ma / Web : www.btpconsulting.ma</div>
                        <div>Siège 1 : Av. Ait Yaaaa, Wilaya Center, 5° - Étage, N° 23 - Tétouan / Siège 2 : N° 14 Lot El Wahda Ou Laadir, Ouazzane</div>
                        <div>Capitale : 5 000 000,00 DH / RC : 1201 à Ouazzane / CNSS : 4783751 / Patente : 22119118 / I.F : 18741827 / ICE : 000285660000039</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Maintien;