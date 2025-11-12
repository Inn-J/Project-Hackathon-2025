import React, { useState } from 'react';
import { SearchIcon, BookmarkIcon, UserCircleIcon, UserIcon, LogoutIcon } from '@heroicons/react/solid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { signOut } from 'firebase/auth'; 
import { auth } from '../services/firebaseConfig'; 
import './Header.css'; // ⬅️ 1. ต้องมีบรรทัดนี้

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // ดึงข้อมูล User ปัจจุบัน (มี Role)

  const handleLogout = async () => {
    try {
      await signOut(auth); // สั่ง Firebase Logout
      // Context จะจัดการ setCurrentUser(null) ให้เองอัตโนมัติ
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Logout Error:", error);
      alert("ไม่สามารถ Logout ได้");
    }
  };

  const usernameInitial = currentUser?.username?.charAt(0) || 'G';
  const usernameDisplay = currentUser?.username || 'Guest';
  const roleDisplay = currentUser?.role || 'N/A';

  return (
    <div className="header-container">
      <h1 className="header-logo" onClick={() => navigate('/')}>CourseReviewHub</h1>
      
      {/* Search Bar (ตรงกลาง) */}
      <div className="header-search-wrapper">
        <input
          type="text"
          placeholder="ค้นหารหัสวิชา, ชื่อวิชา..."
          className="header-search-input"
        />
        <SearchIcon className="header-search-icon" />
      </div>

      <div className="header-icons-area">
        <button className="header-icon-button">
          <BookmarkIcon className="header-icon" />
        </button>
        
        {/* ปุ่ม Profile และ Dropdown Menu */}
        <div className="profile-menu-container">
            <button 
                className="header-icon-button profile-button" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                <span className="profile-initial">{usernameInitial}</span>
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