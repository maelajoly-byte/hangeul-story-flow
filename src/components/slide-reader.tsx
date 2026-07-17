import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import type { EpisodePart, Slide } from "@/lib/data";
import { WordSpan } from "./word-span";
import { useUser } from "@/lib/user-store";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { SceneCanvas } from "./scene-canvas";
import { MedalPopup } from "./medal-popup";

const MASK_BG: Record<Slide["mask"], string> = {
  black: "#000000",
  white: "#ffffff",
  slate: "#0f172a",
  cream: "#f4ede0",
};
const MASK_FG: Record<Slide["mask"], string> = {
  black: "#f4ede0",
  white: "#0a0a14",
  slate: "#f4ede0",
  cream: "#0a0a14",
};

export function SlideReader({ ep, seriesId }: { ep: EpisodePart; seriesId: string }) {
  const { user, saveProgress, markSlideRead, completePart } = useUser();
  const navigate = useNavigate();
  const [idx, setIdx] = useState(() => Math.min(user.progress[seriesId]?.slide ?? 0, ep.slides.length - 1));
  const [dir, setDir] = useState(0);
  const [fs, setFs] = useState(false);

  const slide = ep.slides[idx];
  const total = ep.slides.length;

  useEffect(() => {
    saveProgress(seriesId, ep.episode, ep.part, idx);
    markSlideRead();
    if (idx === total - 1) {
      completePart(seriesId, ep.episode, ep.part, ep.part === ep.totalParts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, ep.episode, ep.part, seriesId, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIdx((i) => { if (i < total - 1) { setDir(1); return i + 1; } return i; });
      if (e.key === "ArrowLeft") setIdx((i) => { if (i > 0) { setDir(-1); return i - 1; } return i; });
      if (e.key === "Escape" && fs) setFs(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total, fs]);

  const next = () => { if (idx < total - 1) { setDir(1); setIdx(idx + 1); } };
  const prev = () => { if (idx > 0) { setDir(-1); setIdx(idx - 1); } };

  return (
    <>
    <div className={`${fs ? "fixed inset-0 z-50 bg-slate-deep" : "relative"} flex flex-col`}>
      <div className="flex items-center gap-4 px-6 py-3 border-b border-border/60 bg-background/60 backdrop-blur">
        <Button variant="ghost" size="icon" onClick={() => (fs ? setFs(false) : navigate({ to: "/series/$id", params: { id: seriesId } }))}>
          <X className="h-4 w-4" />
        </Button>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Épisode {ep.episode} · Partie {ep.part}/{ep.totalParts}
        </div>
        <div className="font-display text-sm ml-2 text-foreground/90 truncate">{ep.title}</div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground tabular-nums">{idx + 1} / {total}</span>
          <Button variant="ghost" size="icon" onClick={() => setFs((v) => !v)} aria-label="Plein écran">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Progress value={((idx + 1) / total) * 100} className="rounded-none h-0.5" />

      <div className="flex-1 grid place-items-center p-6 md:p-10 bg-slate-deep min-h-[70vh]">
        <div className="relative w-full max-w-4xl aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border border-border/40">
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
              <SceneCanvas slide={slide} />
              <div
                className="absolute rounded-md shadow-lg"
                style={{
                  top: slide.textBox.top,
                  left: slide.textBox.left,
                  width: slide.textBox.width ?? "auto",
                  right: slide.textBox.right,
                  bottom: slide.textBox.bottom,
                  background: MASK_BG[slide.mask],
                  color: MASK_FG[slide.mask],
                  padding: "1rem 1.25rem",
                  textAlign: slide.textBox.align ?? "left",
                }}
              >
                {slide.lines.map((line, i) => (
                  <p key={i} className="font-korean text-xl md:text-2xl leading-relaxed">
                    {line.tokens.map((tok, j) =>
                      tok.premium ? (
                        <WordSpan key={j} token={tok} seriesId={seriesId} />
                      ) : (
                        <span key={j} className="font-korean">{tok.ko}</span>
                      )
                    )}
                  </p>
                ))}
              </div>
              <button
                onClick={prev}
                disabled={idx === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur grid place-items-center text-cream disabled:opacity-30"
                aria-label="Diapo précédente"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
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
    </div>
    <MedalPopup />
    </>
  );
}