import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/lib/user-store";
import { toast } from "sonner";
import { Mail } from "lucide-react";

const CATS = ["Vocabulaire", "Grammaire", "Particule", "Nuance", "Registre"];

export function RequestExplanationModal({
  open, onOpenChange, defaultSelection = "",
}: { open: boolean; onOpenChange: (b: boolean) => void; defaultSelection?: string }) {
  const { submitQuery } = useUser();
  const [ko, setKo] = useState(defaultSelection);
  const [cat, setCat] = useState("Grammaire");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Demander une explication</DialogTitle>
          <DialogDescription>
            Sélectionnez le mot ou la phrase. Vous recevrez une diapo annotée par e-mail.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Sélection</Label>
            <Textarea value={ko} onChange={(e) => setKo(e.target.value)} className="font-korean" rows={2} placeholder="ex. 아직 거기에 있어?" />
          </div>
          <div>
            <Label className="text-xs">Catégorie</Label>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={!ko.trim()}
            onClick={() => {
              submitQuery({ ko, category: cat });
              onOpenChange(false);
              toast.success("Demande envoyée", {
                description: "Vous recevrez une diapo annotée par e-mail sous 24–48 h.",
                icon: <Mail className="h-4 w-4" />,
              });
            }}
          >
            Envoyer la demande
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}