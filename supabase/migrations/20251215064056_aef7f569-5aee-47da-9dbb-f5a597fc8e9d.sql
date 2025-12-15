-- Add database-level constraints for input validation

-- Add length constraints on organizations table
ALTER TABLE public.organizations 
  ADD CONSTRAINT organizations_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 200),
  ADD CONSTRAINT organizations_contact_person_length CHECK (char_length(contact_person) >= 2 AND char_length(contact_person) <= 200),
  ADD CONSTRAINT organizations_phone_format CHECK (phone ~ '^[0-9+\-\s]{9,20}$'),
  ADD CONSTRAINT organizations_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add validation constraints on assessments
ALTER TABLE public.assessments
  ADD CONSTRAINT assessments_total_score_range CHECK (total_score >= 0 AND total_score <= 100),
  ADD CONSTRAINT assessments_max_score_range CHECK (max_score >= 0 AND max_score <= 100);

-- Add validation constraints on assessment_answers
ALTER TABLE public.assessment_answers
  ADD CONSTRAINT assessment_answers_score_range CHECK (score >= 0 AND score <= 100);

-- Create a validation function for score calculation
CREATE OR REPLACE FUNCTION public.validate_assessment_answer()
RETURNS TRIGGER AS $$
DECLARE
  option_record RECORD;
  question_record RECORD;
  expected_score NUMERIC;
BEGIN
  -- Validate that the selected_option_id exists and belongs to the question
  SELECT qo.*, q.weight INTO option_record
  FROM public.question_options qo
  JOIN public.questions q ON q.id = qo.question_id
  WHERE qo.id = NEW.selected_option_id AND qo.question_id = NEW.question_id;
  
  IF option_record IS NULL THEN
    RAISE EXCEPTION 'Invalid option for question';
  END IF;
  
  -- Calculate expected score
  expected_score := (option_record.score_percentage::NUMERIC / 100) * option_record.weight;
  
  -- Validate score matches expected (with small tolerance for floating point)
  IF ABS(NEW.score - expected_score) > 0.01 THEN
    RAISE EXCEPTION 'Score does not match expected calculation';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for answer validation
CREATE TRIGGER validate_assessment_answer_trigger
BEFORE INSERT ON public.assessment_answers
FOR EACH ROW
EXECUTE FUNCTION public.validate_assessment_answer();

-- Create a function to validate assessment total score
CREATE OR REPLACE FUNCTION public.validate_assessment_total()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate max_score equals the sum of question weights
  IF NEW.max_score != 20 THEN
    RAISE EXCEPTION 'Invalid max_score';
  END IF;
  
  -- Validate total_score is within valid range
  IF NEW.total_score < 0 OR NEW.total_score > NEW.max_score THEN
    RAISE EXCEPTION 'Invalid total_score';
  END IF;
  
  -- Validate is_qualified matches threshold
  IF (NEW.total_score >= 12 AND NOT NEW.is_qualified) OR (NEW.total_score < 12 AND NEW.is_qualified) THEN
    RAISE EXCEPTION 'is_qualified does not match score threshold';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for assessment validation
CREATE TRIGGER validate_assessment_total_trigger
BEFORE INSERT ON public.assessments
FOR EACH ROW
EXECUTE FUNCTION public.validate_assessment_total();