import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { listNotifications, markNotificationRead } from "@/lib/content";
import { useUser } from "@/lib/user-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationBell() {
  const { user } = useUser();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["notifications", user.userId],
    queryFn: listNotifications,
    enabled: !!user.userId,
    refetchInterval: 30000,
  });
  if (!user.userId) return null;
  const unread = items.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-9 w-9 grid place-items-center rounded-md text-muted-foreground hover:text-foreground" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-accent text-accent-foreground text-[10px] grid place-items-center">
              {unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 && <div className="px-2 py-4 text-xs text-muted-foreground">Aucune notification.</div>}
        {items.map((n) => (
          <DropdownMenuItem
            key={n.id}
            className={`flex-col items-start gap-0.5 ${n.read ? "opacity-60" : ""}`}
            onClick={async () => {
              await markNotificationRead(n.id);
              qc.invalidateQueries({ queryKey: ["notifications"] });
              if (n.link) navigate({ to: n.link });
            }}
          >
            <span className="text-sm">{n.title}</span>
            <span className="text-xs text-muted-foreground line-clamp-2">{n.body}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
