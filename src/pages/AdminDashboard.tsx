import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState<AssessmentAnswer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "user" | "none">("user");
  const [addingUser, setAddingUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

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

      const [orgsResult, assessmentsResult, rolesResult] = await Promise.all([
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
      ]);

      if (orgsResult.data) setOrganizations(orgsResult.data);
      if (assessmentsResult.data) setAssessments(assessmentsResult.data as Assessment[]);

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
      console.error("Error updating role:", error);
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
      console.error("Error adding user:", error);
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
      console.error("Error deleting user:", error);
      toast.error("حدث خطأ أثناء حذف المستخدم");
    } finally {
      setDeletingUser(null);
    }
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

  const qualifiedCount = assessments.filter((a) => a.is_qualified).length;
  const avgScore =
    assessments.length > 0
      ? (assessments.reduce((sum, a) => sum + a.total_score, 0) / assessments.length).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/assessment")}>
              <ChevronLeft className="h-4 w-4 ml-1" />
              الرئيسية
            </Button>
            <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-bold text-foreground">لوحة التحكم</h1>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الجهات</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organizations.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي التقييمات</CardTitle>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">معدل التأهيل</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assessments.length > 0 ? Math.round((qualifiedCount / assessments.length) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <Tabs defaultValue="assessments" className="space-y-10" dir="rtl">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="assessments">التقييمات</TabsTrigger>
            <TabsTrigger value="organizations">الجهات</TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1">
              <UserCog className="h-4 w-4" />
              إدارة المستخدمين
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assessments">
            <Card>
              <CardHeader>
                <CardTitle className="text-right">جميع التقييمات</CardTitle>
              </CardHeader>
              <CardContent>
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
                      {assessments.map((assessment) => (
                        <TableRow key={assessment.id}>
                          <TableCell className="font-medium">{assessment.organization?.name || "غير معروف"}</TableCell>
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
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(assessment)}>
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organizations">
            <Card>
              <CardHeader>
                <CardTitle className="text-right">جميع الجهات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table dir="rtl">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">اسم الجهة</TableHead>
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
                          <TableCell dir="ltr" className="text-right">
                            {org.email}
                          </TableCell>
                          <TableCell dir="ltr" className="text-right">
                            {org.phone}
                          </TableCell>
                          <TableCell>{new Date(org.created_at).toLocaleDateString("en-GB")}</TableCell>
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-right">
                  <Shield className="h-5 w-5" />
                  إدارة المستخدمين والصلاحيات
                </CardTitle>
                <Button onClick={() => setShowAddUserDialog(true)} className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  إضافة مستخدم
                </Button>
              </CardHeader>
              <CardContent>
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
                              {u.role === "admin" ? "مدير" : u.role === "user" ? "مستخدم" : "بدون صلاحية"}
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
                                  <SelectItem value="none">بدون صلاحية</SelectItem>
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
                    <span className="mr-2 font-medium" dir="ltr">
                      {selectedAssessment.organization?.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">الهاتف:</span>
                    <span className="mr-2 font-medium" dir="ltr">
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
    </div>
  );
}
