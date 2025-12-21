-- Tighten public read access to evaluation framework tables (require authentication)

-- Ensure RLS is enabled (safe if already enabled)
ALTER TABLE public.evaluation_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.main_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criteria_options ENABLE ROW LEVEL SECURITY;

-- evaluation_domains
DROP POLICY IF EXISTS "Anyone can read evaluation domains" ON public.evaluation_domains;
CREATE POLICY "Authenticated users can read evaluation domains"
ON public.evaluation_domains
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- main_elements
DROP POLICY IF EXISTS "Anyone can read main elements" ON public.main_elements;
CREATE POLICY "Authenticated users can read main elements"
ON public.main_elements
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- sub_elements
DROP POLICY IF EXISTS "Anyone can read sub elements" ON public.sub_elements;
CREATE POLICY "Authenticated users can read sub elements"
ON public.sub_elements
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- criteria
DROP POLICY IF EXISTS "Anyone can read criteria" ON public.criteria;
CREATE POLICY "Authenticated users can read criteria"
ON public.criteria
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- criteria_options
DROP POLICY IF EXISTS "Anyone can read criteria options" ON public.criteria_options;
CREATE POLICY "Authenticated users can read criteria options"
ON public.criteria_options
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);
