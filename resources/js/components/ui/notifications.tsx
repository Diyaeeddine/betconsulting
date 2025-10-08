import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Clock, FileText, Calendar, DollarSign, Building, CheckCircle, XCircle, AlertTriangle, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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
    marche_id?: string;
    reference?: string;
    objet?: string;
    type_ao?: string;
    estimation?: number;
    decision?: 'accepte' | 'refuse';
    type?: string;
    icon?: string;
};

export function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [chargement, setChargement] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const boutonRef = useRef<HTMLButtonElement>(null);

    const { auth } = usePage().props as any; 

    // Formatage des dates
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

    // Formatage des devises
    const formatCurrency = (amount?: number) => {
        if (!amount) return '';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'MAD'
        }).format(amount);
    };

    // Icônes selon la priorité
    const getPriorityIcon = (priority?: string, type?: string) => {
        if (type === 'marche_decision') {
            return <Building className="h-4 w-4 text-blue-600" />;
        }
        
        switch (priority) {
            case 'critique':
                return <AlertTriangle className="h-4 w-4 text-red-600" />;
            case 'urgent':
                return <Clock className="h-4 w-4 text-orange-600" />;
            case 'normal':
                return <FileText className="h-4 w-4 text-blue-600" />;
            default:
                return <Bell className="h-4 w-4 text-blue-600" />;
        }
    };

    // Badge de priorité
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

    // Charger les notifications
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

    // Marquer une notification comme lue
    const marquerCommeLue = useCallback(async (notificationId: string) => {
        try {
            await axios.post(`/api/notifications/${notificationId}/read`);
            
            setNotifications(prev => 
                prev.map(n => 
                    n.id === notificationId 
                        ? { ...n, read_at: new Date().toISOString() }
                        : n
                )
            );
        } catch (err: any) {
            console.error("Erreur lors du marquage:", err);
        }
    }, []);

    // Marquer toutes comme lues
    const marquerToutesCommeLues = useCallback(async () => {
        try {
            await axios.post('/api/notifications/mark-all-read');
            
            setNotifications(prev => 
                prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
            );
        } catch (err: any) {
            console.error("Erreur lors du marquage de toutes:", err);
        }
    }, []);

    // Supprimer une notification
    const supprimerNotification = useCallback(async (notificationId: string) => {
        try {
            const response = await axios.delete(`/api/notifications/${notificationId}`);
            
            if (response.data.success) {
                setNotifications(prev => 
                    prev.filter(n => n.id !== notificationId)
                );
                
                // Optionnel: afficher un message de succès
                console.log('Notification supprimée avec succès');
            }
        } catch (err: any) {
            console.error("Erreur lors de la suppression:", err);
            
            // Afficher l'erreur à l'utilisateur
            if (err.response?.data?.message) {
                alert(`Erreur: ${err.response.data.message}`);
            } else {
                alert('Erreur lors de la suppression de la notification');
            }
        }
    }, []);

    // Gérer le clic sur une notification
    const handleNotificationClick = useCallback((notification: Notification) => {
        // Marquer comme lue si ce n'est pas déjà fait
        if (!notification.read_at) {
            marquerCommeLue(notification.id);
        }

        // Redirection basée sur le type de notification
        if (notification.type === 'marche_decision' && notification.marche_id) {
            window.location.href = `/etudes-techniques/marches/${notification.marche_id}`;
        } else if (notification.document_type) {
            window.location.href = '/documents/expiration';
        }
    }, [marquerCommeLue]);

    // Empêcher la propagation pour les actions (supprimer, marquer comme lu)
    const handleActionClick = useCallback((e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    }, []);

    // Initialisation et WebSocket
    useEffect(() => {
        // Charger les notifications au montage
        chargerNotifications();

        // Configuration Pusher pour les notifications temps réel
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
            const notification: Notification = {
                id: data.notification?.id || data.id || Math.random().toString(),
                titre: data.notification?.titre || data.titre || "Notification",
                commentaire: data.notification?.commentaire || data.commentaire || null,
                created_at: data.notification?.created_at || data.created_at || new Date().toISOString(),
                read_at: data.notification?.read_at || data.read_at || null,
                priority: data.notification?.priority || data.priority || 'info',
                document_type: data.notification?.document_type || data.document_type,
                days_until_expiration: data.notification?.days_until_expiration || data.days_until_expiration,
                date_expiration: data.notification?.date_expiration || data.date_expiration,
                action_required: data.notification?.action_required || data.action_required || false,
                marche_id: data.notification?.marche_id || data.marche_id,
                reference: data.notification?.reference || data.reference,
                objet: data.notification?.objet || data.objet,
                type_ao: data.notification?.type_ao || data.type_ao,
                estimation: data.notification?.estimation || data.estimation,
                decision: data.notification?.decision || data.decision,
                type: data.notification?.type || data.type || 'general',
                icon: data.notification?.icon || data.icon || '📄',
            };

            setNotifications(prev => [notification, ...prev]);

            // Son de notification
            try {
                const audio = new Audio('/sounds/notification.mp3');
                audio.play().catch(() => {});
            } catch (e) {
                console.log("Son de notification non disponible");
            }

            // Notification navigateur
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(notification.titre, {
                    body: notification.commentaire || 'Nouvelle notification',
                    icon: '/favicon.ico'
                });
            }
        });

        // Demander la permission pour les notifications du navigateur
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Nettoyage
        return () => {
            canal.unsubscribe();
            pusher.disconnect();
        };
    }, [auth.user.id, chargerNotifications]);

    const unreadCount = notifications.filter(n => !n.read_at).length;

    return (
        <DropdownMenu
          onOpenChange={(ouvert) => {
            if (!ouvert) boutonRef.current?.blur()
          }}
        >
          <DropdownMenuTrigger asChild>
            <button
              ref={boutonRef}
              className="relative flex h-10 w-10 items-center justify-center rounded-full 
                       bg-blue-100 border-2 border-blue-300 text-blue-700 
                       transition-all duration-200 
                       hover:bg-blue-200 hover:border-blue-400 hover:shadow-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
            >
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
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    {unreadCount} nouvelles
                  </span>
                )}
                {error && (
                  <button 
                    onClick={chargerNotifications}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
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
                  <button 
                    onClick={chargerNotifications}
                    className="text-xs text-blue-600 hover:text-blue-800 underline mt-2"
                  >
                    Réessayer
                  </button>
                </DropdownMenuItem>
              ) : notifications.length > 0 ? (
                notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className={`block p-4 transition-colors duration-150 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-blue-25 ${
                      !n.read_at ? 'bg-blue-25 border-l-4 border-l-blue-500' : 'hover:bg-gray-25'
                    }`}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <div className="space-y-3">
                      {/* En-tête avec icône et titre */}
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="p-2 bg-blue-50 rounded-full border border-blue-100">
                            {getPriorityIcon(n.priority, n.type)}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 leading-5 mb-1">
                              {n.titre}
                            </h3>
                            <div className="flex items-center space-x-2 ml-2">
                              {getPriorityBadge(n.priority)}
                              {!n.read_at && (
                                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions rapides */}
                          <div className="flex items-center space-x-2 mt-2">
                            {!n.read_at && (
                              <button
                                onClick={(e) => handleActionClick(e, () => marquerCommeLue(n.id))}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1 p-1 rounded transition-colors hover:bg-blue-50"
                                title="Marquer comme lu"
                              >
                                <CheckCircle className="h-3 w-3" />
                                <span>Lu</span>
                              </button>
                            )}
                            <button
                              onClick={(e) => handleActionClick(e, () => {
                                if (window.confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
                                  supprimerNotification(n.id);
                                }
                              })}
                              className="text-xs text-red-600 hover:text-red-800 flex items-center space-x-1 p-1 rounded transition-colors hover:bg-red-50"
                              title="Supprimer"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Suppr</span>
                            </button>
                          </div>
                          
                          {/* Commentaire principal */}
                          {n.commentaire && (
                            <p className="text-sm text-gray-700 leading-5 mb-2">
                              {n.commentaire}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Informations spécifiques aux marchés */}
                      {n.type === 'marche_decision' && (
                        <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                          {n.reference && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-gray-900">
                                  Réf: {n.reference}
                                </span>
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
                                <span className="font-medium text-gray-900">
                                  {formatCurrency(n.estimation)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Informations des documents pour les autres notifications */}
                      {n.type !== 'marche_decision' && (n.document_type || n.days_until_expiration !== undefined) && (
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
                                <span className={`font-medium ${
                                  n.days_until_expiration <= 3 ? 'text-red-700' : 'text-gray-700'
                                }`}>
                                  {n.days_until_expiration === 0 ? "Expire aujourd'hui" :
                                   n.days_until_expiration === 1 ? "Expire demain" :
                                   `Expire dans ${n.days_until_expiration} jours`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Date d'expiration */}
                      {n.date_expiration && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span>
                            {n.type === 'marche_decision' ? 'Date limite: ' : 'Expire le: '}
                            {formatExpirationDate(n.date_expiration)}
                          </span>
                        </div>
                      )}
                      
                      {/* Footer avec date et action */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          {new Date(n.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {n.action_required && (
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium border border-orange-200">
                            Action requise
                          </span>
                        )}
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                    <Bell className="h-8 w-8 text-blue-400" />
                  </div>
                  <span className="text-sm text-gray-600 font-medium mb-1">
                    Aucune nouvelle notification
                  </span>
                  <span className="text-xs text-gray-400">
                    Vous êtes à jour !
                  </span>
                </DropdownMenuItem>
              )}
            </div>

            {/* Footer avec actions */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <button 
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center space-x-1"
                    onClick={() => window.location.href = '/notifications'}
                  >
                    <Bell className="h-3 w-3" />
                    <span>Historique complet</span>
                  </button>
                  {unreadCount > 0 && (
                    <button
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors font-medium flex items-center space-x-1"
                      onClick={marquerToutesCommeLues}
                    >
                      <CheckCircle className="h-3 w-3" />
                      <span>Tout marquer comme lu</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
    );
}