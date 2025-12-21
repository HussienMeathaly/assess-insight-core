-- جدول المجالات
CREATE TABLE public.evaluation_domains (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    display_order integer NOT NULL DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- جدول العناصر الرئيسية
CREATE TABLE public.main_elements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id uuid REFERENCES public.evaluation_domains(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text,
    weight_percentage numeric NOT NULL CHECK (weight_percentage >= 0 AND weight_percentage <= 100),
    display_order integer NOT NULL DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- جدول العناصر الفرعية
CREATE TABLE public.sub_elements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    main_element_id uuid REFERENCES public.main_elements(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text,
    display_order integer NOT NULL DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- جدول المعايير
CREATE TABLE public.criteria (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_element_id uuid REFERENCES public.sub_elements(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text,
    weight_percentage numeric NOT NULL CHECK (weight_percentage >= 0 AND weight_percentage <= 100),
    display_order integer NOT NULL DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- جدول خيارات الإجابة للمعايير
CREATE TABLE public.criteria_options (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    criterion_id uuid REFERENCES public.criteria(id) ON DELETE CASCADE NOT NULL,
    label text NOT NULL,
    score_percentage numeric NOT NULL CHECK (score_percentage >= 0 AND score_percentage <= 100),
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- جدول التقييمات (جلسات التقييم)
CREATE TABLE public.evaluations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    domain_id uuid REFERENCES public.evaluation_domains(id) NOT NULL,
    total_score numeric DEFAULT 0,
    max_score numeric DEFAULT 100,
    is_completed boolean DEFAULT false,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone
);

-- جدول إجابات التقييم
CREATE TABLE public.evaluation_answers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id uuid REFERENCES public.evaluations(id) ON DELETE CASCADE NOT NULL,
    criterion_id uuid REFERENCES public.criteria(id) NOT NULL,
    selected_option_id uuid REFERENCES public.criteria_options(id) NOT NULL,
    score numeric NOT NULL,
    answered_at timestamp with time zone DEFAULT now(),
    UNIQUE (evaluation_id, criterion_id)
);

-- تفعيل RLS على جميع الجداول
ALTER TABLE public.evaluation_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.main_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criteria_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_answers ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة للجداول المرجعية (متاحة لجميع المستخدمين المسجلين)
CREATE POLICY "Anyone can read evaluation domains" ON public.evaluation_domains
    FOR SELECT USING (true);

CREATE POLICY "Anyone can read main elements" ON public.main_elements
    FOR SELECT USING (true);

CREATE POLICY "Anyone can read sub elements" ON public.sub_elements
    FOR SELECT USING (true);

CREATE POLICY "Anyone can read criteria" ON public.criteria
    FOR SELECT USING (true);

CREATE POLICY "Anyone can read criteria options" ON public.criteria_options
    FOR SELECT USING (true);

-- سياسات جدول التقييمات
CREATE POLICY "Users can insert their own evaluations" ON public.evaluations
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT id FROM public.organizations WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can read their own evaluations" ON public.evaluations
    FOR SELECT USING (
        organization_id IN (
            SELECT id FROM public.organizations WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own evaluations" ON public.evaluations
    FOR UPDATE USING (
        organization_id IN (
            SELECT id FROM public.organizations WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can read all evaluations" ON public.evaluations
    FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- سياسات جدول إجابات التقييم
CREATE POLICY "Users can insert their own evaluation answers" ON public.evaluation_answers
    FOR INSERT WITH CHECK (
        evaluation_id IN (
            SELECT e.id FROM public.evaluations e
            JOIN public.organizations o ON o.id = e.organization_id
            WHERE o.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can read their own evaluation answers" ON public.evaluation_answers
    FOR SELECT USING (
        evaluation_id IN (
            SELECT e.id FROM public.evaluations e
            JOIN public.organizations o ON o.id = e.organization_id
            WHERE o.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own evaluation answers" ON public.evaluation_answers
    FOR UPDATE USING (
        evaluation_id IN (
            SELECT e.id FROM public.evaluations e
            JOIN public.organizations o ON o.id = e.organization_id
            WHERE o.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can read all evaluation answers" ON public.evaluation_answers
    FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- فهارس لتحسين الأداء
CREATE INDEX idx_main_elements_domain ON public.main_elements(domain_id);
CREATE INDEX idx_sub_elements_main ON public.sub_elements(main_element_id);
CREATE INDEX idx_criteria_sub_element ON public.criteria(sub_element_id);
CREATE INDEX idx_criteria_options_criterion ON public.criteria_options(criterion_id);
CREATE INDEX idx_evaluations_organization ON public.evaluations(organization_id);
CREATE INDEX idx_evaluation_answers_evaluation ON public.evaluation_answers(evaluation_id);