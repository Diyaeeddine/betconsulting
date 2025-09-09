"use client"

import { Head, useForm } from "@inertiajs/react"
import { LoaderCircle, Calculator, BarChart3, FileText, Shield, Users, Building2, Eye, EyeOff } from "lucide-react"
import { type FormEventHandler, useState, useEffect } from "react"

import InputError from "@/components/input-error"
import TextLink from "@/components/text-link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { route } from "ziggy-js"

type LoginForm = {
  email: string
  password: string
  remember: boolean
}

interface LoginProps {
  status?: string
  canResetPassword: boolean
}

export default function Login({ status, canResetPassword }: LoginProps) {
  const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
    email: "",
    password: "",
    remember: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const submit: FormEventHandler = (e) => {
    e.preventDefault()
    post(route("login"), {
      onFinish: () => reset("password"),
    })
  }

  const departments = [
    { icon: Building2, name: "Direction Générale", color: "text-blue-600" },
    { icon: BarChart3, name: "Marchés & Marketing", color: "text-green-600" },
    { icon: FileText, name: "Études Techniques", color: "text-purple-600" },
    { icon: Shield, name: "Qualité & Audit", color: "text-red-600" },
    { icon: Calculator, name: "Financier & Comptabilité", color: "text-orange-600" },
    { icon: Users, name: "Ressources Humaines", color: "text-teal-600" },
  ]

  return (
    <div className="min-h-screen flex">
      <Head title="Connexion" />

      {/* Left side - Company Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div
            className={`absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full ${isLoaded ? "animate-pulse-glow" : "opacity-0"}`}
          ></div>
          <div
            className={`absolute top-40 right-32 w-24 h-24 border border-white/20 rounded-lg rotate-45 ${isLoaded ? "animate-spin" : "opacity-0"}`}
            style={{ animationDuration: "20s" }}
          ></div>
          <div
            className={`absolute bottom-32 left-32 w-20 h-20 border border-white/20 rounded-full ${isLoaded ? "animate-bounce" : "opacity-0"}`}
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className={`absolute bottom-20 right-20 w-28 h-28 border border-white/20 rounded-lg ${isLoaded ? "animate-pulse" : "opacity-0"}`}
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center p-12 w-full">
          <div className="text-center mb-12">
            <h1
              className={`text-5xl font-extrabold text-white tracking-wide mb-4 drop-shadow-sm transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              Bet<span className="text-white">Consulting</span>
            </h1>
          
            <div
              className={`mt-6 flex justify-center transition-all duration-1000 delay-500 ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
            >
              <span className="block w-20 h-1 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 rounded-full"></span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 max-w-md">
            {departments.map((dept, index) => (
              <div
                key={dept.name}
                className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 ${isLoaded ? "animate-fade-in" : "opacity-0"}`}
                style={{ animationDelay: `${index * 0.2 + 0.8}s` }}
              >
                <dept.icon className={`w-6 h-6 ${dept.color} mb-2`} />
                <p className="text-white text-sm font-medium leading-tight">{dept.name}</p>
              </div>
            ))}
          </div>

          <div
            className={`mt-12 flex items-center space-x-8 text-white/60 transition-all duration-1000 delay-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Sécurisé</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">Analytics</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span className="text-sm">Documentation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Professional Management Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-0 left-0 w-full h-full">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                                    linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px)
                                `,
                  backgroundSize: "60px 60px",
                }}
              ></div>

              <div
                className={`absolute top-20 left-10 w-32 h-32 border-2 border-blue-200/40 rounded-xl rotate-12 ${isLoaded ? "animate-pulse-glow" : "opacity-0"}`}
              ></div>
              <div
                className={`absolute top-40 right-20 w-24 h-24 border-2 border-indigo-200/40 rounded-full ${isLoaded ? "animate-pulse" : "opacity-0"}`}
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className={`absolute bottom-32 left-1/4 w-20 h-20 border-2 border-slate-200/40 rounded-lg rotate-45 ${isLoaded ? "animate-pulse" : "opacity-0"}`}
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className={`absolute bottom-20 right-10 w-16 h-16 bg-gradient-to-r from-blue-100/40 to-indigo-100/40 rounded-full ${isLoaded ? "animate-pulse" : "opacity-0"}`}
                style={{ animationDelay: "0.7s" }}
              ></div>
            </div>
          </div>

          <div className="absolute inset-0 opacity-50">
            <div
              className={`absolute top-16 left-16 w-16 h-16 transition-all duration-1000 ${isLoaded ? "animate-holographic-entry opacity-100" : "opacity-0"}`}
            >
              <svg viewBox="0 0 64 64" className="w-full h-full text-blue-400 drop-shadow-lg">
                <rect
                  x="8"
                  y="32"
                  width="8"
                  height="24"
                  rx="2"
                  fill="currentColor"
                  className={`${isLoaded ? "animate-bar-growth" : ""}`}
                  style={{ animationDelay: "0.1s" }}
                />
                <rect
                  x="20"
                  y="24"
                  width="8"
                  height="32"
                  rx="2"
                  fill="currentColor"
                  className={`${isLoaded ? "animate-bar-growth" : ""}`}
                  style={{ animationDelay: "0.2s" }}
                />
                <rect
                  x="32"
                  y="16"
                  width="8"
                  height="40"
                  rx="2"
                  fill="currentColor"
                  className={`${isLoaded ? "animate-bar-growth" : ""}`}
                  style={{ animationDelay: "0.3s" }}
                />
                <rect
                  x="44"
                  y="20"
                  width="8"
                  height="36"
                  rx="2"
                  fill="currentColor"
                  className={`${isLoaded ? "animate-bar-growth" : ""}`}
                  style={{ animationDelay: "0.4s" }}
                />
                <path
                  d="M8 16 L20 12 L32 8 L44 12 L56 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className={`opacity-60 ${isLoaded ? "animate-line-draw" : ""}`}
                />
                <circle cx="8" cy="16" r="2" fill="currentColor" />
                <circle cx="20" cy="12" r="2" fill="currentColor" />
                <circle cx="32" cy="8" r="2" fill="currentColor" />
                <circle cx="44" cy="12" r="2" fill="currentColor" />
                <circle cx="56" cy="8" r="2" fill="currentColor" />
              </svg>
            </div>

            <div
              className={`absolute top-32 right-24 w-12 h-12 transition-all duration-1000 delay-300 ${isLoaded ? "animate-quantum-float opacity-100" : "opacity-0"}`}
            >
              <svg viewBox="0 0 48 48" className="w-full h-full text-green-400 drop-shadow-lg">
                <path
                  d="M8 40 L24 24 L32 32 L40 8"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className={`${isLoaded ? "animate-arrow-trace" : ""}`}
                />
                <path d="M32 8 L40 8 L40 16" stroke="currentColor" strokeWidth="3" fill="none" />
                <circle cx="8" cy="40" r="2" fill="currentColor" />
                <circle cx="24" cy="24" r="2" fill="currentColor" />
                <circle cx="32" cy="32" r="2" fill="currentColor" />
                <circle cx="40" cy="8" r="2" fill="currentColor" />
              </svg>
            </div>

            <div
              className={`absolute bottom-40 left-20 w-10 h-10 transition-all duration-1000 delay-500 ${isLoaded ? "animate-cyber-materialize opacity-100" : "opacity-0"}`}
            >
              <svg viewBox="0 0 40 40" className="w-full h-full text-purple-400 drop-shadow-lg">
                <rect x="6" y="16" width="28" height="18" rx="3" fill="currentColor" />
                <rect x="8" y="18" width="24" height="2" fill="currentColor" className="opacity-60" />
                <rect x="15" y="12" width="10" height="4" rx="1" fill="currentColor" />
                <rect x="17" y="8" width="6" height="4" rx="1" fill="currentColor" />
                <circle
                  cx="20"
                  cy="25"
                  r="2"
                  fill="currentColor"
                  className={`opacity-40 ${isLoaded ? "animate-energy-pulse" : ""}`}
                />
                <rect x="18" y="30" width="4" height="2" rx="1" fill="currentColor" className="opacity-60" />
              </svg>
            </div>

            <div
              className={`absolute bottom-24 right-32 w-12 h-12 transition-all duration-1000 delay-700 ${isLoaded ? "animate-justice-balance opacity-100" : "opacity-0"}`}
            >
              <svg viewBox="0 0 48 48" className="w-full h-full text-red-400 drop-shadow-lg">
                <line x1="24" y1="8" x2="24" y2="40" stroke="currentColor" strokeWidth="2" />
                <line x1="12" y1="16" x2="36" y2="16" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M8 20 Q12 24 16 20 L12 16 Z"
                  fill="currentColor"
                  className={`${isLoaded ? "animate-pulse" : ""}`}
                  style={{ animationDelay: "0.5s" }}
                />
                <path
                  d="M32 20 Q36 24 40 20 L36 16 Z"
                  fill="currentColor"
                  className={`${isLoaded ? "animate-pulse" : ""}`}
                  style={{ animationDelay: "0.7s" }}
                />
                <rect x="22" y="6" width="4" height="4" rx="2" fill="currentColor" />
                <rect x="20" y="38" width="8" height="4" rx="2" fill="currentColor" />
              </svg>
            </div>

            <div
              className={`absolute top-1/2 left-8 w-10 h-10 transition-all duration-1000 delay-900 ${isLoaded ? "animate-building-construct opacity-100" : "opacity-0"}`}
            >
              <svg viewBox="0 0 40 40" className="w-full h-full text-orange-400 drop-shadow-lg">
                <rect x="8" y="12" width="24" height="24" rx="2" fill="currentColor" />
                <rect x="12" y="8" width="16" height="4" rx="1" fill="currentColor" />
                <rect
                  x="11"
                  y="16"
                  width="3"
                  height="3"
                  rx="0.5"
                  fill="currentColor"
                  className={`opacity-60 ${isLoaded ? "animate-window-light" : ""}`}
                  style={{ animationDelay: "1s" }}
                />
                <rect
                  x="15"
                  y="16"
                  width="3"
                  height="3"
                  rx="0.5"
                  fill="currentColor"
                  className={`opacity-60 ${isLoaded ? "animate-window-light" : ""}`}
                  style={{ animationDelay: "1.1s" }}
                />
                <rect
                  x="23"
                  y="16"
                  width="3"
                  height="3"
                  rx="0.5"
                  fill="currentColor"
                  className={`opacity-60 ${isLoaded ? "animate-window-light" : ""}`}
                  style={{ animationDelay: "1.2s" }}
                />
                <rect
                  x="27"
                  y="16"
                  width="3"
                  height="3"
                  rx="0.5"
                  fill="currentColor"
                  className={`opacity-60 ${isLoaded ? "animate-window-light" : ""}`}
                  style={{ animationDelay: "1.3s" }}
                />
                <rect
                  x="11"
                  y="22"
                  width="3"
                  height="3"
                  rx="0.5"
                  fill="currentColor"
                  className={`opacity-60 ${isLoaded ? "animate-window-light" : ""}`}
                  style={{ animationDelay: "1.4s" }}
                />
                <rect
                  x="15"
                  y="22"
                  width="3"
                  height="3"
                  rx="0.5"
                  fill="currentColor"
                  className={`opacity-60 ${isLoaded ? "animate-window-light" : ""}`}
                  style={{ animationDelay: "1.5s" }}
                />
                <rect
                  x="23"
                  y="22"
                  width="3"
                  height="3"
                  rx="0.5"
                  fill="currentColor"
                  className={`opacity-60 ${isLoaded ? "animate-window-light" : ""}`}
                  style={{ animationDelay: "1.6s" }}
                />
                <rect
                  x="27"
                  y="22"
                  width="3"
                  height="3"
                  rx="0.5"
                  fill="currentColor"
                  className={`opacity-60 ${isLoaded ? "animate-window-light" : ""}`}
                  style={{ animationDelay: "1.7s" }}
                />
                <rect x="18" y="28" width="4" height="8" rx="1" fill="currentColor" className="opacity-80" />
              </svg>
            </div>

            <div
              className={`absolute top-1/3 right-12 w-8 h-8 transition-all duration-1000 delay-1100 ${isLoaded ? "animate-document-digitize opacity-100" : "opacity-0"}`}
            >
              <svg viewBox="0 0 32 32" className="w-full h-full text-teal-400 drop-shadow-lg">
                <rect x="6" y="4" width="20" height="24" rx="2" fill="currentColor" />
                <rect x="10" y="2" width="12" height="4" rx="2" fill="currentColor" className="opacity-80" />
                <rect
                  x="10"
                  y="10"
                  width="12"
                  height="1.5"
                  rx="0.75"
                  fill="currentColor"
                  className={`opacity-40 ${isLoaded ? "animate-text-type" : ""}`}
                  style={{ animationDelay: "1.2s" }}
                />
                <rect
                  x="10"
                  y="14"
                  width="12"
                  height="1.5"
                  rx="0.75"
                  fill="currentColor"
                  className={`opacity-40 ${isLoaded ? "animate-text-type" : ""}`}
                  style={{ animationDelay: "1.3s" }}
                />
                <rect
                  x="10"
                  y="18"
                  width="8"
                  height="1.5"
                  rx="0.75"
                  fill="currentColor"
                  className={`opacity-40 ${isLoaded ? "animate-text-type" : ""}`}
                  style={{ animationDelay: "1.4s" }}
                />
                <rect
                  x="10"
                  y="22"
                  width="10"
                  height="1.5"
                  rx="0.75"
                  fill="currentColor"
                  className={`opacity-40 ${isLoaded ? "animate-text-type" : ""}`}
                  style={{ animationDelay: "1.5s" }}
                />
                <circle cx="22" cy="20" r="1" fill="currentColor" className="opacity-60" />
              </svg>
            </div>
          </div>

          <div className="absolute top-0 left-0 w-full h-full">
            <div
              className={`absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300/30 to-transparent ${isLoaded ? "animate-scan-line" : "opacity-0"}`}
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className={`absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-300/20 to-transparent ${isLoaded ? "animate-scan-line" : "opacity-0"}`}
              style={{ animationDelay: "2.5s" }}
            ></div>
          </div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-200/20 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-200/20 to-transparent rounded-tr-full"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div
            className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="text-center mb-8">
              <div
                className={`w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg transition-all duration-1000 delay-300 ${isLoaded ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-10 rotate-120"}`}
              >
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h2
                className={`text-2xl font-bold text-gray-900 transition-all duration-1000 delay-500 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              >
                Connexion à votre compte
              </h2>
              <p
                className={`text-gray-600 mt-2 transition-all duration-1000 delay-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              >
                Accédez à vos services professionnels
              </p>
            </div>

            {status && (
              <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800 text-center">{status}</p>
              </div>
            )}

            <form onSubmit={submit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
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
                  onChange={(e) => setData("email", e.target.value)}
                  placeholder="email@exemple.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                />
                <InputError message={errors.email} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Mot de passe
                  </Label>
                  {canResetPassword && (
                    <TextLink
                      href={route("password.request")}
                      className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                      tabIndex={5}
                    >
                      Mot de passe oublié ?
                    </TextLink>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    tabIndex={2}
                    autoComplete="current-password"
                    value={data.password}
                    onChange={(e) => setData("password", e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <InputError message={errors.password} />
              </div>

              <div className="flex items-center">
                <Checkbox
                  id="remember"
                  name="remember"
                  checked={data.remember}
                  onCheckedChange={(checked) => setData("remember", checked as boolean)}
                  tabIndex={3}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="remember" className="ml-3 text-sm text-gray-700">
                  Se souvenir de moi
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                tabIndex={4}
                disabled={processing}
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
                    Connexion...
                  </div>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                <span className="flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  Sécurisé SSL
                </span>
                <span>•</span>
                <span>Support 24/7</span>
                <span>•</span>
                <span>Conformité RGPD</span>
              </div>
            </div>
          </div>

          {/* Mobile Services Display */}
          <div className="lg:hidden mt-8">
            <div
              className={`bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-white/20 transition-all duration-1000 delay-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Services Disponibles</h3>
              <div className="grid grid-cols-3 gap-4">
                {departments.slice(0, 6).map((dept, index) => (
                  <div key={dept.name} className="text-center">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <dept.icon className={`w-5 h-5 ${dept.color}`} />
                    </div>
                    <p className="text-xs text-gray-600 leading-tight">{dept.name}</p>
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

                /* Futuristic 2050 Icon Animations */
                @keyframes holographic-entry {
                    0% {
                        opacity: 0;
                        transform: scale(0.3) rotateY(-90deg) translateZ(-100px);
                        filter: blur(10px) hue-rotate(180deg);
                    }
                    50% {
                        opacity: 0.7;
                        transform: scale(1.1) rotateY(10deg) translateZ(20px);
                        filter: blur(2px) hue-rotate(90deg);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) rotateY(0deg) translateZ(0px);
                        filter: blur(0px) hue-rotate(0deg);
                    }
                }

                @keyframes quantum-float {
                    0% {
                        transform: translateY(0px) rotateZ(0deg) scale(0.8);
                        opacity: 0;
                        filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.8));
                    }
                    25% {
                        transform: translateY(-8px) rotateZ(5deg) scale(1.05);
                        opacity: 0.8;
                        filter: drop-shadow(0 0 30px rgba(34, 197, 94, 0.6));
                    }
                    50% {
                        transform: translateY(-4px) rotateZ(-3deg) scale(1);
                        opacity: 1;
                        filter: drop-shadow(0 0 25px rgba(34, 197, 94, 0.4));
                    }
                    75% {
                        transform: translateY(-6px) rotateZ(2deg) scale(1.02);
                        opacity: 0.9;
                        filter: drop-shadow(0 0 35px rgba(34, 197, 94, 0.5));
                    }
                    100% {
                        transform: translateY(0px) rotateZ(0deg) scale(1);
                        opacity: 1;
                        filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.3));
                    }
                }

                @keyframes cyber-materialize {
                    0% {
                        opacity: 0;
                        transform: scale(0.1) rotateX(90deg);
                        filter: brightness(3) contrast(2) saturate(2);
                    }
                    30% {
                        opacity: 0.6;
                        transform: scale(0.7) rotateX(45deg);
                        filter: brightness(2) contrast(1.5) saturate(1.5);
                    }
                    60% {
                        opacity: 0.9;
                        transform: scale(1.1) rotateX(-10deg);
                        filter: brightness(1.2) contrast(1.2) saturate(1.2);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) rotateX(0deg);
                        filter: brightness(1) contrast(1) saturate(1);
                    }
                }

                @keyframes balance-emergence {
                    0% {
                        opacity: 0;
                        transform: translateY(50px) rotateZ(-180deg) scale(0.2);
                        filter: sepia(1) hue-rotate(180deg);
                    }
                    40% {
                        opacity: 0.7;
                        transform: translateY(10px) rotateZ(-45deg) scale(0.8);
                        filter: sepia(0.5) hue-rotate(90deg);
                    }
                    70% {
                        opacity: 0.9;
                        transform: translateY(-5px) rotateZ(10deg) scale(1.1);
                        filter: sepia(0.2) hue-rotate(30deg);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0px) rotateZ(0deg) scale(1);
                        filter: sepia(0) hue-rotate(0deg);
                    }
                }

                @keyframes building-construct {
                    0% {
                        opacity: 0;
                        transform: translateY(100px) scaleY(0.1);
                        filter: blur(5px) brightness(2);
                    }
                    25% {
                        opacity: 0.4;
                        transform: translateY(50px) scaleY(0.4);
                        filter: blur(3px) brightness(1.5);
                    }
                    50% {
                        opacity: 0.7;
                        transform: translateY(20px) scaleY(0.7);
                        filter: blur(1px) brightness(1.2);
                    }
                    75% {
                        opacity: 0.9;
                        transform: translateY(5px) scaleY(0.9);
                        filter: blur(0.5px) brightness(1.1);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0px) scaleY(1);
                        filter: blur(0px) brightness(1);
                    }
                }

                @keyframes document-digitize {
                    0% {
                        opacity: 0;
                        transform: rotateY(-90deg) translateX(-50px);
                        filter: contrast(3) brightness(0.3);
                    }
                    30% {
                        opacity: 0.5;
                        transform: rotateY(-30deg) translateX(-20px);
                        filter: contrast(2) brightness(0.6);
                    }
                    60% {
                        opacity: 0.8;
                        transform: rotateY(10deg) translateX(5px);
                        filter: contrast(1.3) brightness(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: rotateY(0deg) translateX(0px);
                        filter: contrast(1) brightness(1);
                    }
                }

                /* Individual Element Animations */
                @keyframes bar-growth {
                    0% {
                        transform: scaleY(0);
                        opacity: 0;
                    }
                    50% {
                        transform: scaleY(1.2);
                        opacity: 0.8;
                    }
                    100% {
                        transform: scaleY(1);
                        opacity: 1;
                    }
                }

                @keyframes line-draw {
                    0% {
                        stroke-dasharray: 0 200;
                        opacity: 0;
                    }
                    50% {
                        stroke-dasharray: 100 200;
                        opacity: 0.8;
                    }
                    100% {
                        stroke-dasharray: 200 200;
                        opacity: 1;
                    }
                }

                @keyframes pulse-glow {
                    0%, 100% {
                        filter: drop-shadow(0 0 5px currentColor);
                        transform: scale(1);
                    }
                    50% {
                        filter: drop-shadow(0 0 15px currentColor);
                        transform: scale(1.05);
                    }
                }

                @keyframes arrow-trace {
                    0% {
                        stroke-dasharray: 0 100;
                        filter: drop-shadow(0 0 10px currentColor);
                    }
                    100% {
                        stroke-dasharray: 100 100;
                        filter: drop-shadow(0 0 20px currentColor);
                    }
                }

                @keyframes energy-pulse {
                    0%, 100% {
                        transform: scale(1);
                        filter: drop-shadow(0 0 8px currentColor);
                    }
                    50% {
                        transform: scale(1.5);
                        filter: drop-shadow(0 0 20px currentColor);
                    }
                }

                @keyframes scan-line {
                    0% {
                        transform: scaleX(0);
                        filter: brightness(3);
                    }
                    50% {
                        transform: scaleX(1);
                        filter: brightness(2);
                    }
                    100% {
                        transform: scaleX(1);
                        filter: brightness(1);
                    }
                }

                @keyframes window-light {
                    0% {
                        opacity: 0;
                        filter: brightness(0.3);
                    }
                    50% {
                        opacity: 1;
                        filter: brightness(2);
                    }
                    100% {
                        opacity: 0.6;
                        filter: brightness(1);
                    }
                }

                @keyframes text-type {
                    0% {
                        width: 0;
                        opacity: 0;
                    }
                    50% {
                        opacity: 0.8;
                    }
                    100% {
                        width: 100%;
                        opacity: 0.4;
                    }
                }

                /* Apply animations */
                .animate-holographic-entry {
                    animation: holographic-entry 2s ease-out forwards;
                }

                .animate-quantum-float {
                    animation: quantum-float 2.5s ease-in-out forwards;
                }

                .animate-cyber-materialize {
                    animation: cyber-materialize 1.8s ease-out forwards;
                }

                .animate-balance-emergence {
                    animation: balance-emergence 2.2s ease-out forwards;
                }

                .animate-building-construct {
                    animation: building-construct 2s ease-out forwards;
                }

                .animate-document-digitize {
                    animation: document-digitize 1.5s ease-out forwards;
                }
            `}</style>
    </div>
  )
}
