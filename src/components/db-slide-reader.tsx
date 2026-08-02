import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, ChevronRight, HelpCircle, Volume2, X } from "lucide-react";
import { toast } from "sonner";
import type { LexiconEntry, StoryPart, StorySlide } from "@/lib/content";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/lib/user-store";
import { submitLexiconRequest } from "@/lib/lexicon.functions";

function isVideo(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
}

type Segment = { text: string; entry?: LexiconEntry };

function segment(text: string, entries: LexiconEntry[]): Segment[] {
  const terms = [...entries].sort((a, b) => b.term.length - a.term.length);
  const out: Segment[] = [];
  let i = 0;
  let buffer = "";
  const flush = () => {
    if (buffer) {
      out.push({ text: buffer });
      buffer = "";
    }
  };
  while (i < text.length) {
    const hit = terms.find((t) => t.term && text.startsWith(t.term, i));
    if (hit) {
      flush();
      out.push({ text: hit.term, entry: hit });
      i += hit.term.length;
    } else {
      buffer += text[i];
      i += 1;
    }
  }
  flush();
  return out;
}

export function DbSlideReader({
  part,
  slides,
  lexicon,
  seriesId,
  preview = false,
  activeIndex,
  onIndexChange,
  contextLabel,
}: {
  part: StoryPart;
  slides: StorySlide[];
  lexicon: LexiconEntry[];
  seriesId: string;
  preview?: boolean;
  activeIndex?: number;
  onIndexChange?: (i: number) => void;
  contextLabel?: string;
}) {
  const { user, saveProgress, markSlideRead, completePart, addCheckedElement } = useUser();
  const navigate = useNavigate();
  const ask = useServerFn(submitLexiconRequest);
  const [innerIdx, setInnerIdx] = useState(0);
  const idx = Math.min(activeIndex ?? innerIdx, Math.max(0, slides.length - 1));
  const setIdx = (i: number) => {
    setInnerIdx(i);
    onIndexChange?.(i);
  };
  const [dir, setDir] = useState(0);
  const [question, setQuestion] = useState<{ term: string } | null>(null);
  const [questionBody, setQuestionBody] = useState("");
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const ambientUrlRef = useRef<string | null>(null);

  const slide = slides[idx];
  const total = slides.length;
  const slideLexicon = useMemo(
    () => lexicon.filter((l) => l.slide_position === (slide?.position ?? -1)),
    [lexicon, slide?.position],
  );

  // Progress tracking (reader mode only).
  useEffect(() => {
    if (preview || !slide) return;
    saveProgress(seriesId, part.episode, part.part, idx);
    markSlideRead();
    if (idx === total - 1) completePart(seriesId, part.episode, part.part, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, total, preview]);

  // Audio: one-shot sound effect + looping ambience that persists across slides.
  useEffect(() => {
    if (!slide) return;
    if (slide.sfx_url) {
      try {
        const sfx = new Audio(slide.sfx_url);
        sfx.volume = 0.8;
        void sfx.play().catch(() => {});
      } catch {}
    }
    const amb = (slide.ambient_url ?? "").trim();
    if (amb) {
      if (amb.toLowerCase() === "stop") {
        ambientRef.current?.pause();
        ambientRef.current = null;
        ambientUrlRef.current = null;
      } else if (amb !== ambientUrlRef.current) {
        ambientRef.current?.pause();
        const a = new Audio(amb);
        a.loop = true;
        a.volume = 0.35;
        void a.play().catch(() => {});
        ambientRef.current = a;
        ambientUrlRef.current = amb;
      }
    }
  }, [slide?.id, slide?.sfx_url, slide?.ambient_url]);

  useEffect(() => () => { ambientRef.current?.pause(); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && idx < total - 1) { setDir(1); setIdx(idx + 1); }
      if (e.key === "ArrowLeft" && idx > 0) { setDir(-1); setIdx(idx - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!slide) {
    return (
      <div className="min-h-[40vh] grid place-items-center text-sm text-muted-foreground">
        Aucune diapo pour cette partie pour le moment.
      </div>
    );
  }

  const sendQuestion = async () => {
    if (!question) return;
    if (!user.userId) {
      toast.error("Connectez-vous pour poser une question.");
      return;
    }
    try {
      await ask({
        data: {
          partId: part.id,
          slidePosition: slide.position,
          term: question.term,
          question: questionBody,
          link: `/creator/${seriesId}/${part.episode}/${part.part}?slide=${slide.position}&term=${encodeURIComponent(question.term)}`,
          context: contextLabel ?? `${seriesId} · Ép. ${part.episode} · Partie ${part.part}`,
        },
      });
      toast.success("Question envoyée", { description: "Vous serez notifié·e dès que l'explication sera prête." });
      setQuestion(null);
      setQuestionBody("");
    } catch {
      toast.error("Impossible d'envoyer la question.");
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-4 px-4 md:px-6 py-3 border-b border-border/60 bg-background/60 backdrop-blur">
        {!preview && (
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/series/$id", params: { id: seriesId } })}>
            <X className="h-4 w-4" />
          </Button>
        )}
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Épisode {part.episode} · Partie {part.part}
        </div>
        <div className="font-display text-sm ml-2 truncate">{part.title}</div>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
          {(slide.sfx_url || slide.ambient_url) && <Volume2 className="h-3.5 w-3.5" />}
          {idx + 1} / {total}
        </div>
      </div>
      <Progress value={((idx + 1) / total) * 100} className="rounded-none h-0.5" />

      <div className="flex-1 grid place-items-center p-4 md:p-8 bg-slate-deep">
        <div className="relative w-full max-w-4xl aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border border-border/40 bg-black">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={slide.id}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40, filter: "blur(6px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: dir * -40, filter: "blur(6px)" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              {slide.media_url ? (
                isVideo(slide.media_url) ? (
                  <video src={slide.media_url} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline />
                ) : (
                  <img src={slide.media_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                )
              ) : (
                <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">
                  Aucun média
                </div>
              )}

              {slide.hangeul.trim() && (
                <div className="absolute left-[6%] right-[6%] bottom-[8%] rounded-md bg-black/75 text-cream px-5 py-4 shadow-lg">
                  <p className="font-korean text-xl md:text-2xl leading-relaxed">
                    {segment(slide.hangeul, slideLexicon).map((seg, i) =>
                      seg.entry ? (
                        <Popover key={i}>
                          <PopoverTrigger asChild>
                            <span
                              onClick={() =>
                                addCheckedElement({ ko: seg.text, fr: seg.entry!.explanation, category: "lexique", series: seriesId })
                              }
                              className="font-korean cursor-pointer underline underline-offset-[6px] decoration-dotted decoration-accent"
                            >
                              {seg.text}
                            </span>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="font-korean text-lg mb-1">{seg.entry.term}</div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{seg.entry.explanation}</p>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <span key={i} className="font-korean">
                          {seg.text.split(/(\s+)/).map((chunk, j) =>
                            chunk.trim() ? (
                              <span
                                key={j}
                                onClick={() => { setQuestion({ term: chunk }); setQuestionBody(""); }}
                                className="cursor-help hover:text-accent transition-colors"
                                title="Poser une question sur cet élément"
                              >
                                {chunk}
                              </span>
                            ) : (
                              <span key={j}>{chunk}</span>
                            ),
                          )}
                        </span>
                      ),
                    )}
                  </p>
                </div>
              )}

              <button
                onClick={() => { if (idx > 0) { setDir(-1); setIdx(idx - 1); } }}
                disabled={idx === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur grid place-items-center text-cream disabled:opacity-30"
                aria-label="Diapo précédente"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => { if (idx < total - 1) { setDir(1); setIdx(idx + 1); } }}
                disabled={idx === total - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur grid place-items-center text-cream disabled:opacity-30"
                aria-label="Diapo suivante"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <Dialog open={!!question} onOpenChange={(v) => !v && setQuestion(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <HelpCircle className="h-4 w-4" /> Poser une question
            </DialogTitle>
            <DialogDescription>
              Élément sélectionné : <span className="font-korean text-foreground">{question?.term}</span>
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={questionBody}
            onChange={(e) => setQuestionBody(e.target.value)}
            rows={4}
            placeholder="Qu'est-ce que tu ne comprends pas ici ?"
          />
          <Button onClick={sendQuestion} className="bg-accent text-accent-foreground hover:bg-accent/90">
            Envoyer ma question
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
