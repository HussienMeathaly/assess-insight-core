import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FileText, Copy, Check, Loader2, Share2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface GenerateReportButtonProps {
  evaluationId: string;
  organizationName: string;
  isCompleted: boolean;
}

export function GenerateReportButton({ 
  evaluationId, 
  organizationName,
  isCompleted 
}: GenerateReportButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDays, setExpiryDays] = useState(30);

  const handleGenerateReport = async () => {
    if (!user) {
      toast.error('يجب تسجيل الدخول لإنشاء التقرير');
      return;
    }

    setGenerating(true);

    try {
      const expiresAt = hasExpiry 
        ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await supabase
        .from('evaluation_reports')
        .insert({
          evaluation_id: evaluationId,
          created_by: user.id,
          expires_at: expiresAt,
        })
        .select('share_token')
        .single();

      if (error) throw error;

      const url = `${window.location.origin}/report/${data.share_token}`;
      setReportUrl(url);
      toast.success('تم إنشاء رابط التقرير بنجاح');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('حدث خطأ أثناء إنشاء التقرير');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!reportUrl) return;
    
    try {
      await navigator.clipboard.writeText(reportUrl);
      setCopied(true);
      toast.success('تم نسخ الرابط');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('فشل نسخ الرابط');
    }
  };

  const handleOpenReport = () => {
    if (reportUrl) {
      window.open(reportUrl, '_blank');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setReportUrl(null);
    setCopied(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={!isCompleted}
        className="gap-2"
        title={!isCompleted ? 'التقييم غير مكتمل' : 'إصدار تقرير'}
      >
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">تقرير</span>
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              إصدار تقرير التقييم
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {!reportUrl ? (
              <>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <FileText className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">
                    {organizationName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    سيتم إنشاء رابط قابل للمشاركة لتقرير التقييم
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="expiry" className="flex items-center gap-2">
                      تحديد صلاحية للرابط
                    </Label>
                    <Switch
                      id="expiry"
                      checked={hasExpiry}
                      onCheckedChange={setHasExpiry}
                    />
                  </div>

                  {hasExpiry && (
                    <div className="space-y-2">
                      <Label htmlFor="expiry-days">عدد أيام الصلاحية</Label>
                      <Input
                        id="expiry-days"
                        type="number"
                        min={1}
                        max={365}
                        value={expiryDays}
                        onChange={(e) => setExpiryDays(parseInt(e.target.value) || 30)}
                        className="text-center"
                      />
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleGenerateReport} 
                  disabled={generating}
                  className="w-full gap-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      جاري إنشاء الرابط...
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      إنشاء رابط المشاركة
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <Check className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">
                    تم إنشاء الرابط بنجاح!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    يمكنك مشاركة هذا الرابط مع الجهة المعنية
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>رابط التقرير</Label>
                  <div className="flex gap-2">
                    <Input
                      value={reportUrl}
                      readOnly
                      dir="ltr"
                      className="text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyLink}
                      className="shrink-0"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleOpenReport}
                    className="flex-1 gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    فتح التقرير
                  </Button>
                  <Button
                    onClick={handleCopyLink}
                    className="flex-1 gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        تم النسخ
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        نسخ الرابط
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}