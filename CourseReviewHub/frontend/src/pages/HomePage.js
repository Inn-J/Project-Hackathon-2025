import React, { useState, useEffect } from 'react';
import Header from '../components/HomeHeader';
import CourseCard from '../components/CourseCard';
import ReviewCard from '../components/ReviewCard';
import { SearchIcon } from '@heroicons/react/solid';
import './HomePage.css';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/axiosConfig';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [latestReviews, setLatestReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // ฟังก์ชันพาไปหน้า Search
  const goSearch = () => {
    const q = searchTerm.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
    else navigate(`/search`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1) ดึง stat รายวิชาแบบ personalized ตามคณะของ user
        // backend: GET /api/courses/faculty → { courses: [...] }
        const coursesRes = await apiClient.get('/courses/faculty');
        setCourses(coursesRes.data?.courses || []);

        // 2) ดึงรีวิวล่าสุด
        const reviewsRes = await apiClient.get('/reviews/latest');

        const withoutCourse = reviewsRes.data.filter(r => !r.course).length;
        console.log(
          withoutCourse > 0
            ? `⚠️ มี ${withoutCourse} รีวิวที่ไม่มี course`
            : '✅ ทุกรีวิวมี course แล้ว'
        );

        setLatestReviews(reviewsRes.data || []);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
        setError('ไม่สามารถดึงข้อมูลวิชาหรือรีวิวได้');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchData();
    } else {
      // ถ้าไม่มี currentUser (ยังไม่ login) ก็หยุดโหลด
      setLoading(false);
    }
  }, [currentUser]);

  // -------------------- Loading & Error State --------------------
  if (loading) {
    return (
      <div className="homepage-container">
        <Header />
        <div className="loading-state">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="homepage-container">
        <Header />
        <div className="error-state">Error: {error}</div>
      </div>
    );
  }

  // -------------------- Logic วิชาแนะนำ --------------------

  // เอาเฉพาะวิชาที่มีรีวิว
  const coursesWithReviews = courses.filter(course => (course.review_count ?? 0) > 0);

  // เรียงตามจำนวนรีวิว จากมาก → น้อย (ใช้เป็น base ทั้ง global และ personalized)
  const sortedByReviewCount = [...coursesWithReviews].sort(
    (a, b) => (b.review_count ?? 0) - (a.review_count ?? 0)
  );

  const userFaculty = currentUser?.faculty;

  // วิชาที่มี "จำนวนรีวิวจากคณะเดียวกับ user > 0"
  const popularBySameFaculty = userFaculty
    ? sortedByReviewCount.filter(course => (course.same_faculty_reviewers ?? 0) > 0)
    : [];

  // ถ้ามีวิชาคณะเดียวกัน → ใช้ list นั้น, ถ้าไม่มีเลย → fallback ไปใช้ global sorted
  const finalCoursesRaw =
    popularBySameFaculty.length > 0 ? popularBySameFaculty : sortedByReviewCount;

  // จะจำกัดจำนวน เช่น top 10
  const finalCourses = finalCoursesRaw.slice(0, 10);

  const hasSameFacultyResult = userFaculty && popularBySameFaculty.length > 0;

  // -------------------- Render --------------------
  return (
    <div className="homepage-container">
      <Header />

      {/* Banner ค้นหา */}
      <div className="home-banner">
        <h2 className="home-banner-title">ค้นหาวิชาที่สนใจ</h2>
        {currentUser && (
          <p className="home-status-message">
            ยินดีต้อนรับ, {currentUser.username} ({currentUser.faculty})
          </p>
        )}

        <form
          className="home-search-wrapper"
          onSubmit={(e) => {
            e.preventDefault();
            goSearch();
          }}
        >
          <input
            type="text"
            placeholder="ค้นหาด้วยรหัสวิชา หรือชื่อวิชา..."
            className="home-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="home-search-button" aria-label="ค้นหา">
            <SearchIcon className="home-search-icon" />
          </button>
        </form>
      </div>

      <div className="home-content-wrapper">
        {/* วิชาแนะนำ (Horizontal Scroll) */}
        <h3 className="home-section-title">
          {hasSameFacultyResult
            ? `วิชาที่คนในคณะของคุณสนใจ (${finalCourses.length} วิชา)`
            : `วิชาที่มีคนรีวิวมากที่สุด (${finalCourses.length} วิชา)`}
        </h3>

        <div className="home-course-scroll">
          {finalCourses.map(course => (
            <CourseCard
              key={course.id}
              course={{
                id: course.id,
                code: course.course_code,
                title: course.name_th,
                difficulty: course.difficulty ?? 0,
                reviewCount: course.review_count ?? 0,
              }}
            />
          ))}
        </div>

        {/* รีวิวล่าสุด */}
        <h3 className="home-section-title" style={{ marginTop: '40px' }}>
          รีวิวล่าสุด ({latestReviews.length} รายการ)
        </h3>

        {latestReviews.length > 0 ? (
          latestReviews.map(review => (
            <ReviewCard
              key={review.id}
              review={{
                id: review.id,
                author: review.author || review.users?.username || 'นักศึกษา',
                authorId: review.authorId || review.user_id,
                grade: review.grade,
                tags: review.tags || [],
                course: review.course,
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
            />
          ))
        ) : (
          <p className="no-review-message">ยังไม่มีรีวิวในระบบ</p>
        )}
      </div>
    </div>
  );
}
