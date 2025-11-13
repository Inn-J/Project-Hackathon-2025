import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import Header from './components/Header'; // 👈 Header (ที่มีค้นหา)
import CourseDetail from './pages/CourseDetail';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth(); 
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// [ส่วนที่แก้ไข]
// สร้าง Component เพื่อจัดการการแสดง Header
const HeaderManager = () => {
  const location = useLocation();
  
  // 1. กำหนดหน้าที่จะ "ไม่" แสดง Header
  const noHeaderPaths = ['/', '/login', '/signup'];

  // 2. เช็คว่า Path ปัจจุบันอยู่ในรายการที่กำหนดหรือไม่
  const shouldShowHeader = !noHeaderPaths.includes(location.pathname);

  // 3. ถ้าใช่ ให้แสดง Header (ที่มีค้นหา)
  return shouldShowHeader ? <Header /> : null;
};

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <>
      {/* 4. เรียกใช้ HeaderManager แทนตรรกะเดิม */}
      <HeaderManager />
      
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
              <CourseDetail/>
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
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}