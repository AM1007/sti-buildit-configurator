import { Link } from "react-router-dom";
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
  const myListCount = useMyListCount();
  const { t } = useTranslation();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-gray-800 hover:text-brand-600">
            Build <span className="bg-brand-600 text-white px-1">it</span>
          </Link>
          <nav className="flex items-center gap-4 md:gap-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-brand-600 font-medium text-sm"
            >
              {t("common.home")}
            </Link>
            <Link
              to="/my-list"
              className="text-gray-600 hover:text-brand-600 font-medium text-sm flex items-center gap-2"
            >
              {t("common.myList")}
              {myListCount > 0 && (
                <span className="bg-brand-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {myListCount}
                </span>
              )}
            </Link>
            <LanguageSwitcher />
          </nav>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-800 text-gray-400 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xl font-bold text-white">
            Build <span className="bg-brand-600 px-1">it</span>
          </div>

          <p className="text-sm">
            {t("footer.copyright", { year: new Date().getFullYear().toString() })}
          </p>

          <div className="flex gap-4 text-sm">
            <a href="#" className="hover:text-white">
              {t("common.privacy")}
            </a>
            <a href="#" className="hover:text-white">
              {t("common.terms")}
            </a>
            <a href="#" className="hover:text-white">
              {t("common.contact")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}