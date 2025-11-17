// src/components/ReviewCard.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import ReviewForm from "../components/ReviewForm";

export default function ReviewCard({ review, onEditReview, onDeleteReview }) {
  const [openMenu, setOpenMenu] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [openReply, setOpenReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [helpfulStatus, setHelpfulStatus] = useState(null);

  // ⭐️ เพิ่ม state modal แก้ไข
  const [openEditModal, setOpenEditModal] = useState(false);

  const menuRef = useRef();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // ---- ROLE ----
  const role = currentUser?.role || '';
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

   console.log('review object', review);
  const renderRating = (Icon, level, activeColorClass) => {
    return [...Array(5)].map((_, i) => (
      <Icon key={i} className={`rating-icon ${i < level ? activeColorClass : ''}`} />
    ));
  };

  // โหลด helpful vote เดิม
  useEffect(() => {
    if (!currentUser || !review?.id) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await apiClient.get(`/reviews/${review.id}/helpful/me`);
        if (!cancelled) {
          setHelpfulStatus(res.data?.isHelpful ?? null);
        }
      } catch (err) {
        console.error('โหลด helpful vote เดิมไม่สำเร็จ', err.response?.data || err);
      }
    })();

    return () => { cancelled = true; };
  }, [currentUser?.id, review?.id]);


  // --- ส่งรายงาน ---
  const handleReportSubmit = async ({ reason, details }) => {
    try {
      await apiClient.post('/reports', {
        reporterId: currentUser.id,
        targetUserId: review.authorId || null,
        targetReviewId: review.id,
        reason,
        details,
      });

      alert('ส่งรายงานสำเร็จ ขอบคุณที่ช่วยรายงาน 💜');
    } catch (err) {
      alert('ส่งรายงานไม่สำเร็จ ลองใหม่อีกครั้ง');
    }
  };

  // --- ลบรีวิว ---
  const handleDelete = async () => {
    if (!window.confirm('ต้องการลบรีวิวนี้จริงหรือไม่?')) return;
    try {
      await apiClient.delete(`/reviews/${review.id}`);
      onDeleteReview?.(review.id);
    } catch (err) {
      alert('ลบรีวิวไม่สำเร็จ');
    }
  };

  // --- แก้ไขรีวิว (submit) ---
  const handleEditSubmit = async (payload) => {
  try {
    const res = await apiClient.put(`/reviews/${review.id}`, payload);

    setOpenEditModal(false);

    // อัปเดต state การ์ดนี้เองผ่าน parent
    if (onEditReview) {
      onEditReview({
        ...review,
        grade: payload.grade,
        tags: payload.tags,
        ratings: {
          satisfaction: payload.rating_satisfaction,
          difficulty: payload.rating_difficulty,
          workload: payload.rating_workload,
        },
        content: {
          prerequisite: payload.content_prerequisite,
          prosCons: payload.content_pros_cons,
          tips: payload.content_tips,
        },
      });
    }

    alert("บันทึกการแก้ไขรีวิวเรียบร้อยแล้ว ✨");
  } catch (err) {
    console.error("edit review error:", err.response?.data || err);
    alert(
      err?.response?.data?.error ||
        "ไม่สามารถบันทึกการแก้ไขรีวิวได้ กรุณาลองใหม่อีกครั้ง"
    );
  }
};
useEffect(() => {
  console.log('🎴 ReviewCard received review:', review);
    console.log('📚 Course:', review?.course);
    console.log('👤 Author:', review?.author);
    console.log('⭐ Ratings:', review?.ratings);
}, [review]);
  // --- vote ---
  const handleHelpfulVote = async (isHelpful) => {
    if (!currentUser || !isStudent) return;

    try {
      await apiClient.post(`/reviews/${review.id}/helpful`, {
        userId: currentUser.id,
        isHelpful,
      });
      setHelpfulStatus(isHelpful);
    } catch (err) {
      alert("โหวตไม่สำเร็จ");
    }
  };

  // --- Instructor reply ---
  const handleReplySubmit = async (e) => {
    e.preventDefault();

    if (!replyText.trim()) return;

    try {
      await apiClient.post(`/reviews/${review.id}/replies`, {
        instructorId: currentUser.id,
        content: replyText.trim(),
      });

      alert("ตอบกลับรีวิวแล้ว");
      setReplyText("");
      setOpenReply(false);

    } catch (err) {
      alert("ส่งคำตอบไม่สำเร็จ");
    }
  };
  const goToUserProfile = () => {
    if (!review.authorId) return; // (กันพัง)
    
    if (isOwner) {
      // ถ้าเป็นรีวิวเราเอง ให้ไปหน้า /profile
      navigate('/profile');
    } else {
      // ถ้าเป็นรีวิวคนอื่น ให้ไปหน้า /user/:id
      navigate(`/user/${review.authorId}`);
    }
  };

  return (
    <>
      {/* ----------------- REVIEW CARD ----------------- */}
      <div className="review-card">
        <div className="review-card-content">

        {/* HEADER */}
      <div className="review-header">
        {/* ⬇️ 4. (แก้ไข) ทำให้ส่วน author กดได้ ⬇️ */}
        <div 
          className="review-author-info review-author-info-clickable" // (เพิ่มคลาสใหม่)
          onClick={goToUserProfile}
          title={`ดูโปรไฟล์ของ ${review.author}`}
        >
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
            
          {review.course && (
              <div 
                className="review-course-name" // (ใช้ CSS เดียวกัน)
                onClick={(e) => {
                  e.stopPropagation(); 
                  navigate(`/courses/${review.course.id || review.course_id}`);
                }}
              >
                {review.course.course_code} - {review.course.name_th}
              </div>
            )}
          </div>
        </div>

            {/* จุดสามจุด */}
            <div className="review-menu-wrapper" ref={menuRef}>
              <button
                className="review-options-button"
                onClick={() => setOpenMenu(prev => !prev)}
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
                          setOpenEditModal(true);  // ⭐ เปิด modal edit
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
            <p className="content-text">{review.content?.prerequisite || '-'}</p>
          </div>
          <div className="content-section">
            <h4 className="content-title">ข้อดี / ข้อเสีย:</h4>
            <p className="content-text">{review.content?.prosCons || '-'}</p>
          </div>
          <div className="content-section">
            <h4 className="content-title">Tips:</h4>
            <p className="content-text">{review.content?.tips || '-'}</p>
          </div>

          {/* INSTRUCTOR REPLY */}
          {review.instructor_reply && (
            <div
              style={{
                backgroundColor: '#f0f8ff',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #cce0ff',
                marginTop: '10px'
              }}
            >
              <p
                style={{
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#003366'
                }}
              >
                💬 ตอบกลับโดย {review.instructorName || review.instructor?.username}
              </p>
              <p style={{ margin: 0 }}>{review.instructor_reply}</p>
            </div>
          )}

          {/* FOOTER */}
          <div className="review-footer">
            {isStudent && (
              <div className="review-footer-actions">
                <button
                  className={`review-footer-button ${helpfulStatus === true ? 'active' : ''}`}
                  onClick={() => handleHelpfulVote(true)}
                >
                  มีประโยชน์
                </button>

                <button
                  className={`review-footer-button ${helpfulStatus === false ? 'active' : ''}`}
                  onClick={() => handleHelpfulVote(false)}
                >
                  ไม่มีประโยชน์
                </button>
              </div>
            )}

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

      {/* ----------------- MODAL REPORT ----------------- */}
      {!isOwner && (
        <ReportReviewModal
          isOpen={openReport}
          onClose={() => setOpenReport(false)}
          onSubmit={handleReportSubmit}
          reviewAuthor={review.author}
        />
      )}

      {/* ----------------- MODAL REPLY ----------------- */}
      {isInstructor && openReply && (
        <div className="report-modal__backdrop" onClick={() => setOpenReply(false)}>
          <div
            className="report-modal__container"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleReplySubmit} className="report-modal__body">
              <h3>ตอบกลับรีวิวของ {review.author}</h3>

              <textarea
                className="report-modal__textarea"
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="พิมพ์ตอบกลับ..."
              />

              <div className="report-modal__footer">
                <button type="button" onClick={() => setOpenReply(false)}>
                  ยกเลิก
                </button>
                <button type="submit">ส่งคำตอบ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL EDIT REVIEW ----------------- */}
      {openEditModal && (
        <div
          className="report-modal__backdrop"
          onClick={() => setOpenEditModal(false)}
        >
          <div
            className="report-modal__container"
            onClick={(e) => e.stopPropagation()}
          >
            <ReviewForm
              mode="edit"
              course={review.course}
              initialReview={{
                grade: review.grade,
                tags: review.tags || [],
                rating_satisfaction: review.ratings?.satisfaction || 0,
                rating_difficulty: review.ratings?.difficulty || 0,
                rating_workload: review.ratings?.workload || 0,
                content_prerequisite: review.content?.prerequisite || '',
                content_pros_cons: review.content?.prosCons || '',
                content_tips: review.content?.tips || '',
              }}
              onClose={() => setOpenEditModal(false)}
              onSubmit={handleEditSubmit}
            />
          </div>
        </div>
      )}
    </>
  );
}
