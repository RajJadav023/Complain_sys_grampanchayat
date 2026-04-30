import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Complain from './pages/Complain';
import Status from './pages/Status';
import Documents from './pages/Documents';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import About from './pages/About';
import Help from './pages/Help';
import Navbar from './components/Navbar';

const ProtectedLayout = ({ children, adminOnly = false }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-blue-600">Loading DCMS...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto pt-2 pb-8 sm:px-6 lg:px-8 px-4">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes - No Navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes - With Navbar */}
          <Route path="/" element={<ProtectedLayout><Home /></ProtectedLayout>} />
          <Route path="/complain" element={<ProtectedLayout><Complain /></ProtectedLayout>} />
          <Route path="/status" element={<ProtectedLayout><Status /></ProtectedLayout>} />
          <Route path="/documents" element={<ProtectedLayout><Documents /></ProtectedLayout>} />
          <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
          <Route path="/admin" element={<ProtectedLayout adminOnly={true}><AdminDashboard /></ProtectedLayout>} />
          <Route path="/about" element={<ProtectedLayout><About /></ProtectedLayout>} />
          <Route path="/help" element={<ProtectedLayout><Help /></ProtectedLayout>} />

          {/* Redirect to Home or Login */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
