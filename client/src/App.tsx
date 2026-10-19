import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { CustomersPage } from './pages/CustomersPage';
import { ProductsPage } from './pages/ProductsPage';
import { DesignStudioPage } from './pages/DesignStudioPage';
import { DesignLibraryPage } from './pages/DesignLibraryPage';
import { ProductionPage } from './pages/ProductionPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { ReportsPage } from './pages/ReportsPage';
import { StaffPage } from './pages/StaffPage';
import { SettingsPage } from './pages/SettingsPage';
import { StorefrontPage } from './pages/StorefrontPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { LoginPage } from './pages/LoginPage';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Allow public pages without login
  const isPublicPage = location.pathname === '/storefront' || location.pathname === '/track' || location.pathname === '/login';

  if (!isAuthenticated && !isPublicPage) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-bangla">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        {isAuthenticated && !isPublicPage && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <ProtectedLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:id" element={<OrderDetailPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/design-studio" element={<DesignStudioPage />} />
                <Route path="/design-library" element={<DesignLibraryPage />} />
                <Route path="/production" element={<ProductionPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/invoices" element={<InvoicesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/staff" element={<StaffPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/storefront" element={<StorefrontPage />} />
                <Route path="/track" element={<TrackOrderPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ProtectedLayout>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
