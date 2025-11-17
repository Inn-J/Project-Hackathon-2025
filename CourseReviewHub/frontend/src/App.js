import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext'; // ⬅️ 1. Import
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
// ❌ ลบ Header/HeaderManager ออกจากตรงนี้
import CourseDetail from './pages/CourseDetail';
import WishlistPage from './pages/WishlistPage'; // ⬅️ 2. Import
import PublicProfilePage from './pages/PublicProfilePage';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// ❌ ลบ HeaderManager ทั้งหมดทิ้งไป

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <>
      {/* ❌ ไม่ต้องมี HeaderManager ที่นี่ */}
      <Routes>
        <Route
          path="/login"
          element={currentUser ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/signup"
          element={currentUser ? <Navigate to="/" replace /> : <SignUpPage />}
        />
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

        {/* ⬅️ 3. เพิ่ม Route นี้ */}
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
<Route 
          path="/user/:userId" 
          element={
            <ProtectedRoute>
              <PublicProfilePage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider> {/* ⬅️ 4. ห่อ AppRoutes */}
          <AppRoutes />
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}