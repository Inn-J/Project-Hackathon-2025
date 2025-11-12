import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';

// (สร้างไฟล์ HomePage.js เปล่าๆ ไว้ก่อน)
import HomePage from './pages/HomePage'; 
// (Import หน้าอื่นๆ ที่คุณทำเสร็จแล้ว เช่น SearchPage)
import SearchPage from './pages/SearchPage';

// (นี่คือตัวอย่าง Component "กำแพง" กันคนไม่ล็อกอิน)
// (คุณต้องสร้าง Context เพื่อเก็บ state ว่าล็อกอินหรือยัง)
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = false; // ⬅️ (ชั่วคราว) เปลี่ยนเป็น true เพื่อเทส
  
  if (!isLoggedIn) {
    // ถ้ายังไม่ล็อกอิน ให้เด้งกลับไปหน้า Login
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. หน้า Login (หน้าแรก) */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* 2. หน้า Sign Up */}
        <Route path="/signup" element={<SignUpPage />} />

        {/* 3. หน้า Home (หน้าหลักหลังล็อกอิน) */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute> 
              <HomePage />
            </ProtectedRoute>
          } 
        />
        
        {/* (ผม Comment <ProtectedRoute> ออกชั่วคราว ไม่งั้นคุณจะเข้าหน้า Home ไม่ได้) */}
        {/* (เพิ่ม Route หน้าอื่นๆ) */}
        <Route path="/search" element={<SearchPage />} />

      </Routes>
    </BrowserRouter>
  );
}