import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { useUser } from "@/lib/user-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSeries } from "@/lib/data";
import { Sparkles, Mail } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profil — K·Intermédiaire" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, set, signInWithGoogle, signOut } = useUser();

  if (!user.signedIn) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-md px-6 py-32 text-center">
          <h1 className="font-display text-4xl">Connectez-vous</h1>
          <p className="text-muted-foreground mt-3 mb-8 text-sm">Votre vrai nom et votre e-mail restent privés — seul votre pseudonyme public est visible.</p>
          <Button onClick={signInWithGoogle} className="w-full bg-cream text-cream-foreground hover:bg-cream/90">
            Continuer avec Google
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <header className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-accent">Profil</div>
            <h1 className="font-display text-4xl mt-1">{user.pseudo}</h1>
            <p className="text-sm text-muted-foreground mt-1">Votre nom et votre e-mail Google ne sont jamais affichés publiquement.</p>
          </div>
          {user.premium && <Badge className="bg-gold/90 text-slate-deep border-0"><Sparkles className="h-3 w-3 mr-1" /> Premium actif</Badge>}
        </header>

        <Tabs defaultValue="stats" className="mt-10">
          <TabsList>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="vocab">Carnet ({user.vocab.length})</TabsTrigger>
            <TabsTrigger value="queries">Demandes ({user.queries.length})</TabsTrigger>
            <TabsTrigger value="passes">Mes pass</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="mt-6 grid sm:grid-cols-3 gap-4">
            <Stat label="Diapos comprises" value={user.marked.understood.length} />
            <Stat label="À revoir" value={user.marked.later.length} />
            <Stat label="Mots sauvegardés" value={user.vocab.length} />
          </TabsContent>

          <TabsContent value="vocab" className="mt-6">
            {user.vocab.length === 0 ? (
              <Empty text="Sauvegardez vos premiers mots depuis une diapo." />
            ) : (
              <ul className="divide-y divide-border/60 border border-border/60 rounded-lg bg-card/60">
                {user.vocab.map((v, i) => (
                  <li key={i} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <span className="font-korean text-lg text-foreground">{v.ko}</span>
                      <span className="text-sm text-muted-foreground ml-3">{v.fr}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{v.series}</span>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="queries" className="mt-6">
            {user.queries.length === 0 ? (
              <Empty text="Aucune demande encore. Utilisez « Demander une explication » dans le lecteur." />
            ) : (
              <ul className="space-y-3">
                {user.queries.map((q) => (
                  <li key={q.id} className="rounded-lg border border-border/60 bg-card/60 p-4 flex items-start gap-4">
                    <Mail className="h-4 w-4 text-accent mt-1" />
                    <div className="flex-1">
                      <p className="font-korean text-cream">{q.ko}</p>
                      <div className="text-xs text-muted-foreground mt-1">{q.category}</div>
                    </div>
                    <Badge variant="outline" className="border-accent/40 text-accent">{q.status === "queued" ? "En file" : "Répondu"}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="passes" className="mt-6 grid sm:grid-cols-2 gap-3">
            {user.unlockedSeries.map((id) => {
              const s = getSeries(id);
              if (!s) return null;
              return (
                <Link key={id} to="/series/$id" params={{ id }} className="rounded-lg border border-border/60 bg-card/60 p-4 hover:border-accent/50 transition-colors">
                  <div className="font-korean text-sm text-muted-foreground">{s.titleKo}</div>
                  <div className="font-display text-lg">{s.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.episodes} épisodes · {s.level}</div>
                </Link>
              );
            })}
          </TabsContent>

          <TabsContent value="settings" className="mt-6 space-y-8 max-w-xl">
            <section>
              <h3 className="font-display text-xl mb-3">Identité publique</h3>
              <Label htmlFor="pseudo" className="text-xs">Pseudonyme public</Label>
              <Input id="pseudo" value={user.pseudo} onChange={(e) => set({ pseudo: e.target.value })} className="mt-1" />
              <p className="text-xs text-muted-foreground mt-2">Seul ce pseudonyme est affiché dans les discussions.</p>
            </section>
            <Separator />
            <section>
              <h3 className="font-display text-xl mb-3">Notifications par e-mail</h3>
              <NotifRow label="Essentielles (réponses à vos demandes, paiements)" checked={user.notif.essential}
                onChange={(v) => set((s) => ({ notif: { ...s.notif, essential: v } }))} />
              <NotifRow label="Communauté (réponses à vos commentaires)" checked={user.notif.community}
                onChange={(v) => set((s) => ({ notif: { ...s.notif, community: v } }))} />
              <NotifRow label="Marketing (nouvelles séries, offres)" checked={user.notif.marketing}
                onChange={(v) => set((s) => ({ notif: { ...s.notif, marketing: v } }))} />
            </section>
            <Separator />
            <Button variant="ghost" onClick={signOut}>Se déconnecter</Button>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/60 p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-4xl mt-2 tabular-nums">{value}</div>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground border border-dashed border-border rounded-lg p-8 text-center">{text}</p>;
}
function NotifRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/40">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}