-- Add admin-only write policies for evaluation reference tables

-- evaluation_domains
CREATE POLICY "Admins can insert evaluation domains"
ON public.evaluation_domains FOR INSERT
TO authenticated WITH CHECK (public.has_role('admin'::public.app_role));

CREATE POLICY "Admins can update evaluation domains"
ON public.evaluation_domains FOR UPDATE
TO authenticated
USING (public.has_role('admin'::public.app_role))
WITH CHECK (public.has_role('admin'::public.app_role));

CREATE POLICY "Admins can delete evaluation domains"
ON public.evaluation_domains FOR DELETE
TO authenticated USING (public.has_role('admin'::public.app_role));

-- main_elements
CREATE POLICY "Admins can insert main elements"
ON public.main_elements FOR INSERT
TO authenticated WITH CHECK (public.has_role('admin'::public.app_role));

CREATE POLICY "Admins can update main elements"
ON public.main_elements FOR UPDATE
TO authenticated
USING (public.has_role('admin'::public.app_role))
WITH CHECK (public.has_role('admin'::public.app_role));

CREATE POLICY "Admins can delete main elements"
ON public.main_elements FOR DELETE
TO authenticated USING (public.has_role('admin'::public.app_role));

-- sub_elements
CREATE POLICY "Admins can insert sub elements"
ON public.sub_elements FOR INSERT
TO authenticated WITH CHECK (public.has_role('admin'::public.app_role));

CREATE POLICY "Admins can update sub elements"
ON public.sub_elements FOR UPDATE
TO authenticated
USING (public.has_role('admin'::public.app_role))
WITH CHECK (public.has_role('admin'::public.app_role));

CREATE POLICY "Admins can delete sub elements"
ON public.sub_elements FOR DELETE
TO authenticated USING (public.has_role('admin'::public.app_role));

-- criteria
CREATE POLICY "Admins can insert criteria"
ON public.criteria FOR INSERT
TO authenticated WITH CHECK (public.has_role('admin'::public.app_role));

CREATE POLICY "Admins can update criteria"
ON public.criteria FOR UPDATE
TO authenticated
USING (public.has_role('admin'::public.app_role))
WITH CHECK (public.has_role('admin'::public.app_role));

CREATE POLICY "Admins can delete criteria"
ON public.criteria FOR DELETE
TO authenticated USING (public.has_role('admin'::public.app_role));

-- criteria_options
CREATE POLICY "Admins can insert criteria options"
ON public.criteria_options FOR INSERT
TO authenticated WITH CHECK (public.has_role('admin'::public.app_role));

CREATE POLICY "Admins can update criteria options"
ON public.criteria_options FOR UPDATE
TO authenticated
USING (public.has_role('admin'::public.app_role))
WITH CHECK (public.has_role('admin'::public.app_role));

CREATE POLICY "Admins can delete criteria options"
ON public.criteria_options FOR DELETE
TO authenticated USING (public.has_role('admin'::public.app_role));