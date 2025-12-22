-- Add delete policy for evaluations table (admin only)
CREATE POLICY "Admins can delete evaluations"
ON public.evaluations
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add delete policy for evaluation_answers table (admin only)
CREATE POLICY "Admins can delete evaluation answers"
ON public.evaluation_answers
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));