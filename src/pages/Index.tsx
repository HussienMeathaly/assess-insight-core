import { Assessment } from '@/components/assessment/Assessment';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Profit+ | التقييم الأولي للجاهزية المؤسسية</title>
        <meta name="description" content="منصة Profit+ للتقييم المؤسسي - قياس الجاهزية المبدئية للمنشآت والشركات" />
      </Helmet>
      <Assessment />
    </>
  );
};

export default Index;
