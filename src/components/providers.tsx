"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { translate, SUPPORTED_LANGUAGES, LANG_COOKIE, type LabelKey } from "@/lib/i18n";

type Theme = "dark" | "light";

interface LangCtx {
  lang: string;
  setLang: (l: string) => void;
  t: (k: LabelKey) => string;
  theme: Theme;
  toggleTheme: () => void;
}

const Ctx = createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  t: (k) => translate("en", k),
  theme: "dark",
  toggleTheme: () => {},
});

export const useApp = () => useContext(Ctx);

export function AppProviders({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<string>(() => resolveStoredLang());
  const [theme, setTheme] = useState<Theme>(() => resolveStoredTheme());

  useEffect(() => {
    const th = theme;
    document.documentElement.classList.toggle("light", th === "light");
    document.documentElement.classList.toggle("dark", th !== "light");
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("tem_theme", next);
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  const setLang = useCallback((l: string) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_COOKIE, l);
      document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* storage unavailable */
    }
  }, []);

  const t = useCallback((k: LabelKey) => translate(lang, k), [lang]);

  return (
    <Ctx.Provider value={{ lang, setLang, t, theme, toggleTheme }}>{children}</Ctx.Provider>
  );
}

function resolveStoredLang(): string {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem(LANG_COOKIE);
    return stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored) ? stored : "en";
  } catch {
    return "en";
  }
}

function resolveStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    return localStorage.getItem("tem_theme") === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}