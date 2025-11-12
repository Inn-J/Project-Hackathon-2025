import React, { useState } from 'react';
import { BookmarkIcon, UserIcon, LogoutIcon } from '@heroicons/react/solid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig'; 
import './Header.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // ดึงข้อมูล User ปัจจุบัน

  // ----------------------------------------------------
  // ✅ Logic: แสดงชื่อผู้ใช้
  // ----------------------------------------------------
  const emailPrefix = currentUser?.email?.split('@')[0] || 'Guest';
  const profileInitial = emailPrefix.charAt(0).toUpperCase();
  const usernameDisplay = currentUser?.username || emailPrefix;
  const roleDisplay = currentUser?.role || 'N/A';
  // ----------------------------------------------------
  
  const handleLogout = async () => {
    try {
      await signOut(auth); // สั่ง Firebase Logout
      setIsMenuOpen(false);
      navigate('/login');
    } catch (error) {
      console.error("Logout Error:", error);
      alert("ไม่สามารถ Logout ได้");
    }
  };

  return (
    <div className="header-container">
      {/* 🔹 โลโก้ (กดแล้วกลับหน้า Home) */}
      <h1 className="header-logo" onClick={() => navigate('/')}>
        CourseReviewHub
      </h1>

      {/* 🔹 ส่วนขวา: Bookmark + โปรไฟล์ */}
      <div className="header-icons-area">
        <button className="header-icon-button">
          <BookmarkIcon className="header-icon" />
        </button>

        <div className="profile-menu-container">
          <button 
            className="header-icon-button profile-button" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="profile-initial">{profileInitial}</span>
          </button>

          {isMenuOpen && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-user">
                <p className="profile-username">{usernameDisplay}</p>
                <p className="profile-role">Role: {roleDisplay}</p>
              </div>
              <button 
                className="dropdown-item"
                onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
              >
                <UserIcon className="dropdown-icon" /> My Profile
              </button>
              <button 
                className="dropdown-item logout-item"
                onClick={handleLogout}
              >
                <LogoutIcon className="dropdown-icon" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
