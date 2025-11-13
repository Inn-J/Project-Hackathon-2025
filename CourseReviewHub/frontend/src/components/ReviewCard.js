// src/components/ReviewCard.jsx
import React, { useState, useRef, useEffect } from 'react';
import apiClient from '../services/axiosConfig';
import {
  StarIcon,
  FireIcon,
  BookOpenIcon,
  DotsVerticalIcon
} from '@heroicons/react/solid';
import ReportReviewModal from './ReportReviewModal';
import { useAuth } from '../context/AuthContext';
import './ReviewCard.css';

export default function ReviewCard({ review, onEditReview, onDeleteReview }) {
  const [openMenu, setOpenMenu] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const menuRef = useRef();

  const { currentUser } = useAuth();

  const isOwner =
    currentUser &&
    review.authorId &&           // ต้องมี authorId มาด้วย
    currentUser.id === review.authorId;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderRating = (Icon, level, activeColorClass) => {
    return [...Array(5)].map((_, i) => (
      <Icon key={i} className={`rating-icon ${i < level ? activeColorClass : ''}`} />
    ));
  };

  // 👉 ส่งรายงาน (เฉพาะถ้าไม่ใช่เจ้าของ)
  const handleReportSubmit = async ({ reason, details }) => {
    try {
      await apiClient.post('/reports', {
        reporterId: currentUser.id,
        targetUserId: review.authorId || null,
        targetReviewId: review.id,
        reason,
        details,
      });

      console.log('ส่งรายงานสำเร็จ');
      alert('ส่งรายงานสำเร็จ ขอบคุณที่ช่วยรายงาน 💜');
    } catch (err) {
      console.error('ส่งรายงานไม่สำเร็จ', err);
      alert('ส่งรายงานไม่สำเร็จ ลองใหม่อีกครั้ง');
    }
  };

  // 👉 ลบรีวิว (สำหรับเจ้าของ)
  const handleDelete = async () => {
    if (!window.confirm('ต้องการลบรีวิวนี้จริงหรือไม่?')) return;
    try {
      await apiClient.delete(`/reviews/${review.id}`);
      console.log('ลบรีวิวสำเร็จ');
      onDeleteReview?.(review.id); // ให้ parent เอาไปลบออกจาก state ถ้าส่งมา
    } catch (err) {
      console.error('ลบรีวิวไม่สำเร็จ', err);
      alert('ลบรีวิวไม่สำเร็จ');
    }
  };

  // 👉 แก้ไขรีวิว (เปิด modal / ไปหน้าแก้ไข แล้วแต่จะต่อยอด)
  const handleEdit = () => {
    onEditReview?.(review); // ให้ parent ตัดสินใจว่าจะทำยังไงต่อ
  };

  return (
  console.log('Review Data:', review),

    <>
      <div className="review-card">
        <div className="review-card-content">
          {/* HEADER */}
          <div className="review-header">
            <div className="review-author-info">
              <div className="review-author-avatar">
                {(review.author?.charAt(0) || 'U').toUpperCase()}
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

            {/* จุดสามจุด */}
            <div className="review-menu-wrapper" ref={menuRef}>
              <button
                className="review-options-button"
                onClick={() => setOpenMenu((prev) => !prev)}
              >
                <DotsVerticalIcon style={{ height: 20, width: 20 }} />
              </button>

              {openMenu && (
                <div className="review-dropdown-menu">
                  {isOwner ? (
                    <>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          handleEdit();
                          setOpenMenu(false);
                        }}
                      >
                        แก้ไขรีวิว
                      </button>
                      <button
                        className="dropdown-item dropdown-item--danger"
                        onClick={() => {
                          handleDelete();
                          setOpenMenu(false);
                        }}
                      >
                        ลบรีวิว
                      </button>
                    </>
                  ) : (
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setOpenReport(true);
                        setOpenMenu(false);
                      }}
                    >
                      รายงานรีวิว
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* TAGS */}
          <div className="review-tags">
            {(review.tags || []).map(tag => (
              <span key={tag} className="review-tag-item">{tag}</span>
            ))}
          </div>

          {/* RATINGS */}
          <div className="review-ratings-container">
            <div className="rating-group">
              <span className="rating-label">ความพอใจ:</span>
              {renderRating(StarIcon, review.ratings?.satisfaction || 0, 'rating-yellow')}
            </div>
            <div className="rating-group">
              <span className="rating-label">ความยาก:</span>
              {renderRating(FireIcon, review.ratings?.difficulty || 0, 'rating-orange')}
            </div>
            <div className="rating-group">
              <span className="rating-label">ปริมาณงาน:</span>
              {renderRating(BookOpenIcon, review.ratings?.workload || 0, 'rating-blue')}
            </div>
          </div>

          {/* CONTENT */}
          
          <div className="content-section">
            <h4 className="content-title">สิ่งที่ควรรู้:</h4>
            <p className="content-text">
              {review.content?.prerequisite || '-'}
            </p>
          </div>
          <div className="content-section">
            <h4 className="content-title">ข้อดี / ข้อเสีย:</h4>
            <p className="content-text">
              {review.content?.prosCons || '-'}
            </p>
          </div>
          <div className="content-section">
            <h4 className="content-title">Tips:</h4>
            <p className="content-text">
              {review.content?.tips || '-'}
            </p>
          </div>

          {/* FOOTER */}
          <div className="review-footer">
            <div className="review-footer-actions">
              <button className="review-footer-button">มีประโยชน์</button>
              <button className="review-footer-button">ไม่มีประโยชน์</button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL รายงาน (แสดงเฉพาะถ้าไม่ใช่เจ้าของ) */}
      {!isOwner && (
        <ReportReviewModal
          isOpen={openReport}
          onClose={() => setOpenReport(false)}
          onSubmit={handleReportSubmit}
          reviewAuthor={review.author}
        />
      )}
    </>
  );
}
