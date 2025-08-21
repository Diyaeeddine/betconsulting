import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, KeyRound, Mail, ArrowLeft, Shield, Clock, Users, FileText } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm<Required<{ email: string }>>({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    const securityFeatures = [
        { icon: Shield, text: "Lien sécurisé SSL" },
        { icon: Clock, text: "Expiration automatique" },
        { icon: Mail, text: "Vérification par e-mail" },
    ];

    const steps = [
        { number: "1", text: "Saisissez votre adresse e-mail professionnelle" },
        { number: "2", text: "Recevez un lien de réinitialisation sécurisé" },
        { number: "3", text: "Créez votre nouveau mot de passe" },
    ];

    return (
        <div className="min-h-screen flex">
            <Head title="Mot de passe oublié" />
            
            {/* Left Side - Background with security info */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-800 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-32 left-24 w-40 h-40 border border-white/20 rounded-full animate-pulse"></div>
                    <div className="absolute top-48 right-28 w-32 h-32 border border-white/20 rounded-lg rotate-12 animate-spin" style={{ animationDuration: '25s' }}></div>
                    <div className="absolute bottom-40 left-28 w-24 h-24 border border-white/20 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
                    <div className="absolute bottom-24 right-32 w-36 h-36 border border-white/20 rounded-lg animate-pulse" style={{ animationDelay: '3s' }}></div>
                </div>
                
                <div className="relative z-10 flex flex-col justify-center items-center p-4 w-full">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20">
                            <KeyRound className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">
                            Récupération Sécurisée
                        </h1>
                        <p className="text-xl text-indigo-100 max-w-md">
                            Retrouvez l'accès à votre espace professionnel en toute sécurité
                        </p>
                    </div>
                    
                    {/* Security Features */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 mb-8 max-w-md w-full">
                        <h3 className="text-white font-semibold text-lg mb-2 text-center">Processus Sécurisé</h3>
                        <div className="space-y-4">
                            {securityFeatures.map((feature, index) => (
                                <div 
                                    key={index}
                                    className="flex items-center space-x-3 text-white/90 animate-fade-in"
                                    style={{ animationDelay: `${index * 0.2}s` }}
                                >
                                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                        <feature.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Steps */}
                    <div className="max-w-md w-full">
                        <h3 className="text-white font-semibold text-lg mb-4 text-center">Étapes de récupération</h3>
                        <div className="space-y-3">
                            {steps.map((step, index) => (
                                <div 
                                    key={index}
                                    className="flex items-start space-x-3 text-white/80 animate-fade-in"
                                    style={{ animationDelay: `${(index + 3) * 0.2}s` }}
                                >
                                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                        {step.number}
                                    </div>
                                    <span className="text-sm leading-relaxed">{step.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <KeyRound className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Mot de passe oublié</h2>
                            <p className="text-gray-600 mt-2">Entrez votre e-mail pour recevoir un lien de réinitialisation</p>
                        </div>

                        {status && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <Mail className="w-5 h-5 text-green-600" />
                                    <p className="text-sm font-medium text-green-800">{status}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>{/* Form wrapper */}
                                <div>
                                    <Label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Adresse e-mail professionnelle
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            autoComplete="off"
                                            value={data.email}
                                            autoFocus
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="votre.email@entreprise.com"
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                <div className="mt-6">
                                    <Button 
                                        onClick={submit}
                                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl" 
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <div className="flex items-center justify-center">
                                                <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
                                                Envoi en cours...
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center">
                                                <Mail className="w-5 h-5 mr-2" />
                                                Envoyer le lien de réinitialisation
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Back to login */}
                            <div className="text-center pt-4 border-t border-gray-100">
                                <TextLink 
                                    href={route('login')} 
                                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Retour à la connexion
                                </TextLink>
                            </div>
                        </div>

                        {/* Security info */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="text-center">
                                <p className="text-xs text-gray-500 mb-3">
                                    Le lien de réinitialisation expirera dans 60 minutes
                                </p>
                                <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                                    <span className="flex items-center">
                                        <Shield className="w-3 h-3 mr-1" />
                                        Crypté
                                    </span>
                                    <span>•</span>
                                    <span>Sécurisé</span>
                                    <span>•</span>
                                    <span>Confidentiel</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile info card */}
                    <div className="lg:hidden">
                        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center flex items-center justify-center">
                                <KeyRound className="w-5 h-5 mr-2 text-indigo-600" />
                                Récupération Sécurisée
                            </h3>
                            <div className="space-y-3">
                                {steps.map((step, index) => (
                                    <div key={index} className="flex items-start space-x-3">
                                        <div className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                            {step.number}
                                        </div>
                                        <span className="text-sm text-gray-600">{step.text}</span>
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