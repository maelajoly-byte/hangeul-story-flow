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
  { tab: "stats", label: "Statistiques", icon: BarChart3 },
  { tab: "checked", label: "Éléments vérifiés", icon: ListChecks },
  { tab: "comments", label: "Mes commentaires", icon: MessageSquare },
  { tab: "queries", label: "Mes demandes", icon: Mail },
  { tab: "passes", label: "Mes pass", icon: Ticket },
  { tab: "settings", label: "Paramètres", icon: Settings },
] as const;

export function SiteHeader() {
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
                  K<span className="text-accent">·</span>Intermédiaire
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </span>
                <span className="font-korean text-[10px] text-muted-foreground">중급 한국어</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem asChild><Link to="/">Accueil</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/library">Bibliothèque</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/pourquoi">Genèse</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Link to="/" className="hidden md:flex items-center gap-2 group">
          <span className="font-display text-xl tracking-tight">
            K<span className="text-accent">·</span>Intermédiaire
          </span>
          <span className="font-korean text-xs text-muted-foreground">중급 한국어</span>
        </Link>
        <div className="flex items-center gap-2 ml-auto">
          <nav className="hidden md:flex items-center gap-2 text-sm">
            {[
              { to: "/", label: "Accueil" },
              { to: "/library", label: "Bibliothèque" },
              { to: "/pourquoi", label: "Genèse" },
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
          {user.signedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  {user.pseudo}
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {ACCOUNT_LINKS.map(({ tab, label, icon: Icon }) => (
                  <DropdownMenuItem key={tab} asChild>
                    <Link to="/profile" search={{ tab }}>
                      <Icon className="h-4 w-4 mr-2" /> {label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" /> Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => setAuthOpen(true)} className="bg-cream text-cream-foreground hover:bg-cream/90">
              S'inscrire / Se connecter
            </Button>
          )}
        </div>
      </div>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}