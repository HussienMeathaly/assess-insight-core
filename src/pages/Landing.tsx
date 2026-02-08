import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

const Landing = () => {
  return (
    <>
      <Helmet>
        <title>Profit+ | بروفيت بلس - تحويل التجارب الى مكاسب</title>
        <meta name="description" content="بروفيت بلس - استديو متخصص في تقديم حلول متكاملة للمستثمرين، من التقييم والتخطيط إلى التنفيذ والتشغيل" />
      </Helmet>

      <div className="min-h-screen relative">
        <Navbar />
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <CTASection />
        <Footer />
      </div>
    </>
  );
};

export default Landing;
