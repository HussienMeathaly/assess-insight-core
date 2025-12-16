import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronDown } from 'lucide-react';
import profitLogo from '@/assets/profit-logo.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleFreeAssessment = () => {
    navigate('/auth?type=free');
  };

  const handleComprehensiveAssessment = () => {
    // سيتم برمجته لاحقاً
  };

  return (
    <>
      <Helmet>
        <title>Profit+ | بروفيت بلس</title>
        <meta name="description" content="بروفيت بلس - استديو متخصص في تقديم حلول متكاملة للمستثمرين" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        {/* Header with Login Dropdown */}
        <header className="fixed top-0 left-0 right-0 z-50 p-6">
          <div className="flex justify-end">
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 bg-secondary/50 border-border/50 hover:bg-secondary/80 text-foreground px-6 py-2"
                >
                  <span>تسجيل الدخول</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="w-48 bg-card border-border z-50"
              >
                <DropdownMenuItem 
                  onClick={handleFreeAssessment}
                  className="cursor-pointer hover:bg-secondary focus:bg-secondary text-foreground"
                >
                  التقييم المجاني
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleComprehensiveAssessment}
                  className="cursor-pointer hover:bg-secondary focus:bg-secondary text-muted-foreground"
                  disabled
                >
                  التقييم الشامل
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          {/* Logo */}
          <div className="mb-12 animate-fade-in">
            <div className="bg-secondary/60 p-8 rounded-lg inline-block">
              <img 
                src={profitLogo} 
                alt="Profit+ Logo" 
                className="h-16 w-auto"
              />
            </div>
          </div>

          {/* Description */}
          <div className="max-w-3xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-lg md:text-xl text-foreground/90 leading-relaxed">
              بروفيت بلس هي استديو متخصص في تقديم حلول متكاملة للمستثمرين، من التقييم والتخطيط إلى التنفيذ والتشغيل. نؤمن بأن النجاح يبدأ بفهم عميق للسوق واستراتيجية محكمة، ونعمل على تحويل الأفكار إلى منتجات رابحة
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default Landing;
