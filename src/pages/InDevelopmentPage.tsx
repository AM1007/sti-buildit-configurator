import { Link, useParams } from "react-router-dom";
import { getConfiguratorBySlug } from "../data/catalog";
import { useTranslation } from "../i18n";

export function InDevelopmentPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const config = slug ? getConfiguratorBySlug(slug) : undefined;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 md:px-6 xl:px-8">
      <div className="max-w-md md:max-w-lg w-full text-center">
        <div className="bg-white border-2 border-gray-200 p-8 md:p-12">
          <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
            {t("inDevelopment.title")}
          </h1>

          <p className="text-sm md:text-base text-gray-600 mb-8">
            {config
              ? t("inDevelopment.descriptionWithName", { name: config.name })
              : t("inDevelopment.description")}
          </p>

          <Link
            to="/"
            className="cursor-pointer inline-flex items-center justify-center font-bold text-sm gap-1 px-4.5 py-0.5 min-h-9 border-4 md:gap-1.5 md:px-6 md:py-1 md:min-h-11 xl:text-base bg-brand-600 border-brand-600 text-white hover:bg-brand-700 hover:border-brand-700 transition-all duration-300"
          >
            {t("notFound.backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}