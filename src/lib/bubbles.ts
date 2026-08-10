import narrator from "@/assets/bubbles/BPP-Narrator-t.png";
import classic from "@/assets/bubbles/BPP-Classic-t.png";
import thinking from "@/assets/bubbles/BPP-Thinking-t.png";
import dark from "@/assets/bubbles/BPP-Dark-t.png";
import angry from "@/assets/bubbles/BPP-Angry-t.png";
import cute from "@/assets/bubbles/BPP-Cute.gif.asset.json";
import happy from "@/assets/bubbles/BPP-Happy.gif.asset.json";
import stress from "@/assets/bubbles/BPP-Stress.gif.asset.json";
import exaspered from "@/assets/bubbles/BPP-Exaspered.gif.asset.json";
import exclamation from "@/assets/bubbles/BPP-Exclamation-t.png";

export type BubblePosition = "top" | "center" | "bottom";

export interface BubbleStyle {
  id: string;
  label: string;
  url: string | null;
  /** true when the artwork is dark and the text must be light. */
  darkText?: boolean;
  /** inner text box inset (percent of the bubble box). */
  inset: { x: number; yTop: number; yBottom: number };
}

const DEFAULT_INSET = { x: 10, yTop: 18, yBottom: 22 };

export const BUBBLES: BubbleStyle[] = [
  { id: "none", label: "Aucune (bandeau simple)", url: null, inset: { x: 6, yTop: 12, yBottom: 12 } },
  { id: "bpp-narrator", label: "BPP · Narrateur", url: narrator, darkText: true, inset: { x: 12, yTop: 22, yBottom: 22 } },
  { id: "bpp-classic", label: "BPP · Classique", url: classic, inset: { x: 10, yTop: 18, yBottom: 26 } },
  { id: "bpp-thinking", label: "BPP · Pensée", url: thinking, inset: { x: 20, yTop: 22, yBottom: 30 } },
  { id: "bpp-dark", label: "BPP · Sombre", url: dark, darkText: true, inset: { x: 18, yTop: 26, yBottom: 26 } },
  { id: "bpp-angry", label: "BPP · Colère", url: angry, darkText: true, inset: { x: 12, yTop: 18, yBottom: 18 } },
  { id: "bpp-cute", label: "BPP · Mignon (animé)", url: cute.url, inset: { x: 24, yTop: 26, yBottom: 30 } },
  { id: "bpp-happy", label: "BPP · Joie (animé)", url: happy.url, inset: { x: 12, yTop: 22, yBottom: 24 } },
  { id: "bpp-stress", label: "BPP · Stress (animé)", url: stress.url, inset: { x: 18, yTop: 26, yBottom: 26 } },
  { id: "bpp-exaspered", label: "BPP · Exaspéré (animé)", url: exaspered.url, inset: { x: 16, yTop: 24, yBottom: 24 } },
  { id: "bpp-exclamation", label: "BPP · Exclamation", url: exclamation, inset: { x: 16, yTop: 24, yBottom: 26 } },
];

export const BUBBLE_POSITIONS: { id: BubblePosition; label: string }[] = [
  { id: "top", label: "Haut" },
  { id: "center", label: "Milieu" },
  { id: "bottom", label: "Bas" },
];

export function getBubble(id: string | null | undefined): BubbleStyle {
  return BUBBLES.find((b) => b.id === id) ?? BUBBLES[0]!;
}

export { DEFAULT_INSET };
