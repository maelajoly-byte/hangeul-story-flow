import { useState } from "react";
import type { Token } from "@/lib/data";
import { PremiumPopup } from "./premium-popup";
import { PaywallModal } from "./paywall-modal";
import { useUser } from "@/lib/user-store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const COLOR: Record<string, string> = {
  particle: "decoration-accent",
  verb: "decoration-amber-400",
  noun: "decoration-current/60",
  adverb: "decoration-accent/60",
  ending: "decoration-amber-300",
  adjective: "decoration-current/40",
};

export function WordSpan({ token, seriesId, onAddVocab }: { token: Token; seriesId: string; onAddVocab?: (t: Token) => void }) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [paywall, setPaywall] = useState(false);

  if (!token.premium || !token.explanation) {
    return <span className="font-korean">{token.ko}</span>;
  }

  const trigger = (
    <span
      role="button"
      tabIndex={0}
      onClick={() => (user.premium ? setOpen(true) : setPaywall(true))}
      className={`font-korean cursor-pointer underline underline-offset-[6px] decoration-dotted decoration-1 transition-opacity hover:opacity-70 ${COLOR[token.category ?? "noun"] ?? ""}`}
    >
      {token.ko}
    </span>
  );

  return (
    <>
      {user.premium ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent className="w-80 p-0 border-border/60 bg-popover">
            <PremiumPopup token={token} onSave={() => onAddVocab?.(token)} />
          </PopoverContent>
        </Popover>
      ) : (
        trigger
      )}
      <PaywallModal open={paywall} onOpenChange={setPaywall} seriesId={seriesId} reason="grammar" />
    </>
  );
}