import { Link } from "@tanstack/react-router";
import { useUser } from "@/lib/user-store";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { user, signInWithGoogle, signOut } = useUser();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-display text-xl tracking-tight">
            K<span className="text-accent">·</span>Intermédiaire
          </span>
          <span className="font-korean text-xs text-muted-foreground hidden sm:inline">중급 한국어</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
          <Link to="/library" className="hover:text-foreground transition-colors">Bibliothèque</Link>
          <Link to="/pourquoi" className="hover:text-foreground transition-colors">Mon Histoire</Link>
        </nav>
        <div className="flex items-center gap-2">
          {user.signedIn ? (
            <Button asChild variant="ghost" size="sm">
              <Link to="/profile">{user.pseudo}</Link>
            </Button>
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