import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Clock, FileText, Calendar, CheckCircle, XCircle, AlertTriangle, Trash2, Users, Briefcase } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios"; 
import Pusher from "pusher-js";
import { router, usePage } from "@inertiajs/react";

type NotificationSalarie = {
    id: string;
    titre: string;
    commentaire: string | null;
    created_at: string;
    read_at?: string | null;
    priority?: 'critique' | 'urgent' | 'normal' | 'info';
    type?: string;
    action_required?: boolean;
    
    // Documents
    document_id?: string;
    document_type?: string;
    days_until_expiration?: number;
    date_expiration?: string;
    
    // Tâches
    tache_id?: string;
    tache_titre?: string;
    projet?: string;
    date_echeance?: string;
    days_until_deadline?: number;
    
    // Congés
    conge_id?: string;
    type_conge?: string;
    date_debut?: string;
    date_fin?: string;
    decision?: 'accepte' | 'refuse';
    motif_refus?: string;
    
    // Profil
    validation_status?: string;
    validation_message?: string;
};

export function NotificationsSalaries() {
    const [notifications, setNotifications] = useState<NotificationSalarie[]>([]);
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

    const getNotificationIcon = (notification: NotificationSalarie) => {
        switch (notification.type) {
            case 'document_expiration':
                return <FileText className="h-4 w-4 text-blue-600" />;
            case 'tache_assignee':
                return <Briefcase className="h-4 w-4 text-purple-600" />;
            case 'conge_decision':
                return notification.decision === 'accepte' 
                    ? <CheckCircle className="h-4 w-4 text-green-600" />
                    : <XCircle className="h-4 w-4 text-red-600" />;
            case 'validation_profile':
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

    const getBackgroundColor = (notification: NotificationSalarie) => {
        if (!notification.read_at) return 'bg-blue-25 border-l-4 border-l-blue-500';
        return 'hover:bg-gray-25';
    };

    const renderNotificationDetails = (n: NotificationSalarie) => {
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

            case 'tache_assignee':
                return (
                    <div className="bg-purple-50 rounded-lg p-3 space-y-2">
                        {n.tache_titre && (
                            <div className="flex items-center space-x-2">
                                <Briefcase className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium text-gray-900">{n.tache_titre}</span>
                            </div>
                        )}
                        {n.projet && (
                            <div className="text-sm text-gray-700">
                                <span className="font-medium">Projet:</span> {n.projet}
                            </div>
                        )}
                        {n.date_echeance && (
                            <div className="flex items-center space-x-2 text-sm">
                                <Calendar className="h-4 w-4 text-purple-600" />
                                <span className="text-gray-700">Échéance: {formatExpirationDate(n.date_echeance)}</span>
                            </div>
                        )}
                        <div className="pt-2">
                            <span className="text-xs text-purple-600 font-medium">
                                Cliquez pour voir les détails →
                            </span>
                        </div>
                    </div>
                );
            case 'conge_decision':
                return (
                    <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            {n.type_conge && (
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-900">{n.type_conge}</span>
                                </div>
                            )}
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
                        {n.date_debut && n.date_fin && (
                            <div className="text-sm text-gray-700">
                                Du {formatExpirationDate(n.date_debut)} au {formatExpirationDate(n.date_fin)}
                            </div>
                        )}
                        {n.motif_refus && (
                            <div className="text-sm text-red-700 bg-red-50 p-2 rounded">
                                <span className="font-medium">Motif:</span> {n.motif_refus}
                            </div>
                        )}
                    </div>
                );

            case 'validation_profile':
                return (
                    <div className="bg-indigo-50 rounded-lg p-3 space-y-2">
                        {n.validation_status && (
                            <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-indigo-600" />
                                <span className="text-sm font-medium text-gray-900">
                                    Statut: {n.validation_status}
                                </span>
                            </div>
                        )}
                        {n.validation_message && (
                            <div className="text-sm text-gray-700">{n.validation_message}</div>
                        )}
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
            const response = await axios.get("/api/notifications-salarie");
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
            await axios.post(`/api/notifications-salarie/${notificationId}/read`);
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n));
        } catch (err: any) {
            console.error("Erreur lors du marquage:", err);
        }
    }, []);

    const marquerToutesCommeLues = useCallback(async () => {
        try {
            await axios.post('/api/notifications-salarie/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
        } catch (err: any) {
            console.error("Erreur lors du marquage de toutes:", err);
        }
    }, []);

    const supprimerNotification = useCallback(async (notificationId: string) => {
        try {
            const response = await axios.delete(`/api/notifications-salarie/${notificationId}`);
            if (response.data.success) {
                setNotifications(prev => prev.filter(n => n.id !== notificationId));
            }
        } catch (err: any) {
            console.error("Erreur lors de la suppression:", err);
            alert(err.response?.data?.message || 'Erreur lors de la suppression de la notification');
        }
    }, []);

    const handleNotificationClick = useCallback((notification: NotificationSalarie) => {
    if (!notification.read_at) {
        marquerCommeLue(notification.id);
    }

    switch (notification.type) {
        case 'document_expiration':
            router.visit('/salarie/documents');
            break;
        case 'tache_assignee':
            if (notification.tache_id) {
                router.visit(`/salarie/marches/taches/${notification.tache_id}`);
            }
            break;
        case 'conge_decision':
            router.visit('/salarie/conges');
            break;
        case 'validation_profile':
            router.visit('/salarie/profil');
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

        const canal = pusher.subscribe(`private-salarie.${auth.user.id}`);

        canal.bind("notification.created", (data: any) => {
            const nd = data.notification || data;
            const notification: NotificationSalarie = {
                id: nd.id || Math.random().toString(),
                titre: nd.titre || "Notification",
                commentaire: nd.commentaire || null,
                created_at: nd.created_at || new Date().toISOString(),
                read_at: nd.read_at || null,
                priority: nd.priority || 'info',
                type: nd.type || 'general',
                action_required: nd.action_required || false,
                document_id: nd.document_id,
                document_type: nd.document_type,
                days_until_expiration: nd.days_until_expiration,
                date_expiration: nd.date_expiration,
                tache_id: nd.tache_id,
                tache_titre: nd.tache_titre,
                projet: nd.projet,
                date_echeance: nd.date_echeance,
                days_until_deadline: nd.days_until_deadline,
                conge_id: nd.conge_id,
                type_conge: nd.type_conge,
                date_debut: nd.date_debut,
                date_fin: nd.date_fin,
                decision: nd.decision,
                motif_refus: nd.motif_refus,
                validation_status: nd.validation_status,
                validation_message: nd.validation_message,
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