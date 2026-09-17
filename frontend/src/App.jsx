import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import GenerateDocuments from './pages/GenerateDocuments';
import AuthCallback from './pages/AuthCallback';
import AuthError from './pages/AuthError';
import BlogIndex from './pages/BlogIndex';
import BlogPost from './pages/BlogPost';
import Cerfa15776Page from './pages/Cerfa15776Page';
import DocumentsPage from './pages/DocumentsPage';
import AnalyticsListener from './components/AnalyticsListener';
import './index.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Chargement...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cerfa-15776" element={<Cerfa15776Page />} />
      <Route path="/documents-vente-vehicule" element={<DocumentsPage />} />
      <Route path="/blog" element={<BlogIndex />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/error" element={<AuthError />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/generate" 
        element={
          <ProtectedRoute>
            <GenerateDocuments />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <Admin />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
