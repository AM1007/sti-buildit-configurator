/**
 * Maps known Supabase Auth error messages to i18n keys.
 * Falls back to raw error message for unknown errors.
 *
 * Supabase returns English error strings in error.message.
 * This maps them to our i18n keys so they display in the user's language.
 */

const ERROR_MAP: Record<string, string> = {
  // Sign in errors
  "Invalid login credentials": "authError.invalidCredentials",
  "Email not confirmed": "authError.emailNotConfirmed",
  "Invalid Refresh Token: Refresh Token Not Found": "authError.sessionExpired",

  // Sign up errors
  "User already registered": "authError.userAlreadyRegistered",
  "Password should be at least 6 characters": "authError.passwordTooShort",
  "Signup requires a valid password": "authError.invalidPassword",
  "Unable to validate email address: invalid format": "authError.invalidEmail",

  // Rate limiting
  "For security purposes, you can only request this once every 60 seconds": "authError.rateLimited",
  "For security purposes, you can only request this after 60 seconds": "authError.rateLimited",

  // Password reset
  "User not found": "authError.userNotFound",

  // OAuth
  "Error getting user email from external provider": "authError.oauthEmailError",

  // Network
  "Failed to fetch": "authError.networkError",
  "NetworkError when attempting to fetch resource.": "authError.networkError",
};

/**
 * Resolves a Supabase error message to a translated string.
 *
 * @param rawError - The raw error string from Supabase
 * @param t - Translation function from i18n
 * @returns Translated error string, or raw error if no mapping exists
 */
export function mapAuthError(rawError: string, t: (key: string) => string): string {
  const i18nKey = ERROR_MAP[rawError];
  if (i18nKey) {
    const translated = t(i18nKey);
    // If t() returns the key itself (missing translation), fall back to raw
    if (translated !== i18nKey) {
      return translated;
    }
  }
  // Unknown error: return raw message
  // ASSUMPTION: Supabase may add new error messages over time.
  // Unknown errors display in English. Log for future mapping.
  console.warn(`[mapAuthError] Unmapped Supabase error: "${rawError}"`);
  return rawError;
}