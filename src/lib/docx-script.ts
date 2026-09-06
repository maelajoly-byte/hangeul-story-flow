import { unzipSync, strFromU8 } from "fflate";

export interface ParsedLine {
  /** 1-based index of the slide in the part */
  index: number;
  bubble_type: "bpp-narrator" | "bpp-classic" | "bp-normal";
  speaker_name: string;
  text: string;
}

interface RawParagraph {
  text: string;
  centered: boolean;
}

/** Extracts paragraphs (with centering info) from a .docx file. */
export function readDocxParagraphs(buffer: ArrayBuffer): RawParagraph[] {
  const files = unzipSync(new Uint8Array(buffer));
  const entry = files["word/document.xml"];
  if (!entry) throw new Error("Fichier .docx invalide (document.xml introuvable).");
  const xml = strFromU8(entry);
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

  const paragraphs: RawParagraph[] = [];
  const nodes = doc.getElementsByTagNameNS(W, "p");
  for (let i = 0; i < nodes.length; i++) {
    const p = nodes[i]!;
    // centering: paragraph-level justification
    let centered = false;
    const pPr = p.getElementsByTagNameNS(W, "pPr")[0];
    if (pPr) {
      const jc = pPr.getElementsByTagNameNS(W, "jc")[0];
      const val = jc?.getAttributeNS(W, "val") ?? jc?.getAttribute("w:val");
      if (val === "center") centered = true;
    }

    // text: concatenate runs, keep manual line breaks
    let text = "";
    const walk = (node: Node) => {
      for (let c = 0; c < node.childNodes.length; c++) {
        const child = node.childNodes[c]!;
        if (child.nodeType !== 1) continue;
        const el = child as Element;
        const name = el.localName;
        if (name === "t") text += el.textContent ?? "";
        else if (name === "br" || name === "cr") text += "\n";
        else if (name === "tab") text += " ";
        else if (name !== "pPr") walk(el);
      }
    };
    walk(p);
    paragraphs.push({ text: text.replace(/\u00a0/g, " ").trim(), centered });
  }
  return paragraphs;
}

const SPEAKER_RE = /^([^\s:：][^:：]{0,20})\s*[:：]\s*$/;
const SARA = "사라";

/** Turns docx paragraphs into the ordered list of slide texts. */
export function parseScript(paragraphs: RawParagraph[]): ParsedLine[] {
  const out: ParsedLine[] = [];
  let speaker = "";
  for (const p of paragraphs) {
    if (!p.text) continue;
    const m = SPEAKER_RE.exec(p.text);
    if (m) {
      speaker = m[1]!.trim();
      continue;
    }
    if (p.centered) {
      out.push({ index: out.length + 1, bubble_type: "bpp-narrator", speaker_name: "", text: p.text });
    } else if (speaker === SARA) {
      out.push({ index: out.length + 1, bubble_type: "bpp-classic", speaker_name: "", text: p.text });
    } else {
      out.push({ index: out.length + 1, bubble_type: "bp-normal", speaker_name: speaker, text: p.text });
    }
  }
  return out;
}

export const BUBBLE_LABELS: Record<ParsedLine["bubble_type"], string> = {
  "bp-normal": "BP · Normal",
  "bpp-classic": "BPP · Classic",
  "bpp-narrator": "BPP · Narrator",
};
