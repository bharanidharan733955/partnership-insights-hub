import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import PartnerDashboard from './PartnerDashboard';
import AnalystDashboard from './AnalystDashboard';

const Index = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      {user?.role === 'partner' ? (
        <PartnerDashboard />
      ) : (
        <AnalystDashboard />
      )}
    </DashboardLayout>
  );
};

export default Index;
