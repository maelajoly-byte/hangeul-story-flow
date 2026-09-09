import type { Token } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

export function PremiumPopup({ token }: { token: Token }) {
  const e = token.explanation!;
  return (
    <div className="p-4 space-y-3 text-sm text-popover-foreground">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-korean text-2xl text-popover-foreground">{token.ko}</div>
          <div className="text-popover-foreground/90 mt-0.5">{e.fr}</div>
        </div>
        <Badge variant="outline" className="border-accent/50 text-accent text-[10px] uppercase tracking-wider">
          {token.category}
        </Badge>
      </div>
      <div className="space-y-1.5">
        <Row label="Rôle" value={e.role} />
        <Row label="Nuance" value={e.nuance} />
        <Row label="Registre" value={e.register} />
      </div>
      <div className="rounded-md bg-foreground/5 border border-border/60 p-2.5">
        <p className="font-korean text-popover-foreground">{e.example.ko}</p>
        <p className="text-xs text-popover-foreground/70 mt-1">{e.example.fr}</p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-[10px] uppercase tracking-wider text-popover-foreground/60 mt-0.5 w-16 shrink-0">{label}</span>
      <span className="text-popover-foreground/85 text-xs leading-relaxed">{value}</span>
    </div>
  );
}
