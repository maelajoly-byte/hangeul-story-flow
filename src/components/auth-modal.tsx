import { useLang } from "@/lib/i18n";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export function AuthModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useLang();
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
      toast.error(t("Connexion Google impossible", "Google sign-in failed"), { description: result.error.message });
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
      if (error) return toast.error(t("Inscription impossible", "Sign-up failed"), { description: error.message });
      if (!data.session) {
        toast.success(t("Vérifiez votre boîte mail", "Check your inbox"), {
          description: t("Un lien de confirmation vous attend pour activer votre compte.", "A confirmation link is waiting to activate your account."),
        });
        close();
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return toast.error(t("Connexion impossible", "Sign-in failed"), { description: error.message });
    }
    toast.success(t("Bienvenue !", "Welcome!"));
    close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {mode === "signin" ? t("Se connecter", "Sign in") : t("S'inscrire", "Sign up")}
          </DialogTitle>
          <DialogDescription>
            {t("Votre nom et votre e-mail restent privés — seul votre pseudonyme est visible.", "Your name and email stay private — only your username is visible.")}
          </DialogDescription>
        </DialogHeader>

        <Button variant="outline" className="w-full justify-center" disabled={busy} onClick={google}>
          {t("Continuer avec Google", "Continue with Google")}
        </Button>

        <div className="flex items-center gap-3 my-1">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">{t("ou avec une adresse e-mail", "or with an email address")}</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-3" onSubmit={submit}>
          {mode === "signup" && (
            <div>
              <Label htmlFor="pseudo" className="text-xs">{t("Pseudonyme public", "Public username")}</Label>
              <Input id="pseudo" value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="Yeon_07" className="mt-1" required />
            </div>
          )}
          <div>
            <Label htmlFor="email" className="text-xs">{t("Adresse e-mail", "Email address")}</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("vous@exemple.com", "you@example.com")} className="mt-1" required />
          </div>
          <div>
            <Label htmlFor="password" className="text-xs">{t("Mot de passe", "Password")}</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" required minLength={6} />
          </div>
          <Button type="submit" disabled={busy} className="w-full bg-cream text-cream-foreground hover:bg-cream/90">
            {mode === "signin" ? t("Se connecter", "Sign in") : t("Créer mon compte", "Create my account")}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          {mode === "signin" ? t("Pas encore de compte ? ", "No account yet? ") : t("Déjà inscrit·e ? ", "Already registered? ")}
          <button type="button" className="text-accent hover:underline" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? t("S'inscrire", "Sign up") : t("Se connecter", "Sign in")}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
