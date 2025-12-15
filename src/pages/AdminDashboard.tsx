import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Building2, ClipboardCheck, Users, LogOut, Eye, ChevronLeft } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  created_at: string;
}

interface Assessment {
  id: string;
  total_score: number;
  max_score: number;
  is_qualified: boolean;
  completed_at: string;
  organization: {
    name: string;
    contact_person: string;
    email: string;
    phone: string;
  } | null;
}

interface AssessmentAnswer {
  id: string;
  question_id: number;
  score: number;
  question: {
    text: string;
    weight: number;
  } | null;
  option: {
    label: string;
    score_percentage: number;
  } | null;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState<AssessmentAnswer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!roleLoading && !isAdmin && user) {
      navigate('/');
    }
  }, [roleLoading, isAdmin, user, navigate]);

  useEffect(() => {
    async function fetchData() {
      if (!isAdmin) return;

      const [orgsResult, assessmentsResult] = await Promise.all([
        supabase.from('organizations').select('*').order('created_at', { ascending: false }),
        supabase.from('assessments').select(`
          *,
          organization:organizations(name, contact_person, email, phone)
        `).order('completed_at', { ascending: false }),
      ]);

      if (orgsResult.data) setOrganizations(orgsResult.data);
      if (assessmentsResult.data) setAssessments(assessmentsResult.data as Assessment[]);
      setLoadingData(false);
    }

    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const handleViewDetails = async (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setLoadingAnswers(true);

    const { data } = await supabase
      .from('assessment_answers')
      .select(`
        *,
        question:questions(text, weight),
        option:question_options!assessment_answers_selected_option_id_fkey(label, score_percentage)
      `)
      .eq('assessment_id', assessment.id)
      .order('question_id');

    if (data) {
      setAssessmentAnswers(data as AssessmentAnswer[]);
    }
    setLoadingAnswers(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (authLoading || roleLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const qualifiedCount = assessments.filter(a => a.is_qualified).length;
  const avgScore = assessments.length > 0
    ? (assessments.reduce((sum, a) => sum + a.total_score, 0) / assessments.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ChevronLeft className="h-4 w-4 ml-1" />
              الرئيسية
            </Button>
            <h1 className="text-xl font-bold text-foreground">لوحة تحكم المدير</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي المنظمات
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organizations.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي التقييمات
              </CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assessments.length}</div>
              <p className="text-xs text-muted-foreground">
                {qualifiedCount} مؤهل • متوسط النتيجة: {avgScore}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                معدل التأهيل
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assessments.length > 0
                  ? Math.round((qualifiedCount / assessments.length) * 100)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <Tabs defaultValue="assessments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="assessments">التقييمات</TabsTrigger>
            <TabsTrigger value="organizations">المنظمات</TabsTrigger>
          </TabsList>

          <TabsContent value="assessments">
            <Card>
              <CardHeader>
                <CardTitle>جميع التقييمات</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المنظمة</TableHead>
                      <TableHead className="text-right">المسؤول</TableHead>
                      <TableHead className="text-right">النتيجة</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assessments.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">
                          {assessment.organization?.name || 'غير معروف'}
                        </TableCell>
                        <TableCell>
                          {assessment.organization?.contact_person || '-'}
                        </TableCell>
                        <TableCell>
                          {assessment.total_score} / {assessment.max_score}
                        </TableCell>
                        <TableCell>
                          <Badge variant={assessment.is_qualified ? 'default' : 'secondary'}>
                            {assessment.is_qualified ? 'مؤهل' : 'غير مؤهل'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(assessment.completed_at).toLocaleDateString('ar-SA')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(assessment)}
                          >
                            <Eye className="h-4 w-4 ml-1" />
                            التفاصيل
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {assessments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          لا توجد تقييمات بعد
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organizations">
            <Card>
              <CardHeader>
                <CardTitle>جميع المنظمات</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم المنظمة</TableHead>
                      <TableHead className="text-right">المسؤول</TableHead>
                      <TableHead className="text-right">البريد الإلكتروني</TableHead>
                      <TableHead className="text-right">الهاتف</TableHead>
                      <TableHead className="text-right">تاريخ التسجيل</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">{org.name}</TableCell>
                        <TableCell>{org.contact_person}</TableCell>
                        <TableCell dir="ltr" className="text-right">{org.email}</TableCell>
                        <TableCell dir="ltr" className="text-right">{org.phone}</TableCell>
                        <TableCell>
                          {new Date(org.created_at).toLocaleDateString('ar-SA')}
                        </TableCell>
                      </TableRow>
                    ))}
                    {organizations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          لا توجد منظمات بعد
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Assessment Details Dialog */}
      <Dialog open={!!selectedAssessment} onOpenChange={() => setSelectedAssessment(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">
              تفاصيل التقييم - {selectedAssessment?.organization?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedAssessment && (
            <div className="space-y-6">
              {/* Organization Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">معلومات المنظمة</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">الاسم:</span>
                    <span className="mr-2 font-medium">{selectedAssessment.organization?.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">المسؤول:</span>
                    <span className="mr-2 font-medium">{selectedAssessment.organization?.contact_person}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">البريد:</span>
                    <span className="mr-2 font-medium" dir="ltr">{selectedAssessment.organization?.email}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">الهاتف:</span>
                    <span className="mr-2 font-medium" dir="ltr">{selectedAssessment.organization?.phone}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Score Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">ملخص النتيجة</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-6">
                  <div className="text-3xl font-bold text-primary">
                    {selectedAssessment.total_score} / {selectedAssessment.max_score}
                  </div>
                  <Badge variant={selectedAssessment.is_qualified ? 'default' : 'secondary'} className="text-sm">
                    {selectedAssessment.is_qualified ? 'مؤهل للتقييم الشامل' : 'غير مؤهل'}
                  </Badge>
                </CardContent>
              </Card>

              {/* Answers */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">الإجابات التفصيلية</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingAnswers ? (
                    <div className="text-center text-muted-foreground py-4">جاري التحميل...</div>
                  ) : (
                    <div className="space-y-4">
                      {assessmentAnswers.map((answer, index) => (
                        <div key={answer.id} className="border-b border-border pb-4 last:border-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-sm mb-1">
                                {index + 1}. {answer.question?.text}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                الإجابة: <span className="text-foreground">{answer.option?.label}</span>
                              </p>
                            </div>
                            <div className="text-left">
                              <Badge variant="outline">
                                {answer.score.toFixed(2)} / {answer.question?.weight}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
