export type SeriesStatus = "available" | "in_progress" | "coming_soon";

export interface Series {
  id: string;
  order: number;
  title: string;
  titleKo: string;
  synopsis: string;
  /** Difficulty on a 1–5 scale (script complexity + register range). */
  stars: number;
  episodes: number;
  status: SeriesStatus;
  moods: string[];
  cover: { from: string; to: string; symbol: string };
  free?: boolean;
  warnings?: string[];
  tips?: string[];
}

export const SERIES: Series[] = [
  {
    id: "ghost-of-the-past",
    order: 1,
    title: "Ghost of the Past",
    titleKo: "과거의 유령",
    synopsis: "Une lycéenne reçoit un message d'un numéro qu'elle a effacé il y a dix ans.",
    stars: 1,
    episodes: 16,
    status: "available",
    moods: ["Mystère", "Drame", "Surnaturel léger"],
    cover: { from: "#0b1220", to: "#2b1450", symbol: "유" },
    free: true,
    warnings: ["Atmosphère sombre", "Apparition fantomatique"],
    tips: [
      "Cliquez sur chaque particule pour comprendre la nuance.",
      "Laissez le contexte faire le travail : les mots reviennent d'eux-mêmes.",
    ],
  },
  { id: "reality", order: 2, title: "Reality", titleKo: "현실", synopsis: "Un cadre fatigué découvre que ses collègues ne se souviennent plus de lui.", stars: 2, episodes: 10, status: "available", moods: ["Drame", "Psychologique"], cover: { from: "#1a1a2e", to: "#0f3460", symbol: "현" } },
  { id: "supernatural-chase", order: 3, title: "Supernatural Chase", titleKo: "초자연 추격", synopsis: "Une chasseuse de fantômes traque une entité qui change de visage.", stars: 3, episodes: 12, status: "in_progress", moods: ["Action", "Surnaturel", "Suspense"], cover: { from: "#1b1035", to: "#5b2a86", symbol: "초" } },
  { id: "z-virus", order: 4, title: "Z-Virus", titleKo: "Z-바이러스", synopsis: "Un campus universitaire isolé, un virus qui ne dit pas son nom.", stars: 3, episodes: 14, status: "coming_soon", moods: ["Horreur", "Survie"], cover: { from: "#1a0b0b", to: "#5b1f1f", symbol: "Z" } },
  { id: "clash", order: 5, title: "Clash", titleKo: "충돌", synopsis: "Deux familles, une fusion d'entreprise, un secret qui resurgit.", stars: 4, episodes: 10, status: "coming_soon", moods: ["Drame", "Corporate"], cover: { from: "#0c1a2b", to: "#1f4068", symbol: "충" } },
  { id: "elevator-game", order: 6, title: "Elevator Game", titleKo: "엘리베이터 게임", synopsis: "Sept étages. Cinq règles. Une seule sortie.", stars: 4, episodes: 7, status: "coming_soon", moods: ["Horreur", "Mystère"], cover: { from: "#0a0a0a", to: "#2c2c2c", symbol: "엘" } },
  { id: "shattered", order: 7, title: "Shattered", titleKo: "깨진", synopsis: "Le miroir de la salle de bain montre un autre appartement.", stars: 4, episodes: 9, status: "coming_soon", moods: ["Surnaturel", "Drame"], cover: { from: "#13202b", to: "#3d6478", symbol: "깨" } },
  { id: "protocol-unknown", order: 8, title: "Protocol Unknown", titleKo: "미확인 프로토콜", synopsis: "Une IA d'aide à la décision commence à mentir — peut-être.", stars: 5, episodes: 11, status: "coming_soon", moods: ["SF", "Thriller"], cover: { from: "#0a1f2c", to: "#0e7490", symbol: "미" } },
  { id: "siren-call", order: 9, title: "Siren Call", titleKo: "세이렌의 부름", synopsis: "Un port de pêche, une voix dans la brume, et personne qui rentre.", stars: 5, episodes: 12, status: "coming_soon", moods: ["Horreur folklorique", "Drame"], cover: { from: "#0b1f2b", to: "#264653", symbol: "세" } },
];

export type TokenCategory = "noun" | "verb" | "particle" | "adverb" | "ending" | "adjective";

export interface Token {
  ko: string;
  category?: TokenCategory;
  premium?: boolean;
  explanation?: {
    fr: string;
    role: string;
    nuance: string;
    register: string;
    example: { ko: string; fr: string };
  };
}

export interface SlideLine {
  tokens: Token[];
}

export interface Slide {
  id: number;
  /** Visual context for the simulated webtoon panel. */
  scene: { from: string; to: string; vignette?: string; subject: string };
  /** The mask color must match the dominant area where original English sat. */
  mask: "black" | "white" | "slate" | "cream";
  /** Where the speech bubble / caption sits, in % of slide. */
  textBox: { top: string; left: string; right?: string; bottom?: string; width?: string; align?: "left" | "center" };
  lines: SlideLine[];
  caption?: string;
}

const p = (ko: string, explanation: Token["explanation"]): Token => ({
  ko, category: "particle", premium: true, explanation,
});
const w = (ko: string, explanation?: Token["explanation"], category: TokenCategory = "noun"): Token => ({
  ko, category, premium: !!explanation, explanation,
});
const t = (ko: string): Token => ({ ko });

/** Episode 1 — Part 1/4 of Ghost of the Past. Fully premium-unlocked for demo. */
export const GHOST_E1_P1: Slide[] = [
  {
    id: 1,
    scene: { from: "#0a0a14", to: "#1a1530", subject: "ROOM_NIGHT", vignette: "rgba(0,0,0,0.55)" },
    mask: "black",
    textBox: { top: "8%", left: "8%", width: "55%", align: "left" },
    lines: [
      { tokens: [
        w("새벽", { fr: "aube, petit matin", role: "Nom", nuance: "Plus poétique que « 아침 ».", register: "Neutre / littéraire", example: { ko: "새벽 세 시였다.", fr: "Il était trois heures du matin." } }),
        p("에", { fr: "à (temps / lieu statique)", role: "Particule de temps", nuance: "Indique un point dans le temps.", register: "Neutre", example: { ko: "다섯 시에 만나요.", fr: "On se voit à cinq heures." } }),
        t(" "),
        w("문자", undefined, "noun"),
        p("가", { fr: "marqueur de sujet (information nouvelle)", role: "Particule de sujet", nuance: "Présente une info nouvelle, à la différence de « 는 » qui contraste.", register: "Neutre", example: { ko: "비가 와요.", fr: "Il pleut." } }),
        t(" "),
        w("왔다", { fr: "est arrivé", role: "Verbe (passé, style narratif)", nuance: "Style 해라체, typique du récit littéraire.", register: "Narratif", example: { ko: "편지가 왔다.", fr: "Une lettre est arrivée." } }, "verb"),
        t("."),
      ]},
    ],
    caption: "Slide 1 — 새벽에 문자가 왔다.",
  },
  {
    id: 2,
    scene: { from: "#101018", to: "#241830", subject: "PHONE_GLOW" },
    mask: "black",
    textBox: { top: "60%", left: "10%", width: "75%", align: "left" },
    lines: [
      { tokens: [
        w("모르는", { fr: "inconnu (que je ne connais pas)", role: "Verbe + déterminant", nuance: "Forme déterminante au présent de « 모르다 ».", register: "Neutre", example: { ko: "모르는 사람이에요.", fr: "C'est quelqu'un que je ne connais pas." } }, "verb"),
        t(" "),
        w("번호", undefined, "noun"),
        p("였다", { fr: "c'était (copule au passé, narratif)", role: "Copule -이다 conjuguée", nuance: "Style narratif (해라체), pas pour parler à quelqu'un.", register: "Narratif", example: { ko: "그것은 거짓말이었다.", fr: "C'était un mensonge." } }),
        t("."),
      ]},
    ],
    caption: "Slide 2 — 모르는 번호였다.",
  },
  {
    id: 3,
    scene: { from: "#f4ede0", to: "#e8dcc0", subject: "MESSAGE_BUBBLE" },
    mask: "white",
    textBox: { top: "30%", left: "12%", width: "76%", align: "center" },
    lines: [
      { tokens: [
        t("« "),
        w("아직", { fr: "encore, toujours", role: "Adverbe", nuance: "Sous-entend une continuité depuis le passé.", register: "Neutre", example: { ko: "아직 안 왔어요.", fr: "Il/Elle n'est pas encore arrivé(e)." } }, "adverb"),
        t(" "),
        w("거기", { fr: "là-bas (proche de l'interlocuteur)", role: "Démonstratif de lieu", nuance: "« 거기 » ≠ « 저기 » qui est loin des deux.", register: "Neutre", example: { ko: "거기 누구 있어요?", fr: "Il y a quelqu'un là ?" } }, "noun"),
        p("에", { fr: "à, dans (lieu)", role: "Particule locative statique", nuance: "Statique ; pour le mouvement, on utilise aussi « 에 » (vers).", register: "Neutre", example: { ko: "집에 있어요.", fr: "Je suis à la maison." } }),
        t(" "),
        w("있", undefined, "verb"),
        w("어", { fr: "marqueur de question informel", role: "Terminaison interrogative", nuance: "Forme 반말 — très intime, parfois agressive selon le ton.", register: "Familier (반말)", example: { ko: "어디 가?", fr: "Tu vas où ?" } }, "ending"),
        t("? »"),
      ]},
    ],
    caption: "Slide 3 — « 아직 거기에 있어? »",
  },
  {
    id: 4,
    scene: { from: "#0a0a14", to: "#1a1020", subject: "FACE_SHOCK", vignette: "rgba(0,0,0,0.6)" },
    mask: "black",
    textBox: { top: "10%", left: "10%", width: "80%", align: "left" },
    lines: [
      { tokens: [
        w("그", { fr: "ce (déterminant)", role: "Démonstratif", nuance: "« 그 » = ce/cette (proche de l'interlocuteur ou connu).", register: "Neutre", example: { ko: "그 사람", fr: "cette personne" } }, "adjective"),
        t(" "),
        w("번호", undefined, "noun"),
        p("는", { fr: "marqueur de thème / contraste", role: "Particule de thème", nuance: "Met en relief ou contraste avec autre chose.", register: "Neutre", example: { ko: "나는 안 가.", fr: "Moi, je n'y vais pas." } }),
        t(" "),
        w("십 년", undefined, "noun"),
        t(" "),
        w("전", undefined, "noun"),
        p("에", { fr: "il y a (temps écoulé)", role: "Particule de temps", nuance: "Avec une durée + « 전 », signifie « il y a X ».", register: "Neutre", example: { ko: "한 시간 전에", fr: "il y a une heure" } }),
        t(" "),
        w("지운", { fr: "effacé(e)", role: "Verbe + déterminant passé", nuance: "Forme -(으)ㄴ du verbe « 지우다 ».", register: "Neutre", example: { ko: "지운 사진", fr: "la photo effacée" } }, "verb"),
        t(" "),
        w("번호였다", { fr: "c'était le numéro", role: "Copule au passé narratif", nuance: "Conclut une narration en style 해라체.", register: "Narratif", example: { ko: "친구였다.", fr: "C'était un ami." } }, "verb"),
        t("."),
      ]},
    ],
    caption: "Slide 4 — 그 번호는 십 년 전에 지운 번호였다.",
  },
  {
    id: 5,
    scene: { from: "#0a0a14", to: "#100818", subject: "BLACK_OUT", vignette: "rgba(0,0,0,0.85)" },
    mask: "black",
    textBox: { top: "42%", left: "12%", width: "76%", align: "center" },
    lines: [
      { tokens: [
        w("심장", undefined, "noun"),
        p("이", { fr: "marqueur de sujet (après consonne)", role: "Particule de sujet", nuance: "Variante de « 가 » après une consonne finale.", register: "Neutre", example: { ko: "꽃이 예뻐요.", fr: "Les fleurs sont jolies." } }),
        t(" "),
        w("뛰기", undefined, "verb"),
        w(" 시작했다", { fr: "a commencé à", role: "Auxiliaire -기 시작하다", nuance: "Structure -기 시작하다 = « commencer à V ».", register: "Neutre / narratif", example: { ko: "비가 오기 시작했다.", fr: "Il a commencé à pleuvoir." } }, "verb"),
        t("."),
      ]},
    ],
    caption: "Slide 5 — 심장이 뛰기 시작했다.",
  },
  {
    id: 6,
    scene: { from: "#1a0f0f", to: "#3a1818", subject: "RED_PULSE" },
    mask: "black",
    textBox: { top: "55%", left: "10%", width: "80%", align: "left" },
    lines: [
      { tokens: [
        t("— "),
        w("누구", { fr: "qui", role: "Pronom interrogatif", nuance: "Devient « 누가 » au nominatif.", register: "Neutre", example: { ko: "누가 왔어?", fr: "Qui est venu ?" } }, "noun"),
        w("세요", { fr: "êtes-vous ? (poli)", role: "Terminaison polie -세요 / 이세요", nuance: "Niveau de politesse 합쇼체 adouci, très courant.", register: "Poli (해요체 honorifique)", example: { ko: "어디세요?", fr: "Où êtes-vous ?" } }, "ending"),
        t("?"),
      ]},
    ],
    caption: "Slide 6 — — 누구세요 ?",
  },
];

export interface EpisodePart {
  episode: number;
  part: number;
  totalParts: number;
  title: string;
  slides: Slide[];
}

export const EPISODES: Record<string, EpisodePart[]> = {
  "ghost-of-the-past": [
    { episode: 1, part: 1, totalParts: 4, title: "Le numéro effacé", slides: GHOST_E1_P1 },
    { episode: 1, part: 2, totalParts: 4, title: "La réponse", slides: GHOST_E1_P1 },
    { episode: 1, part: 3, totalParts: 4, title: "La photo", slides: GHOST_E1_P1 },
    { episode: 1, part: 4, totalParts: 4, title: "La porte", slides: GHOST_E1_P1 },
    { episode: 2, part: 1, totalParts: 3, title: "Dix ans plus tôt", slides: GHOST_E1_P1 },
  ],
};

export function getSeries(id: string) {
  return SERIES.find((s) => s.id === id);
}
export function getEpisodePart(seriesId: string, episode: number, part: number) {
  return EPISODES[seriesId]?.find((e) => e.episode === episode && e.part === part);
}