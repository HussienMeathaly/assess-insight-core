-- Switch validation trigger functions to SECURITY INVOKER to avoid elevated-privilege execution

CREATE OR REPLACE FUNCTION public.validate_assessment_answer()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
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
$function$;


CREATE OR REPLACE FUNCTION public.validate_assessment_total()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
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
$function$;
