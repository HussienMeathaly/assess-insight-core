import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logInfo, logError } from '@/lib/logger';
interface CriterionOption {
  id: string;
  criterion_id: string;
  label: string;
  score_percentage: number;
  display_order: number;
}

interface Criterion {
  id: string;
  sub_element_id: string;
  name: string;
  weight_percentage: number;
  display_order: number;
  options: CriterionOption[];
}

interface SubElement {
  id: string;
  main_element_id: string;
  name: string;
  display_order: number;
  criteria: Criterion[];
}

interface MainElement {
  id: string;
  domain_id: string;
  name: string;
  weight_percentage: number;
  display_order: number;
  sub_elements: SubElement[];
}

interface EvaluationDomain {
  id: string;
  name: string;
  description: string | null;
  main_elements: MainElement[];
}

interface EvaluationAnswer {
  criterionId: string;
  selectedOptionId: string;
  score: number;
}

export function useEvaluation() {
  const { user } = useAuth();
  const [domain, setDomain] = useState<EvaluationDomain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Map<string, EvaluationAnswer>>(new Map());
  const [currentMainElementIndex, setCurrentMainElementIndex] = useState(0);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Fetch organization ID for current user
  useEffect(() => {
    async function fetchOrganization() {
      if (!user) {
        logInfo('No user found for organization fetch in evaluation');
        return;
      }

      logInfo('Fetching organization for evaluation user', { userId: user.id });

      const { data, error } = await supabase
        .from('organizations')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        logError('Error fetching organization for evaluation', error);
        return;
      }

      if (data) {
        setOrganizationId(data.id);
        logInfo('Organization found for evaluation', { orgId: data.id });
      }
    }

    fetchOrganization();
  }, [user]);

  useEffect(() => {
    fetchEvaluationData();
  }, []);

  async function fetchEvaluationData() {
    try {
      setLoading(true);
      
      // Fetch domain
      const { data: domains, error: domainError } = await supabase
        .from('evaluation_domains')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .limit(1);

      if (domainError) throw domainError;
      if (!domains || domains.length === 0) throw new Error('لم يتم العثور على مجال التقييم');

      const domainData = domains[0];

      // Fetch main elements
      const { data: mainElements, error: mainError } = await supabase
        .from('main_elements')
        .select('*')
        .eq('domain_id', domainData.id)
        .eq('is_active', true)
        .order('display_order');

      if (mainError) throw mainError;

      // Fetch sub elements
      const { data: subElements, error: subError } = await supabase
        .from('sub_elements')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (subError) throw subError;

      // Fetch criteria
      const { data: criteria, error: criteriaError } = await supabase
        .from('criteria')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (criteriaError) throw criteriaError;

      // Fetch options
      const { data: options, error: optionsError } = await supabase
        .from('criteria_options')
        .select('*')
        .order('display_order');

      if (optionsError) throw optionsError;

      // Build hierarchical structure
      const criteriaWithOptions = criteria?.map(c => ({
        ...c,
        options: options?.filter(o => o.criterion_id === c.id) || []
      })) || [];

      const subElementsWithCriteria = subElements?.map(se => ({
        ...se,
        criteria: criteriaWithOptions.filter(c => c.sub_element_id === se.id)
      })) || [];

      const mainElementsWithSubs = mainElements?.map(me => ({
        ...me,
        sub_elements: subElementsWithCriteria.filter(se => se.main_element_id === me.id)
      })) || [];

      setDomain({
        ...domainData,
        main_elements: mainElementsWithSubs
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }

  function answerCriterion(criterionId: string, optionId: string, score: number) {
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.set(criterionId, {
        criterionId,
        selectedOptionId: optionId,
        score
      });
      return newAnswers;
    });
  }

  // Calculate scores
  const scores = useMemo(() => {
    if (!domain) return { total: 0, max: 100, percentage: 0, byMainElement: new Map() };

    let totalScore = 0;
    const byMainElement = new Map<string, { score: number; max: number; name: string }>();

    domain.main_elements.forEach(me => {
      let elementScore = 0;
      let elementMax = me.weight_percentage;

      me.sub_elements.forEach(se => {
        se.criteria.forEach(c => {
          const answer = answers.get(c.id);
          if (answer) {
            // Score = (criterion weight * answer percentage) / 100
            const criterionScore = (c.weight_percentage * answer.score) / 100;
            elementScore += criterionScore;
          }
        });
      });

      totalScore += elementScore;
      byMainElement.set(me.id, {
        score: elementScore,
        max: elementMax,
        name: me.name
      });
    });

    return {
      total: Math.round(totalScore * 100) / 100,
      max: 100,
      percentage: Math.round(totalScore),
      byMainElement
    };
  }, [domain, answers]);

  // Calculate progress
  const progress = useMemo(() => {
    if (!domain) return { current: 0, total: 0, percentage: 0 };

    let totalCriteria = 0;
    domain.main_elements.forEach(me => {
      me.sub_elements.forEach(se => {
        totalCriteria += se.criteria.length;
      });
    });

    return {
      current: answers.size,
      total: totalCriteria,
      percentage: totalCriteria > 0 ? Math.round((answers.size / totalCriteria) * 100) : 0
    };
  }, [domain, answers]);

  // Get current main element
  const currentMainElement = useMemo(() => {
    if (!domain || domain.main_elements.length === 0) return null;
    return domain.main_elements[currentMainElementIndex];
  }, [domain, currentMainElementIndex]);

  function goToNextElement() {
    if (domain && currentMainElementIndex < domain.main_elements.length - 1) {
      setCurrentMainElementIndex(prev => prev + 1);
    }
  }

  function goToPreviousElement() {
    if (currentMainElementIndex > 0) {
      setCurrentMainElementIndex(prev => prev - 1);
    }
  }

  function goToElement(index: number) {
    if (domain && index >= 0 && index < domain.main_elements.length) {
      setCurrentMainElementIndex(index);
    }
  }

  const isComplete = progress.current === progress.total && progress.total > 0;
  const isLastElement = domain ? currentMainElementIndex === domain.main_elements.length - 1 : false;
  const isFirstElement = currentMainElementIndex === 0;

  // Save evaluation to database
  const saveEvaluation = useCallback(async () => {
    if (!domain || !organizationId || saved || saving) {
      logInfo('Cannot save evaluation', { 
        hasDomain: !!domain, 
        hasOrgId: !!organizationId, 
        saved, 
        saving 
      });
      return false;
    }

    setSaving(true);
    logInfo('Saving evaluation to database', { organizationId, totalScore: scores.total });

    try {
      // Create evaluation record
      const { data: evaluation, error: evalError } = await supabase
        .from('evaluations')
        .insert({
          organization_id: organizationId,
          domain_id: domain.id,
          total_score: scores.total,
          max_score: scores.max,
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (evalError) {
        logError('Error creating evaluation', evalError);
        throw evalError;
      }

      logInfo('Evaluation created', { evaluationId: evaluation.id });

      // Save all answers
      const answersToInsert = Array.from(answers.values()).map(answer => ({
        evaluation_id: evaluation.id,
        criterion_id: answer.criterionId,
        selected_option_id: answer.selectedOptionId,
        score: answer.score,
      }));

      if (answersToInsert.length > 0) {
        const { error: answersError } = await supabase
          .from('evaluation_answers')
          .insert(answersToInsert);

        if (answersError) {
          logError('Error saving evaluation answers', answersError);
          throw answersError;
        }

        logInfo('Evaluation answers saved', { count: answersToInsert.length });
      }

      setSaved(true);
      return true;
    } catch (err) {
      logError('Failed to save evaluation', err);
      return false;
    } finally {
      setSaving(false);
    }
  }, [domain, organizationId, saved, saving, scores, answers]);

  return {
    domain,
    loading,
    error,
    answers,
    scores,
    progress,
    currentMainElement,
    currentMainElementIndex,
    answerCriterion,
    goToNextElement,
    goToPreviousElement,
    goToElement,
    isComplete,
    isLastElement,
    isFirstElement,
    saveEvaluation,
    saving,
    saved,
  };
}
