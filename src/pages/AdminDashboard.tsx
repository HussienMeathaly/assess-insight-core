import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { startOfWeek, startOfMonth, isAfter } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AssessmentsMobileCards,
  OrganizationsMobileCards,
  UsersMobileCards,
  EvaluationsMobileCards,
  type AdminMobileEvaluation,
} from "@/components/admin/AdminMobileCards";
import { EditOrganizationButton } from "@/components/admin/EditOrganizationButton";
import { EditOrganizationForm } from "@/components/admin/EditOrganizationForm";
import { GenerateReportButton } from "@/components/admin/GenerateReportButton";
import {
  Building2,
  ClipboardCheck,
  Users,
  LogOut,
  Eye,
  ChevronLeft,
  Shield,
  UserCog,
  UserPlus,
  Trash2,
  Loader2,
  FileCheck2,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { logError } from "@/lib/logger";

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

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  role: "admin" | "user" | null;
}

interface Evaluation {
  id: string;
  total_score: number | null;
  max_score: number | null;
  is_completed: boolean | null;
  started_at: string | null;
  completed_at: string | null;
  organization: {
    name: string;
    contact_person: string;
    email: string;
    phone: string;
  } | null;
}

interface EvaluationAnswer {
  id: string;
  criterion_id: string;
  score: number;
  criterion: {
    name: string;
    weight_percentage: number;
    sub_element: {
      id: string;
      name: string;
      main_element: {
        id: string;
        name: string;
        weight_percentage: number;
      } | null;
    } | null;
  } | null;
  option: {
    label: string;
    score_percentage: number;
  } | null;
}

interface GroupedEvaluationAnswers {
  mainElementId: string;
  mainElementName: string;
  mainElementWeight: number;
  subElements: {
    subElementId: string;
    subElementName: string;
    criteria: EvaluationAnswer[];
  }[];
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState<AssessmentAnswer[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [evaluationAnswers, setEvaluationAnswers] = useState<EvaluationAnswer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "user" | "none">("user");
  const [addingUser, setAddingUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [deletingAssessment, setDeletingAssessment] = useState<string | null>(null);
  const [deletingEvaluation, setDeletingEvaluation] = useState<string | null>(null);
  const [qualificationFilter, setQualificationFilter] = useState<"all" | "qualified" | "not_qualified">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [evaluationStatusFilter, setEvaluationStatusFilter] = useState<"all" | "completed" | "in_progress">("all");
  const [evaluationSearchQuery, setEvaluationSearchQuery] = useState("");
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!roleLoading && !isAdmin && user) {
      navigate("/");
    }
  }, [roleLoading, isAdmin, user, navigate]);

  useEffect(() => {
    async function fetchData() {
      if (!isAdmin) return;

      const [orgsResult, assessmentsResult, rolesResult, evaluationsResult] = await Promise.all([
        supabase.from("organizations").select("*").order("created_at", { ascending: false }),
        supabase
          .from("assessments")
          .select(
            `
          *,
          organization:organizations(name, contact_person, email, phone)
        `,
          )
          .order("completed_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
        supabase
          .from("evaluations")
          .select(
            `
          *,
          organization:organizations(name, contact_person, email, phone)
        `,
          )
          .order("started_at", { ascending: false }),
      ]);

      if (orgsResult.data) setOrganizations(orgsResult.data);
      if (assessmentsResult.data) setAssessments(assessmentsResult.data as Assessment[]);
      if (evaluationsResult.data) setEvaluations(evaluationsResult.data as Evaluation[]);

      // Fetch users from auth (we'll get them from organizations for now)
      const uniqueUserIds = new Set<string>();
      const usersWithRoles: UserWithRole[] = [];

      // Get users from organizations
      if (orgsResult.data) {
        for (const org of orgsResult.data) {
          if (org.user_id && !uniqueUserIds.has(org.user_id)) {
            uniqueUserIds.add(org.user_id);
            const userRole = rolesResult.data?.find((r) => r.user_id === org.user_id);
            usersWithRoles.push({
              id: org.user_id,
              email: org.email,
              created_at: org.created_at,
              role: userRole?.role || null,
            });
          }
        }
      }

      // Also check if current admin is in the list
      if (user && !uniqueUserIds.has(user.id)) {
        const userRole = rolesResult.data?.find((r) => r.user_id === user.id);
        usersWithRoles.unshift({
          id: user.id,
          email: user.email || "",
          created_at: new Date().toISOString(),
          role: userRole?.role || null,
        });
      }

      setUsers(usersWithRoles);
      setLoadingData(false);
    }

    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, user]);

  const handleViewDetails = async (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setLoadingAnswers(true);

    const { data } = await supabase
      .from("assessment_answers")
      .select(
        `
        *,
        question:questions(text, weight),
        option:question_options!assessment_answers_selected_option_id_fkey(label, score_percentage)
      `,
      )
      .eq("assessment_id", assessment.id)
      .order("question_id");

    if (data) {
      setAssessmentAnswers(data as AssessmentAnswer[]);
    }
    setLoadingAnswers(false);
  };

  const handleViewEvaluationDetails = async (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setLoadingAnswers(true);

    const { data } = await supabase
      .from("evaluation_answers")
      .select(
        `
        *,
        criterion:criteria(
          name, 
          weight_percentage,
          sub_element:sub_elements(
            id,
            name,
            main_element:main_elements(
              id,
              name,
              weight_percentage
            )
          )
        ),
        option:criteria_options!evaluation_answers_selected_option_id_fkey(label, score_percentage)
      `,
      )
      .eq("evaluation_id", evaluation.id);

    if (data) {
      setEvaluationAnswers(data as EvaluationAnswer[]);
    }
    setLoadingAnswers(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleRoleChange = async (userId: string, newRole: "admin" | "user" | "none") => {
    if (userId === user?.id) {
      toast.error("لا يمكنك تغيير صلاحياتك الخاصة");
      return;
    }

    setUpdatingRole(userId);

    try {
      // First, delete existing role
      await supabase.from("user_roles").delete().eq("user_id", userId);

      // If new role is not 'none', insert the new role
      if (newRole !== "none") {
        const { error } = await supabase.from("user_roles").insert({
          user_id: userId,
          role: newRole,
        });

        if (error) throw error;
      }

      // Update local state
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole === "none" ? null : newRole } : u)));

      toast.success("تم تحديث الصلاحية بنجاح");
    } catch (error) {
      logError("Error updating role", error);
      toast.error("حدث خطأ أثناء تحديث الصلاحية");
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleAddUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast.error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    if (newUserPassword.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setAddingUser(true);

    try {
      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: {
          action: "create",
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole === "none" ? undefined : newUserRole,
        },
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Add to local state
      setUsers((prev) => [
        {
          id: data.user.id,
          email: data.user.email,
          created_at: new Date().toISOString(),
          role: data.user.role,
        },
        ...prev,
      ]);

      toast.success("تم إضافة المستخدم بنجاح");
      setShowAddUserDialog(false);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("user");
    } catch (error) {
      logError("Error adding user", error);
      toast.error("حدث خطأ أثناء إضافة المستخدم");
    } finally {
      setAddingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      toast.error("لا يمكنك حذف حسابك الخاص");
      return;
    }

    setDeletingUser(userId);

    try {
      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: {
          action: "delete",
          userId,
        },
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Remove from local state
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("تم حذف المستخدم بنجاح");
    } catch (error) {
      logError("Error deleting user", error);
      toast.error("حدث خطأ أثناء حذف المستخدم");
    } finally {
      setDeletingUser(null);
    }
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    setDeletingAssessment(assessmentId);

    try {
      // First delete assessment answers
      const { error: answersError } = await supabase
        .from("assessment_answers")
        .delete()
        .eq("assessment_id", assessmentId);

      if (answersError) throw answersError;

      // Then delete the assessment
      const { error } = await supabase.from("assessments").delete().eq("id", assessmentId);

      if (error) throw error;

      // Remove from local state
      setAssessments((prev) => prev.filter((a) => a.id !== assessmentId));
      toast.success("تم حذف التقييم الأولي بنجاح");
    } catch (error) {
      logError("Error deleting assessment", error);
      toast.error("حدث خطأ أثناء حذف التقييم");
    } finally {
      setDeletingAssessment(null);
    }
  };

  const handleDeleteEvaluation = async (evaluationId: string) => {
    setDeletingEvaluation(evaluationId);

    try {
      // First delete evaluation answers
      const { error: answersError } = await supabase
        .from("evaluation_answers")
        .delete()
        .eq("evaluation_id", evaluationId);

      if (answersError) throw answersError;

      // Then delete the evaluation
      const { error } = await supabase.from("evaluations").delete().eq("id", evaluationId);

      if (error) throw error;

      // Remove from local state
      setEvaluations((prev) => prev.filter((e) => e.id !== evaluationId));
      toast.success("تم حذف التقييم المجاني بنجاح");
    } catch (error) {
      logError("Error deleting evaluation", error);
      toast.error("حدث خطأ أثناء حذف التقييم");
    } finally {
      setDeletingEvaluation(null);
    }
  };

  if (authLoading || roleLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          </div>
          <p className="text-muted-foreground font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const qualifiedCount = assessments.filter((a) => a.is_qualified).length;
  const avgScoreNum =
    assessments.length > 0 ? assessments.reduce((sum, a) => sum + a.total_score, 0) / assessments.length : 0;
  const avgScore = avgScoreNum.toFixed(1);

  // Filtered assessments based on search, qualification and date filters
  const filteredAssessments = assessments.filter((a) => {
    // Text search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      const orgName = a.organization?.name?.toLowerCase() || "";
      const contactPerson = a.organization?.contact_person?.toLowerCase() || "";
      if (!orgName.includes(query) && !contactPerson.includes(query)) {
        return false;
      }
    }

    // Qualification filter
    if (qualificationFilter === "qualified" && !a.is_qualified) return false;
    if (qualificationFilter === "not_qualified" && a.is_qualified) return false;

    // Date filter
    if (dateFilter !== "all") {
      const assessmentDate = new Date(a.completed_at);
      const now = new Date();

      if (dateFilter === "today") {
        if (assessmentDate.toDateString() !== now.toDateString()) return false;
      } else if (dateFilter === "week") {
        if (!isAfter(assessmentDate, startOfWeek(now, { weekStartsOn: 0 }))) return false;
      } else if (dateFilter === "month") {
        if (!isAfter(assessmentDate, startOfMonth(now))) return false;
      }
    }

    return true;
  });

  // Filtered evaluations based on search and status filters
  const completedEvaluations = evaluations.filter((e) => e.is_completed).length;
  const filteredEvaluations = evaluations.filter((e) => {
    // Text search filter
    if (evaluationSearchQuery.trim()) {
      const query = evaluationSearchQuery.trim().toLowerCase();
      const orgName = e.organization?.name?.toLowerCase() || "";
      const contactPerson = e.organization?.contact_person?.toLowerCase() || "";
      if (!orgName.includes(query) && !contactPerson.includes(query)) {
        return false;
      }
    }

    // Status filter
    if (evaluationStatusFilter === "completed" && !e.is_completed) return false;
    if (evaluationStatusFilter === "in_progress" && e.is_completed) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back Button + Title (Mobile) */}
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigate("/assessment")}
                className="h-10 w-10 rounded-xl border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground">لوحة التحكم</h1>
                <p className="text-xs text-muted-foreground">إدارة النظام والتقارير</p>
              </div>
            </div>
            
            {/* Center: Title (Mobile Only) */}
            <h1 className="sm:hidden text-lg font-bold text-foreground">لوحة التحكم</h1>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="hidden sm:flex items-center gap-2 rounded-xl border-border/50 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span>تسجيل الخروج</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSignOut}
                className="sm:hidden h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {/* بطاقة الجهات */}
          <Card className="group relative overflow-hidden border-border/30 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 sm:h-1.5 bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 relative p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">إجمالي الجهات</CardTitle>
              <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Building2 className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="relative p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-2xl sm:text-4xl font-bold text-foreground mb-0.5 sm:mb-1">{organizations.length}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">جهة مسجلة في النظام</p>
            </CardContent>
          </Card>

          {/* بطاقة التقييم الأولي */}
          <Card className="group relative overflow-hidden border-border/30 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-accent/5 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 sm:h-1.5 bg-gradient-to-r from-accent/30 via-accent to-accent/30" />
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 relative p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">التقييم الأولي</CardTitle>
              <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <ClipboardCheck className="h-4 w-4 sm:h-6 sm:w-6 text-accent" />
              </div>
            </CardHeader>
            <CardContent className="relative p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-2xl sm:text-4xl font-bold text-foreground mb-1 sm:mb-2">{assessments.length}</div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <Badge className="text-[10px] sm:text-xs bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20">
                  ✓ {qualifiedCount} مؤهل
                </Badge>
                <Badge variant="outline" className="text-[10px] sm:text-xs bg-orange-500/10 text-orange-600 border-orange-500/30">
                  {assessments.length - qualifiedCount} غير مؤهل
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${avgScoreNum >= 75 ? "bg-green-500" : avgScoreNum >= 50 ? "bg-amber-500" : "bg-red-500"}`} />
                <span className="text-xs sm:text-sm text-muted-foreground">المتوسط: <span className="font-semibold text-foreground">{avgScore}</span></span>
              </div>
            </CardContent>
          </Card>

          {/* بطاقة التقييم المجاني */}
          <Card className="group relative overflow-hidden border-border/30 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-secondary/5 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 sm:h-1.5 bg-gradient-to-r from-secondary/30 via-secondary to-secondary/30" />
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 relative p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">التقييم المجاني</CardTitle>
              <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                <FileCheck2 className="h-4 w-4 sm:h-6 sm:w-6 text-secondary-foreground" />
              </div>
            </CardHeader>
            <CardContent className="relative p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-2xl sm:text-4xl font-bold text-foreground mb-1 sm:mb-2">{evaluations.length}</div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <Badge className="text-[10px] sm:text-xs bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20">
                  ✓ {completedEvaluations} مكتمل
                </Badge>
                <Badge variant="outline" className="text-[10px] sm:text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                  {evaluations.length - completedEvaluations} قيد التنفيذ
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                المتوسط: <span className="font-semibold text-foreground">
                  {evaluations.length > 0 
                    ? (evaluations.filter(e => e.is_completed && e.total_score !== null).reduce((sum, e) => sum + (e.total_score || 0), 0) / (completedEvaluations || 1)).toFixed(1)
                    : 0}%
                </span>
              </p>
            </CardContent>
          </Card>

          {/* بطاقة معدل التأهيل */}
          <Card className="group relative overflow-hidden border-border/30 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 sm:h-1.5 bg-gradient-to-r from-green-500/30 via-green-500 to-green-500/30" />
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 relative p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">معدل التأهيل</CardTitle>
              <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <Users className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="relative p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-2xl sm:text-4xl font-bold text-green-600 mb-2 sm:mb-3">
                {assessments.length > 0 ? Math.round((qualifiedCount / assessments.length) * 100) : 0}%
              </div>
              <div className="w-full h-2 sm:h-2.5 bg-muted/50 rounded-full overflow-hidden mb-1.5 sm:mb-2">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${assessments.length > 0 ? Math.round((qualifiedCount / assessments.length) * 100) : 0}%`,
                  }}
                />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">نسبة الجهات المؤهلة</p>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <Tabs defaultValue="assessments" className="space-y-4 sm:space-y-6" dir="rtl">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-2 scrollbar-hide">
            <TabsList className="inline-flex w-auto min-w-max md:w-full gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-muted/50 backdrop-blur-sm rounded-xl sm:rounded-2xl">
              <TabsTrigger 
                value="users" 
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                <UserCog className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>المستخدمين</span>
              </TabsTrigger>
              <TabsTrigger 
                value="organizations" 
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>الجهات</span>
              </TabsTrigger>
              <TabsTrigger 
                value="assessments" 
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                <ClipboardCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>التقييم الأولي</span>
              </TabsTrigger>
              <TabsTrigger 
                value="evaluations" 
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                <FileCheck2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>التقييم المجاني</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="assessments">
            <Card className="border-border/30 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardHeader className="flex flex-col gap-4 border-b border-border/30 pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-accent" />
                    جميع التقييمات الأولية
                  </CardTitle>
                  <Badge variant="outline" className="text-sm">
                    {filteredAssessments.length} نتيجة
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">الحالة</Label>
                    <Select
                      value={qualificationFilter}
                      onValueChange={(v) => setQualificationFilter(v as "all" | "qualified" | "not_qualified")}
                    >
                      <SelectTrigger className="w-full rounded-xl border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        <SelectItem value="qualified">مؤهل ({qualifiedCount})</SelectItem>
                        <SelectItem value="not_qualified">غير مؤهل ({assessments.length - qualifiedCount})</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">الفترة</Label>
                    <Select
                      value={dateFilter}
                      onValueChange={(v) => setDateFilter(v as "all" | "today" | "week" | "month")}
                    >
                      <SelectTrigger className="w-full rounded-xl border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        <SelectItem value="today">اليوم</SelectItem>
                        <SelectItem value="week">هذا الأسبوع</SelectItem>
                        <SelectItem value="month">هذا الشهر</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">البحث</Label>
                    <Input
                      placeholder="اسم الجهة أو المسؤول..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="rounded-xl border-border/50"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Mobile (cards) */}
                <div className="md:hidden">
                  <AssessmentsMobileCards
                    assessments={filteredAssessments}
                    onViewDetails={handleViewDetails}
                    onDelete={handleDeleteAssessment}
                    deletingId={deletingAssessment}
                  />
                </div>

                {/* Desktop (table) */}
                <div className="hidden md:block">
                  <div className="overflow-x-auto">
                    <Table dir="rtl">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">الجهة</TableHead>
                          <TableHead className="text-right">المسؤول</TableHead>
                          <TableHead className="text-right">النتيجة</TableHead>
                          <TableHead className="text-right">الحالة</TableHead>
                          <TableHead className="text-right">التاريخ</TableHead>
                          <TableHead className="text-right">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAssessments.map((assessment) => (
                          <TableRow key={assessment.id}>
                            <TableCell className="font-medium">
                              {assessment.organization?.name || "غير معروف"}
                            </TableCell>
                            <TableCell>{assessment.organization?.contact_person || "-"}</TableCell>
                            <TableCell>
                              {assessment.total_score} / {assessment.max_score}
                            </TableCell>
                            <TableCell>
                              <Badge variant={assessment.is_qualified ? "default" : "secondary"}>
                                {assessment.is_qualified ? "مؤهل" : "غير مؤهل"}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(assessment.completed_at).toLocaleDateString("en-GB")}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" onClick={() => handleViewDetails(assessment)}>
                                  <Eye className="h-4 w-4 ml-1" />
                                  التفاصيل
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteAssessment(assessment.id)}
                                  disabled={deletingAssessment === assessment.id}
                                >
                                  {deletingAssessment === assessment.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredAssessments.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                              {qualificationFilter === "all" ? "لا توجد تقييمات بعد" : "لا توجد نتائج مطابقة"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evaluations">
            <Card className="border-border/30 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardHeader className="flex flex-col gap-4 border-b border-border/30 pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileCheck2 className="h-5 w-5 text-secondary-foreground" />
                    تقارير التقييم المجاني
                  </CardTitle>
                  <Badge variant="outline" className="text-sm">
                    {filteredEvaluations.length} نتيجة
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">الحالة</Label>
                    <Select
                      value={evaluationStatusFilter}
                      onValueChange={(v) => setEvaluationStatusFilter(v as "all" | "completed" | "in_progress")}
                    >
                      <SelectTrigger className="w-full rounded-xl border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل ({evaluations.length})</SelectItem>
                        <SelectItem value="completed">مكتمل ({completedEvaluations})</SelectItem>
                        <SelectItem value="in_progress">
                          قيد التنفيذ ({evaluations.length - completedEvaluations})
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">البحث</Label>
                    <Input
                      placeholder="اسم الجهة أو المسؤول..."
                      value={evaluationSearchQuery}
                      onChange={(e) => setEvaluationSearchQuery(e.target.value)}
                      className="rounded-xl border-border/50"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Mobile (cards) */}
                <div className="md:hidden">
                  <EvaluationsMobileCards
                    evaluations={filteredEvaluations}
                    onViewDetails={handleViewEvaluationDetails}
                    onDelete={handleDeleteEvaluation}
                    deletingId={deletingEvaluation}
                  />
                </div>

                {/* Desktop (table) */}
                <div className="hidden md:block">
                  <div className="overflow-x-auto">
                    <Table dir="rtl">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">الجهة</TableHead>
                          <TableHead className="text-right">المسؤول</TableHead>
                          <TableHead className="text-right">النتيجة</TableHead>
                          <TableHead className="text-right">الحالة</TableHead>
                          <TableHead className="text-right">تاريخ البدء</TableHead>
                          <TableHead className="text-right">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEvaluations.map((evaluation) => (
                          <TableRow key={evaluation.id}>
                            <TableCell className="font-medium">
                              {evaluation.organization?.name || "غير معروف"}
                            </TableCell>
                            <TableCell>{evaluation.organization?.contact_person || "-"}</TableCell>
                            <TableCell>
                              {evaluation.total_score !== null
                                ? `${evaluation.total_score} / ${evaluation.max_score}`
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={evaluation.is_completed ? "default" : "secondary"}>
                                {evaluation.is_completed ? "مكتمل" : "قيد التنفيذ"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {evaluation.started_at
                                ? new Date(evaluation.started_at).toLocaleDateString("en-GB")
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewEvaluationDetails(evaluation)}
                                >
                                  <Eye className="h-4 w-4 ml-1" />
                                  التفاصيل
                                </Button>
                                <GenerateReportButton
                                  evaluationId={evaluation.id}
                                  organizationName={evaluation.organization?.name || "غير معروف"}
                                  isCompleted={evaluation.is_completed || false}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteEvaluation(evaluation.id)}
                                  disabled={deletingEvaluation === evaluation.id}
                                >
                                  {deletingEvaluation === evaluation.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredEvaluations.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                              {evaluationStatusFilter === "all" ? "لا توجد تقييمات مجانية بعد" : "لا توجد نتائج مطابقة"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organizations">
            <Card className="border-border/30 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardHeader className="border-b border-border/30 pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    جميع الجهات المسجلة
                  </CardTitle>
                  <Badge variant="outline" className="text-sm">
                    {organizations.length} جهة
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Mobile (cards) */}
                <div className="md:hidden">
                  <OrganizationsMobileCards
                    organizations={organizations}
                    onEdit={(org) => setEditingOrganization(org)}
                  />
                </div>

                {/* Desktop (table) */}
                <div className="hidden md:block">
                  <div className="overflow-x-auto">
                    <Table dir="rtl">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">اسم الجهة</TableHead>
                          <TableHead className="text-right">المسؤول</TableHead>
                          <TableHead className="text-right">البريد الإلكتروني</TableHead>
                          <TableHead className="text-right">الهاتف</TableHead>
                          <TableHead className="text-right">تاريخ التسجيل</TableHead>
                          <TableHead className="text-right">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {organizations.map((org) => (
                          <TableRow key={org.id}>
                            <TableCell className="font-medium">{org.name}</TableCell>
                            <TableCell>{org.contact_person}</TableCell>
                            <TableCell dir="ltr" className="text-right">
                              {org.email}
                            </TableCell>
                            <TableCell dir="ltr" className="text-right">
                              {org.phone}
                            </TableCell>
                            <TableCell>{new Date(org.created_at).toLocaleDateString("en-GB")}</TableCell>
                            <TableCell>
                              <EditOrganizationButton
                                organization={org}
                                onUpdate={(updatedOrg) => {
                                  setOrganizations((prev) =>
                                    prev.map((o) => (o.id === updatedOrg.id ? { ...o, ...updatedOrg } : o))
                                  );
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                        {organizations.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                              لا توجد منظمات بعد
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="border-border/30 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/30 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">إدارة المستخدمين</CardTitle>
                    <p className="text-sm text-muted-foreground">إدارة الصلاحيات والأدوار</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowAddUserDialog(true)}
                  className="flex items-center gap-2 w-full sm:w-auto rounded-xl"
                >
                  <UserPlus className="h-4 w-4" />
                  إضافة مستخدم
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Mobile (cards) */}
                <div className="md:hidden">
                  <UsersMobileCards
                    users={users}
                    currentUserId={user?.id}
                    updatingRoleUserId={updatingRole}
                    deletingUserId={deletingUser}
                    onRoleChange={handleRoleChange}
                    onDelete={handleDeleteUser}
                  />
                </div>

                {/* Desktop (table) */}
                <div className="hidden md:block">
                  <div className="overflow-x-auto">
                    <Table dir="rtl">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">البريد الإلكتروني</TableHead>
                          <TableHead className="text-right">الصلاحية الحالية</TableHead>
                          <TableHead className="text-right">تغيير الصلاحية</TableHead>
                          <TableHead className="text-right">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell className="font-medium text-right">
                              <span dir="ltr" className="inline-flex items-center gap-2">
                                {u.id === user?.id && <Badge variant="outline">أنت</Badge>}
                                {u.email}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                                {u.role === "admin" ? "مدير" : u.role === "user" ? "مستخدم" : "غير محدد"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {u.id === user?.id ? (
                                <span className="text-muted-foreground text-sm">غير متاح</span>
                              ) : (
                                <Select
                                  value={u.role || "none"}
                                  onValueChange={(value) => handleRoleChange(u.id, value as "admin" | "user" | "none")}
                                  disabled={updatingRole === u.id}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">مدير</SelectItem>
                                    <SelectItem value="user">مستخدم</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </TableCell>
                            <TableCell>
                              {u.id === user?.id ? (
                                <span className="text-muted-foreground text-sm">-</span>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteUser(u.id)}
                                  disabled={deletingUser === u.id}
                                >
                                  {deletingUser === u.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {users.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              لا يوجد مستخدمين
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Assessment Details Dialog */}
      <Dialog open={!!selectedAssessment} onOpenChange={() => setSelectedAssessment(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-center">تفاصيل التقييم - {selectedAssessment?.organization?.name}</DialogTitle>
          </DialogHeader>

          {selectedAssessment && (
            <div className="space-y-6">
              {/* Organization Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">معلومات الجهة</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-xs">الاسم</span>
                    <span className="font-medium">{selectedAssessment.organization?.name}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-xs">المسؤول</span>
                    <span className="font-medium">{selectedAssessment.organization?.contact_person}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-xs">البريد الإلكتروني</span>
                    <span className="font-medium break-all" dir="ltr">
                      {selectedAssessment.organization?.email}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-xs">الهاتف</span>
                    <span className="font-medium" dir="ltr">
                      {selectedAssessment.organization?.phone}
                    </span>
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
                  <Badge variant={selectedAssessment.is_qualified ? "default" : "secondary"} className="text-sm">
                    {selectedAssessment.is_qualified ? "مؤهل للتقييم المجاني" : "غير مؤهل"}
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

      {/* Evaluation Details Dialog */}
      <Dialog open={!!selectedEvaluation} onOpenChange={() => setSelectedEvaluation(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <FileCheck2 className="h-5 w-5" />
              تفاصيل التقييم المجاني - {selectedEvaluation?.organization?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedEvaluation && (
            <div className="space-y-6">
              {/* Organization Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">معلومات الجهة</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-xs">الاسم</span>
                    <span className="font-medium">{selectedEvaluation.organization?.name}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-xs">المسؤول</span>
                    <span className="font-medium">{selectedEvaluation.organization?.contact_person}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-xs">البريد الإلكتروني</span>
                    <span className="font-medium break-all" dir="ltr">
                      {selectedEvaluation.organization?.email}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-xs">الهاتف</span>
                    <span className="font-medium" dir="ltr">
                      {selectedEvaluation.organization?.phone}
                    </span>
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
                    {selectedEvaluation.total_score !== null
                      ? `${selectedEvaluation.total_score} / ${selectedEvaluation.max_score}`
                      : "لم يكتمل"}
                  </div>
                  <Badge variant={selectedEvaluation.is_completed ? "default" : "secondary"} className="text-sm">
                    {selectedEvaluation.is_completed ? "مكتمل" : "قيد التنفيذ"}
                  </Badge>
                </CardContent>
              </Card>

              {/* Answers - Grouped by Main Element and Sub Element */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">الإجابات التفصيلية</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingAnswers ? (
                    <div className="text-center text-muted-foreground py-4">جاري التحميل...</div>
                  ) : evaluationAnswers.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">لا توجد إجابات بعد</div>
                  ) : (
                    <div className="space-y-6">
                      {(() => {
                        // Group answers by main element and sub element
                        const grouped = evaluationAnswers.reduce((acc, answer) => {
                          const mainElement = answer.criterion?.sub_element?.main_element;
                          const subElement = answer.criterion?.sub_element;
                          
                          if (!mainElement || !subElement) return acc;
                          
                          const mainKey = mainElement.id;
                          if (!acc[mainKey]) {
                            acc[mainKey] = {
                              id: mainElement.id,
                              name: mainElement.name,
                              weight: mainElement.weight_percentage,
                              subElements: {},
                              totalScore: 0,
                            };
                          }
                          
                          const subKey = subElement.id;
                          if (!acc[mainKey].subElements[subKey]) {
                            acc[mainKey].subElements[subKey] = {
                              id: subElement.id,
                              name: subElement.name,
                              answers: [],
                            };
                          }
                          
                          acc[mainKey].subElements[subKey].answers.push(answer);
                          // Calculate actual score: (criterion weight * score percentage) / 100
                          const criterionWeight = answer.criterion?.weight_percentage || 0;
                          const actualScore = (criterionWeight * answer.score) / 100;
                          acc[mainKey].totalScore += actualScore;
                          
                          return acc;
                        }, {} as Record<string, {
                          id: string;
                          name: string;
                          weight: number;
                          subElements: Record<string, { id: string; name: string; answers: EvaluationAnswer[] }>;
                          totalScore: number;
                        }>);
                        
                        return Object.values(grouped).map((mainElement) => (
                          <div key={mainElement.id} className="border border-border rounded-lg overflow-hidden">
                            {/* Main Element Header */}
                            <div className="bg-primary/10 px-4 py-3 flex items-center justify-between">
                              <h4 className="font-bold text-foreground">{mainElement.name}</h4>
                              <Badge variant="default">
                                {mainElement.totalScore.toFixed(1)} / {mainElement.weight}
                              </Badge>
                            </div>
                            
                            {/* Sub Elements */}
                            <div className="divide-y divide-border">
                              {Object.values(mainElement.subElements).map((subElement) => (
                                <div key={subElement.id} className="p-4">
                                  <h5 className="font-medium text-muted-foreground text-sm mb-3">
                                    {subElement.name}
                                  </h5>
                                  <div className="space-y-3">
                                    {subElement.answers.map((answer) => {
                                      const criterionWeight = answer.criterion?.weight_percentage || 0;
                                      // Calculate actual score: (criterion weight * score percentage) / 100
                                      const actualScore = (criterionWeight * answer.score) / 100;
                                      return (
                                        <div 
                                          key={answer.id} 
                                          className="flex items-start justify-between gap-4 bg-muted/30 rounded-md p-3"
                                        >
                                          <div className="flex-1">
                                            <p className="text-sm font-medium mb-1">{answer.criterion?.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                              الإجابة: <span className="text-foreground">{answer.option?.label}</span>
                                            </p>
                                          </div>
                                          <Badge variant="outline" className="shrink-0">
                                            {actualScore.toFixed(1)} / {criterionWeight}
                                          </Badge>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              إضافة مستخدم جديد
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@domain.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                dir="ltr"
                className="text-left"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                dir="ltr"
                className="text-left"
              />
              <p className="text-xs text-muted-foreground">6 أحرف على الأقل</p>
            </div>

            <div className="space-y-2">
              <Label>الصلاحية</Label>
              <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as "admin" | "user" | "none")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">مدير</SelectItem>
                  <SelectItem value="user">مستخدم</SelectItem>
                  <SelectItem value="none">بدون صلاحية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddUser} disabled={addingUser}>
              {addingUser ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري الإضافة...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 ml-2" />
                  إضافة المستخدم
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Organization Dialog (Mobile) */}
      {editingOrganization && (
        <Dialog open={!!editingOrganization} onOpenChange={() => setEditingOrganization(null)}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-center">تعديل بيانات الجهة</DialogTitle>
            </DialogHeader>
            <EditOrganizationForm
              organization={editingOrganization}
              onUpdate={(updatedOrg) => {
                setOrganizations((prev) =>
                  prev.map((o) => (o.id === updatedOrg.id ? { ...o, ...updatedOrg } : o))
                );
                setEditingOrganization(null);
              }}
              onCancel={() => setEditingOrganization(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
