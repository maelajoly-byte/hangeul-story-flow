import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/user-store";
import { getMedal } from "@/lib/medals";
import { Award } from "lucide-react";

export function MedalPopup() {
  const { user, clearMedalPopup } = useUser();
  const id = user.pendingMedalPopup;
  const medal = id ? getMedal(id) : undefined;
  const open = !!medal;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) clearMedalPopup(); }}>
      <DialogContent className="max-w-sm text-center">
        <div className="mx-auto grid place-items-center w-20 h-20 rounded-full bg-accent/15 border border-accent/40 mb-2 animate-in zoom-in-50 duration-500">
          <Award className="h-10 w-10 text-accent" />
        </div>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Médaille débloquée !</DialogTitle>
          <DialogDescription>{medal?.name}</DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{medal?.description}</p>
        <Button className="mt-4" onClick={clearMedalPopup}>Merci !</Button>
      </DialogContent>
    </Dialog>
  );
}