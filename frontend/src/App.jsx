import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import POSScreen from './pages/POSScreen';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import CustomersPage from './pages/CustomersPage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import UserManagementPage from './pages/UserManagementPage';
import SettingsPage from './pages/SettingsPage';
import { MainLayout } from './components/layout/MainLayout';
import { LoadingOverlay } from './components/common/Feedback';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingOverlay visible={true} />;
  if (!user) return <Navigate to="/login" />;

  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingOverlay visible={true} />;
  const isAdmin = user?.role === 'admin' 
    || user?.roles?.some(r => r.toUpperCase() === 'ROLE_ADMIN' || r.toUpperCase() === 'ADMIN')
    || user?.name?.toLowerCase() === 'admin';
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CurrencyProvider>
          <CartProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route path="/" element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="pos" element={<POSScreen />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="customers" element={<CustomersPage />} />
                  <Route path="reports" element={<SalesHistoryPage />} />
                  <Route path="users" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
                  <Route path="settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </CartProvider>
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
