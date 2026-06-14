import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface UserState {
  signedIn: boolean;
  pseudo: string;
  premium: boolean;
  unlockedSeries: string[];
  vocab: { ko: string; fr: string; series: string }[];
  progress: Record<string, { episode: number; part: number; slide: number }>;
  marked: { understood: number[]; later: number[] };
  queries: { id: string; ko: string; category: string; status: "queued" | "answered"; ts: number }[];
  notif: { essential: boolean; community: boolean; marketing: boolean };
}

const defaultState: UserState = {
  signedIn: false,
  pseudo: "Lecteur·rice",
  premium: true,
  unlockedSeries: ["ghost-of-the-past"],
  vocab: [],
  progress: {},
  marked: { understood: [], later: [] },
  queries: [],
  notif: { essential: true, community: true, marketing: false },
};

interface Ctx {
  user: UserState;
  set: (patch: Partial<UserState> | ((s: UserState) => Partial<UserState>)) => void;
  signInWithGoogle: () => void;
  signOut: () => void;
  addVocab: (v: { ko: string; fr: string; series: string }) => void;
  unlockSeries: (id: string) => void;
  submitQuery: (q: { ko: string; category: string }) => void;
  saveProgress: (seriesId: string, episode: number, part: number, slide: number) => void;
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
    setUser((s) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) }));

  const value: Ctx = {
    user,
    set,
    signInWithGoogle: () =>
      set({ signedIn: true, pseudo: user.pseudo === "Lecteur·rice" ? "Yeon_07" : user.pseudo }),
    signOut: () => set({ signedIn: false }),
    addVocab: (v) =>
      set((s) => ({ vocab: [v, ...s.vocab.filter((x) => x.ko !== v.ko)].slice(0, 200) })),
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
  };

  return <UserCtx.Provider value={value}>{children}</UserCtx.Provider>;
}

export function useUser() {
  const ctx = useContext(UserCtx);
  if (!ctx) throw new Error("useUser outside UserProvider");
  return ctx;
}