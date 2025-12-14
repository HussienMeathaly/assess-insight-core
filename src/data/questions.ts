import { Question } from '@/types/assessment';

export const assessmentQuestions: Question[] = [
  {
    id: 1,
    text: 'هل سبق وأن مارست أي نشاط تجاري لمدة لا تقل عن سنتين؟',
    weight: 4,
    type: 'binary',
    options: [
      { id: 'q1_yes', label: 'نعم', scorePercentage: 100 },
      { id: 'q1_no', label: 'لا', scorePercentage: 0 },
    ],
  },
  {
    id: 2,
    text: 'هل سبق وأن تعاملت مع منتجات مشابهة؟',
    weight: 3,
    type: 'multiple',
    options: [
      { id: 'q2_5plus', label: 'أكثر من 5 سنوات', scorePercentage: 100 },
      { id: 'q2_3to5', label: 'أكثر من 3 وأقل من 5 سنوات', scorePercentage: 85 },
      { id: 'q2_1to3', label: 'أكثر من سنة وأقل من 3 سنوات', scorePercentage: 70 },
      { id: 'q2_less1', label: 'أقل من سنة', scorePercentage: 50 },
      { id: 'q2_none', label: 'لا يوجد', scorePercentage: 0 },
    ],
  },
  {
    id: 3,
    text: 'هل سبق وأن قمت بعمل دراسة لفئة النشاط الجديد؟',
    weight: 4,
    type: 'binary',
    options: [
      { id: 'q3_yes', label: 'نعم', scorePercentage: 100 },
      { id: 'q3_no', label: 'لا', scorePercentage: 0 },
    ],
  },
  {
    id: 4,
    text: 'هل لديك جاهزية للتمويل متناسبة مع مستهدفات النشاط؟',
    weight: 6,
    type: 'binary',
    options: [
      { id: 'q4_yes', label: 'نعم', scorePercentage: 100 },
      { id: 'q4_no', label: 'لا', scorePercentage: 0 },
    ],
  },
  {
    id: 5,
    text: 'هل أنت متفرغ لإدارة النشاط؟',
    weight: 3,
    type: 'binary',
    options: [
      { id: 'q5_yes', label: 'نعم', scorePercentage: 100 },
      { id: 'q5_no', label: 'لا', scorePercentage: 0 },
    ],
  },
];

export const MAX_SCORE = 20;
export const QUALIFICATION_THRESHOLD = 12;
