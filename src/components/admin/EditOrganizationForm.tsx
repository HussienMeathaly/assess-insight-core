import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logError } from "@/lib/logger";

const validOrgAndNameRegex = /^[\u0600-\u06FFa-zA-Z0-9\s_]+$/;
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

interface Organization {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
}

interface EditOrganizationFormProps {
  organization: Organization;
  onUpdate: (updatedOrg: Organization) => void;
  onCancel: () => void;
}

export function EditOrganizationForm({ organization, onUpdate, onCancel }: EditOrganizationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: organization.name,
    contact_person: organization.contact_person,
    phone: organization.phone,
    email: organization.email,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      onUpdate({
        ...organization,
        name: clean.name,
        contact_person: clean.contact_person,
        phone: clean.phone,
        email: clean.email,
      });

      toast.success("تم تحديث بيانات الجهة بنجاح");
    } catch (error) {
      logError("Error updating organization", error);
      toast.error("حدث خطأ أثناء تحديث البيانات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="edit-name">اسم الجهة</Label>
        <Input
          id="edit-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-contact_person">اسم المسؤول</Label>
        <Input
          id="edit-contact_person"
          value={formData.contact_person}
          onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-phone">رقم الجوال</Label>
        <Input
          id="edit-phone"
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
        <Label htmlFor="edit-email">البريد الإلكتروني</Label>
        <Input
          id="edit-email"
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
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}
