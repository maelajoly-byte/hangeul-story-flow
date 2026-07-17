import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { evaluateNewMedals } from "./medals";

export type CommentKind = "theorie" | "entraide" | "discuter" | "opinion" | "question";

export interface UserState {
  signedIn: boolean;
  pseudo: string;
  unlockedSeries: string[];
  progress: Record<string, { episode: number; part: number; slide: number }>;
  completedParts: Record<string, string[]>; // key: `${ep}-${part}`
  completedEpisodes: Record<string, number[]>;
  slidesRead: number;
  activeDays: string[];
  weeklyMinutes: number;
  checkedElements: { ko: string; fr: string; category: string; series: string; ts: number }[];
  comments: { id: string; body: string; kind: CommentKind; series: string; episode: number; part: number; ts: number }[];
  queries: { id: string; ko: string; category: string; status: "queued" | "answered"; ts: number }[];
  notif: { essential: boolean; community: boolean; marketing: boolean };
  earnedMedals: string[];
  pendingMedalPopup: string | null;
  reclickedElements?: number;
  visitedArchive?: boolean;
  earlyMorningRead?: number;
  marathonDone?: boolean;
  replays?: number;
}

const defaultState: UserState = {
  signedIn: false,
  pseudo: "Lecteur·rice",
  unlockedSeries: ["ghost-of-the-past"],
  progress: {},
  completedParts: {},
  completedEpisodes: {},
  slidesRead: 0,
  activeDays: [],
  weeklyMinutes: 0,
  checkedElements: [],
  comments: [],
  queries: [],
  notif: { essential: true, community: true, marketing: false },
  earnedMedals: [],
  pendingMedalPopup: null,
};

interface Ctx {
  user: UserState;
  set: (patch: Partial<UserState> | ((s: UserState) => Partial<UserState>)) => void;
  signInWithGoogle: () => void;
  signOut: () => void;
  addCheckedElement: (v: { ko: string; fr: string; category: string; series: string }) => void;
  addComment: (c: { body: string; kind: CommentKind; series: string; episode: number; part: number }) => void;
  markSlideRead: () => void;
  unlockSeries: (id: string) => void;
  submitQuery: (q: { ko: string; category: string }) => void;
  saveProgress: (seriesId: string, episode: number, part: number, slide: number) => void;
  completePart: (seriesId: string, episode: number, part: number, isLastPartOfEpisode: boolean) => void;
  clearMedalPopup: () => void;
  markArchiveVisited: () => void;
}

const UserCtx = createContext<Ctx | null>(null);
const KEY = "ki_user_v1";

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser({ ...defaultState, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(user));
  }, [user, hydrated]);

  const set: Ctx["set"] = (patch) =>
    setUser((s) => {
      const next = { ...s, ...(typeof patch === "function" ? patch(s) : patch) };
      const gained = evaluateNewMedals(next, next.earnedMedals);
      if (gained.length > 0) {
        next.earnedMedals = [...next.earnedMedals, ...gained];
        if (!next.pendingMedalPopup) next.pendingMedalPopup = gained[0];
      }
      return next;
    });

  const value: Ctx = {
    user,
    set,
    signInWithGoogle: () =>
      set({ signedIn: true, pseudo: user.pseudo === "Lecteur·rice" ? "Yeon_07" : user.pseudo }),
    signOut: () => set({ signedIn: false }),
    addCheckedElement: (v) =>
      set((s) => {
        const already = s.checkedElements.some((x) => x.ko === v.ko);
        return {
          checkedElements: [
            { ...v, ts: Date.now() },
            ...s.checkedElements.filter((x) => x.ko !== v.ko),
          ].slice(0, 500),
          reclickedElements: (s.reclickedElements ?? 0) + (already ? 1 : 0),
        };
      }),
    addComment: (c) =>
      set((s) => ({
        comments: [
          { id: crypto.randomUUID(), ts: Date.now(), ...c },
          ...s.comments,
        ].slice(0, 200),
      })),
    markSlideRead: () => {
      const today = new Date().toISOString().slice(0, 10);
      const hour = new Date().getHours();
      set((s) => ({
        slidesRead: (s.slidesRead ?? 0) + 1,
        activeDays: s.activeDays.includes(today) ? s.activeDays : [...s.activeDays, today],
        earlyMorningRead: hour < 7 ? (s.earlyMorningRead ?? 0) + 1 : s.earlyMorningRead,
      }));
    },
    unlockSeries: (id) =>
      set((s) => ({ unlockedSeries: Array.from(new Set([...s.unlockedSeries, id])) })),
    submitQuery: (q) =>
      set((s) => ({
        queries: [
          { id: crypto.randomUUID(), ko: q.ko, category: q.category, status: "queued", ts: Date.now() },
          ...s.queries,
        ],
      })),
    saveProgress: (seriesId, episode, part, slide) =>
      set((s) => ({ progress: { ...s.progress, [seriesId]: { episode, part, slide } } })),
    completePart: (seriesId, episode, part, isLastPartOfEpisode) =>
      set((s) => {
        const key = `${episode}-${part}`;
        const partsDone = s.completedParts[seriesId] ?? [];
        const nextPartsDone = partsDone.includes(key) ? partsDone : [...partsDone, key];
        const epsDone = s.completedEpisodes[seriesId] ?? [];
        const nextEpsDone =
          isLastPartOfEpisode && !epsDone.includes(episode) ? [...epsDone, episode] : epsDone;
        const replays = partsDone.includes(key) ? (s.replays ?? 0) + 1 : s.replays;
        return {
          completedParts: { ...s.completedParts, [seriesId]: nextPartsDone },
          completedEpisodes: { ...s.completedEpisodes, [seriesId]: nextEpsDone },
          replays,
          marathonDone: true,
        };
      }),
    clearMedalPopup: () => set({ pendingMedalPopup: null }),
    markArchiveVisited: () => set({ visitedArchive: true }),
  };

  return <UserCtx.Provider value={value}>{children}</UserCtx.Provider>;
}

export function useUser() {
  const ctx = useContext(UserCtx);
  if (!ctx) throw new Error("useUser outside UserProvider");
  return ctx;
}