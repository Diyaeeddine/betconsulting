import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Clock, FileText, Calendar, DollarSign, Building, CheckCircle, XCircle, AlertTriangle, Trash2, Users, CheckSquare } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios"; 
import Pusher from "pusher-js";
import { usePage } from "@inertiajs/react";

type Notification = {
    id: string;
    titre: string;
    commentaire: string | null;
    created_at: string;
    read_at?: string | null;
    priority?: 'critique' | 'urgent' | 'normal' | 'info';
    document_type?: string;
    days_until_expiration?: number;
    date_expiration?: string;
    action_required?: boolean;
    type?: string;
    document_id?: string;
    periodicite?: string;
    marche_id?: string;
    reference?: string;
    objet?: string;
    type_ao?: string;
    estimation?: number;
    decision?: 'accepte' | 'refuse';
    date_decision?: string;
    date_limite?: string;
    service_origine?: string;
    date?: string;
    taches?: string[];
    nombre_taches?: number;
    projet?: string;
    date_echeance?: string;
    days_until_deadline?: number;
    salarie_id?: string;
    salarie_nom?: string;
    salarie_prenom?: string;
    salarie_matricule?: string;
};

export function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [chargement, setChargement] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const boutonRef = useRef<HTMLButtonElement>(null);
    const { auth } = usePage().props as any; 

    const formatExpirationDate = (dateStr?: string) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const formatCurrency = (amount?: number) => {
        if (!amount) return '';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'MAD'
        }).format(amount);
    };

    const getNotificationIcon = (notification: Notification) => {
        switch (notification.type) {
            case 'document_expiration':
                return <FileText className="h-4 w-4 text-blue-600" />;
            case 'marche_decision':
                return notification.decision === 'accepte' 
                    ? <CheckCircle className="h-4 w-4 text-green-600" />
                    : <XCircle className="h-4 w-4 text-red-600" />;
            case 'marche_validation_admin':
                return <Building className="h-4 w-4 text-purple-600" />;
            case 'validation_profile_salarie':
                return <Users className="h-4 w-4 text-indigo-600" />;
            default:
                switch (notification.priority) {
                    case 'critique':
                        return <AlertTriangle className="h-4 w-4 text-red-600" />;
                    case 'urgent':
                        return <Clock className="h-4 w-4 text-orange-600" />;
                    default:
                        return <Bell className="h-4 w-4 text-blue-600" />;
                }
        }
    };

    const getPriorityBadge = (priority?: string) => {
        switch (priority) {
            case 'critique':
                return <span className="inline-block px-2 py-0.5 text-xs font-medium bg-red-50 text-red-700 rounded-full border border-red-200">Critique</span>;
            case 'urgent':
                return <span className="inline-block px-2 py-0.5 text-xs font-medium bg-orange-50 text-orange-700 rounded-full border border-orange-200">Urgent</span>;
            case 'normal':
                return <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200">Normal</span>;
            case 'info':
                return <span className="inline-block px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 rounded-full border border-green-200">Info</span>;
            default:
                return null;
        }
    };

    const getBackgroundColor = (notification: Notification) => {
        if (!notification.read_at) return 'bg-blue-25 border-l-4 border-l-blue-500';
        return 'hover:bg-gray-25';
    };

    const renderNotificationDetails = (n: Notification) => {
        switch (n.type) {
            case 'document_expiration':
                return (
                    <div className="bg-orange-50 rounded-lg p-3">
                        <div className="grid grid-cols-1 gap-2 text-sm">
                            {n.document_type && (
                                <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    <span className="text-gray-700">Type: {n.document_type}</span>
                                </div>
                            )}
                            {n.days_until_expiration !== undefined && (
                                <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4 text-blue-600" />
                                    <span className={`font-medium ${n.days_until_expiration <= 3 ? 'text-red-700' : 'text-gray-700'}`}>
                                        {n.days_until_expiration === 0 ? "Expire aujourd'hui" :
                                         n.days_until_expiration === 1 ? "Expire demain" :
                                         `Expire dans ${n.days_until_expiration} jours`}
                                    </span>
                                </div>
                            )}
                            {n.date_expiration && (
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                    <span className="text-gray-700">Expire le: {formatExpirationDate(n.date_expiration)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'marche_decision':
                return (
                    <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                        {n.reference && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-900">Ref: {n.reference}</span>
                                </div>
                                {n.decision && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        n.decision === 'accepte' 
                                            ? 'bg-green-100 text-green-800 border border-green-200' 
                                            : 'bg-red-100 text-red-800 border border-red-200'
                                    }`}>
                                        {n.decision === 'accepte' ? 'Accepté' : 'Refusé'}
                                    </span>
                                )}
                            </div>
                        )}
                        {n.objet && <div className="text-sm text-gray-700"><span className="font-medium">Objet:</span> {n.objet}</div>}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {n.type_ao && (
                                <div className="flex items-center space-x-2">
                                    <Building className="h-4 w-4 text-blue-600" />
                                    <span className="text-gray-700">{n.type_ao}</span>
                                </div>
                            )}
                            {n.estimation && (
                                <div className="flex items-center space-x-2">
                                    <DollarSign className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium text-gray-900">{formatCurrency(n.estimation)}</span>
                                </div>
                            )}
                        </div>
                        {n.date_limite && (
                            <div className="flex items-center space-x-2 text-sm">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span className="text-gray-700">Date limite: {formatExpirationDate(n.date_limite)}</span>
                            </div>
                        )}
                    </div>
                );

            case 'marche_validation_admin':
                return (
                    <div className="bg-purple-50 rounded-lg p-3 space-y-2">
                        {n.reference && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm font-medium text-gray-900">Ref: {n.reference}</span>
                                </div>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                    En attente
                                </span>
                            </div>
                        )}
                        {n.objet && <div className="text-sm text-gray-700"><span className="font-medium">Objet:</span> {n.objet}</div>}
                        {n.service_origine && (
                            <div className="flex items-center space-x-2 text-sm">
                                <Building className="h-4 w-4 text-purple-600" />
                                <span className="text-gray-700">Source: {n.service_origine}</span>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {n.type_ao && <div className="flex items-center space-x-2"><span className="text-gray-700">{n.type_ao}</span></div>}
                            {n.estimation && (
                                <div className="flex items-center space-x-2">
                                    <DollarSign className="h-4 w-4 text-purple-600" />
                                    <span className="font-medium text-gray-900">{formatCurrency(n.estimation)}</span>
                                </div>
                            )}
                        </div>
                        {n.date && (
                            <div className="flex items-center space-x-2 text-sm">
                                <Calendar className="h-4 w-4 text-purple-600" />
                                <span className="text-gray-700">Date: {formatExpirationDate(n.date)}</span>
                            </div>
                        )}
                    </div>
                );

            

            case 'validation_profile_salarie':
                return (
                    <div className="bg-indigo-50 rounded-lg p-3 space-y-2">
                        {(n.salarie_nom || n.salarie_prenom) && (
                            <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-indigo-600" />
                                <span className="text-sm font-medium text-gray-900">{n.salarie_nom} {n.salarie_prenom}</span>
                            </div>
                        )}
                        {n.salarie_matricule && <div className="text-sm text-gray-700"><span className="font-medium">Matricule:</span> {n.salarie_matricule}</div>}
                        {n.salarie_id && <div className="text-xs text-gray-500">ID: {n.salarie_id}</div>}
                    </div>
                );

            default:
                return null;
        }
    };

    const chargerNotifications = useCallback(async () => {
        try {
            setChargement(true);
            setError(null);
            const response = await axios.get("/api/notifications");
            setNotifications(response.data);
        } catch (err: any) {
            console.error("Erreur lors du chargement des notifications:", err);
            setError("Impossible de charger les notifications");
        } finally {
            setChargement(false);
        }
    }, []);

    const marquerCommeLue = useCallback(async (notificationId: string) => {
        try {
            await axios.post(`/api/notifications/${notificationId}/read`);
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n));
        } catch (err: any) {
            console.error("Erreur lors du marquage:", err);
        }
    }, []);

    const marquerToutesCommeLues = useCallback(async () => {
        try {
            await axios.post('/api/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
        } catch (err: any) {
            console.error("Erreur lors du marquage de toutes:", err);
        }
    }, []);

    const supprimerNotification = useCallback(async (notificationId: string) => {
        try {
            const response = await axios.delete(`/api/notifications/${notificationId}`);
            if (response.data.success) {
                setNotifications(prev => prev.filter(n => n.id !== notificationId));
            }
        } catch (err: any) {
            console.error("Erreur lors de la suppression:", err);
            alert(err.response?.data?.message || 'Erreur lors de la suppression de la notification');
        }
    }, []);

    const handleNotificationClick = useCallback((notification: Notification) => {
        if (!notification.read_at) {
            marquerCommeLue(notification.id);
        }

        switch (notification.type) {
            case 'document_expiration':
                window.location.href = notification.document_id ? `/documents/` : '/documents/expiration';
                break;
            // case 'marche_decision':
            //     if (notification.marche_id) window.location.href = `/etudes-techniques/marches/${notification.marche_id}`;
            //     break;
            case 'marche_validation_admin':
                window.location.href = `/direction-generale/boite-decision-marche`;
                break;
            case 'validation_profile_salarie':
                window.location.href = `/direction-generale/boite-decision-profile`;
                break;
        }
    }, [marquerCommeLue]);

    const handleActionClick = useCallback((e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    }, []);

    useEffect(() => {
        chargerNotifications();

        const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
            authEndpoint: "/broadcasting/auth",
            auth: {
                headers: {
                    "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
                }
            }
        });

        const canal = pusher.subscribe(`private-user.${auth.user.id}`);

        canal.bind("notification.created", (data: any) => {
            const nd = data.notification || data;
            const notification: Notification = {
                id: nd.id || Math.random().toString(),
                titre: nd.titre || "Notification",
                commentaire: nd.commentaire || null,
                created_at: nd.created_at || new Date().toISOString(),
                read_at: nd.read_at || null,
                priority: nd.priority || 'info',
                document_type: nd.document_type,
                days_until_expiration: nd.days_until_expiration,
                date_expiration: nd.date_expiration,
                action_required: nd.action_required || false,
                type: nd.type || 'general',
                document_id: nd.document_id,
                periodicite: nd.periodicite,
                marche_id: nd.marche_id,
                reference: nd.reference,
                objet: nd.objet,
                type_ao: nd.type_ao,
                estimation: nd.estimation,
                decision: nd.decision,
                date_decision: nd.date_decision,
                date_limite: nd.date_limite,
                service_origine: nd.service_origine,
                date: nd.date,
                taches: nd.taches,
                nombre_taches: nd.nombre_taches,
                projet: nd.projet,
                date_echeance: nd.date_echeance,
                days_until_deadline: nd.days_until_deadline,
                salarie_id: nd.salarie_id,
                salarie_nom: nd.salarie_nom,
                salarie_prenom: nd.salarie_prenom,
                salarie_matricule: nd.salarie_matricule,
            };

            setNotifications(prev => [notification, ...prev]);

            try {
                const audio = new Audio('/sounds/notification.mp3');
                audio.play().catch(() => {});
            } catch (e) {
                console.log("Son de notification non disponible");
            }

            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(notification.titre, {
                    body: notification.commentaire || 'Nouvelle notification',
                    icon: '/favicon.ico'
                });
            }
        });

        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return () => {
            canal.unsubscribe();
            pusher.disconnect();
        };
    }, [auth.user.id, chargerNotifications]);

    const unreadCount = notifications.filter(n => !n.read_at).length;

    return (
        <DropdownMenu onOpenChange={(ouvert) => { if (!ouvert) boutonRef.current?.blur() }}>
          <DropdownMenuTrigger asChild>
            <button ref={boutonRef} className="relative flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 border-2 border-blue-300 text-blue-700 transition-all duration-200 hover:bg-blue-200 hover:border-blue-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white">
              <Bell className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white shadow-lg animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 animate-ping opacity-75"></span>
                </>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-96 shadow-xl border-gray-200 bg-white">
            <DropdownMenuLabel className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
              <span className="font-semibold text-gray-900">Notifications</span>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                      {unreadCount} nouvelles
                    </span>
                    <button 
                      onClick={marquerToutesCommeLues}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Tout marquer lu
                    </button>
                  </>
                )}
                {error && (
                  <button onClick={chargerNotifications} className="text-xs text-blue-600 hover:text-blue-800 underline">
                    Réessayer
                  </button>
                )}
              </div>
            </DropdownMenuLabel>

            <div className="max-h-96 overflow-y-auto">
              {chargement ? (
                <DropdownMenuItem className="flex items-center justify-center py-8 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                    <span>Chargement des notifications...</span>
                  </div>
                </DropdownMenuItem>
              ) : error ? (
                <DropdownMenuItem className="flex flex-col items-center justify-center py-8 text-center text-red-600">
                  <AlertTriangle className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">{error}</span>
                  <button onClick={chargerNotifications} className="text-xs text-blue-600 hover:text-blue-800 underline mt-2">
                    Réessayer
                  </button>
                </DropdownMenuItem>
              ) : notifications.length > 0 ? (
                notifications.map((n) => (
                  <DropdownMenuItem key={n.id} className={`block p-4 transition-colors duration-150 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-blue-25 ${getBackgroundColor(n)}`} onClick={() => handleNotificationClick(n)}>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="p-2 bg-blue-50 rounded-full border border-blue-100">
                            {getNotificationIcon(n)}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 leading-5 mb-1">{n.titre}</h3>
                            <div className="flex items-center space-x-2 ml-2">
                              {getPriorityBadge(n.priority)}
                              {!n.read_at && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-2">
                            {!n.read_at && (
                              <button onClick={(e) => handleActionClick(e, () => marquerCommeLue(n.id))} className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1 p-1 rounded transition-colors hover:bg-blue-50" title="Marquer comme lu">
                                <CheckCircle className="h-3 w-3" />
                                <span>Lu</span>
                              </button>
                            )}
                            <button onClick={(e) => handleActionClick(e, () => { if (window.confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) { supprimerNotification(n.id); } })} className="text-xs text-red-600 hover:text-red-800 flex items-center space-x-1 p-1 rounded transition-colors hover:bg-red-50" title="Supprimer">
                              <Trash2 className="h-3 w-3" />
                              <span>Suppr</span>
                            </button>
                          </div>
                          
                          {n.commentaire && <p className="text-sm text-gray-700 leading-5 mb-2">{n.commentaire}</p>}
                        </div>
                      </div>

                      {renderNotificationDetails(n)}
                      
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-500">{formatExpirationDate(n.created_at)}</span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                  <Bell className="h-12 w-12 mb-3 text-gray-300" />
                  <span className="text-sm font-medium">Aucune notification</span>
                  <span className="text-xs mt-1">Vous êtes à jour</span>
                </DropdownMenuItem>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
    );
}