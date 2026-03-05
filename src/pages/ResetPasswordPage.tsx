import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useTranslation } from "../i18n";
import { mapAuthError } from "../utils/mapAuthError";

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const resetPassword = useAuthStore((s) => s.resetPassword);

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await resetPassword(email);

    if (result.error) {
      setError(mapAuthError(result.error, t));
      setIsSubmitting(false);
    } else {
      setIsSent(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto px-4 py-12 md:py-20">
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("auth.backToSignIn")}
      </Link>

      {isSent ? (
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-9 w-9 rounded-sm bg-green-50 border border-green-200 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {t("auth.checkYourEmail")}
            </h1>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            {t("auth.resetEmailSent", { email })}
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full h-10 rounded-sm bg-slate-900 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            {t("auth.backToSignIn")}
          </Link>
        </div>
      ) : (
        <div>
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-1">
              {t("auth.resetPassword")}
            </h1>
            <p className="text-sm text-slate-500">
              {t("auth.resetPasswordDescription")}
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-2 rounded-sm border border-red-200 bg-red-50 px-3 py-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-xs font-medium text-slate-700 mb-1.5">
                {t("auth.email")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="reset-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-10 rounded-sm border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 rounded-sm bg-slate-900 text-sm font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t("common.loading") : t("auth.sendResetLink")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}