import React from 'react';
import { StarIcon, FireIcon, BookOpenIcon, DotsVerticalIcon } from '@heroicons/react/solid';
import './ReviewCard.css'; // Import CSS

export default function ReviewCard({ review }) {

  const renderRating = (Icon, level, activeColorClass) => {
    let icons = [];
    for (let i = 0; i < 5; i++) {
      icons.push(
        <Icon 
          key={i} 
          className={`rating-icon ${i < level ? activeColorClass : ''}`} 
        />
      );
    }
    return icons;
  };

  return (
    <div className="review-card">
      <div className="review-card-content">
        
        <div className="review-header">
          <div className="review-author-info">
            <div className="review-author-avatar">
              {review.author.charAt(0)}
            </div>
            <div className="review-author-details">
              <div className="review-author-name">
                {review.author}
                <span className="review-verified-badge">✓ ยืนยันแล้ว</span>
              </div>
              <div className="review-author-grade">
                เกรดที่ได้: <span className="grade-value">{review.grade}</span>
              </div>
            </div>
          </div>
          <button className="review-options-button">
            <DotsVerticalIcon style={{ height: 20, width: 20 }} />
          </button>
        </div>

        <div className="review-tags">
          {review.tags.map(tag => (
            <span key={tag} className="review-tag-item">{tag}</span>
          ))}
        </div>

        <div className="review-ratings-container">
          <div className="rating-group">
            <span className="rating-label">ความพอใจ:</span>
            {renderRating(StarIcon, review.ratings.satisfaction, 'rating-yellow')}
          </div>
          <div className="rating-group">
            <span className="rating-label">ความยาก:</span>
            {renderRating(FireIcon, review.ratings.difficulty, 'rating-orange')}
          </div>
          <div className="rating-group">
            <span className="rating-label">ปริมาณงาน:</span>
            {renderRating(BookOpenIcon, review.ratings.workload, 'rating-blue')}
          </div>
        </div>

        <div className="review-content-body">
          <div className="content-section">
            <h4 className="content-title">สิ่งที่ควรรู้:</h4>
            <p className="content-text">{review.content.prerequisite}</p>
          </div>
          <div className="content-section">
            <h4 className="content-title">ข้อดี / ข้อเสีย:</h4>
            <p className="content-text">{review.content.prosCons}</p>
          </div>
          <div className="content-section">
            <h4 className="content-title">Tips:</h4>
            <p className="content-text">{review.content.tips}</p>
          </div>
        </div>

        <div className="review-footer">
          <div className="review-footer-actions">
            <button className="review-footer-button">มีประโยชน์</button>
            <button className="review-footer-button">ไม่มีประโยชน์</button>
          </div>
          <button className="review-report-button">รายงาน</button>
        </div>
      </div>
    </div>
  );
}
