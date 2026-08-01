import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/lib/user-store";

export function AuthModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { signInWithProvider, signInWithEmail } = useUser();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");

  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {mode === "signin" ? "Se connecter" : "S'inscrire"}
          </DialogTitle>
          <DialogDescription>
            Votre nom et votre e-mail restent privés — seul votre pseudonyme est visible.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={() => { signInWithProvider("google"); close(); }}
          >
            Continuer avec Google
          </Button>
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={() => { signInWithProvider("facebook"); close(); }}
          >
            Continuer avec Facebook
          </Button>
        </div>

        <div className="flex items-center gap-3 my-1">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">ou avec une adresse e-mail</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            signInWithEmail(email, mode === "signup" ? pseudo : undefined);
            close();
          }}
        >
          {mode === "signup" && (
            <div>
              <Label htmlFor="pseudo" className="text-xs">Pseudonyme public</Label>
              <Input id="pseudo" value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="Yeon_07" className="mt-1" required />
            </div>
          )}
          <div>
            <Label htmlFor="email" className="text-xs">Adresse e-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" className="mt-1" required />
          </div>
          <div>
            <Label htmlFor="password" className="text-xs">Mot de passe</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" required minLength={6} />
          </div>
          <Button type="submit" className="w-full bg-cream text-cream-foreground hover:bg-cream/90">
            {mode === "signin" ? "Se connecter" : "Créer mon compte"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          {mode === "signin" ? "Pas encore de compte ? " : "Déjà inscrit·e ? "}
          <button className="text-accent hover:underline" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? "S'inscrire" : "Se connecter"}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}