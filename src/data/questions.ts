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
    type: 'binary',
    options: [
      { id: 'q2_yes', label: 'نعم', scorePercentage: 100 },
      { id: 'q2_no', label: 'لا', scorePercentage: 0 },
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
