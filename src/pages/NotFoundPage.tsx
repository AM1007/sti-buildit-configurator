import { Link } from "react-router-dom";
import { useTranslation } from "../i18n";

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-8xl font-bold text-gray-200 mb-4">404</div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {t("notFound.title")}
          </h1>

          <p className="text-gray-600 mb-6">
            {t("notFound.description")}
          </p>

          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-brand-600 text-white font-bold rounded hover:bg-brand-700 transition-colors"
          >
            {t("notFound.backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}