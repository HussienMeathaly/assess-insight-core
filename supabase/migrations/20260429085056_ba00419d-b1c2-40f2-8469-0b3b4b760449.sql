DROP FUNCTION IF EXISTS public.get_report_by_token(uuid);

CREATE OR REPLACE FUNCTION public.get_report_by_token(p_token uuid)
 RETURNS TABLE(report_id uuid, evaluation_id uuid, org_name text, org_contact_person text, org_email text, org_phone text, org_activity_category text, total_score numeric, max_score numeric, is_completed boolean, completed_at timestamp with time zone, is_active boolean, expires_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
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
    o.activity_category as org_activity_category,
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
$function$;