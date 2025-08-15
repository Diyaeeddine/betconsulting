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
                if (!open) buttonRef.current?.blur();
            }}
        >
            <DropdownMenuTrigger asChild>
                <button
                    ref={buttonRef}
                    className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none"
                >
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-64">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {loading ? (
                    <DropdownMenuItem className="text-center text-sm text-gray-500">
                        Loading...
                    </DropdownMenuItem>
                ) : notifications.length > 0 ? (
                    notifications.map((n) => (
                        <DropdownMenuItem key={n.id} className="flex flex-col items-start">
                            <span className="text-sm">{n.titre}</span>
                            {n.commentaire && (
                                <span className="text-xs text-gray-500">{n.commentaire}</span>
                            )}
                            <span className="text-xs text-gray-400">
                                {new Date(n.created_at).toLocaleString()}
                            </span>
                        </DropdownMenuItem>
                    ))
                ) : (
                    <DropdownMenuItem className="text-center text-sm text-gray-500">
                        No new notifications
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
