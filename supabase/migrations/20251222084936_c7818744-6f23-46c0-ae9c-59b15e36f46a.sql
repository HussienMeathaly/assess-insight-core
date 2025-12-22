-- Add DELETE policies for organizations table

-- Allow users to delete their own organizations
CREATE POLICY "Users can delete their own organizations"
ON public.organizations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Allow admins to delete any organization
CREATE POLICY "Admins can delete organizations"
ON public.organizations
FOR DELETE
TO authenticated
USING (public.has_role('admin'::public.app_role));