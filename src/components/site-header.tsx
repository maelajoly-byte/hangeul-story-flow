import { useLang } from "@/lib/i18n";
import { NotificationBell } from "@/components/notification-bell";
import { LangToggle } from "@/lib/i18n";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useUser } from "@/lib/user-store";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, BarChart3, ListChecks, MessageSquare, Mail, Ticket, Settings } from "lucide-react";

const ACCOUNT_LINKS = [
  { tab: "stats", label: "Statistiques", en: "Statistics", icon: BarChart3 },
  { tab: "checked", label: "Éléments vérifiés", en: "Checked items", icon: ListChecks },
  { tab: "comments", label: "Mes commentaires", en: "My comments", icon: MessageSquare },
  { tab: "queries", label: "Mes demandes", en: "My requests", icon: Mail },
  { tab: "passes", label: "Mes pass", en: "My passes", icon: Ticket },
  { tab: "settings", label: "Paramètres", en: "Settings", icon: Settings },
] as const;

export function SiteHeader() {
  const { t } = useLang();
  const { user, signOut } = useUser();
  const [authOpen, setAuthOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        {/* Mobile: click logo to open nav; Desktop: normal home link */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-start leading-tight group">
                <span className="font-display text-lg tracking-tight inline-flex items-center gap-1">
                  K<span className="text-accent">-</span>Flow
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </span>
                <span className="font-korean text-[10px] text-muted-foreground">드디어, 한국어가 살아나는 순간</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem asChild><Link to="/">{t("Accueil", "Home")}</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/library">{t("Bibliothèque", "Library")}</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/pourquoi">{t("Genèse", "Origins")}</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Link to="/" className="hidden md:flex items-center gap-2 group">
          <span className="font-display text-xl tracking-tight">
            K<span className="text-accent">-</span>Flow
          </span>
          <span className="font-korean text-xs text-muted-foreground">드디어, 한국어가 살아나는 순간</span>
        </Link>
        <div className="flex items-center gap-2 ml-auto">
          <nav className="hidden md:flex items-center gap-2 text-sm">
            {[
              { to: "/", label: t("Accueil", "Home") },
              { to: "/library", label: t("Bibliothèque", "Library") },
              { to: "/pourquoi", label: t("Genèse", "Origins") },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="rounded-md h-9 px-4 inline-flex items-center transition-all duration-200 text-muted-foreground hover:text-foreground hover:font-medium hover:[text-shadow:0_0_10px_color-mix(in_oklab,var(--cream)_70%,transparent)] data-[status=active]:bg-cream data-[status=active]:text-cream-foreground data-[status=active]:font-medium data-[status=active]:shadow-[0_0_28px_-4px_color-mix(in_oklab,var(--cream)_80%,transparent)]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <LangToggle />
          {user.signedIn ? (
            <div className="flex items-center gap-1">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  {user.pseudo}
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {ACCOUNT_LINKS.map(({ tab, label, en, icon: Icon }) => (
                  <DropdownMenuItem key={tab} asChild>
                    <Link to="/profile" search={{ tab }}>
                      <Icon className="h-4 w-4 mr-2" /> {t(label, en)}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" /> {t("Se déconnecter", "Sign out")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          ) : (
            <Button
              onClick={() => setAuthOpen(true)}
              className="h-9 px-4 rounded-md text-sm font-medium bg-cream text-cream-foreground hover:bg-cream/90 shadow-[0_0_28px_-4px_color-mix(in_oklab,var(--cream)_80%,transparent)]"
            >
              {t("S'inscrire / Se connecter", "Sign up / Sign in")}
            </Button>
          )}
        </div>
      </div>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}