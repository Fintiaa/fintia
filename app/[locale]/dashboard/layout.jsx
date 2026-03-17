import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: 'Dashboard - Fintia',
  description: 'Panel de control de finanzas personales',
};

export default function DashboardRootLayout({ children }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
