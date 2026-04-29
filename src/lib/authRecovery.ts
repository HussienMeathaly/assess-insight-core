const PASSWORD_RECOVERY_STORAGE_KEY = "profit_password_recovery_pending";

export function isPasswordRecoveryUrl(url = window.location.href) {
  const parsed = new URL(url);
  const search = parsed.search;
  const hash = parsed.hash;

  return (
    parsed.searchParams.get("password-recovery") === "1" ||
    search.includes("type=recovery") ||
    hash.includes("type=recovery") ||
    hash.includes("access_token=") ||
    /[?&]code=/.test(search)
  );
}

export function markPasswordRecoveryFlow() {
  sessionStorage.setItem(PASSWORD_RECOVERY_STORAGE_KEY, "true");
}

export function clearPasswordRecoveryFlow() {
  sessionStorage.removeItem(PASSWORD_RECOVERY_STORAGE_KEY);
}

export function isPasswordRecoveryFlowPending() {
  return sessionStorage.getItem(PASSWORD_RECOVERY_STORAGE_KEY) === "true";
}