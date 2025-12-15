-- Add user_id to organizations table to link with authenticated users
ALTER TABLE public.organizations 
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop the old permissive policies
DROP POLICY IF EXISTS "Anyone can insert organizations" ON public.organizations;
DROP POLICY IF EXISTS "Anyone can read organizations" ON public.organizations;
DROP POLICY IF EXISTS "Anyone can insert assessments" ON public.assessments;
DROP POLICY IF EXISTS "Anyone can read assessments" ON public.assessments;
DROP POLICY IF EXISTS "Anyone can insert assessment_answers" ON public.assessment_answers;
DROP POLICY IF EXISTS "Anyone can read assessment_answers" ON public.assessment_answers;

-- Create new secure RLS policies for organizations
CREATE POLICY "Users can insert their own organizations"
ON public.organizations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own organizations"
ON public.organizations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create new secure RLS policies for assessments
CREATE POLICY "Users can insert assessments for their organizations"
ON public.assessments FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT id FROM public.organizations WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can read their own assessments"
ON public.assessments FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT id FROM public.organizations WHERE user_id = auth.uid()
  )
);

-- Create new secure RLS policies for assessment_answers
CREATE POLICY "Users can insert answers for their assessments"
ON public.assessment_answers FOR INSERT
TO authenticated
WITH CHECK (
  assessment_id IN (
    SELECT a.id FROM public.assessments a
    JOIN public.organizations o ON o.id = a.organization_id
    WHERE o.user_id = auth.uid()
  )
);

CREATE POLICY "Users can read their own assessment answers"
ON public.assessment_answers FOR SELECT
TO authenticated
USING (
  assessment_id IN (
    SELECT a.id FROM public.assessments a
    JOIN public.organizations o ON o.id = a.organization_id
    WHERE o.user_id = auth.uid()
  )
);