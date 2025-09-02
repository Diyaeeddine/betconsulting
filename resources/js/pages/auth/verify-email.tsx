import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, Shield, CheckCircle, Send, LogOut, RefreshCw, Clock } from 'lucide-react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    const verificationSteps = [
        { number: "1", text: "Vérifiez votre boîte de réception", icon: Mail },
        { number: "2", text: "Cliquez sur le lien de vérification", icon: CheckCircle },
        { number: "3", text: "Accédez à votre espace professionnel", icon: Shield },
    ];

    const emailTips = [
        "Vérifiez également votre dossier spam/courrier indésirable",
        "Le lien de vérification expire après 60 minutes",
        "Vous pouvez demander un nouveau lien à tout moment",
    ];

    return (
        <div className="min-h-screen flex">
            <Head title="Vérification d'e-mail" />
            
            {/* Left Side - Verification Process */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-900 via-orange-900 to-slate-800 relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-32 left-24 w-44 h-44 border border-white/20 rounded-full animate-pulse"></div>
                    <div className="absolute top-48 right-32 w-32 h-32 border border-white/20 rounded-lg rotate-12 animate-spin" style={{ animationDuration: '35s' }}></div>
                    <div className="absolute bottom-40 left-32 w-24 h-24 border border-white/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-24 right-24 w-36 h-36 border border-white/20 rounded-lg animate-pulse" style={{ animationDelay: '2.5s' }}></div>
                </div>
                
                <div className="relative z-10 flex flex-col justify-center items-center p-12 w-full">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20">
                            <Mail className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">
                            Vérification E-mail
                        </h1>
                        <p className="text-xl text-amber-100 max-w-md">
                            Confirmez votre adresse e-mail pour accéder à votre espace professionnel
                        </p>
                    </div>
                    
                    {/* Verification Steps */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8 max-w-md w-full">
                        <h3 className="text-white font-semibold text-lg mb-6 text-center">Étapes de Vérification</h3>
                        <div className="space-y-4">
                            {verificationSteps.map((step, index) => (
                                <div 
                                    key={index}
                                    className="flex items-center space-x-4 text-white/90 animate-fade-in"
                                    style={{ animationDelay: `${index * 0.2}s` }}
                                >
                                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                        {step.number}
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <step.icon className="w-5 h-5" />
                                        <span className="text-sm">{step.text}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Email Tips */}
                    <div className="max-w-md w-full">
                        <h3 className="text-white font-semibold text-lg mb-4 text-center">Conseils Utiles</h3>
                        <div className="space-y-3">
                            {emailTips.map((tip, index) => (
                                <div 
                                    key={index}
                                    className="flex items-start space-x-3 text-white/80 animate-fade-in"
                                    style={{ animationDelay: `${(index + 3) * 0.2}s` }}
                                >
                                    <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                                    </div>
                                    <span className="text-sm leading-relaxed">{tip}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Action Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Vérification d'E-mail</h2>
                            <p className="text-gray-600 mt-2">
                                Veuillez vérifier votre adresse e-mail en cliquant sur le lien que nous venons de vous envoyer
                            </p>
                        </div>

                        {status === 'verification-link-sent' && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="text-sm font-medium text-green-800">Lien envoyé avec succès !</p>
                                        <p className="text-xs text-green-700 mt-1">
                                            Un nouveau lien de vérification a été envoyé à votre adresse e-mail
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Main Content */}
                        <div className="space-y-6 text-center">
                            {/* Email Illustration */}
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-100">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-gradient-to-r from-amber-200 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Mail className="w-10 h-10 text-amber-700" />
                                    </div>
                                    {/* Animated pulse rings */}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <div className="w-24 h-24 border-2 border-amber-300/30 rounded-2xl animate-ping" style={{ animationDuration: '2s' }}></div>
                                        <div className="absolute top-0 left-0 w-28 h-28 border-2 border-orange-300/20 rounded-2xl animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">E-mail de Vérification Envoyé</h3>
                                <p className="text-gray-600 text-sm">
                                    Cliquez sur le lien dans l'e-mail pour activer votre compte
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-4">{/* Form wrapper */}
                                <Button 
                                    onClick={submit}
                                    disabled={processing} 
                                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                                >
                                    {processing ? (
                                        <div className="flex items-center justify-center">
                                            <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
                                            Envoi en cours...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <RefreshCw className="w-5 h-5 mr-2" />
                                            Renvoyer l'e-mail de vérification
                                        </div>
                                    )}
                                </Button>

                                <TextLink 
                                    href={route('logout')} 
                                    method="post" 
                                    className="inline-flex items-center justify-center w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <LogOut className="w-5 h-5 mr-2" />
                                    Se déconnecter
                                </TextLink>
                            </div>

                            {/* Help Text */}
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <div className="flex items-start space-x-3">
                                    <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-blue-900">Vous ne recevez pas l'e-mail ?</p>
                                        <p className="text-xs text-blue-700 mt-1">
                                            Vérifiez votre dossier spam ou cliquez sur "Renvoyer" pour recevoir un nouveau lien
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="text-center">
                                <p className="text-xs text-gray-500 mb-3">
                                    Le lien de vérification expire dans 60 minutes
                                </p>
                                <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                                    <span className="flex items-center">
                                        <Shield className="w-3 h-3 mr-1" />
                                        Sécurisé
                                    </span>
                                    <span>•</span>
                                    <span>Confidentiel</span>
                                    <span>•</span>
                                    <span>Support 24/7</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Tips */}
                    <div className="lg:hidden mt-8">
                        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center flex items-center justify-center">
                                <Mail className="w-5 h-5 mr-2 text-amber-600" />
                                Conseils de Vérification
                            </h3>
                            <div className="space-y-3">
                                {emailTips.map((tip, index) => (
                                    <div key={index} className="flex items-start space-x-3">
                                        <div className="w-5 h-5 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                                        </div>
                                        <span className="text-sm text-gray-600">{tip}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>

    );
}