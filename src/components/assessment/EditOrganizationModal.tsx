import { useState, useEffect } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { logError } from "@/lib/logger";

// اسم الجهة + اسم المسؤول: عربي/إنجليزي/أرقام/مسافات/_ فقط
const validOrgAndNameRegex = /^[\u0600-\u06FFa-zA-Z0-9\s_]+$/;
// رقم الجوال: أرقام فقط وبحد أدنى 10
const phoneDigitsMin10Regex = /^\d{10,}$/;

const orgUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "اسم الجهة مطلوب")
    .regex(validOrgAndNameRegex, "اسم الجهة يجب أن يحتوي على حروف عربية أو إنجليزية أو أرقام أو _ فقط"),
  contact_person: z
    .string()
    .trim()
    .min(2, "اسم المسؤول مطلوب")
    .regex(validOrgAndNameRegex, "اسم المسؤول يجب أن يحتوي على حروف عربية أو إنجليزية أو أرقام أو _ فقط"),
  phone: z.string().trim().regex(phoneDigitsMin10Regex, "رقم الجوال يجب أن لا يقل عن 10 أرقام"),
  email: z.string().trim().email("البريد الإلكتروني غير صحيح"),
});

interface OrganizationData {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
}

export function EditOrganizationModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    if (open && user) {
      fetchOrganization();
    }
  }, [open, user]);

  const fetchOrganization = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, contact_person, phone, email")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        logError("Error fetching organization", error);
        return;
      }

      if (data) {
        setOrganization(data);
        setFormData({
          name: data.name,
          contact_person: data.contact_person,
          phone: data.phone,
          email: data.email,
        });
      }
    } catch (error) {
      logError("Error fetching organization", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    const result = orgUpdateSchema.safeParse(formData);
    if (!result.success) {
      toast.error(result.error.errors[0]?.message ?? "البيانات المدخلة غير صحيحة");
      return;
    }

    setLoading(true);
    try {
      const clean = result.data;

      const { error } = await supabase
        .from("organizations")
        .update({
          name: clean.name,
          contact_person: clean.contact_person,
          phone: clean.phone,
          email: clean.email,
        })
        .eq("id", organization.id);

      if (error) throw error;

      toast.success("تم تحديث بيانات الجهة بنجاح");
      setOpen(false);
    } catch (error) {
      logError("Error updating organization", error);
      toast.error("حدث خطأ أثناء تحديث البيانات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-foreground border-border hover:bg-accent ">
          <Settings className="h-4 w-4" />
          <span>تعديل بيانات الجهة</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center">تعديل بيانات الجهة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">اسم الجهة</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_person">اسم المسؤول</Label>
            <Input
              id="contact_person"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">رقم الجوال</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              minLength={10}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
              required
              dir="ltr"
              className="text-left"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              dir="ltr"
              className="text-left"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
