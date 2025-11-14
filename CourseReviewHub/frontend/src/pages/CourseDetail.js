// src/pages/CourseDetail.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../services/axiosConfig";
import { useAuth } from "../context/AuthContext";
import ReviewForm from "../components/ReviewForm";
import {
  StarIcon,
  FireIcon,
  BookOpenIcon
} from '@heroicons/react/solid';
import Header from "../components/Header";

import ReviewCard from "../components/ReviewCard";

import "./CourseDetail.css";

export default function CourseDetail() {
  const { id } = useParams();
  const { currentUser } = useAuth();

  const [course, setCourse] = useState(null);
  const [instructorSummary, setInstructorSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("all");
  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔁 ฟังก์ชันโหลด course + reviews เอาไว้ใช้ซ้ำ
  const reloadCourseData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/courses/${id}`);
      setCourse(res.data.course);
      setInstructorSummary(res.data.instructor_summary);
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error("Error loading course detail:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ⬅️ useEffect มี dependency แค่อันเดียวพอ
  useEffect(() => {
    reloadCourseData();
  }, [reloadCourseData]);

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;
  if (!course) return <div>ไม่พบข้อมูลรายวิชา</div>;

  // 👉 ส่งรีวิวใหม่
  const handleCreateReview = async (payload) => {
    await apiClient.post("/reviews", {
      ...payload,
      course_id: Number(id), // ผูกกับวิชาปัจจุบัน
    });

    // reload reviews ให้ตรงกับฐานข้อมูลทุกที่
    await reloadCourseData();
    setOpenReviewModal(false);
  };

  // 👉 เวลา ReviewCard แจ้งว่ารีวิวนี้ถูกแก้ไขแล้ว (ถ้าใช้)
  const handleReviewUpdated = (updatedReview) => {
    setReviews(prev =>
      prev.map(r => (r.id === updatedReview.id ? updatedReview : r))
    );
  };

  // 👉 เวลา ReviewCard ลบรีวิวนี้
  const handleReviewDeleted = (deletedId) => {
    setReviews(prev => prev.filter(r => r.id !== deletedId));
  };

  // ฟิลเตอร์เกรด
  const filteredReviews =
    filter === "all"
      ? reviews
      : reviews.filter((r) => {
          if (filter === "ab") return ["A", "A-", "B+", "B"].includes(r.grade);
          if (filter === "cdf") return ["C", "C-", "D", "F"].includes(r.grade);
          return true;
        });

  return (
    <>
      <Header />
      <div className="course-detail-container">

        {/* HEADER วิชา */}
        <div className="course-header-card">
          <span className="course-code">{course.course_code}</span>
          <h1 className="course-title">{course.name_th}</h1>

          <div className="course-meta">
            <div className="meta-item">
              ความยากเฉลี่ย
              <span className="value">/ 5</span>
            </div>
            <div className="meta-item">
              ปริมาณงานเฉลี่ย
              <span className="value">/ 5</span>
            </div>
          </div>

          {/* แท็กยอดนิยม */}
          <div className="course-tags">
            {course.popular_tags?.map((tag) => (
              <span key={tag} className="course-tag">
                #{tag}
              </span>
            ))}
          </div>

          {/* ปุ่มบนขวา */}
          <div className="course-header-actions">
            <button className="btn-save">บันทึก</button>
            <button
              className="btn-add-review"
              onClick={() => setOpenReviewModal(true)}
            >
              + เขียนคำแนะนำ
            </button>

            <ReviewForm
              isOpen={openReviewModal}
              mode="create"
              course={course}
              onClose={() => setOpenReviewModal(false)}
              onSubmit={handleCreateReview}
            />
          </div>
        </div>

        {/* INSTRUCTOR SUMMARY */}
        {instructorSummary && (
          <div className="instructor-box">
            <p>
              <strong>ผู้สอน:</strong> {instructorSummary.name}
            </p>
            <p>{instructorSummary.comment}</p>
          </div>
        )}

        {/* FILTER */}
        <div className="review-filter">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            ทั้งหมด
          </button>

          <button
            className={filter === "ab" ? "active" : ""}
            onClick={() => setFilter("ab")}
          >
            A/B+
          </button>

          <button
            className={filter === "cdf" ? "active" : ""}
            onClick={() => setFilter("cdf")}
          >
            C/D/F
          </button>
        </div>

        {/* REVIEWS */}
        <div className="review-list">
          {filteredReviews.length === 0 ? (
            <p className="empty-review">ยังไม่มีรีวิวในหมวดนี้</p>
          ) : (
            filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={{
                  id: review.id,
                  author: review.users?.username || "นักศึกษา",
                  authorId: review.user_id,
                  grade: review.grade,
                  tags: review.tags || [],
                  ratings: {
                    satisfaction: review.rating_satisfaction,
                    difficulty: review.rating_difficulty,
                    workload: review.rating_workload,
                  },
                  content: {
                    prerequisite: review.content_prerequisite,
                    prosCons: review.content_pros_cons,
                    tips: review.content_tips,
                  },
                  instructor_reply: review.instructor_reply,
                  instructorName: review.instructor?.username,
                }}
                onEditReview={handleReviewUpdated}
                onDeleteReview={handleReviewDeleted}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
