import { Assessment } from "@/components/assessment/Assessment";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { LogOut, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const { signOut, user } = useAuth();
  const { isAdmin } = useRole();

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <>
      <Helmet>
        <title>Profit+ | التقييم الأولي للجاهزية </title>
        <meta name="description" content="منصة Profit+ للتقييم المؤسسي - قياس الجاهزية المبدئية للمنشآت والشركات" />
      </Helmet>

      {user && (
        <div className="fixed top-3 left-3 md:top-4 md:left-4 z-50 flex items-center gap-1.5 md:gap-2">
          <ThemeToggle />
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1 md:gap-2 px-2.5 py-1.5 md:px-4 md:py-2 bg-primary hover:bg-primary/90 
                         text-primary-foreground rounded-md md:rounded-lg transition-all duration-200 text-xs md:text-sm"
            >
              <Settings className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden xs:inline">لوحة التحكم</span>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 md:gap-2 px-2.5 py-1.5 md:px-4 md:py-2 bg-secondary hover:bg-secondary/80 
                       text-foreground rounded-md md:rounded-lg transition-all duration-200 text-xs md:text-sm"
          >
            <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden xs:inline">تسجيل الخروج</span>
          </button>
        </div>
      )}

      <Assessment />
    </>
  );
};

export default Index;
