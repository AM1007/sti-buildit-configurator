import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Shield, LogOut, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { useAuthStore, useUser } from "../stores/authStore";
import { useTranslation } from "../i18n";
import { mapAuthError } from "../utils/mapAuthError";

const GOOGLE_ICON_PATHS = [
  { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z", fill: "#4285F4" },
  { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" },
  { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z", fill: "#FBBC05" },
  { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z", fill: "#EA4335" },
];

function ChangePasswordForm() {
  const { t } = useTranslation();
  const updatePassword = useAuthStore((s) => s.updatePassword);

  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setError(null);
    setIsDone(false);
    setPassword("");
    setConfirmPassword("");
  };

  const handleCancel = () => {
    setIsOpen(false);
    setError(null);
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(t("auth.passwordMinLength"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.passwordsDoNotMatch"));
      return;
    }

    setIsSubmitting(true);
    const result = await updatePassword(password);

    if (result.error) {
      setError(mapAuthError(result.error, t));
      setIsSubmitting(false);
      return;
    }

    setIsDone(true);
    setIsSubmitting(false);
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-sm bg-slate-100 flex items-center justify-center shrink-0">
          <Lock className="h-4 w-4 text-slate-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
            {t("account.changePassword")}
          </p>
          <p className="text-sm text-slate-500">{t("account.changePasswordDescription")}</p>
        </div>
        {!isOpen && !isDone && (
          <button
            type="button"
            onClick={handleOpen}
            className="shrink-0 h-8 px-3 rounded-sm border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {t("auth.updatePassword")}
          </button>
        )}
        {isDone && (
          <div className="shrink-0 flex items-center gap-1.5 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs font-medium">{t("auth.passwordUpdated")}</span>
          </div>
        )}
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {error && (
            <div className="flex items-start gap-2 rounded-sm border border-red-200 bg-red-50 px-3 py-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="account-new-password" className="block text-xs font-medium text-slate-700 mb-1.5">
              {t("auth.newPassword")}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="account-new-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 rounded-sm border border-slate-200 bg-white pl-9 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">{t("auth.passwordHint")}</p>
          </div>

          <div>
            <label htmlFor="account-confirm-password" className="block text-xs font-medium text-slate-700 mb-1.5">
              {t("auth.confirmPassword")}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="account-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 rounded-sm border border-slate-200 bg-white pl-9 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-4 rounded-sm bg-slate-900 text-sm font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t("common.loading") : t("common.save")}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="h-9 px-4 rounded-sm border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export function AccountPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useUser();
  const signOut = useAuthStore((s) => s.signOut);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) return null;

  const providerLabel = user.provider === "google" ? "Google" : "Email";

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-1">
          {t("account.title")}
        </h1>
        <p className="text-sm text-slate-500">
          {t("account.subtitle")}
        </p>
      </div>

      <div className="border border-slate-200 rounded-sm bg-white divide-y divide-slate-200">
        <div className="px-4 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-sm bg-slate-100 flex items-center justify-center shrink-0">
            <Mail className="h-4 w-4 text-slate-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
              {t("account.email")}
            </p>
            <p className="text-sm font-medium text-slate-900 truncate">
              {user.email}
            </p>
          </div>
        </div>

        <div className="px-4 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-sm bg-slate-100 flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-slate-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
              {t("account.authProvider")}
            </p>
            <div className="flex items-center gap-2">
              {user.provider === "google" && (
                <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  {GOOGLE_ICON_PATHS.map((p) => (
                    <path key={p.fill} d={p.d} fill={p.fill} />
                  ))}
                </svg>
              )}
              <span className="text-sm font-medium text-slate-900">{providerLabel}</span>
            </div>
          </div>
        </div>

        {user.provider === "email" && <ChangePasswordForm />}
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-sm border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {t("account.signOut")}
        </button>
      </div>
    </div>
  );
}