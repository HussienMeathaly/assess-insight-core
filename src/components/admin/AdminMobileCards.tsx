import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Loader2, Trash2 } from "lucide-react";

export type AdminMobileAssessment = {
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
};

export function AssessmentsMobileCards({
  assessments,
  onViewDetails,
  onDelete,
  deletingId,
}: {
  assessments: AdminMobileAssessment[];
  onViewDetails: (assessment: AdminMobileAssessment) => void;
  onDelete?: (id: string) => void;
  deletingId?: string | null;
}) {
  if (assessments.length === 0) {
    return <div className="py-6 text-center text-sm text-muted-foreground">لا توجد تقييمات بعد</div>;
  }

  return (
    <div className="space-y-3">
      {assessments.map((a) => (
        <Card key={a.id}>
          <CardContent className="p-4 overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">{a.organization?.name || "غير معروف"}</p>
                <p className="mt-1 text-sm text-muted-foreground truncate">المسؤول: {a.organization?.contact_person || "-"}</p>
              </div>
              <Badge variant={a.is_qualified ? "default" : "secondary"} className="shrink-0">
                {a.is_qualified ? "مؤهل" : "غير مؤهل"}
              </Badge>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="text-foreground">
                <span className="text-muted-foreground">النتيجة: </span>
                {a.total_score} / {a.max_score}
              </div>
              <div className="text-left" dir="ltr">
                <span className="text-muted-foreground">التاريخ: </span>
                {new Date(a.completed_at).toLocaleDateString("en-GB")}
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => onViewDetails(a)}>
                <Eye className="h-4 w-4 ml-2" />
                التفاصيل
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(a.id)}
                  disabled={deletingId === a.id}
                >
                  {deletingId === a.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export type AdminMobileOrganization = {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  created_at: string;
};

export function OrganizationsMobileCards({ organizations }: { organizations: AdminMobileOrganization[] }) {
  if (organizations.length === 0) {
    return <div className="py-6 text-center text-sm text-muted-foreground">لا توجد منظمات بعد</div>;
  }

  return (
    <div className="space-y-3">
      {organizations.map((org) => (
        <Card key={org.id}>
          <CardContent className="p-4 overflow-hidden">
            <p className="font-semibold truncate" title={org.name}>
              {org.name}
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
              <div className="min-w-0">
                <span className="text-muted-foreground">المسؤول: </span>
                <span className="text-foreground break-words">{org.contact_person}</span>
              </div>
              <div dir="ltr" className="text-left min-w-0">
                <span className="text-muted-foreground">البريد: </span>
                <span className="text-foreground break-all">{org.email}</span>
              </div>
              <div dir="ltr" className="text-left min-w-0">
                <span className="text-muted-foreground">الهاتف: </span>
                <span className="text-foreground break-all">{org.phone}</span>
              </div>
              <div dir="ltr" className="text-left">
                <span className="text-muted-foreground">تاريخ التسجيل: </span>
                <span className="text-foreground">{new Date(org.created_at).toLocaleDateString("en-GB")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export type AdminMobileUser = {
  id: string;
  email: string;
  role: "admin" | "user" | null;
};

export function UsersMobileCards({
  users,
  currentUserId,
  updatingRoleUserId,
  deletingUserId,
  onRoleChange,
  onDelete,
}: {
  users: AdminMobileUser[];
  currentUserId?: string;
  updatingRoleUserId: string | null;
  deletingUserId: string | null;
  onRoleChange: (userId: string, role: "admin" | "user" | "none") => void;
  onDelete: (userId: string) => void;
}) {
  if (users.length === 0) {
    return <div className="py-6 text-center text-sm text-muted-foreground">لا يوجد مستخدمين</div>;
  }

  return (
    <div className="space-y-3">
      {users.map((u) => {
        const isMe = currentUserId && u.id === currentUserId;

        return (
          <Card key={u.id}>
            <CardContent className="p-4 overflow-hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {isMe && <Badge variant="outline">أنت</Badge>}
                    <span dir="ltr" className="font-semibold truncate">
                      {u.email}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                      {u.role === "admin" ? "مدير" : u.role === "user" ? "مستخدم" : "بدون صلاحية"}
                    </Badge>
                  </div>
                </div>

                {!isMe && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(u.id)}
                    disabled={deletingUserId === u.id}
                    aria-label="حذف المستخدم"
                  >
                    {deletingUserId === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                )}
              </div>

              <div className="mt-4">
                {isMe ? (
                  <div className="text-sm text-muted-foreground">تغيير الصلاحية: غير متاح</div>
                ) : (
                  <Select
                    value={u.role || "none"}
                    onValueChange={(value) => onRoleChange(u.id, value as "admin" | "user" | "none")}
                    disabled={updatingRoleUserId === u.id}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">مدير</SelectItem>
                      <SelectItem value="user">مستخدم</SelectItem>
                      <SelectItem value="none">بدون صلاحية</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Evaluation (Free Evaluation) Mobile Cards
export type AdminMobileEvaluation = {
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
};

export function EvaluationsMobileCards({
  evaluations,
  onViewDetails,
  onDelete,
  deletingId,
}: {
  evaluations: AdminMobileEvaluation[];
  onViewDetails: (evaluation: AdminMobileEvaluation) => void;
  onDelete?: (id: string) => void;
  deletingId?: string | null;
}) {
  if (evaluations.length === 0) {
    return <div className="py-6 text-center text-sm text-muted-foreground">لا توجد تقييمات مجانية بعد</div>;
  }

  return (
    <div className="space-y-3">
      {evaluations.map((e) => (
        <Card key={e.id}>
          <CardContent className="p-4 overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">{e.organization?.name || "غير معروف"}</p>
                <p className="mt-1 text-sm text-muted-foreground truncate">المسؤول: {e.organization?.contact_person || "-"}</p>
              </div>
              <Badge variant={e.is_completed ? "default" : "secondary"} className="shrink-0">
                {e.is_completed ? "مكتمل" : "قيد التنفيذ"}
              </Badge>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="text-foreground">
                <span className="text-muted-foreground">النتيجة: </span>
                {e.total_score !== null ? `${e.total_score} / ${e.max_score}` : "-"}
              </div>
              <div className="text-left" dir="ltr">
                <span className="text-muted-foreground">التاريخ: </span>
                {e.started_at ? new Date(e.started_at).toLocaleDateString("en-GB") : "-"}
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => onViewDetails(e)}>
                <Eye className="h-4 w-4 ml-2" />
                التفاصيل
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(e.id)}
                  disabled={deletingId === e.id}
                >
                  {deletingId === e.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
