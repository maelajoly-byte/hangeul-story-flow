import { useEffect, useRef, useState } from "react";
import { Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function isVideo(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
}

export function SlideMediaPreview({ url, position }: { url: string | null; position: number }) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: "300px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={containerRef} className="relative mx-auto w-28 aspect-[9/16] overflow-hidden rounded border border-border bg-muted">
        {url && visible && (isVideo(url) ? (
          <video src={url} muted playsInline preload="metadata" className="h-full w-full object-cover"
            onLoadedMetadata={(event) => { event.currentTarget.currentTime = Math.min(0.1, event.currentTarget.duration || 0.1); }} />
        ) : (
          <img src={url} alt={`Visuel de la diapo ${position}`} loading="lazy" className="h-full w-full object-cover" />
        ))}
        {!url && <span className="absolute inset-0 grid place-items-center p-2 text-center text-xs text-muted-foreground">Aucun média</span>}
        {url && <Button type="button" variant="secondary" size="icon" className="absolute bottom-1 right-1 h-7 w-7"
          aria-label={`Agrandir le média de la diapo ${position}`} title="Agrandir le média" onClick={() => setOpen(true)}>
          <Expand className="h-4 w-4" />
        </Button>}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-fit max-w-[95vw] max-h-[95vh] p-4">
          <DialogHeader><DialogTitle>Diapo {position} — média original</DialogTitle></DialogHeader>
          {url && (isVideo(url) ? (
            <video src={url} controls autoPlay muted playsInline className="max-h-[76vh] max-w-full aspect-[9/16] object-contain" />
          ) : (
            <img src={url} alt={`Visuel de la diapo ${position}`} className="max-h-[76vh] max-w-full object-contain" />
          ))}
        </DialogContent>
      </Dialog>
    </>
  );
}