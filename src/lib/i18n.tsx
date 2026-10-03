import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "fr" | "en";
const KEY = "kflow-lang";

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "fr", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");
  useEffect(() => {
    const v = window.localStorage.getItem(KEY);
    if (v === "en" || v === "fr") setLangState(v);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(KEY, l);
  };
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

/** Returns lang + a tiny translator: t("Texte FR", "English text"). */
export function useLang() {
  const { lang, setLang } = useContext(Ctx);
  const t = (fr: string, en: string) => (lang === "en" ? en : fr);
  return { lang, setLang, t };
}

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === "fr" ? "en" : "fr")}
      className="h-8 min-w-9 px-2 rounded-md border border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
      aria-label={lang === "fr" ? "Switch to English" : "Passer en français"}
      title={lang === "fr" ? "Switch to English" : "Passer en français"}
    >
      {lang === "fr" ? "Fr" : "En"}
    </button>
  );
}
