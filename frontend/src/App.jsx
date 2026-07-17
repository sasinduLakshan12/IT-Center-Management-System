import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

const DashboardLayout = () => {
  const { user } = useAuthStore();
  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-grow">
        {user?.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  const user = useAuthStore(state => state.user);
  const { isDark, initTheme } = useThemeStore();

  // Initialize theme from persisted preference on mount
  useEffect(() => {
    initTheme(isDark);
  }, []);

  return (
    <Router>
      <div className="min-h-screen font-sans flex flex-col">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <DashboardLayout /> : <Navigate to="/login" />} />
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
