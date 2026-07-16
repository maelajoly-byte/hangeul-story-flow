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
import { Mail, Search, Award } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Mon Compte — K·Intermédiaire" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, set, signInWithGoogle, signOut } = useUser();
  const [search, setSearch] = useState("");

  const weekActiveDays = useMemo(() => {
    const now = Date.now();
    return user.activeDays.filter((d) => now - new Date(d).getTime() < 7 * 86400_000).length;
  }, [user.activeDays]);

  const filteredChecked = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return user.checkedElements;
    return user.checkedElements.filter((e) => e.ko.toLowerCase().includes(q) || e.fr.toLowerCase().includes(q));
  }, [user.checkedElements, search]);

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
            <div className="text-xs uppercase tracking-[0.2em] text-accent">Mon Compte</div>
            <h1 className="font-display text-4xl mt-1">{user.pseudo}</h1>
            <p className="text-sm text-muted-foreground mt-1">Votre nom et votre e-mail Google ne sont jamais affichés publiquement.</p>
          </div>
        </header>

        <Tabs defaultValue="stats" className="mt-10">
          <TabsList>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="checked">Éléments vérifiés ({user.checkedElements.length})</TabsTrigger>
            <TabsTrigger value="comments">Mes commentaires ({user.comments.length})</TabsTrigger>
            <TabsTrigger value="queries">Mes demandes ({user.queries.length})</TabsTrigger>
            <TabsTrigger value="passes">Mes pass</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="mt-6 space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Stat label="Slides lues" value={user.slidesRead} />
              <Stat label="Activité (jours)" value={user.activeDays.length} sub={`${weekActiveDays} cette semaine`} />
              <Stat label="Exposition hebdo (min)" value={user.weeklyMinutes} />
            </div>
            <div className="rounded-lg border border-border/60 bg-card/60 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-4 w-4 text-accent" />
                <h3 className="font-display text-lg">Badges</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Vos premiers badges apparaîtront ici au fil de votre lecture — régularité, curiosité, endurance…
              </p>
            </div>
          </TabsContent>

          <TabsContent value="checked" className="mt-6 space-y-3">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un mot ou une traduction…"
                className="pl-9"
              />
            </div>
            {filteredChecked.length === 0 ? (
              <Empty text="Cliquez sur un mot ou une particule pendant votre lecture pour le retrouver ici." />
            ) : (
              <ul className="divide-y divide-border/60 border border-border/60 rounded-lg bg-card/60">
                {filteredChecked.map((v, i) => (
                  <li key={i} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-korean text-lg text-foreground">{v.ko}</span>
                      <span className="text-sm text-muted-foreground ml-3">{v.fr}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">{v.category}</span>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            {user.comments.length === 0 ? (
              <Empty text="Vos commentaires publiés sous les épisodes apparaîtront ici." />
            ) : (
              <ul className="space-y-3">
                {user.comments.map((c) => (
                  <li key={c.id} className="rounded-lg border border-border/60 bg-card/60 p-4">
                    <p className="text-sm">{c.body}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{getSeries(c.series)?.title ?? c.series} · Ép. {c.episode}.{c.part}</span>
                      <Link to="/read/$seriesId/$episode/$part" params={{ seriesId: c.series, episode: String(c.episode), part: String(c.part) }} className="text-accent hover:underline">
                        Retrouver la conversation →
                      </Link>
                    </div>
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
                      <p className="font-korean text-foreground">{q.ko}</p>
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
                  <div className="text-xs text-muted-foreground mt-1">{s.episodes} épisodes · {"★".repeat(s.stars)}{"☆".repeat(5 - s.stars)}</div>
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

function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/60 p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-4xl mt-2 tabular-nums">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
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