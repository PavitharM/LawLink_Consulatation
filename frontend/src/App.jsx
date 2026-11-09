import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getMe } from './services/user.service';
import PageLoader from './components/PageLoader';

// Layout & Components
import ProtectedRoute from './components/ProtectedRoute';
import { NotificationProvider } from './contexts/NotificationContext';

// Common Pages
const Home = lazy(() => import('./pages/common/Home'));
const Login = lazy(() => import('./pages/common/Login'));
const Register = lazy(() => import('./pages/common/Register'));
const ForgotPassword = lazy(() => import('./pages/common/ForgotPassword'));
const NotFound = lazy(() => import('./pages/common/NotFound'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const ManageLawyers = lazy(() => import('./pages/admin/ManageLawyers'));
const ManageComplaints = lazy(() => import('./pages/admin/ManageComplaints'));
const ManageArticles = lazy(() => import('./pages/admin/ManageArticles'));
const Report = lazy(() => import('./pages/admin/Report'));
const ManagePackages = lazy(() => import('./pages/admin/ManagePackages'));
const AdminNotificationSettings = lazy(() => import('./pages/admin/AdminNotificationSettings'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));

// User Pages
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const SubmitComplaint = lazy(() => import('./pages/user/SubmitComplaint'));
const MyComplaints = lazy(() => import('./pages/user/MyComplaints'));
const ComplaintDetails = lazy(() => import('./pages/user/ComplaintDetails'));
const SearchLawyers = lazy(() => import('./pages/user/SearchLawyers'));
const SelectPackage = lazy(() => import('./pages/user/SelectPackage'));
const Payment = lazy(() => import('./pages/user/Payment'));
const UploadDocuments = lazy(() => import('./pages/user/UploadDocuments'));
const Review = lazy(() => import('./pages/user/Review'));
const Notification = lazy(() => import('./pages/user/Notification'));
const UserProfile = lazy(() => import('./pages/user/UserProfile'));
const ConsultationResponse = lazy(() => import('./pages/user/ConsultationResponse'));

// Lawyer Pages
const LawyerDashboard = lazy(() => import('./pages/lawyer/LawyerDashboard'));
const AssignedComplaints = lazy(() => import('./pages/lawyer/AssignedComplaints'));
const ComplaintReview = lazy(() => import('./pages/lawyer/ComplaintReview'));
const PackageManagement = lazy(() => import('./pages/lawyer/PackageManagement'));
const LawyerNotifications = lazy(() => import('./pages/lawyer/LawyerNotifications'));
const LawyerProfileManage = lazy(() => import('./pages/lawyer/LawyerProfileManage'));

export const AuthContext = React.createContext({ user: null, role: null, setAuth: () => {} });

function App() {
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    const token = localStorage.getItem('lawlink_token');
    if (!token) {
      setRole(null);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await getMe();
      if (response.success && response.data) {
        setUser(response.data);
        setRole(response.data.role.toLowerCase());
      } else {
        throw new Error('Invalid session');
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      localStorage.removeItem('lawlink_token');
      localStorage.removeItem('lawlink_role');
      setRole(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
    
    const handler = () => fetchSession();
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const handleAuthChange = (newUser, newRole, token) => {
    if (token) {
      localStorage.setItem('lawlink_token', token);
      localStorage.setItem('lawlink_role', newRole.toLowerCase());
    } else if (!newUser) {
      localStorage.removeItem('lawlink_token');
      localStorage.removeItem('lawlink_role');
    }
    setUser(newUser);
    setRole(newRole ? newRole.toLowerCase() : null);
  };

  if (loading) {
    return (
      <PageLoader fullScreen />
    );
  }

  return (
    <AuthContext.Provider value={{ user, role, setAuth: handleAuthChange }}>
      <NotificationProvider>
        <Router>
          <Suspense fallback={<PageLoader fullScreen />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onLogin={handleAuthChange} />} />
            <Route path="/register" element={<Register onLogin={handleAuthChange} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Admin Routes */}
            <Route element={<ProtectedRoute role={role} allowedRoles={['admin']} onLogout={() => handleAuthChange(null, null)} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/lawyers" element={<ManageLawyers />} />
              <Route path="/admin/complaints" element={<ManageComplaints />} />
              <Route path="/admin/packages" element={<ManagePackages />} />
              <Route path="/admin/articles" element={<ManageArticles />} />
              <Route path="/admin/report" element={<Report />} />
              <Route path="/admin/notifications" element={<AdminNotificationSettings />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
            </Route>

            {/* User Routes */}
            <Route element={<ProtectedRoute role={role} allowedRoles={['user']} onLogout={() => handleAuthChange(null, null)} />}>
              <Route path="/user" element={<UserDashboard />} />
              <Route path="/user/complaints/new" element={<SubmitComplaint />} />
              <Route path="/user/complaints" element={<MyComplaints />} />
              <Route path="/user/complaints/:id" element={<ComplaintDetails />} />
              <Route path="/user/lawyers/search" element={<SearchLawyers />} />
              <Route path="/user/packages" element={<SelectPackage />} />
              <Route path="/user/payment" element={<Payment />} />
              <Route path="/user/upload" element={<UploadDocuments />} />
              <Route path="/user/review" element={<Review />} />
              <Route path="/user/notifications" element={<Notification />} />
              <Route path="/user/profile" element={<UserProfile />} />
              <Route path="/user/consultation" element={<ConsultationResponse />} />
            </Route>

            {/* Lawyer Routes */}
            <Route element={<ProtectedRoute role={role} allowedRoles={['lawyer']} onLogout={() => handleAuthChange(null, null)} />}>
              <Route path="/lawyer" element={<LawyerDashboard />} />
              <Route path="/lawyer/assigned-complaints" element={<AssignedComplaints />} />
              <Route path="/lawyer/complaint/:id" element={<ComplaintReview />} />
              <Route path="/lawyer/packages" element={<PackageManagement />} />
              <Route path="/lawyer/notifications" element={<LawyerNotifications />} />
              <Route path="/lawyer/profile" element={<LawyerProfileManage />} />
            </Route>

            {/* Catch All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </Router>
      </NotificationProvider>
    </AuthContext.Provider>
  );
}

export default App;
