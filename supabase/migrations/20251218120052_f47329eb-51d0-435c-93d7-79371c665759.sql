-- Drop existing public read policies for questions
DROP POLICY IF EXISTS "Anyone can read questions" ON public.questions;
DROP POLICY IF EXISTS "Anyone can read question_options" ON public.question_options;

-- Create new policies that restrict to authenticated users only
CREATE POLICY "Authenticated users can read questions"
ON public.questions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can read question_options"
ON public.question_options
FOR SELECT
TO authenticated
USING (true);