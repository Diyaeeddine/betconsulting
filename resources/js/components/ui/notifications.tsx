import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
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
    id: number;
    titre: string;
    commentaire: string | null;
    created_at: string;
};

export function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const { auth } = usePage().props as any; 

    useEffect(() => {
        axios.get("/api/notifications")
            .then((res) => setNotifications(res.data))
            .catch((err) => console.error("Failed to load notifications", err))
            .finally(() => setLoading(false));

        const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
            authEndpoint: "/broadcasting/auth",
            auth: {
                headers: {
                    "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
                }
            }
        });

        const channel = pusher.subscribe(`private-user.${auth.user.id}`);

        channel.bind("notification.created", (data: { notification: Notification }) => {
            setNotifications(prev => [data.notification, ...prev]);
        });

        return () => {
            channel.unsubscribe();
            pusher.disconnect();
        };
    }, [auth.user.id]);

return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) buttonRef.current?.blur()
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          ref={buttonRef}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#232E40] border-2 border-slate-600 text-white transition-all duration-200 hover:bg-slate-700 hover:border-slate-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          <Bell className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
          {notifications.length > 0 && (
            <>
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white shadow-lg animate-pulse">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 animate-ping opacity-75"></span>
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 shadow-xl border-slate-200 dark:border-slate-700">
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
          <span className="font-semibold">Notifications</span>
          {notifications.length > 0 && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
              {notifications.length} new
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <DropdownMenuItem className="flex items-center justify-center py-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                <span>Loading notifications...</span>
              </div>
            </DropdownMenuItem>
          ) : notifications.length > 0 ? (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex flex-col items-start p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
              >
                <div className="w-full">
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                      {n.titre}
                    </span>
                    <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 ml-2"></div>
                  </div>
                  {n.commentaire && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{n.commentaire}</p>
                  )}
                  <span className="text-xs text-slate-500 dark:text-slate-500 mt-2 block">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-slate-400 mb-2" />
              <span className="text-sm text-slate-500 font-medium">No new notifications</span>
              <span className="text-xs text-slate-400 mt-1">You're all caught up!</span>
            </DropdownMenuItem>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}