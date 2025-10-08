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
    title: 'Lettre d\'Écartement',
    href: '/marches-marketing/lettres/ecartement',
  },
];

const Ecartement = () => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Lettre d'Écartement" />
      
      <div className="space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">Lettre d'Écartement</CardTitle>
                <CardDescription>
                  AO N° 103/2024/AREP-MS - Demande de précisions sur l'écartement technique
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Écarté
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
                      {/* Logo */}
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
                        Tétouan, le 05/12/2024
                      </div>
                    </div>
                    
                    {/* Company Name */}
                    <div className="text-center font-bold text-base mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                      De BTP CONSULTING
                    </div>
                    
                    {/* Recipient */}
                    <div className="text-center mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
                      <div className="font-bold text-base mb-2">A</div>
                      <div className="font-bold text-base mb-4">
                        Monsieur le président de la séance d'ouverture des plis de l'appel d'offre
                      </div>
                      <div className="font-bold text-sm leading-relaxed">
                        AO N° 103/2024/AREP-MS relatif à l'assistance au maître d'ouvrage pour l'ordonnancement, pilotage et coordination des projets d'approvisionnement en eau potable des centres et des douars relevant de la région de marrakech-safi
                      </div>
                    </div>
                    
                    {/* Subject */}
                    <div className="mb-6 text-sm" style={{ fontFamily: 'Times New Roman, serif' }}>
                      <div className="flex items-start">
                        <span className="font-bold underline mr-1">Objet</span>
                        <span className="mr-2">:</span>
                        <div className="font-bold flex-1">
                          Demande de précisions sur l'écartement technique - Appel d'offres n° 103/2024/AREP-MS du 03/12/2024
                        </div>
                      </div>
                    </div>
                    
                    {/* Greeting */}
                    <div className="mb-4 text-sm" style={{ fontFamily: 'Times New Roman, serif' }}>
                      Monsieur,
                    </div>
                    
                    {/* Body Text - Paragraph 1 */}
                    <div className="mb-4 text-justify text-sm leading-relaxed" style={{ fontFamily: 'Times New Roman, serif' }}>
                      Notre BET a participé à l'appel d'offres n° <strong>103/2024/AREP-MS</strong> du 03/12/2024 concernant l'assistance au maître d'ouvrage pour l'ordonnancement, pilotage et coordination des projets d'approvisionnement en eau potable des centres et des douars relevant de la région de Marrakech Safi
                    </div>
                    
                    {/* Body Text - Paragraph 2 */}
                    <div className="mb-4 text-justify text-sm leading-relaxed" style={{ fontFamily: 'Times New Roman, serif' }}>
                      Selon les résultats affichés dans le portail marocain des marchés publics (PMMP), notre candidature a été écartée lors de l'examen de l'enveloppe technique. Afin de comprendre les raisons précises de cet écartement et d'améliorer nos futures soumissions, nous souhaiterions obtenir des éclaircissements sur les points suivants :
                    </div>
                    
                    {/* Bullet Points */}
                    <div className="mb-4 text-sm leading-relaxed pl-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                      <div className="mb-2">
                        <span className="mr-2">-</span>
                        Quels aspects spécifiques de notre offre technique n'ont pas satisfait aux exigences du cahier des charges ?
                      </div>
                      <div className="mb-2">
                        <span className="mr-2">-</span>
                        Y a-t-il eu des insuffisances particulières dans notre méthodologie proposée ou dans les qualifications de notre équipe ?
                      </div>
                      <div className="mb-2">
                        <span className="mr-2">-</span>
                        Notre note technique était-elle inférieure au seuil minimum requis de 70 points mentionné dans le règlement de consultation ?
                      </div>
                    </div>
                    
                    {/* Body Text - Paragraph 3 */}
                    <div className="mb-4 text-justify text-sm leading-relaxed" style={{ fontFamily: 'Times New Roman, serif' }}>
                      Ces informations nous seront précieuses pour comprendre les raisons de notre écartement et nous permettront de rectifier nos erreurs pour les appels d'offres à venir.
                    </div>
                    
                    {/* Closing */}
                    <div className="mb-8 text-sm" style={{ fontFamily: 'Times New Roman, serif' }}>
                      Dans l'attente de votre réponse, nous vous prions d'agréer, Monsieur le Directeur, l'expression de nos salutations distinguées.
                    </div>
                    
                    {/* Signature Block */}
                    <div className="text-center" style={{ fontFamily: 'Times New Roman, serif' }}>
                      <div className="font-bold underline text-sm">Signature</div>
                    </div>
                  </div>
                  
                  {/* Footer Section */}
                  <div className="absolute bottom-0 left-0 right-0">
                    {/* Orange Line */}
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

        {/* Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V9a4 4 0 10-8 0v2.5" />
                </svg>
                Imprimer
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Télécharger PDF
              </button>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Envoyer par Email
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Ecartement;