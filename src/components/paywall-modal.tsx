import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Lock } from "lucide-react";
import { useUser } from "@/lib/user-store";
import { getSeries } from "@/lib/data";
import { toast } from "sonner";

export function PaywallModal({
  open, onOpenChange, seriesId, reason,
}: { open: boolean; onOpenChange: (b: boolean) => void; seriesId: string; reason: "series" | "grammar" }) {
  const { unlockSeries, set } = useUser();
  const s = getSeries(seriesId);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-popover border-accent/30">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-accent/15 grid place-items-center mb-2">
            <Lock className="h-5 w-5 text-accent" />
          </div>
          <DialogTitle className="font-display text-2xl text-center text-balance">
            {reason === "series" ? `Débloquez « ${s?.title} »` : "Analyse grammaticale verrouillée"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {reason === "series"
              ? "Achetez le pass de cette série, ou activez le Founder Pack et accédez à toutes les séries publiées et à venir."
              : "Les explications de particules, nuances et registres font partie du niveau Premium."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <PassCard title={`Pass « ${s?.title ?? "série"} »`} price="9 €" tag="série unique" />
          <PassCard title="Founder Pack" price="49 €" tag="accès à vie" highlight />
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="ghost" className="flex-1" onClick={() => onOpenChange(false)}>Plus tard</Button>
          <Button
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => {
              unlockSeries(seriesId);
              set({ premium: true });
              onOpenChange(false);
              toast.success("Paiement simulé — accès débloqué.");
            }}
          >
            <Sparkles className="h-4 w-4 mr-2" /> Simuler le paiement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PassCard({ title, price, tag, highlight }: { title: string; price: string; tag: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? "border-gold/60 bg-gold/5" : "border-border"}`}>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{tag}</div>
      <div className="font-display text-base mt-0.5">{title}</div>
      <div className="text-2xl font-display mt-2">{price}</div>
    </div>
  );
}