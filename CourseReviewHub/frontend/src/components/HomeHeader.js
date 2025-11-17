import React, { useState } from 'react';
import { BookmarkIcon, UserIcon, LogoutIcon } from '@heroicons/react/solid';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import './HomeHeader.css'; // (ใช้ CSS เดียวกัน)

export default function HomeHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const emailPrefix = currentUser?.email?.split('@')[0] || 'Guest';
  const profileInitial = emailPrefix.charAt(0).toUpperCase();
  const usernameDisplay = currentUser?.username || emailPrefix;
  const roleDisplay = currentUser?.role || 'N/A';
  const isInstructor = currentUser?.role === "INSTRUCTOR";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsMenuOpen(false);
      navigate('/login');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <div className="header-container">
      <h1 className="header-logo" onClick={() => navigate('/')}>
        CourseReviewHub
      </h1>

      {/* (ไม่มี Search Bar) */}

      <div className="header-icons-area">

        {/* ⬅️ แก้ปุ่ม Wishlist ให้เป็น Link ที่กดได้ */}
        {currentUser && !isInstructor && (
          <NavLink
            to="/wishlist"
            className={({ isActive }) =>
              isActive ? "header-icon-button active" : "header-icon-button"
            }
            title="Wishlist"
          >
            <BookmarkIcon className="header-icon" />
          </NavLink>
        )}

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