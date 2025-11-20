// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import ScrollToTop from "./ScrollToTop";

// --- Import Pages ---
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import CourseDetail from './pages/CourseDetail';
import WishlistPage from './pages/WishlistPage';
import PublicProfilePage from './pages/PublicProfilePage';
import AdminReportPage from './pages/AdminReportPage'; // 👈 1. Import หน้า Admin

// --- Protected Route (ตัวกันคนนอก) ---
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// --- รวมเส้นทางทั้งหมด (Routes) ---
function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      {/* 1. เส้นทาง Public (ไม่ต้อง Login) */}
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={currentUser ? <Navigate to="/" replace /> : <SignUpPage />}
      />

      {/* 2. เส้นทาง Protected (ต้อง Login) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:id"
        element={
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute>
            <WishlistPage />
          </ProtectedRoute>
        }
      />
      
      {/* 👇 3. เส้นทางดูโปรไฟล์คนอื่น */}
      <Route 
        path="/user/:userId" 
        element={
          <ProtectedRoute>
            <PublicProfilePage />
          </ProtectedRoute>
        } 
      />

      {/* 👇 4. เส้นทาง Admin (เพิ่มอันนี้ครับ!) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminReportPage />
          </ProtectedRoute>
        }
      />
      
      {/* (แถม) ถ้าพิมพ์มั่ว ให้เด้งกลับหน้าแรก */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// --- Main App Component ---
export default function App() {
  return (
    <BrowserRouter>
    <ScrollToTop />
      <AuthProvider>
        <WishlistProvider>
          <AppRoutes />
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}