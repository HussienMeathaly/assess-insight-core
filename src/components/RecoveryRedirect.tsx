import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isPasswordRecoveryUrl, markPasswordRecoveryFlow } from "@/lib/authRecovery";

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

    if (isPasswordRecoveryUrl()) {
      markPasswordRecoveryFlow();
      navigate(`/auth${window.location.search}${window.location.hash}`, { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
}
