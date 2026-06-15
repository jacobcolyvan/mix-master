export const LOGOUT_REASONS = ["session_expired", "unauthorized", "signed_out"] as const;

export type LogoutReason = (typeof LOGOUT_REASONS)[number];

export const isLogoutReason = (value: string | null): value is LogoutReason => {
  return value !== null && (LOGOUT_REASONS as readonly string[]).includes(value);
};

const LOGOUT_REASON_MESSAGES: Record<LogoutReason, string> = {
  session_expired: "Your Spotify session has expired. Sign in again to continue.",
  unauthorized: "Spotify rejected your session. Sign in again to continue.",
  signed_out: "You have been signed out. Sign in again to continue.",
};

// Auth writes ?reason= via history.replaceState, which React Router v5 does not
// mirror into useLocation — read the live URL (or an explicit search string).
export const getLogoutMessage = (search = window.location.search): string | null => {
  const reasonParam = new URLSearchParams(search).get("reason");
  if (!reasonParam) return null;
  return isLogoutReason(reasonParam)
    ? LOGOUT_REASON_MESSAGES[reasonParam]
    : LOGOUT_REASON_MESSAGES.signed_out;
};
