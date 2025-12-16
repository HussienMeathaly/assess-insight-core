-- Add UPDATE policy for organizations table
CREATE POLICY "Users can update their own organizations"
ON public.organizations
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);