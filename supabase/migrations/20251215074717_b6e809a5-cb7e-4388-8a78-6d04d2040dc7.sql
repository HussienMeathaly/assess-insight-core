-- Add DELETE policies for GDPR compliance (Right to Erasure)
-- Users must be able to delete their own assessment data

-- Users can delete their own assessments
CREATE POLICY "Users can delete their own assessments"
ON public.assessments FOR DELETE
TO authenticated
USING (
  organization_id IN (
    SELECT id FROM public.organizations WHERE user_id = auth.uid()
  )
);

-- Users can delete their own assessment answers
CREATE POLICY "Users can delete their own assessment answers"
ON public.assessment_answers FOR DELETE
TO authenticated
USING (
  assessment_id IN (
    SELECT a.id FROM public.assessments a
    JOIN public.organizations o ON o.id = a.organization_id
    WHERE o.user_id = auth.uid()
  )
);

-- Admins can delete any assessment
CREATE POLICY "Admins can delete assessments"
ON public.assessments FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete any assessment answers
CREATE POLICY "Admins can delete assessment answers"
ON public.assessment_answers FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));