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
  const [openReply, setOpenReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const menuRef = useRef();

  const { currentUser } = useAuth();

  // ---- ROLE ----
  const role = currentUser?.role || ''; // 'student', 'instructor', 'admin' อะไรก็ว่าไป
  const isStudent = role.toLowerCase() === 'student';
  const isInstructor = role.toLowerCase() === 'instructor';

  const isOwner =
    currentUser &&
    review.authorId &&
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
      onDeleteReview?.(review.id);
    } catch (err) {
      console.error('ลบรีวิวไม่สำเร็จ', err);
      alert('ลบรีวิวไม่สำเร็จ');
    }
  };

  // 👉 แก้ไขรีวิว
  const handleEdit = () => {
    onEditReview?.(review);
  };

  // 👉 กด "มีประโยชน์" / "ไม่มีประโยชน์" (เฉพาะ Student)
  const handleHelpfulVote = async (isHelpful) => {
    if (!currentUser || !isStudent) return;

    try {
      await apiClient.post(`/reviews/${review.id}/helpful`, {
        userId: currentUser.id,
        isHelpful, // true = มีประโยชน์, false = ไม่มีประโยชน์
      });
      console.log('บันทึกโหวตเรียบร้อย');
      // TODO: อัปเดต counter ใน UI ต่อได้
    } catch (err) {
      console.error('โหวตไม่สำเร็จ', err);
      alert('โหวตไม่สำเร็จ ลองใหม่อีกครั้ง');
    }
  };

  // 👉 Instructor ตอบกลับรีวิว
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await apiClient.post(`/reviews/${review.id}/replies`, {
        instructorId: currentUser.id,
        content: replyText.trim(),
      });
      console.log('ส่งคำตอบสำเร็จ');
      alert('ตอบกลับรีวิวแล้ว');
      setReplyText('');
      setOpenReply(false);
      // TODO: โหลด reply มาแสดงใต้รีวิวต่อได้
    } catch (err) {
      console.error('ส่งคำตอบไม่สำเร็จ', err);
      alert('ส่งคำตอบไม่สำเร็จ');
    }
  };

  return (
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
            {/* Student: ปุ่มโหวต */}
            {isStudent && (
              <div className="review-footer-actions">
                <button
                  className="review-footer-button"
                  onClick={() => handleHelpfulVote(true)}
                >
                  มีประโยชน์
                </button>
                <button
                  className="review-footer-button"
                  onClick={() => handleHelpfulVote(false)}
                >
                  ไม่มีประโยชน์
                </button>
              </div>
            )}

            {/* Instructor: ปุ่มตอบกลับ */}
            {isInstructor && (
              <div className="review-footer-actions">
                <button
                  className="review-footer-button review-footer-button--primary"
                  onClick={() => setOpenReply(true)}
                >
                  ตอบกลับรีวิว
                </button>
              </div>
            )}
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

      {/* Modal ตอบกลับสำหรับ Instructor */}
      {isInstructor && openReply && (
        <div className="report-modal__backdrop" onClick={() => setOpenReply(false)}>
          <div
            className="report-modal__container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="report-modal__header">
              <div className="report-modal__icon">💬</div>
              <div>
                <h2 className="report-modal__title">ตอบกลับรีวิว</h2>
                <p className="report-modal__subtitle">
                  ถึง {review.author}
                </p>
              </div>
            </div>

            <form onSubmit={handleReplySubmit} className="report-modal__body">
              <section className="report-modal__section">
                <textarea
                  className="report-modal__textarea"
                  placeholder="พิมพ์คำตอบกลับของผู้สอน..."
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </section>

              <div className="report-modal__footer">
                <button
                  type="button"
                  className="report-modal__btn report-modal__btn--secondary"
                  onClick={() => setOpenReply(false)}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="report-modal__btn report-modal__btn--primary"
                >
                  ส่งคำตอบ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
