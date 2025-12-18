-- Add security documentation comments to SECURITY DEFINER functions (warn-level hardening)

COMMENT ON FUNCTION public.validate_assessment_answer()
IS $$SECURITY NOTE:
- This function uses SECURITY DEFINER to validate assessment answer integrity by reading reference tables (questions, question_options).
- It must remain SECURITY DEFINER to avoid RLS-related failures during validation.
- FIXED search_path (SET search_path = public) is required to prevent search_path injection.

MAINTENANCE REQUIREMENTS:
- Keep: SECURITY DEFINER + SET search_path = public
- Use only parameterized queries (no dynamic SQL / string concatenation)
- Avoid accessing tables outside public schema
- Review any changes as security-sensitive.$$;

COMMENT ON FUNCTION public.validate_assessment_total()
IS $$SECURITY NOTE:
- This function uses SECURITY DEFINER to validate assessment totals and qualification flags.
- It must remain SECURITY DEFINER to enforce validation consistently.
- FIXED search_path (SET search_path = public) is required to prevent search_path injection.

MAINTENANCE REQUIREMENTS:
- Keep: SECURITY DEFINER + SET search_path = public
- Use only parameterized logic (no dynamic SQL)
- Treat modifications as security-sensitive.$$;

COMMENT ON FUNCTION public.has_role(uuid, public.app_role)
IS $$SECURITY NOTE:
- This function uses SECURITY DEFINER to prevent RLS infinite recursion when checking roles.
- FIXED search_path (SET search_path = public) is required to prevent search_path injection.

MAINTENANCE REQUIREMENTS:
- Keep: SECURITY DEFINER + SET search_path = public
- No dynamic SQL
- Review changes as security-sensitive.$$;