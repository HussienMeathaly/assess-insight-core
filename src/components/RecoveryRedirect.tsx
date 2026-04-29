import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isPasswordRecoveryUrl, markPasswordRecoveryFlow } from "@/lib/authRecovery";

/**
 * Detects Supabase password-recovery links that may land on any route
 * (e.g., "/" on a self-hosted deployment) and forwards them to /auth
 * synchronously so the recovery form renders without waiting for other
 * pages to mount/lazy-load.
 */
export function RecoveryRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const [redirected, setRedirected] = useState(() => {
    if (typeof window === "undefined") return false;
    if (window.location.pathname !== "/auth" && isPasswordRecoveryUrl()) {
      markPasswordRecoveryFlow();
      const target = `/auth${window.location.search}${window.location.hash}`;
      window.history.replaceState({}, "", target);
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (redirected) {
      setRedirected(false);
      navigate(`/auth${window.location.search}${window.location.hash}`, { replace: true });
      return;
    }
    if (location.pathname === "/auth") return;
    if (isPasswordRecoveryUrl()) {
      markPasswordRecoveryFlow();
      navigate(`/auth${window.location.search}${window.location.hash}`, { replace: true });
    }
  }, [location.pathname, navigate, redirected]);

  return null;
}
