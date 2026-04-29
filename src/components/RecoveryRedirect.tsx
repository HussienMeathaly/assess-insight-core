import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Detects Supabase password-recovery links that may land on any route
 * (e.g., "/" on a self-hosted deployment) and forwards them to /auth
 * while preserving the hash / query string so the recovery flow works.
 */
export function RecoveryRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/auth") return;

    const hash = window.location.hash || "";
    const search = window.location.search || "";

    const isRecovery =
      hash.includes("type=recovery") ||
      hash.includes("type=magiclink") ||
      hash.includes("access_token=") ||
      search.includes("type=recovery") ||
      /[?&]code=/.test(search);

    if (isRecovery) {
      navigate(`/auth${search}${hash}`, { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
}
