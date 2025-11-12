import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import CourseCard from '../components/CourseCard';
import ReviewCard from '../components/ReviewCard';
import { SearchIcon } from '@heroicons/react/solid';
import './HomePage.css';
import { useAuth } from '../context/AuthContext'; 
import apiClient from '../services/axiosConfig'; 

export default function HomePage() {
  const { currentUser } = useAuth(); 
  const [courses, setCourses] = useState([]);
  const [latestReviews, setLatestReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ฟังก์ชันดึงข้อมูลจะทำงานต่อเมื่อ User Logged In แล้วเท่านั้น
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. ดึงข้อมูลวิชาทั้งหมด (Public API)
        const coursesRes = await apiClient.get('/courses');
        setCourses(coursesRes.data);

        // 2. ดึงรีวิวล่าสุด (Private API - Interceptor จะแนบ Token ไปให้)
        const reviewsRes = await apiClient.get('/reviews/latest');
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
  
  // (โค้ดส่วนแสดงผลหลัก)
  return (
    <div className="homepage-container">
      <Header />
      
      {/* 1. ส่วน Banner ค้นหา (สีม่วง) */}
      <div className="home-banner">
        <h2 className="home-banner-title">ค้นหาวิชาที่สนใจ</h2>
        <p className="home-status-message">ยินดีต้อนรับ, {currentUser?.username} ({currentUser?.faculty})</p>
        <div className="home-search-wrapper">
          <input type="text" placeholder="ค้นหาด้วยรหัสวิชา หรือชื่อวิชา..." className="home-search-input" />
          <SearchIcon className="home-search-icon" />
        </div>
      </div>

      <div className="home-content-wrapper">
        {/* 2. ส่วนวิชาแนะนำ (Horizontal Scroll) */}
        <h3 className="home-section-title">วิชาที่คนสนใจเยอะ ({courses.length} วิชา)</h3>
        <div className="home-course-scroll">
          {courses.map(course => (
            <CourseCard 
              key={course.id} 
              course={{ 
                id: course.id, 
                code: course.course_code, 
                title: course.name_th,
                // ข้อมูลความยาก/รีวิว จำลองค่าไปก่อน
                difficulty: 3, 
                reviewCount: 45 
              }} 
            />
          ))}
        </div>

       {/* 3. ส่วนรีวิวล่าสุด (การ์ดใหญ่) */}
<h3 className="home-section-title" style={{ marginTop: '40px' }}>
  รีวิวล่าสุด ({latestReviews.length} รายการ)
</h3>

{latestReviews.length > 0 ? (
  <>
    {/* การ์ดที่ 1 */}
    <ReviewCard review={{
      author: latestReviews[0].users.username,
      grade: latestReviews[0].grade,
      tags: latestReviews[0].tags || ['#ข้อมูลจากระบบ'],
      ratings: {
        satisfaction: latestReviews[0].rating_satisfaction || 3,
        difficulty: latestReviews[0].rating_difficulty || 3,
        workload: latestReviews[0].rating_workload || 3,
      },
      content: {
        prerequisite: latestReviews[0].content_prerequisite || 'ไม่มีข้อมูล',
        prosCons: latestReviews[0].content_pros_cons || 'ไม่มีข้อมูล',
        tips: latestReviews[0].content_tips || 'ไม่มีเคล็ดลับ',
      }
    }} />

    {/* การ์ดที่ 2 */}
    <ReviewCard review={{
      author: latestReviews[0].users.username,
      grade: latestReviews[0].grade,
      tags: latestReviews[0].tags || ['#ข้อมูลจากระบบ'],
      ratings: {
        satisfaction: latestReviews[0].rating_satisfaction || 3,
        difficulty: latestReviews[0].rating_difficulty || 3,
        workload: latestReviews[0].rating_workload || 3,
      },
      content: {
        prerequisite: latestReviews[0].content_prerequisite || 'ไม่มีข้อมูล',
        prosCons: latestReviews[0].content_pros_cons || 'ไม่มีข้อมูล',
        tips: latestReviews[0].content_tips || 'ไม่มีเคล็ดลับ',
      }
    }} />

    {/* การ์ดที่ 3 */}
    <ReviewCard review={{
      author: latestReviews[0].users.username,
      grade: latestReviews[0].grade,
      tags: latestReviews[0].tags || ['#ข้อมูลจากระบบ'],
      ratings: {
        satisfaction: latestReviews[0].rating_satisfaction || 3,
        difficulty: latestReviews[0].rating_difficulty || 3,
        workload: latestReviews[0].rating_workload || 3,
      },
      content: {
        prerequisite: latestReviews[0].content_prerequisite || 'ไม่มีข้อมูล',
        prosCons: latestReviews[0].content_pros_cons || 'ไม่มีข้อมูล',
        tips: latestReviews[0].content_tips || 'ไม่มีเคล็ดลับ',
      }
    }} />
  </>
) : (
  <p className="no-review-message">ยังไม่มีรีวิวในระบบ</p>
)}

      </div>
    </div>
  );
}