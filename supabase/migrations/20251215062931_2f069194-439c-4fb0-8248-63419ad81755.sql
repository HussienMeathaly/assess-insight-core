-- جدول الجمعيات/المنظمات
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول الأسئلة مع الأوزان
CREATE TABLE public.questions (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  weight INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('binary', 'multiple')),
  display_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول خيارات الإجابة
CREATE TABLE public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id INTEGER REFERENCES public.questions(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  score_percentage INTEGER NOT NULL CHECK (score_percentage >= 0 AND score_percentage <= 100),
  display_order INTEGER NOT NULL
);

-- جدول التقييمات
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  total_score NUMERIC(5,2) NOT NULL,
  max_score INTEGER NOT NULL,
  is_qualified BOOLEAN NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول إجابات التقييم
CREATE TABLE public.assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES public.questions(id),
  selected_option_id UUID REFERENCES public.question_options(id),
  score NUMERIC(5,2) NOT NULL
);

-- تفعيل RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة العامة (البيانات عامة للتقييم)
CREATE POLICY "Anyone can read organizations" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert organizations" ON public.organizations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Anyone can read question_options" ON public.question_options FOR SELECT USING (true);
CREATE POLICY "Anyone can read assessments" ON public.assessments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert assessments" ON public.assessments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read assessment_answers" ON public.assessment_answers FOR SELECT USING (true);
CREATE POLICY "Anyone can insert assessment_answers" ON public.assessment_answers FOR INSERT WITH CHECK (true);

-- إدخال الأسئلة الحالية
INSERT INTO public.questions (id, text, weight, type, display_order) VALUES
(1, 'هل سبق وأن مارست أي نشاط تجاري لمدة لا تقل عن سنتين؟', 4, 'binary', 1),
(2, 'هل سبق وأن تعاملت مع منتجات مشابهة؟', 3, 'multiple', 2),
(3, 'هل سبق وأن قمت بعمل دراسة لفئة النشاط الجديد؟', 4, 'binary', 3),
(4, 'هل لديك جاهزية للتمويل متناسبة مع مستهدفات النشاط؟', 6, 'binary', 4),
(5, 'هل أنت متفرغ لإدارة النشاط؟', 3, 'binary', 5);

-- إدخال خيارات الإجابة
INSERT INTO public.question_options (question_id, label, score_percentage, display_order) VALUES
-- السؤال 1
(1, 'نعم', 100, 1),
(1, 'لا', 0, 2),
-- السؤال 2
(2, 'أكثر من 5 سنوات', 100, 1),
(2, 'أكثر من 3 وأقل من 5 سنوات', 85, 2),
(2, 'أكثر من سنة وأقل من 3 سنوات', 70, 3),
(2, 'أقل من سنة', 50, 4),
(2, 'لا يوجد', 0, 5),
-- السؤال 3
(3, 'نعم', 100, 1),
(3, 'لا', 0, 2),
-- السؤال 4
(4, 'نعم', 100, 1),
(4, 'لا', 0, 2),
-- السؤال 5
(5, 'نعم', 100, 1),
(5, 'لا', 0, 2);