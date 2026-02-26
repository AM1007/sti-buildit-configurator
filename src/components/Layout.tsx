import { Link, useLocation } from "react-router-dom";
import { Home, Star, Languages, User, Globe, BookOpen, FileText } from "lucide-react";
import { useMyListCount } from "../stores/configurationStore";
import { useTranslation, useLanguage } from "../i18n";
import type { Language } from "../i18n";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Header() {
  const myListCount = useMyListCount();
  const { t } = useTranslation();
  const { lang, setLang } = useLanguage();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const toggleLanguage = () => {
    const next: Language = lang === "uk" ? "en" : "uk";
    setLang(next);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl h-16 flex items-center justify-center gap-10 sm:gap-14">
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 transition-colors ${
            isActive("/")
              ? "text-slate-900"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium leading-none">{t("common.home")}</span>
        </Link>

        <Link
          to="/my-list"
          className={`relative flex flex-col items-center gap-0.5 transition-colors ${
            isActive("/my-list")
              ? "text-slate-900"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <span className="relative">
            <Star className="h-5 w-5" />
            {myListCount > 0 && (
              <span className="absolute -top-2 -right-3 flex items-center justify-center min-w-4 h-4 rounded-full bg-brand-600 px-0.5 text-[9px] font-bold text-white leading-none">
                {myListCount}
              </span>
            )}
          </span>
          <span className="text-[10px] font-medium leading-none">{t("common.myList")}</span>
        </Link>

        <button
          type="button"
          onClick={toggleLanguage}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <Languages className="h-5 w-5" />
          <span className="text-[10px] font-medium leading-none uppercase">{lang}</span>
        </button>

        <a
          href="#"
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium leading-none">{t("header.account")}</span>
        </a>
      </div>
    </header>
  );
}

function Footer() {
  const year = new Date().getFullYear().toString();
  const { t } = useTranslation();

  return (
    <footer className="border-t border-slate-200 bg-slate-900 py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6 xl:px-8">
        <div className="flex items-center justify-center gap-8">
          <a
            href="https://fortisec.com.ua"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Official website"
          >
            <Globe className="h-5 w-5" />
          </a>
          <a
            href="https://www.linkedin.com/company/fortisecua"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="LinkedIn"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          <a
            href="#"
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Product catalogue"
          >
            <BookOpen className="h-5 w-5" />
          </a>
          <a
            href="#"
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Installation guides"
          >
            <FileText className="h-5 w-5" />
          </a>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            {t("footer.copyright", { year })}
          </p>
        </div>
      </div>
    </footer>
  );
}