-- Create evaluation_reports table for storing shareable reports
CREATE TABLE public.evaluation_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id uuid NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
  share_token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  view_count integer DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.evaluation_reports ENABLE ROW LEVEL SECURITY;

-- Only admins can create reports
CREATE POLICY "Admins can create evaluation reports"
ON public.evaluation_reports
FOR INSERT
WITH CHECK (has_role('admin'::app_role));

-- Only admins can view all reports
CREATE POLICY "Admins can view all evaluation reports"
ON public.evaluation_reports
FOR SELECT
USING (has_role('admin'::app_role));

-- Only admins can update reports
CREATE POLICY "Admins can update evaluation reports"
ON public.evaluation_reports
FOR UPDATE
USING (has_role('admin'::app_role));

-- Only admins can delete reports
CREATE POLICY "Admins can delete evaluation reports"
ON public.evaluation_reports
FOR DELETE
USING (has_role('admin'::app_role));

-- Create a function to get report by share token (public access for shared reports)
CREATE OR REPLACE FUNCTION public.get_report_by_token(p_token uuid)
RETURNS TABLE (
  report_id uuid,
  evaluation_id uuid,
  org_name text,
  org_contact_person text,
  org_email text,
  org_phone text,
  total_score numeric,
  max_score numeric,
  is_completed boolean,
  completed_at timestamptz,
  is_active boolean,
  expires_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Increment view count
  UPDATE evaluation_reports 
  SET view_count = view_count + 1 
  WHERE share_token = p_token AND is_active = true;

  RETURN QUERY
  SELECT 
    r.id as report_id,
    r.evaluation_id,
    o.name as org_name,
    o.contact_person as org_contact_person,
    o.email as org_email,
    o.phone as org_phone,
    e.total_score,
    e.max_score,
    e.is_completed,
    e.completed_at,
    r.is_active,
    r.expires_at
  FROM evaluation_reports r
  JOIN evaluations e ON e.id = r.evaluation_id
  JOIN organizations o ON o.id = e.organization_id
  WHERE r.share_token = p_token
    AND r.is_active = true
    AND (r.expires_at IS NULL OR r.expires_at > now());
END;
$$;

-- Function to get report answers by token
CREATE OR REPLACE FUNCTION public.get_report_answers_by_token(p_token uuid)
RETURNS TABLE (
  criterion_id uuid,
  criterion_name text,
  criterion_weight numeric,
  selected_option_label text,
  score numeric,
  sub_element_id uuid,
  sub_element_name text,
  main_element_id uuid,
  main_element_name text,
  main_element_weight numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_evaluation_id uuid;
  v_is_valid boolean;
BEGIN
  -- Check if report is valid
  SELECT 
    r.evaluation_id,
    r.is_active AND (r.expires_at IS NULL OR r.expires_at > now())
  INTO v_evaluation_id, v_is_valid
  FROM evaluation_reports r
  WHERE r.share_token = p_token;

  IF NOT v_is_valid OR v_evaluation_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    ea.criterion_id,
    c.name as criterion_name,
    c.weight_percentage as criterion_weight,
    co.label as selected_option_label,
    ea.score,
    se.id as sub_element_id,
    se.name as sub_element_name,
    me.id as main_element_id,
    me.name as main_element_name,
    me.weight_percentage as main_element_weight
  FROM evaluation_answers ea
  JOIN criteria c ON c.id = ea.criterion_id
  JOIN criteria_options co ON co.id = ea.selected_option_id
  JOIN sub_elements se ON se.id = c.sub_element_id
  JOIN main_elements me ON me.id = se.main_element_id
  WHERE ea.evaluation_id = v_evaluation_id
  ORDER BY me.display_order, se.display_order, c.display_order;
END;
$$;