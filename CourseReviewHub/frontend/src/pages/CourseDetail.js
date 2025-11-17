// src/pages/CourseDetail.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../services/axiosConfig";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext"; // ⬅️ เพิ่มตรงนี้
import ReviewForm from "../components/ReviewForm";
import WishlistForm from "../components/WishlistForm";
import {
  FireIcon,
  BookOpenIcon
} from '@heroicons/react/solid';
import Header from "../components/Header";
import ReviewCard from "../components/ReviewCard";
import "./CourseDetail.css";

export default function CourseDetail() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const {
    isCourseInWishlist,
    addToWishlist,
    removeFromWishlist,
  } = useWishlist(); // ⬅️ ดึงจาก Context

  const [course, setCourse] = useState(null);
  const [instructorSummary, setInstructorSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("all");
  const [openWishlistModal, setOpenWishlistModal] = useState(false);
  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ เช็คจาก context แทน state local
  const inWishlist = isCourseInWishlist(id);

  const top5Tags = React.useMemo(() => {
    const counter = {};

    reviews.forEach(r => {
      (r.tags || []).forEach(tag => {
        counter[tag] = (counter[tag] || 0) + 1;
      });
    });

    return Object.entries(counter)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }, [reviews]);

  // โหลดข้อมูลหลัก
  const reloadCourseData = useCallback(async () => {
    try {
      setLoading(true);
      const courseRes = await apiClient.get(`/courses/${id}`);
      setCourse(courseRes.data.course);
      setInstructorSummary(courseRes.data.instructor_summary);
      setReviews(courseRes.data.reviews || []);
    } catch (err) {
      console.error("Error loading course detail:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    reloadCourseData();
  }, [reloadCourseData]);

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;
  if (!course) return <div>ไม่พบข้อมูลรายวิชา</div>;

  // ค่าเฉลี่ยจากรีวิว
  const avgDifficulty = reviews.length
    ? reviews.reduce((sum, r) => sum + (r.rating_difficulty || 0), 0) / reviews.length
    : 0;

  const avgWorkload = reviews.length
    ? reviews.reduce((sum, r) => sum + (r.rating_workload || 0), 0) / reviews.length
    : 0;

  const renderAvgIcons = (IconComponent, avgValue, activeClass) => {
    const level = Math.round(avgValue);
    return (
      <span className="avg-icon-group">
        {[...Array(5)].map((_, i) => (
          <IconComponent
            key={i}
            className={`avg-icon ${i < level ? activeClass : ""}`}
          />
        ))}
      </span>
    );
  };

  // ✅ ฟังก์ชันเรียกตอนกด Save ใน WishlistForm
  const handleWishlistSave = async (noteText) => {
    try {
      await addToWishlist(Number(course.id), noteText || "");
      setOpenWishlistModal(false);
      alert("เพิ่มลง Wishlist แล้ว ✓");
    } catch (err) {
      alert(err.response?.data?.error || "เพิ่มลง Wishlist ไม่สำเร็จ");
    }
  };

  // ✅ toggle ถ้ากดบนปุ่มเขียวซ้ำ → ลบออก
  const handleWishlistButtonClick = async () => {
    if (!currentUser) {
      alert("กรุณาเข้าสู่ระบบก่อนใช้งาน Wishlist");
      return;
    }

    if (inWishlist) {
      // ลบออก
      if (!window.confirm("ต้องการเอาวิชาออกจาก Wishlist หรือไม่?")) return;
      try {
        await removeFromWishlist(Number(id));
        alert("ลบออกจาก Wishlist แล้ว");
      } catch (err) {
        alert("ลบ Wishlist ไม่สำเร็จ");
      }
    } else {
      // ยังไม่อยู่ → เปิดฟอร์มกรอก note
      setOpenWishlistModal(true);
    }
  };

  // ส่งรีวิวใหม่
  const handleCreateReview = async (payload) => {
    await apiClient.post("/reviews", {
      ...payload,
      course_id: Number(id),
    });

    await reloadCourseData();
    setOpenReviewModal(false);
  };

  const handleReviewUpdated = (updatedReview) => {
    setReviews(prev =>
      prev.map(r => (r.id === updatedReview.id ? updatedReview : r))
    );
  };

  const handleReviewDeleted = (deletedId) => {
    setReviews(prev => prev.filter(r => r.id !== deletedId));
  };

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
          <h1 className="course-title-th">{course.name_th}</h1>
          <h1 className="course-title-en">{course.name_en}</h1>

          <div className="course-meta">
            <div className="meta-item">
              ความยากเฉลี่ย
              {renderAvgIcons(FireIcon, avgDifficulty, "rating-orange")}
            </div>

            <div className="meta-item">
              ปริมาณงานเฉลี่ย
              {renderAvgIcons(BookOpenIcon, avgWorkload, "rating-blue")}
            </div>
          </div>

          {top5Tags.length > 0 && (
            <div className="top5-tags-container">
              <h3 className="top5-title">แท็กยอดนิยมในรีวิว</h3>
              <div className="top5-tags">
                {top5Tags.map(tag => (
                  <span key={tag} className="top5-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ปุ่มบนขวา */}
          <div className="course-header-actions">
            <button
              className={`btn-save ${inWishlist ? "in-wishlist" : ""}`}
              onClick={handleWishlistButtonClick}
            >
              {inWishlist ? "✓ อยู่ใน Wishlist แล้ว" : "Wishlist"}
            </button>

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
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
            ทั้งหมด
          </button>
          <button className={filter === "ab" ? "active" : ""} onClick={() => setFilter("ab")}>
            A/B
          </button>
          <button className={filter === "cdf" ? "active" : ""} onClick={() => setFilter("cdf")}>
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
        author: review.author || review.users?.username || "นักศึกษา",
        authorId: review.authorId || review.user_id,
        grade: review.grade,
        tags: review.tags || [],
        
        // ✅ เพิ่ม course (ใช้จากตัวแปร course ที่มีอยู่แล้ว)
        course: review.course || {
          id: course.id,
          course_code: course.course_code,
          name_th: course.name_th,
        },
        
        ratings: review.ratings || {
          satisfaction: review.rating_satisfaction,
          difficulty: review.rating_difficulty,
          workload: review.rating_workload,
        },
        content: review.content || {
          prerequisite: review.content_prerequisite,
          prosCons: review.content_pros_cons,
          tips: review.content_tips,
        },
        instructor_reply: review.instructor_reply,
        instructorName: review.instructorName || review.instructor?.username,
        instructor: review.instructor,
      }}
      onEditReview={handleReviewUpdated}
      onDeleteReview={handleReviewDeleted}
    />
  ))
)}

          {/* Modal Wishlist */}
          <WishlistForm
            isOpen={openWishlistModal}
            course={course}
            onClose={() => setOpenWishlistModal(false)}
            onSave={handleWishlistSave}  // ⬅️ ใช้ addToWishlist ผ่าน callback
          />
        </div>

      </div>
    </>
  );
}
