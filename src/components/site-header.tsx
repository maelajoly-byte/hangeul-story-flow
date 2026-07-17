import { Link } from "@tanstack/react-router";
import { useUser } from "@/lib/user-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut } from "lucide-react";

export function SiteHeader() {
  const { user, signInWithGoogle, signOut } = useUser();
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
              <DropdownMenuItem asChild><Link to="/profile">Mon Compte</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Link to="/" className="hidden md:flex items-center gap-2 group">
          <span className="font-display text-xl tracking-tight">
            K<span className="text-accent">·</span>Intermédiaire
          </span>
          <span className="font-korean text-xs text-muted-foreground">중급 한국어</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
          <Link to="/library" className="hover:text-foreground transition-colors">Bibliothèque</Link>
          <Link to="/pourquoi" className="hover:text-foreground transition-colors">Genèse</Link>
          <Link to="/profile" className="hover:text-foreground transition-colors">Mon Compte</Link>
        </nav>
        <div className="flex items-center gap-2">
          {user.signedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  {user.pseudo}
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" /> Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={signInWithGoogle} className="bg-cream text-cream-foreground hover:bg-cream/90">
              Se connecter
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}