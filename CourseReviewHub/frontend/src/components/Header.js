import React from 'react';
import { SearchIcon, BookmarkIcon, UserCircleIcon } from '@heroicons/react/solid';
import './Header.css'; // Import CSS

export default function Header() {
  return (
    <div className="header-container">
      <h1 className="header-logo">CourseReviewHub</h1>
      
      <div className="header-search-wrapper">
        <input
          type="text"
          placeholder="ค้นหารหัสวิชา, ชื่อวิชา..."
          className="header-search-input"
        />
        <SearchIcon className="header-search-icon" />
      </div>

      <div className="header-icons">
        <button className="header-icon-button">
          <BookmarkIcon className="header-icon" />
        </button>
        <button className="header-icon-button">
          <UserCircleIcon className="header-icon-profile" />
        </button>
      </div>
    </div>
  );
}
