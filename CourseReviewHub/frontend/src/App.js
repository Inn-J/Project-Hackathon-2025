import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import หน้า Page ต่างๆ
import HomePage from ' ./pages/HomePage';
// import SearchPage from './pages/SearchPage';
// import ProfilePage from './pages/ProfilePage';
// (อย่าลืม Import หน้าอื่นๆ เช่น LoginPage, CourseDetailPage เมื่อทำเสร็จ)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ตั้งค่า Route สำหรับหน้าต่างๆ */}
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* (เพิ่ม Route สำหรับหน้าอื่นๆ ที่นี่) */}
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;



