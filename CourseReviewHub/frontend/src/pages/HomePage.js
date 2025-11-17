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
  const [showSuggestions, setShowSuggestions] = useState(false); // ✅ state สำหรับกล่อง suggest

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // ฟังก์ชันพาไปหน้า Search
  const goSearch = (overrideTerm) => {
    const q = (overrideTerm ?? searchTerm).trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    } else {
      navigate('/search');
    }
    setShowSuggestions(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1) ดึง stat รายวิชาแบบ personalized ตามคณะของ user
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

  const coursesWithReviews = courses.filter(course => (course.review_count ?? 0) > 0);

  const sortedByReviewCount = [...coursesWithReviews].sort(
    (a, b) => (b.review_count ?? 0) - (a.review_count ?? 0)
  );

  const userFaculty = currentUser?.faculty;

  const popularBySameFaculty = userFaculty
    ? sortedByReviewCount.filter(course => (course.same_faculty_reviewers ?? 0) > 0)
    : [];

  const finalCoursesRaw =
    popularBySameFaculty.length > 0 ? popularBySameFaculty : sortedByReviewCount;

  const finalCourses = finalCoursesRaw.slice(0, 10);

  const hasSameFacultyResult = userFaculty && popularBySameFaculty.length > 0;

  // -------------------- Logic ของ Suggestion --------------------

  const trimmed = searchTerm.trim().toLowerCase();
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
          <div className="home-search-inner">
            <input
              type="text"
              placeholder="ค้นหาด้วยรหัสวิชา หรือชื่อวิชา..."
              className="home-search-input"
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                setShowSuggestions(value.trim().length > 0);
              }}
              onFocus={() => {
                if (searchTerm.trim().length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                // หน่วงให้คลิกปุ่ม suggestion ทัน
                setTimeout(() => setShowSuggestions(false), 150);
              }}
            />
            <button
              type="submit"
              className="home-search-button"
              aria-label="ค้นหา"
            >
              <SearchIcon className="home-search-icon" />
            </button>
          </div>

          {/* กล่อง Suggestion ใต้ช่องค้นหา */}
          {showSuggestions && limitedSuggestions.length > 0 && (
            <div className="home-search-suggestions">
              {limitedSuggestions.map((course) => (
                <button
                  type="button"
                  key={course.id || course.course_code}
                  className="home-search-suggestion-item"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const query =
                      course.course_code ||
                      course.name_th ||
                      course.name_en ||
                      '';
                    setSearchTerm(query);
                    goSearch(query); // ยิงไปหน้า search พร้อมค่านี้
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
          {finalCourses.map((course) => (
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
          latestReviews.map((review) => (
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
                instructorName:
                  review.instructorName || review.instructor?.username,
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
