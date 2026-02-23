import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Star } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMyListCount } from "../stores/configurationStore";
import { useTranslation } from "../i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const myListCount = useMyListCount();
  const { t } = useTranslation();
  const location = useLocation();

  const navLinks = [
    { to: "/", label: t("common.home") },
    { to: "/my-list", label: t("common.myList"), badge: myListCount },
  ] as const;

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 xl:px-8">
        <Link to="/" className="flex items-center gap-1.5">
          <div className="h-6 w-6 bg-brand-600" />
          <span className="text-lg font-semibold tracking-tighter text-slate-900">
            BUILD<span className="font-normal text-slate-500">IT</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-2 transition-colors ${
                isActive(link.to)
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {link.label}
              {"badge" in link && link.badge > 0 && (
                <span className="flex items-center gap-1 rounded-sm bg-brand-600 px-1.5 py-0.5 text-[11px] font-semibold text-white md:text-[10px]">
                  <Star className="h-3 w-3 md:h-2.5 md:w-2.5" />
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex md:hidden items-center justify-center h-11 w-11 rounded-sm border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-200 bg-white md:hidden"
          >
            <nav className="flex flex-col px-4 py-3 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-sm px-3 py-3 text-[15px] font-medium transition-colors md:py-2.5 md:text-sm ${
                    isActive(link.to)
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                  {"badge" in link && link.badge > 0 && (
                    <span className="flex items-center gap-1 rounded-sm bg-brand-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                      <Star className="h-3 w-3" />
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear().toString();

  return (
    <footer className="border-t border-slate-200 bg-slate-900 pt-12 pb-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6 xl:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
          <div className="md:col-span-2 xl:col-span-2">
            <div className="flex items-center gap-1.5 mb-4">
              <div className="h-5 w-5 bg-brand-600" />
              <span className="text-base font-semibold tracking-tighter text-white">
                BUILD<span className="font-normal text-slate-300">IT</span>
              </span>
            </div>
            <p className="max-w-xs text-[13px] text-slate-300 leading-relaxed md:text-xs">
              {t("home.heroDescription")}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-white md:text-xs">
              {t("common.navigation")}
            </h4>
            <ul className="space-y-3 text-[13px] text-slate-300 md:text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  {t("common.home")}
                </Link>
              </li>
              <li>
                <Link to="/my-list" className="hover:text-white transition-colors">
                  {t("common.myList")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-white md:text-xs">
              {t("common.legal")}
            </h4>
            <ul className="space-y-3 text-[13px] text-slate-300 md:text-xs">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("common.privacy")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("common.terms")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("common.contact")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400">
            {t("footer.copyright", { year })}
          </p>
        </div>
      </div>
    </footer>
  );
}