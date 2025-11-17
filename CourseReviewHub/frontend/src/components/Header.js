import React, { useState, useEffect } from 'react';
import { SearchIcon, BookmarkIcon, UserIcon, LogoutIcon } from '@heroicons/react/solid';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import apiClient from '../services/axiosConfig';   // ✅ เพิ่ม
import './Header.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [query, setQuery] = useState("");              // สำหรับ search
  const [courses, setCourses] = useState([]);          // ✅ เก็บข้อมูลวิชา
  const [showSuggestions, setShowSuggestions] = useState(false); // ✅ state กล่อง suggest

  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const emailPrefix = currentUser?.email?.split('@')[0] || 'Guest';
  const profileInitial = emailPrefix.charAt(0).toUpperCase(); 
  const usernameDisplay = currentUser?.username || emailPrefix; 
  const roleDisplay = currentUser?.role || 'N/A';
  
  // ✅ โหลดรายการวิชามาใช้ autocomplete
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiClient.get('/courses'); // หรือ '/courses/faculty' ถ้าอยาก personalized
        setCourses(res.data || []);
      } catch (err) {
        console.error('Error loading courses for header search:', err);
      }
    };
    fetchCourses();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth); 
      setIsMenuOpen(false);
      navigate('/login'); 
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // ฟังก์ชัน search กด Enter
  const handleSearchKey = (e) => {
    if (e.key === "Enter" && query.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery(""); // ล้าง input หลัง search
      setShowSuggestions(false);
    }
  };

  // -------------------- คำนวณ suggestion --------------------
  const trimmed = query.trim().toLowerCase();
  const suggestionList =
    trimmed.length === 0
      ? []
      : courses.filter((c) => {
          const code = c.course_code?.toLowerCase() || '';
          const en = c.name_en?.toLowerCase() || '';
          const th = c.name_th?.toLowerCase() || '';
          return (
            code.includes(trimmed) ||
            en.includes(trimmed) ||
            th.includes(trimmed)
          );
        });

  const limitedSuggestions = suggestionList.slice(0, 6); // แสดงสูงสุด 6 วิชา

  const handleSelectSuggestion = (course) => {
    const q =
      course.course_code ||
      course.name_th ||
      course.name_en ||
      '';
    if (!q) return;

    setQuery(q);
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setShowSuggestions(false);
  };

  return (
    <div className="header-container">
      <h1 className="header-logo" onClick={() => navigate('/')}>CourseReviewHub</h1>
      
      <div className="header-search-wrapper">
        <input
          type="text"
          placeholder="ค้นหารหัสวิชา, ชื่อวิชา..."
          className="header-search-input"
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            setShowSuggestions(value.trim().length > 0);
          }}
          onKeyDown={handleSearchKey}
          onFocus={() => {
            if (query.trim().length > 0) setShowSuggestions(true);
          }}
          onBlur={() => {
            // หน่วงให้ทันคลิกปุ่ม suggestion
            setTimeout(() => setShowSuggestions(false), 150);
          }}
        />
        <SearchIcon className="header-search-icon" />

        {/* กล่อง suggestion ใต้ช่องค้นหา */}
        {showSuggestions && limitedSuggestions.length > 0 && (
          <div className="header-search-suggestions">
            {limitedSuggestions.map((course) => (
              <button
                type="button"
                key={course.id || course.course_code}
                className="header-search-suggestion-item"
                onMouseDown={(e) => {
                  e.preventDefault(); // กัน blur ก่อนคลิก
                  handleSelectSuggestion(course);
                }}
              >
                <span className="suggest-code">
                  {course.course_code || '-'}
                </span>
                <span className="suggest-name-en">
                  {course.name_en || ''}
                </span>
                <span className="suggest-name-th">
                  {course.name_th || ''}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="header-icons-area">
        {currentUser && ( 
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
