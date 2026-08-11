import narrator from "@/assets/bubbles/BPP-Narrator-t.png";
import classic from "@/assets/bubbles/BPP-Classic-t.png";
import thinking from "@/assets/bubbles/BPP-Thinking-t.png";
import bppDark from "@/assets/bubbles/BPP-Dark-t.png";
import angry from "@/assets/bubbles/BPP-Angry-t.png";
import cute from "@/assets/bubbles/BPP-Cute.gif.asset.json";
import happy from "@/assets/bubbles/BPP-Happy.gif.asset.json";
import stress from "@/assets/bubbles/BPP-Stress.gif.asset.json";
import exaspered from "@/assets/bubbles/BPP-Exaspered.gif.asset.json";
import exclamation from "@/assets/bubbles/BPP-Exclamation-t.png";
import run from "@/assets/bubbles/BPP-Run.gif.asset.json";
import bpNormal from "@/assets/bubbles/BP-Normal-t.png";
import bpDark from "@/assets/bubbles/BP-Dark-t.png";
import bpWhisper from "@/assets/bubbles/BP-Whisper-t.png";
import bpRadio from "@/assets/bubbles/BP-Radio.gif.asset.json";
import fullScreen from "@/assets/bubbles/B-FullScreen.png.asset.json";

export type BubblePosition = "top" | "center" | "bottom";

export interface BubbleStyle {
  id: string;
  label: string;
  url: string | null;
  /** true when the artwork is dark and the text must be light. */
  darkText?: boolean;
  /** width of the bubble relative to the slide width (percent). */
  scale?: number;
  /** inner text box inset (percent of the bubble box). */
  inset: { x: number; yTop: number; yBottom: number };
  /** blue name tag box (percent of the bubble box) when the artwork has one. */
  nameTag?: { left: number; right: number; top: number; bottom: number };
  /** the artwork covers the whole slide. */
  fullScreen?: boolean;
}

const DEFAULT_INSET = { x: 10, yTop: 18, yBottom: 22 };

export const BUBBLES: BubbleStyle[] = [
  { id: "none", label: "Aucune (bandeau simple)", url: null, scale: 92, inset: { x: 6, yTop: 12, yBottom: 12 } },
  { id: "bpp-narrator", label: "BPP · Narrator", url: narrator, darkText: true, scale: 104, inset: { x: 12, yTop: 22, yBottom: 22 } },
  { id: "bpp-classic", label: "BPP · Classic", url: classic, scale: 106, inset: { x: 10, yTop: 20, yBottom: 26 } },
  { id: "bpp-thinking", label: "BPP · Thinking", url: thinking, scale: 112, inset: { x: 20, yTop: 24, yBottom: 30 } },
  { id: "bpp-dark", label: "BPP · Dark", url: bppDark, darkText: true, scale: 110, inset: { x: 18, yTop: 26, yBottom: 26 } },
  { id: "bpp-angry", label: "BPP · Angry", url: angry, darkText: true, scale: 108, inset: { x: 14, yTop: 22, yBottom: 22 } },
  { id: "bpp-cute", label: "BPP · Cute", url: cute.url, scale: 116, inset: { x: 24, yTop: 26, yBottom: 30 } },
  { id: "bpp-happy", label: "BPP · Happy", url: happy.url, scale: 110, inset: { x: 14, yTop: 24, yBottom: 24 } },
  { id: "bpp-stress", label: "BPP · Stress", url: stress.url, scale: 114, inset: { x: 20, yTop: 30, yBottom: 30 } },
  { id: "bpp-exaspered", label: "BPP · Exaspered", url: exaspered.url, scale: 112, inset: { x: 18, yTop: 26, yBottom: 26 } },
  { id: "bpp-exclamation", label: "BPP · Exclamation", url: exclamation, scale: 110, inset: { x: 18, yTop: 26, yBottom: 28 } },
  { id: "bpp-run", label: "BPP · Run", url: run.url, scale: 112, inset: { x: 14, yTop: 26, yBottom: 26 } },
  {
    id: "bp-normal", label: "BP · Normal", url: bpNormal, scale: 106,
    inset: { x: 8, yTop: 24, yBottom: 12 },
    nameTag: { left: 9, right: 72, top: 9, bottom: 75 },
  },
  {
    id: "bp-dark", label: "BP · Dark", url: bpDark, darkText: true, scale: 110,
    inset: { x: 26, yTop: 30, yBottom: 20 },
    nameTag: { left: 26, right: 55, top: 15, bottom: 73 },
  },
  {
    id: "bp-whisper", label: "BP · Whisper", url: bpWhisper, scale: 108,
    inset: { x: 12, yTop: 26, yBottom: 14 },
    nameTag: { left: 10, right: 72, top: 6, bottom: 75 },
  },
  { id: "bp-radio", label: "BP · Radio", url: bpRadio.url, darkText: true, scale: 106, inset: { x: 10, yTop: 24, yBottom: 22 } },
  { id: "b-fullscreen", label: "B · FullScreen", url: fullScreen.url, darkText: true, scale: 100, fullScreen: true, inset: { x: 12, yTop: 20, yBottom: 20 } },
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
