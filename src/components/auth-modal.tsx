import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export function AuthModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [busy, setBusy] = useState(false);

  const close = () => onOpenChange(false);

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    setBusy(false);
    if (result.error) {
      toast.error("Connexion Google impossible", { description: result.error.message });
      return;
    }
    if (result.redirected) return;
    close();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin, data: { pseudo } },
      });
      setBusy(false);
      if (error) return toast.error("Inscription impossible", { description: error.message });
      if (!data.session) {
        toast.success("Vérifiez votre boîte mail", {
          description: "Un lien de confirmation vous attend pour activer votre compte.",
        });
        close();
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return toast.error("Connexion impossible", { description: error.message });
    }
    toast.success("Bienvenue !");
    close();
  };

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

        <Button variant="outline" className="w-full justify-center" disabled={busy} onClick={google}>
          Continuer avec Google
        </Button>

        <div className="flex items-center gap-3 my-1">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">ou avec une adresse e-mail</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-3" onSubmit={submit}>
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
          <Button type="submit" disabled={busy} className="w-full bg-cream text-cream-foreground hover:bg-cream/90">
            {mode === "signin" ? "Se connecter" : "Créer mon compte"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          {mode === "signin" ? "Pas encore de compte ? " : "Déjà inscrit·e ? "}
          <button type="button" className="text-accent hover:underline" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? "S'inscrire" : "Se connecter"}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
