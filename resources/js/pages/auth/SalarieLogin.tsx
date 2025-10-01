'use client';

import { Head, useForm } from '@inertiajs/react';
import { Award, Briefcase, Calendar, ClipboardList, Eye, EyeOff, FileCheck, LoaderCircle, Users } from 'lucide-react';
import { type FormEventHandler, useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { route } from 'ziggy-js';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
}

export default function SalarieLogin({ status }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoaded(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('salarie.login'), {
            onFinish: () => reset('password'),
        });
    };

    const features = [
        { icon: ClipboardList, name: 'Mes Tâches', color: 'text-emerald-600' },
        { icon: Calendar, name: 'Planning', color: 'text-blue-600' },
        { icon: FileCheck, name: 'Documents', color: 'text-purple-600' },
        { icon: Briefcase, name: 'Projets', color: 'text-orange-600' },
        { icon: Award, name: 'Formations', color: 'text-pink-600' },
        { icon: Users, name: 'Équipe', color: 'text-teal-600' },
    ];

    return (
        <div className="flex min-h-screen">
            <Head title="Connexion Salarié" />

            {/* Left side - Employee Branding */}
            <div className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 lg:flex lg:w-1/2">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 opacity-10">
                    <div
                        className={`absolute top-20 left-20 h-32 w-32 rounded-full border border-white/20 ${isLoaded ? 'animate-pulse-glow' : 'opacity-0'}`}
                    ></div>
                    <div
                        className={`absolute top-40 right-32 h-24 w-24 rotate-45 rounded-lg border border-white/20 ${isLoaded ? 'animate-spin' : 'opacity-0'}`}
                        style={{ animationDuration: '20s' }}
                    ></div>
                    <div
                        className={`absolute bottom-32 left-32 h-20 w-20 rounded-full border border-white/20 ${isLoaded ? 'animate-bounce' : 'opacity-0'}`}
                        style={{ animationDelay: '1s' }}
                    ></div>
                    <div
                        className={`absolute right-20 bottom-20 h-28 w-28 rounded-lg border border-white/20 ${isLoaded ? 'animate-pulse' : 'opacity-0'}`}
                        style={{ animationDelay: '2s' }}
                    ></div>
                </div>

                <div className="relative z-10 flex w-full flex-col items-center justify-center p-12">
                    <div className="mb-12 text-center">
                        <h1
                            className={`mb-4 text-5xl font-extrabold tracking-wide text-white drop-shadow-sm transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                        >
                            Bet<span className="text-white">Consulting</span>
                        </h1>
                        <p
                            className={`text-lg font-medium text-emerald-100 transition-all delay-300 duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                        >
                            Espace Salarié
                        </p>
                        <div
                            className={`mt-6 flex justify-center transition-all delay-500 duration-1000 ${isLoaded ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}
                        >
                            <span className="block h-1 w-20 rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400"></span>
                        </div>
                    </div>

                    <div className="grid max-w-md grid-cols-2 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={feature.name}
                                className={`rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}
                                style={{ animationDelay: `${index * 0.2 + 0.8}s` }}
                            >
                                <feature.icon className={`h-6 w-6 ${feature.color} mb-2`} />
                                <p className="text-sm leading-tight font-medium text-white">{feature.name}</p>
                            </div>
                        ))}
                    </div>

                    <div
                        className={`mt-12 flex items-center space-x-8 text-white/60 transition-all delay-1000 duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                    >
                        <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span className="text-sm">Collaboration</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <ClipboardList className="h-4 w-4" />
                            <span className="text-sm">Suivi</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Award className="h-4 w-4" />
                            <span className="text-sm">Formation</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="relative flex w-full items-center justify-center overflow-hidden p-8 lg:w-1/2">
                {/* Professional Employee Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
                    <div className="absolute inset-0 opacity-50">
                        <div className="absolute top-0 left-0 h-full w-full">
                            <div
                                className="absolute inset-0"
                                style={{
                                    backgroundImage: `
                    linear-gradient(rgba(16,185,129,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(16,185,129,0.1) 1px, transparent 1px)
                  `,
                                    backgroundSize: '60px 60px',
                                }}
                            ></div>

                            <div
                                className={`absolute top-20 left-10 h-32 w-32 rotate-12 rounded-xl border-2 border-emerald-200/40 ${isLoaded ? 'animate-pulse-glow' : 'opacity-0'}`}
                            ></div>
                            <div
                                className={`absolute top-40 right-20 h-24 w-24 rounded-full border-2 border-teal-200/40 ${isLoaded ? 'animate-pulse' : 'opacity-0'}`}
                                style={{ animationDelay: '1s' }}
                            ></div>
                            <div
                                className={`absolute bottom-32 left-1/4 h-20 w-20 rotate-45 rounded-lg border-2 border-cyan-200/40 ${isLoaded ? 'animate-pulse' : 'opacity-0'}`}
                                style={{ animationDelay: '0.5s' }}
                            ></div>
                            <div
                                className={`absolute right-10 bottom-20 h-16 w-16 rounded-full bg-gradient-to-r from-emerald-100/40 to-teal-100/40 ${isLoaded ? 'animate-pulse' : 'opacity-0'}`}
                                style={{ animationDelay: '0.7s' }}
                            ></div>
                        </div>
                    </div>

                    {/* Employee Icons */}
                    <div className="absolute inset-0 opacity-50">
                        <div
                            className={`absolute top-16 left-16 h-16 w-16 transition-all duration-1000 ${isLoaded ? 'animate-holographic-entry opacity-100' : 'opacity-0'}`}
                        >
                            <svg viewBox="0 0 64 64" className="h-full w-full text-emerald-400 drop-shadow-lg">
                                <circle cx="32" cy="20" r="12" fill="currentColor" className="opacity-80" />
                                <path d="M16 52 C16 42, 22 38, 32 38 C42 38, 48 42, 48 52 Z" fill="currentColor" className="opacity-80" />
                            </svg>
                        </div>

                        <div
                            className={`absolute top-32 right-24 h-12 w-12 transition-all delay-300 duration-1000 ${isLoaded ? 'animate-quantum-float opacity-100' : 'opacity-0'}`}
                        >
                            <svg viewBox="0 0 48 48" className="h-full w-full text-teal-400 drop-shadow-lg">
                                <rect x="8" y="12" width="32" height="28" rx="2" fill="currentColor" className="opacity-80" />
                                <rect x="12" y="8" width="24" height="4" rx="2" fill="currentColor" />
                                <line x1="14" y1="20" x2="34" y2="20" stroke="currentColor" strokeWidth="2" className="opacity-60" />
                                <line x1="14" y1="26" x2="34" y2="26" stroke="currentColor" strokeWidth="2" className="opacity-60" />
                                <line x1="14" y1="32" x2="28" y2="32" stroke="currentColor" strokeWidth="2" className="opacity-60" />
                            </svg>
                        </div>

                        <div
                            className={`absolute bottom-40 left-20 h-10 w-10 transition-all delay-500 duration-1000 ${isLoaded ? 'animate-cyber-materialize opacity-100' : 'opacity-0'}`}
                        >
                            <svg viewBox="0 0 40 40" className="h-full w-full text-cyan-400 drop-shadow-lg">
                                <rect x="8" y="8" width="24" height="24" rx="2" fill="currentColor" className="opacity-80" />
                                <path d="M12 20 L18 26 L28 14" stroke="white" strokeWidth="2" fill="none" />
                            </svg>
                        </div>

                        <div
                            className={`absolute right-32 bottom-24 h-12 w-12 transition-all delay-700 duration-1000 ${isLoaded ? 'animate-building-construct opacity-100' : 'opacity-0'}`}
                        >
                            <svg viewBox="0 0 48 48" className="h-full w-full text-emerald-400 drop-shadow-lg">
                                <rect x="12" y="8" width="24" height="32" rx="2" fill="currentColor" className="opacity-80" />
                                <circle cx="18" cy="16" r="2" fill="white" className="opacity-60" />
                                <circle cx="24" cy="16" r="2" fill="white" className="opacity-60" />
                                <circle cx="30" cy="16" r="2" fill="white" className="opacity-60" />
                                <rect x="18" y="24" width="12" height="12" rx="1" fill="white" className="opacity-60" />
                            </svg>
                        </div>
                    </div>

                    <div className="absolute top-0 left-0 h-full w-full">
                        <div
                            className={`absolute top-1/4 left-0 h-px w-full bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent ${isLoaded ? 'animate-scan-line' : 'opacity-0'}`}
                            style={{ animationDelay: '2s' }}
                        ></div>
                        <div
                            className={`absolute top-2/3 left-0 h-px w-full bg-gradient-to-r from-transparent via-teal-300/20 to-transparent ${isLoaded ? 'animate-scan-line' : 'opacity-0'}`}
                            style={{ animationDelay: '2.5s' }}
                        ></div>
                    </div>

                    <div className="absolute top-0 right-0 h-64 w-64 rounded-bl-full bg-gradient-to-bl from-emerald-200/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 h-48 w-48 rounded-tr-full bg-gradient-to-tr from-teal-200/20 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full max-w-md">
                    <div
                        className={`rounded-2xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-sm transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                    >
                        <div className="mb-8 text-center">
                            <div
                                className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 shadow-lg transition-all delay-300 duration-1000 ${isLoaded ? 'scale-100 rotate-0 opacity-100' : 'scale-10 rotate-120 opacity-0'}`}
                            >
                                <Users className="h-8 w-8 text-white" />
                            </div>
                            <h2
                                className={`text-2xl font-bold text-gray-900 transition-all delay-500 duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                            >
                                Espace Salarié
                            </h2>
                            <p
                                className={`mt-2 text-gray-600 transition-all delay-700 duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                            >
                                Accédez à votre espace de travail
                            </p>
                        </div>

                        {status && (
                            <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                                <p className="text-center text-sm font-medium text-emerald-800">{status}</p>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <Label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
                                    Adresse e-mail
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="email@exemple.com"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all duration-200 outline-none focus:border-transparent focus:ring-2 focus:ring-emerald-500"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <Label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                        Mot de passe
                                    </Label>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 transition-all duration-200 outline-none focus:border-transparent focus:ring-2 focus:ring-emerald-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    checked={data.remember}
                                    onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                    tabIndex={3}
                                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <Label htmlFor="remember" className="ml-3 text-sm text-gray-700">
                                    Se souvenir de moi
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full transform rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-emerald-700 hover:to-teal-800 hover:shadow-xl active:scale-[0.98] disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
                                tabIndex={4}
                                disabled={processing}
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center">
                                        <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                                        Connexion...
                                    </div>
                                ) : (
                                    'Se connecter'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <a href="/" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                                ← Retour à l'accueil
                            </a>
                        </div>

                        <div className="mt-8 border-t border-gray-100 pt-6">
                            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                                <span className="flex items-center">
                                    <Users className="mr-1 h-3 w-3" />
                                    Support RH
                                </span>
                                <span>•</span>
                                <span>Aide 24/7</span>
                                <span>•</span>
                                <span>Sécurisé</span>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Features Display */}
                    <div className="mt-8 lg:hidden">
                        <div
                            className={`rounded-xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-sm transition-all delay-1000 duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                        >
                            <h3 className="mb-4 text-center text-lg font-semibold text-gray-900">Fonctionnalités</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {features.slice(0, 6).map((feature, index) => (
                                    <div key={feature.name} className="text-center">
                                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
                                            <feature.icon className={`h-5 w-5 ${feature.color}`} />
                                        </div>
                                        <p className="text-xs leading-tight text-gray-600">{feature.name}</p>
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

        @keyframes holographic-entry {
          0% {
            opacity: 0;
            transform: scale(0.3) rotateY(-90deg);
            filter: blur(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotateY(0deg);
            filter: blur(0px);
          }
        }

        @keyframes quantum-float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes cyber-materialize {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes building-construct {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0px);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes scan-line {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-holographic-entry {
          animation: holographic-entry 1s ease-out forwards;
        }

        .animate-quantum-float {
          animation: quantum-float 3s ease-in-out infinite;
        }

        .animate-cyber-materialize {
          animation: cyber-materialize 1s ease-out forwards;
        }

        .animate-building-construct {
          animation: building-construct 1s ease-out forwards;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-scan-line {
          animation: scan-line 3s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
