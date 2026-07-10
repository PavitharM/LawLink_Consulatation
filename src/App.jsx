import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getMe } from './services/user.service';
import { Loader2 } from 'lucide-react';

// Layout & Components
import ProtectedRoute from './components/ProtectedRoute';
import { NotificationProvider } from './contexts/NotificationContext';

// Common Pages
import Home from './pages/common/Home';
import Login from './pages/common/Login';
import Register from './pages/common/Register';
import ForgotPassword from './pages/common/ForgotPassword';
import NotFound from './pages/common/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageLawyers from './pages/admin/ManageLawyers';
import ManageComplaints from './pages/admin/ManageComplaints';
import ManageArticles from './pages/admin/ManageArticles';
import Report from './pages/admin/Report';
import ManagePackages from './pages/admin/ManagePackages';
import AdminNotificationSettings from './pages/admin/AdminNotificationSettings';
import AdminProfile from './pages/admin/AdminProfile';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import SubmitComplaint from './pages/user/SubmitComplaint';
import MyComplaints from './pages/user/MyComplaints';
import ComplaintDetails from './pages/user/ComplaintDetails';
import SearchLawyers from './pages/user/SearchLawyers';
import SelectPackage from './pages/user/SelectPackage';
import Payment from './pages/user/Payment';
import UploadDocuments from './pages/user/UploadDocuments';
import Review from './pages/user/Review';
import Notification from './pages/user/Notification';
import UserProfile from './pages/user/UserProfile';
import ConsultationResponse from './pages/user/ConsultationResponse';

// Lawyer Pages
import LawyerDashboard from './pages/lawyer/LawyerDashboard';
import AssignedComplaints from './pages/lawyer/AssignedComplaints';
import ComplaintReview from './pages/lawyer/ComplaintReview';
import PackageManagement from './pages/lawyer/PackageManagement';
import LawyerNotifications from './pages/lawyer/LawyerNotifications';
import LawyerProfileManage from './pages/lawyer/LawyerProfileManage';

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
      <div className="min-h-screen flex items-center justify-center bg-surface-container-low">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, role, setAuth: handleAuthChange }}>
      <NotificationProvider>
        <Router>
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
        </Router>
      </NotificationProvider>
    </AuthContext.Provider>
  );
}

export default App;
