import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser, type CommentKind } from "@/lib/user-store";

interface Comment { id: string; author: string; text: string; kind: CommentKind; ts: number; correction?: string }

const KINDS: { id: CommentKind; label: string }[] = [
  { id: "theorie", label: "💡 Théorie" },
  { id: "entraide", label: "🤝 Entraide" },
  { id: "discuter", label: "💬 Discuter" },
  { id: "opinion", label: "💭 Opinion" },
  { id: "question", label: "❓ Question" },
];
const KIND_LABEL: Record<CommentKind, string> = Object.fromEntries(KINDS.map((k) => [k.id, k.label])) as Record<CommentKind, string>;

const seed: Comment[] = [
  { id: "1", author: "Minji_22", kind: "discuter", text: "Le narrateur reçoit un message d'un vieux numéro et son cœur s'emballe.", ts: Date.now() - 3600_000, correction: "« 심장이 뛰기 시작했다 » est très bien construit ✅" },
  { id: "2", author: "Loïc_FR", kind: "question", text: "J'ai compris l'idée mais la nuance de « 는 » m'échappe encore.", ts: Date.now() - 7200_000 },
];

export function Comments({ episodeKey }: { episodeKey: string }) {
  const { user, addComment } = useUser();
  const [list, setList] = useState<Comment[]>(seed);
  const [text, setText] = useState("");
  const [kind, setKind] = useState<CommentKind>("discuter");
  const [, seriesId, epStr, partStr] = episodeKey.match(/^(.+)-e(\d+)-p(\d+)$/) ?? [];
  return (
    <section className="mt-12 max-w-3xl mx-auto px-6">
      <h3 className="font-display text-2xl mb-1">Discussion</h3>
      <p className="text-sm text-muted-foreground mb-4">
        💬 Prompt : <em>« Qu'avez-vous compris ? Résumez en une phrase en français. »</em>
      </p>
      <div className="rounded-lg border border-border bg-card/60 p-3 mb-6">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {KINDS.map((k) => (
            <button
              key={k.id}
              onClick={() => setKind(k.id)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                kind === k.id
                  ? "bg-accent text-accent-foreground border-accent"
                  : "border-border/60 hover:border-accent/50 text-muted-foreground"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Votre résumé en une phrase…" rows={2} />
        <div className="flex items-center justify-between mt-2 gap-3">
          <span className="text-xs text-muted-foreground">Partagez votre lecture avec les autres.</span>
          <Button
            size="sm"
            disabled={!text.trim()}
            onClick={() => {
              setList([{ id: crypto.randomUUID(), author: user.pseudo, text, kind, ts: Date.now() }, ...list]);
              if (seriesId) addComment({ body: text, kind, series: seriesId, episode: Number(epStr), part: Number(partStr) });
              setText("");
            }}
          >Publier</Button>
        </div>
      </div>
      <ul className="space-y-4">
        {list.map((c) => (
          <li key={c.id} className="border-b border-border/60 pb-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{c.author}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/40 text-muted-foreground">{KIND_LABEL[c.kind]}</span>
              <span className="text-xs text-muted-foreground ml-auto">il y a {Math.max(1, Math.round((Date.now()-c.ts)/3600_000))} h</span>
            </div>
            <p className="text-sm mt-1.5 text-cream/90">{c.text}</p>
            {c.correction && (
              <p className="mt-2 text-xs text-gold/90 bg-gold/5 border border-gold/20 rounded p-2">
                Correction K·Intermédiaire — {c.correction}
              </p>
            )}
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-muted-foreground mt-6 text-center">#{episodeKey}</p>
    </section>
  );
}