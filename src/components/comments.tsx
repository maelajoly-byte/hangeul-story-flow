import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUser, type CommentKind, type CommentLang } from "@/lib/user-store";

interface Reply { id: string; author: string; text: string; ts: number; mine?: boolean }
interface Comment { id: string; author: string; text: string; kind: CommentKind; lang: CommentLang; ts: number; correction?: string; replies?: Reply[] }

const HINTS_FR: Partial<Record<CommentKind, string>> = {
  entraide: "Réponds aux questions des autres lecteurs",
  discuter: "Engage la discussion avec les autres en leur demandant leur avis sur quelque chose",
  opinion: "Partage ton avis sur la partie ou un élément précis de l'histoire",
  question: "S'il y a un élément de l'histoire que tu n'as pas compris, n'hésites pas à poser ta question !",
};
const HINTS_KO: Partial<Record<CommentKind, string>> = {
  entraide: "다른 독자들의 질문에 답해 주세요",
  discuter: "다른 독자들에게 의견을 물으며 대화를 시작해 보세요",
  opinion: "이번 화나 특정 장면에 대한 생각을 나눠 주세요",
  question: "이해하지 못한 부분이 있다면 편하게 질문해 주세요!",
};

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
  { id: "2", author: "Loïc_FR", kind: "question", lang: "fr", text: "J'ai compris l'idée mais la nuance de « 는 » m'échappe encore.", ts: Date.now() - 7200_000, replies: [
    { id: "2r1", author: "Minji_22", text: "« 는 » marque le contraste ou le thème : ici il oppose le narrateur à ce qu'il vient de lire.", ts: Date.now() - 5400_000 },
  ] },
  { id: "3", author: "Yeon_07", kind: "resume", lang: "ko", text: "새벽에 낯선 번호로부터 문자가 왔고, 주인공의 심장이 뛰기 시작했다.", ts: Date.now() - 5400_000 },
];

function KindButton({ label, hint, active, onSelect }: { label: string; hint?: string; active: boolean; onSelect: () => void }) {
  const [open, setOpen] = useState(false);
  const btn = (
    <button
      onClick={() => { onSelect(); setOpen(false); }}
      onTouchStart={() => hint && setOpen(true)}
      onTouchEnd={() => setTimeout(() => setOpen(false), 2500)}
      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
        active ? "bg-accent text-accent-foreground border-accent" : "border-border/60 hover:border-accent/50 text-muted-foreground"
      }`}
    >
      {label}
    </button>
  );
  if (!hint) return btn;
  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>{btn}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-[16rem] text-xs">{hint}</TooltipContent>
    </Tooltip>
  );
}

function ReplyThread({ comment, onReply, labels }: { comment: Comment; onReply: (text: string) => void; labels: { reply: string; placeholder: string; send: string } }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  return (
    <div className="mt-2">
      {(comment.replies?.length ?? 0) > 0 && (
        <ul className="mt-2 space-y-2 border-l-2 border-border/60 pl-3">
          {comment.replies!.map((r) => (
            <li key={r.id}>
              <div className="text-xs font-medium">{r.author}</div>
              <p className="text-sm text-cream/90">{r.text}</p>
            </li>
          ))}
        </ul>
      )}
      {open ? (
        <div className="mt-2">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={labels.placeholder} rows={2} />
          <div className="flex justify-end mt-2">
            <Button size="sm" disabled={!text.trim()} onClick={() => { onReply(text); setText(""); setOpen(false); }}>{labels.send}</Button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="mt-2 text-xs text-accent hover:underline">{labels.reply}</button>
      )}
    </div>
  );
}

export function Comments({ episodeKey }: { episodeKey: string }) {
  const { user, addComment, addReply, receiveReply } = useUser();
  const [list, setList] = useState<Comment[]>(seed);
  const [text, setText] = useState("");
  const [lang, setLang] = useState<CommentLang>("fr");
  const [kind, setKind] = useState<CommentKind>("resume");
  const [, seriesId, epStr, partStr] = episodeKey.match(/^(.+)-e(\d+)-p(\d+)$/) ?? [];
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const KINDS = lang === "fr" ? KINDS_FR : KINDS_KO;
  const HINTS = lang === "fr" ? HINTS_FR : HINTS_KO;
  const KIND_LABEL: Record<CommentKind, string> = Object.fromEntries(KINDS.map((k) => [k.id, k.label])) as Record<CommentKind, string>;
  const filtered = list.filter((c) => c.lang === lang);

  const t = {
    fr: {
      title: "Commentaires",
      prompt: <>Partage en commentaire ce que tu as compris de l'épisode, ce que tu en penses ou même tes théories !</>,
      placeholder: "Dis-moi ce que tu en penses…",
      publish: "Publier",
      ago: "il y a",
      hours: "h",
      empty: "Aucun commentaire dans cette langue pour l'instant. Soyez le premier.",
      reply: "Répondre",
      replyPlaceholder: "Votre réponse…",
      send: "Envoyer",
    },
    ko: {
      title: "댓글",
      prompt: <>이번 화에서 이해한 것, 느낀 점, 또는 여러분의 이론을 댓글로 나눠 주세요!</>,
      placeholder: "여러분의 생각을 들려주세요…",
      publish: "게시",
      ago: "약",
      hours: "시간 전",
      empty: "아직 이 언어의 댓글이 없어요. 가장 먼저 남겨 보세요.",
      reply: "답글",
      replyPlaceholder: "답글을 입력하세요…",
      send: "보내기",
    },
  }[lang];

  const postReply = (c: Comment, body: string) => {
    setList((l) => l.map((x) => (x.id === c.id ? { ...x, replies: [...(x.replies ?? []), { id: crypto.randomUUID(), author: user.pseudo, text: body, ts: Date.now(), mine: true }] } : x)));
    if (seriesId) addReply({ body, parentAuthor: c.author, parentBody: c.text, series: seriesId, episode: Number(epStr), part: Number(partStr) });
  };

  return (
   <TooltipProvider delayDuration={200}>
    <section className="mt-12 max-w-3xl mx-auto px-6">
      <h3 className="font-display text-2xl mb-3">{t.title}</h3>
      <div className="flex gap-2 mb-4">
        {(["fr", "ko"] as CommentLang[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
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
            <KindButton key={k.id} label={k.label} hint={HINTS[k.id]} active={kind === k.id} onSelect={() => setKind(k.id)} />
          ))}
        </div>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t.placeholder} rows={2} />
        <div className="flex items-center justify-end mt-2 gap-3">
          <Button
            size="sm"
            disabled={!text.trim()}
            onClick={() => {
              const id = crypto.randomUUID();
              const body = text;
              setList([{ id, author: user.pseudo, text: body, kind, lang, ts: Date.now(), replies: [] }, ...list]);
              if (seriesId) addComment({ body: text, kind, lang, series: seriesId, episode: Number(epStr), part: Number(partStr) });
              // Réponse simulée de la communauté (démo)
              timers.current.push(
                setTimeout(() => {
                  const author = "Minji_22";
                  const answer = lang === "fr" ? "Bonne remarque ! J'ai lu ce passage exactement pareil 🙂" : "좋은 지적이에요! 저도 그 장면을 똑같이 읽었어요 🙂";
                  setList((l) => l.map((x) => (x.id === id ? { ...x, replies: [...(x.replies ?? []), { id: crypto.randomUUID(), author, text: answer, ts: Date.now() }] } : x)));
                  if (seriesId) receiveReply({ author, body: answer, parentBody: body, series: seriesId, episode: Number(epStr), part: Number(partStr) });
                }, 9000),
              );
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
              <ReplyThread comment={c} onReply={(body) => postReply(c, body)} labels={{ reply: t.reply, placeholder: t.replyPlaceholder, send: t.send }} />
            </li>
          ))}
        </ul>
      )}
      <p className="text-[11px] text-muted-foreground mt-6 text-center">#{episodeKey}</p>
    </section>
   </TooltipProvider>
  );
}