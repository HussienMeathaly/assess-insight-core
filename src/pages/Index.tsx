import { Assessment } from '@/components/assessment/Assessment';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';

const Index = () => {
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <>
      <Helmet>
        <title>Profit+ | التقييم الأولي للجاهزية المؤسسية</title>
        <meta name="description" content="منصة Profit+ للتقييم المؤسسي - قياس الجاهزية المبدئية للمنشآت والشركات" />
      </Helmet>
      
      {user && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 
                       text-foreground rounded-lg transition-all duration-200 text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      )}
      
      <Assessment />
    </>
  );
};

export default Index;
