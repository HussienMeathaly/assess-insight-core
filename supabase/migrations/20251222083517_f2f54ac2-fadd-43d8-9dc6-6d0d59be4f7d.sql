-- Safer role check overload: prevents probing other users' roles via RPC
CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = _role
  );
$$;

-- Update admin RLS policies to use has_role(role) (no user_id argument)

-- organizations
DROP POLICY IF EXISTS "Admins can read all organizations" ON public.organizations;
CREATE POLICY "Admins can read all organizations"
ON public.organizations
FOR SELECT
TO authenticated
USING (public.has_role('admin'::public.app_role));

-- user_roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role('admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role('admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role('admin'::public.app_role));

-- assessments
DROP POLICY IF EXISTS "Admins can read all assessments" ON public.assessments;
CREATE POLICY "Admins can read all assessments"
ON public.assessments
FOR SELECT
TO authenticated
USING (public.has_role('admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete assessments" ON public.assessments;
CREATE POLICY "Admins can delete assessments"
ON public.assessments
FOR DELETE
TO authenticated
USING (public.has_role('admin'::public.app_role));

-- assessment_answers
DROP POLICY IF EXISTS "Admins can read all assessment answers" ON public.assessment_answers;
CREATE POLICY "Admins can read all assessment answers"
ON public.assessment_answers
FOR SELECT
TO authenticated
USING (public.has_role('admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete assessment answers" ON public.assessment_answers;
CREATE POLICY "Admins can delete assessment answers"
ON public.assessment_answers
FOR DELETE
TO authenticated
USING (public.has_role('admin'::public.app_role));

-- evaluations
DROP POLICY IF EXISTS "Admins can read all evaluations" ON public.evaluations;
CREATE POLICY "Admins can read all evaluations"
ON public.evaluations
FOR SELECT
TO authenticated
USING (public.has_role('admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete evaluations" ON public.evaluations;
CREATE POLICY "Admins can delete evaluations"
ON public.evaluations
FOR DELETE
TO authenticated
USING (public.has_role('admin'::public.app_role));

-- evaluation_answers
DROP POLICY IF EXISTS "Admins can read all evaluation answers" ON public.evaluation_answers;
CREATE POLICY "Admins can read all evaluation answers"
ON public.evaluation_answers
FOR SELECT
TO authenticated
USING (public.has_role('admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete evaluation answers" ON public.evaluation_answers;
CREATE POLICY "Admins can delete evaluation answers"
ON public.evaluation_answers
FOR DELETE
TO authenticated
USING (public.has_role('admin'::public.app_role));

-- questions
DROP POLICY IF EXISTS "Only admins can insert questions" ON public.questions;
CREATE POLICY "Only admins can insert questions"
ON public.questions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role('admin'::public.app_role));

DROP POLICY IF EXISTS "Only admins can update questions" ON public.questions;
CREATE POLICY "Only admins can update questions"
ON public.questions
FOR UPDATE
TO authenticated
USING (public.has_role('admin'::public.app_role))
WITH CHECK (public.has_role('admin'::public.app_role));

DROP POLICY IF EXISTS "Only admins can delete questions" ON public.questions;
CREATE POLICY "Only admins can delete questions"
ON public.questions
FOR DELETE
TO authenticated
USING (public.has_role('admin'::public.app_role));

-- question_options
DROP POLICY IF EXISTS "Only admins can insert question options" ON public.question_options;
CREATE POLICY "Only admins can insert question options"
ON public.question_options
FOR INSERT
TO authenticated
WITH CHECK (public.has_role('admin'::public.app_role));

DROP POLICY IF EXISTS "Only admins can update question options" ON public.question_options;
CREATE POLICY "Only admins can update question options"
ON public.question_options
FOR UPDATE
TO authenticated
USING (public.has_role('admin'::public.app_role))
WITH CHECK (public.has_role('admin'::public.app_role));

DROP POLICY IF EXISTS "Only admins can delete question options" ON public.question_options;
CREATE POLICY "Only admins can delete question options"
ON public.question_options
FOR DELETE
TO authenticated
USING (public.has_role('admin'::public.app_role));

-- Lock down the original 2-arg SECURITY DEFINER function (used only by server-side/service role)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

-- Allow authenticated users to call only the safe 1-arg overload
REVOKE EXECUTE ON FUNCTION public.has_role(public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(public.app_role) TO authenticated, service_role;
