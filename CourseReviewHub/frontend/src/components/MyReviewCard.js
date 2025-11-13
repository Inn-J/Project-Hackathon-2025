// src/components/MyReviewCard.js
import React, { useState } from 'react';
import { StarIcon, FireIcon, BookOpenIcon, DotsVerticalIcon } from '@heroicons/react/solid';
import './ReviewCard.css'; // ใช้ CSS เดิมได้
import { useAuth } from '../context/AuthContext';

export default function MyReviewCard({ review, onEdit, onDelete }) {
    const { currentUser } = useAuth();
    const [openMenu, setOpenMenu] = useState(false);
    if (!review) return null;



 const authorName = currentUser?.username || 'ไม่ระบุชื่อ';
  const avatarInitial = authorName.charAt(0).toUpperCase();

  const renderRating = (Icon, level, activeColorClass) => {
    level = level || 0;
    return [...Array(5)].map((_, i) => (
      <Icon key={i} className={`rating-icon ${i < level ? activeColorClass : ''}`} />
    ));
  };

  const handleEdit = () => {
    onEdit?.(review);
    setOpenMenu(false);
  };

  const handleDelete = () => {
    if (window.confirm('ต้องการลบรีวิวนี้จริงหรือไม่?')) {
      onDelete?.(review.id);
      setOpenMenu(false);
    }
  };

  return (
   console.log('review object', review),
console.log('username?', review.users?.username),
    <div className="review-card">
      <div className="review-card-content">
        {/* HEADER */}
        <div className="review-header">
          <div className="review-author-info">
            <div className="review-author-avatar">{avatarInitial}</div>
            <div className="review-author-details">
              <div className="review-author-name">{authorName}</div>
              <div className="review-author-grade">
                เกรดที่ได้: <span className="grade-value">{review.grade || '-'}</span>
              </div>
            </div>
          </div>

          {/* ปุ่มสามจุด */}
          <div className="review-menu-wrapper">
            <button
              className="review-options-button"
              onClick={() => setOpenMenu(prev => !prev)}
            >
              <DotsVerticalIcon style={{ height: 20, width: 20 }} />
            </button>

            {openMenu && (
              <div className="review-dropdown-menu">
                <button className="dropdown-item" onClick={handleEdit}>
                  แก้ไขรีวิว
                </button>
                <button className="dropdown-item dropdown-item--danger" onClick={handleDelete}>
                  ลบรีวิว
                </button>
              </div>
            )}
          </div>
        </div>

        {/* TAGS */}
        <div className="review-tags">
          {review.tags?.length > 0
            ? review.tags.map(tag => (
                <span key={tag} className="review-tag-item">{tag}</span>
              ))
            : <span className="review-tag-item">ไม่มีแท็ก</span>}
        </div>

        {/* RATINGS */}
        <div className="review-ratings-container">
          <div className="rating-group">
            <span className="rating-label">ความพอใจ:</span>
            {renderRating(StarIcon, review.rating_satisfaction, 'rating-yellow')}
          </div>
          <div className="rating-group">
            <span className="rating-label">ความยาก:</span>
            {renderRating(FireIcon, review.rating_difficulty, 'rating-orange')}
          </div>
          <div className="rating-group">
            <span className="rating-label">ปริมาณงาน:</span>
            {renderRating(BookOpenIcon, review.rating_workload, 'rating-blue')}
          </div>
        </div>

        {/* CONTENT */}
        <div className="review-content-body">
          <div className="content-section">
            <h4 className="content-title">สิ่งที่ควรรู้:</h4>
            <p className="content-text">{review.content_prerequisite || '-'}</p>
          </div>
          <div className="content-section">
            <h4 className="content-title">ข้อดี / ข้อเสีย:</h4>
            <p className="content-text">{review.content_pros_cons || '-'}</p>
          </div>
          <div className="content-section">
            <h4 className="content-title">Tips:</h4>
            <p className="content-text">{review.content_tips || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
