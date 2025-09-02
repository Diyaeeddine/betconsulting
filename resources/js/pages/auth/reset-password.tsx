import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Lock, Shield, Eye, EyeOff, Check, X, Mail } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface ResetPasswordProps {
    token: string;
    email: string;
}

type ResetPasswordForm = {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<Required<ResetPasswordForm>>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    // Password strength validation
    const passwordRequirements = [
        { regex: /.{8,}/, text: "Au moins 8 caractères" },
        { regex: /[A-Z]/, text: "Une lettre majuscule" },
        { regex: /[a-z]/, text: "Une lettre minuscule" },
        { regex: /\d/, text: "Un chiffre" },
        { regex: /[!@#$%^&*(),.?":{}|<>]/, text: "Un caractère spécial" }
    ];

    const getRequirementStatus = (requirement: { regex: RegExp; text: string }) => {
        return requirement.regex.test(data.password);
    };

    const securityTips = [
        "Utilisez une combinaison unique de lettres, chiffres et symboles",
        "Évitez les informations personnelles évidentes",
        "Considérez l'utilisation d'un gestionnaire de mots de passe",
    ];

    return (
        <div className="min-h-screen flex">
            <Head title="Réinitialiser le mot de passe" />
            
            {/* Left Side - Security Guidelines */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-800 relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-24 left-20 w-48 h-48 border border-white/20 rounded-full animate-pulse"></div>
                    <div className="absolute top-56 right-24 w-36 h-36 border border-white/20 rounded-lg rotate-45 animate-spin" style={{ animationDuration: '30s' }}></div>
                    <div className="absolute bottom-32 left-24 w-28 h-28 border border-white/20 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute bottom-20 right-28 w-40 h-40 border border-white/20 rounded-lg animate-pulse" style={{ animationDelay: '4s' }}></div>
                </div>
                
                <div className="relative z-10 flex flex-col justify-center items-center p-12 w-full">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20">
                            <Lock className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">
                            Nouveau Mot de Passe
                        </h1>
                        <p className="text-xl text-emerald-100 max-w-md">
                            Créez un mot de passe fort pour sécuriser votre compte professionnel
                        </p>
                    </div>
                    
                    {/* Security Guidelines */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8 max-w-md w-full">
                        <h3 className="text-white font-semibold text-lg mb-6 text-center flex items-center justify-center">
                            <Shield className="w-5 h-5 mr-2" />
                            Conseils de Sécurité
                        </h3>
                        <div className="space-y-4">
                            {securityTips.map((tip, index) => (
                                <div 
                                    key={index}
                                    className="flex items-start space-x-3 text-white/90 animate-fade-in"
                                    style={{ animationDelay: `${index * 0.3}s` }}
                                >
                                    <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                    </div>
                                    <span className="text-sm leading-relaxed">{tip}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Security Features */}
                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-6 text-white/60">
                            <div className="flex items-center space-x-2">
                                <Shield className="w-4 h-4" />
                                <span className="text-sm">Cryptage SSL</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Lock className="w-4 h-4" />
                                <span className="text-sm">Sécurisé</span>
                            </div>
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
                            <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Réinitialiser le mot de passe</h2>
                            <p className="text-gray-600 mt-2">Créez un nouveau mot de passe sécurisé</p>
                        </div>

                        <div className="space-y-6">{/* Form wrapper */}
                            <div>
                                <Label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Adresse e-mail
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        autoComplete="email"
                                        value={data.email}
                                        readOnly
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div>
                                <Label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nouveau mot de passe
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        autoComplete="new-password"
                                        value={data.password}
                                        autoFocus
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                                
                                {/* Password Requirements */}
                                {data.password && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs font-medium text-gray-700 mb-2">Exigences du mot de passe :</p>
                                        <div className="space-y-1">
                                            {passwordRequirements.map((req, index) => {
                                                const isValid = getRequirementStatus(req);
                                                return (
                                                    <div key={index} className="flex items-center space-x-2">
                                                        {isValid ? (
                                                            <Check className="w-3 h-3 text-green-500" />
                                                        ) : (
                                                            <X className="w-3 h-3 text-red-400" />
                                                        )}
                                                        <span className={`text-xs ${isValid ? 'text-green-600' : 'text-gray-500'}`}>
                                                            {req.text}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="password_confirmation" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirmer le mot de passe
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="password_confirmation"
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="password_confirmation"
                                        autoComplete="new-password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <InputError message={errors.password_confirmation} />
                                
                                {/* Password Match Indicator */}
                                {data.password_confirmation && (
                                    <div className="mt-2 flex items-center space-x-2">
                                        {data.password === data.password_confirmation ? (
                                            <>
                                                <Check className="w-4 h-4 text-green-500" />
                                                <span className="text-sm text-green-600">Les mots de passe correspondent</span>
                                            </>
                                        ) : (
                                            <>
                                                <X className="w-4 h-4 text-red-400" />
                                                <span className="text-sm text-red-500">Les mots de passe ne correspondent pas</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <Button 
                                onClick={submit}
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl" 
                                disabled={processing}
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center">
                                        <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
                                        Réinitialisation...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <Shield className="w-5 h-5 mr-2" />
                                        Réinitialiser le mot de passe
                                    </div>
                                )}
                            </Button>
                        </div>

                        {/* Security Notice */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="text-center">
                                <p className="text-xs text-gray-500 mb-3">
                                    Votre nouveau mot de passe sera immédiatement actif
                                </p>
                                <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                                    <span className="flex items-center">
                                        <Shield className="w-3 h-3 mr-1" />
                                        Sécurisé
                                    </span>
                                    <span>•</span>
                                    <span>Crypté</span>
                                    <span>•</span>
                                    <span>Confidentiel</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Security Tips */}
                    <div className="lg:hidden mt-8">
                        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center flex items-center justify-center">
                                <Shield className="w-5 h-5 mr-2 text-emerald-600" />
                                Conseils de Sécurité
                            </h3>
                            <div className="space-y-3">
                                {securityTips.map((tip, index) => (
                                    <div key={index} className="flex items-start space-x-3">
                                        <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
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