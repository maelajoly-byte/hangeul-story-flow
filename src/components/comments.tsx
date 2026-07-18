import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser, type CommentKind, type CommentLang } from "@/lib/user-store";

interface Comment { id: string; author: string; text: string; kind: CommentKind; lang: CommentLang; ts: number; correction?: string }

const KINDS_FR: { id: CommentKind; label: string }[] = [
  { id: "resume", label: "📝 Résumé" },
  { id: "theorie", label: "💡 Théorie" },
  { id: "entraide", label: "🤝 Entraide" },
  { id: "discuter", label: "💬 Discuter" },
  { id: "opinion", label: "💭 Opinion" },
  { id: "question", label: "❓ Question" },
];
const KINDS_KO: { id: CommentKind; label: string }[] = [
  { id: "resume", label: "📝 요약" },
  { id: "theorie", label: "💡 이론" },
  { id: "entraide", label: "🤝 도움" },
  { id: "discuter", label: "💬 대화" },
  { id: "opinion", label: "💭 의견" },
  { id: "question", label: "❓ 질문" },
];

const seed: Comment[] = [
  { id: "1", author: "Minji_22", kind: "discuter", lang: "fr", text: "Le narrateur reçoit un message d'un vieux numéro et son cœur s'emballe.", ts: Date.now() - 3600_000, correction: "« 심장이 뛰기 시작했다 » est très bien construit ✅" },
  { id: "2", author: "Loïc_FR", kind: "question", lang: "fr", text: "J'ai compris l'idée mais la nuance de « 는 » m'échappe encore.", ts: Date.now() - 7200_000 },
  { id: "3", author: "Yeon_07", kind: "resume", lang: "ko", text: "새벽에 낯선 번호로부터 문자가 왔고, 주인공의 심장이 뛰기 시작했다.", ts: Date.now() - 5400_000 },
];

export function Comments({ episodeKey }: { episodeKey: string }) {
  const { user, addComment } = useUser();
  const [list, setList] = useState<Comment[]>(seed);
  const [text, setText] = useState("");
  const [lang, setLang] = useState<CommentLang>("fr");
  const [kind, setKind] = useState<CommentKind>("resume");
  const [, seriesId, epStr, partStr] = episodeKey.match(/^(.+)-e(\d+)-p(\d+)$/) ?? [];

  const KINDS = lang === "fr" ? KINDS_FR : KINDS_KO;
  const KIND_LABEL: Record<CommentKind, string> = Object.fromEntries(KINDS.map((k) => [k.id, k.label])) as Record<CommentKind, string>;
  const filtered = list.filter((c) => c.lang === lang);

  const t = {
    fr: {
      title: "Discussion",
      prompt: <>💬 Prompt : <em>« Qu'avez-vous compris ? Résumez en une phrase en français. »</em></>,
      placeholder: "Votre résumé en une phrase…",
      hint: "Partagez votre lecture avec les autres.",
      publish: "Publier",
      ago: "il y a",
      hours: "h",
      empty: "Aucun commentaire dans cette langue pour l'instant. Soyez le premier.",
    },
    ko: {
      title: "토론",
      prompt: <>💬 프롬프트 : <em>「무엇을 이해했나요? 한국어로 한 문장으로 요약해 주세요.」</em></>,
      placeholder: "한 문장으로 요약해 주세요…",
      hint: "다른 독자들과 감상을 나눠 보세요.",
      publish: "게시",
      ago: "약",
      hours: "시간 전",
      empty: "아직 이 언어의 댓글이 없어요. 가장 먼저 남겨 보세요.",
    },
  }[lang];

  return (
    <section className="mt-12 max-w-3xl mx-auto px-6">
      <h3 className="font-display text-2xl mb-3">{t.title}</h3>
      <div className="flex gap-2 mb-4">
        {(["fr", "ko"] as CommentLang[]).map((l) => (
          <button
            key={l}
            onClick={() => setList((prev) => prev) || setLang(l)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              lang === l
                ? "bg-accent text-accent-foreground border-accent"
                : "border-border/60 hover:border-accent/50 text-muted-foreground"
            }`}
          >
            {l === "fr" ? "Français" : "한국어"}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground mb-4">{t.prompt}</p>
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
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t.placeholder} rows={2} />
        <div className="flex items-center justify-between mt-2 gap-3">
          <span className="text-xs text-muted-foreground">{t.hint}</span>
          <Button
            size="sm"
            disabled={!text.trim()}
            onClick={() => {
              setList([{ id: crypto.randomUUID(), author: user.pseudo, text, kind, lang, ts: Date.now() }, ...list]);
              if (seriesId) addComment({ body: text, kind, lang, series: seriesId, episode: Number(epStr), part: Number(partStr) });
              setText("");
            }}
          >{t.publish}</Button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">{t.empty}</p>
      ) : (
        <ul className="space-y-4">
          {filtered.map((c) => (
            <li key={c.id} className="border-b border-border/60 pb-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{c.author}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/40 text-muted-foreground">{KIND_LABEL[c.kind] ?? c.kind}</span>
                <span className="text-xs text-muted-foreground ml-auto">{t.ago} {Math.max(1, Math.round((Date.now()-c.ts)/3600_000))} {t.hours}</span>
              </div>
              <p className={`text-sm mt-1.5 text-cream/90 ${c.lang === "ko" ? "font-korean" : ""}`}>{c.text}</p>
              {c.correction && (
                <p className="mt-2 text-xs text-gold/90 bg-gold/5 border border-gold/20 rounded p-2">
                  Correction K·Intermédiaire — {c.correction}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="text-[11px] text-muted-foreground mt-6 text-center">#{episodeKey}</p>
    </section>
  );
}