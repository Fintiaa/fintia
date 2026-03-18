import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout'

export const metadata = {
  title: 'Dashboard - Fintia',
  description: 'Panel de control de finanzas personales',
};

export default function DashboardRootLayout({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
