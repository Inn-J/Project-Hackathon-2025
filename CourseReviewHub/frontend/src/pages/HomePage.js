import React, { useState, useEffect } from 'react';
import Header from '../components/HomeHeader';
import CourseCard from '../components/CourseCard';
import ReviewCard from '../components/ReviewCard';
import { SearchIcon } from '@heroicons/react/solid';
import './HomePage.css';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/axiosConfig';

// เพิ่ม import นี้ สำหรับ Search
import { useNavigate } from 'react-router-dom';


export default function HomePage() {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);

  // 3 ตัวนี้มาจากส่วน Search ของเพื่อน
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const [latestReviews, setLatestReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ฟังก์ชันพาไปหน้า Search (ของเพื่อน)
  const goSearch = () => {
    const q = searchTerm.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
    else navigate(`/search`);
  };

  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. ดึงข้อมูลวิชาทั้งหมด
      const coursesRes = await apiClient.get('/courses/stats');
      setCourses(coursesRes.data.courses);

      // 2. ดึงรีวิวล่าสุด
      const reviewsRes = await apiClient.get('/reviews/latest');
      
      // ⬇️ เพิ่มการ debug เฉพาะ course
      console.log('🔥 [Reviews] Total:', reviewsRes.data?.length);
      console.log('📚 [Reviews] First Review Course:', reviewsRes.data[0]?.course);
      
      // เช็คว่าทุกรีวิวมี course ไหม
      const withoutCourse = reviewsRes.data.filter(r => !r.course).length;
      console.log(withoutCourse > 0 
        ? `⚠️ มี ${withoutCourse} รีวิวที่ไม่มี course` 
        : '✅ ทุกรีวิวมี course แล้ว'
      );
      
      setLatestReviews(reviewsRes.data);

    } catch (err) {
      console.error("Error fetching homepage data:", err);
      setError("ไม่สามารถดึงข้อมูลวิชาหรือรีวิวได้");
    } finally {
      setLoading(false);
    }
  };

  if (currentUser) {
    fetchData();
  }
}, [currentUser]);

// แสดงหน้าโหลดขณะรอ API
if (loading) {
  return <div className="homepage-container"><Header /><div className="loading-state">กำลังโหลดข้อมูล...</div></div>;
}
if (error) {
  return <div className="homepage-container"><Header /><div className="error-state">Error: {error}</div></div>;
}

// กรองวิชาที่มีรีวิวเท่านั้น
const coursesWithReviews = courses.filter(course => (course.review_count ?? 0) > 0);
  // (โค้ดส่วนแสดงผลหลัก)
  return (
    <div className="homepage-container">
      <Header />
      {/* 1. ส่วน Banner ค้นหา (สีม่วง) - (ของเพื่อน) */}
      <div className="home-banner">
        <h2 className="home-banner-title">ค้นหาวิชาที่สนใจ</h2>
        <p className="home-status-message">
          ยินดีต้อนรับ, {currentUser?.username} ({currentUser?.faculty})
        </p>

        {/* ✅ ฟอร์มค้นหาแบบกด Enter หรือคลิกไอคอนแล้วไปหน้า /search?q=... */}
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

        {/* ================== FIX 3: อัปเดตการแสดงผล Course ================== */}
        {/* 2. ส่วนวิชาแนะนำ (Horizontal Scroll) */}

        {/* อัปเดต Title ให้นับจาก 'coursesWithReviews.length' */}
        <h3 className="home-section-title">วิชาที่คนสนใจเยอะ ({coursesWithReviews.length} วิชา)</h3>

        <div className="home-course-scroll">

          {/* เปลี่ยนไป .map() บนตัวแปร 'coursesWithReviews' */}
          {coursesWithReviews.map(course => (
            <CourseCard
              key={course.id}
              course={{
                id: course.id,
                code: course.course_code,
                title: course.name_th,
                // เอาข้อมูลจริงมาใช้ (ไม่ใช่ค่าจำลอง)
                difficulty: course.difficulty ?? 0,
                reviewCount: course.review_count ?? 0
              }}
            />
          ))}
        </div>
        {/* ================================================================ */}


        {/* ================== FIX 4: อัปเดตการแสดงผล Review ================== */}
        {/* 3. ส่วนรีวิวล่าสุด (การ์ดใหญ่) */}
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
        
        // ✅ เพิ่ม course
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