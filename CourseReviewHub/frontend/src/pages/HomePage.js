import React from 'react';
import Header from '../components/Header';
import CourseCard from '../components/CourseCard';
import ReviewCard from '../components/ReviewCard';
import { SearchIcon } from '@heroicons/react/solid';
import './HomePage.css'; // Import CSS

// Mock Data (ข้อมูลจำลอง)
const mockCourses = [
  { id: 1, code: 'CS101', title: 'Introduction to Computer Science', difficulty: 3, reviewCount: 45 },
  { id: 2, code: 'CS101', title: 'Introduction to Computer Science', difficulty: 3, reviewCount: 45 },
  { id: 3, code: 'CS101', title: 'Introduction to Computer Science', difficulty: 3, reviewCount: 45 },
  { id: 4, code: 'CS101', title: 'Introduction to Computer Science', difficulty: 3, reviewCount: 45 },
];

const mockReview = {
  author: 'อาร์ม',
  grade: 'A',
  tags: ['#เน้นเกรด', '#ตั้งใจทำงาน'],
  ratings: { satisfaction: 5, difficulty: 2, workload: 3 },
  content: {
    prerequisite: 'วิชานี้มีความเข้าใจยากกว่าที่ท่องจำ ต้องฝึกทำโจทย์เยอะๆ เพราะจะสอบมิดเทอมใหม่ๆ ที่ต้องใช้ logic',
    prosCons: 'ข้อดี: อาจารย์สอนดี TA ช่วยเหลือดีมาก / ข้อเสีย: งานเยอะหน่อย บางทีก็ต้องใช้เวลาเยอะกว่าจะเข้าใจ',
    tips: 'ทำการบ้านทุกครั้งอย่าสะสมงาน ถ้ามีปัญหาให้ไปถาม TA เขายินดีช่วยสอนให้เข้าใจง่ายๆ เยอะๆ'
  }
};

export default function HomePage() {
  return (
    <div className="homepage-container">
      <Header />
      
      <div className="home-banner">
        <h2 className="home-banner-title">ค้นหาวิชาที่สนใจ</h2>
        <div className="home-search-wrapper">
          <input
            type="text"
            placeholder="ค้นหาด้วยรหัสวิชา หรือชื่อวิชา..."
            className="home-search-input"
          />
          <SearchIcon className="home-search-icon" />
        </div>
      </div>

      <div className="home-content-wrapper">
        <h3 className="home-section-title">วิชาที่คนสนใจเยอะ</h3>
        <div className="home-course-scroll">
          {mockCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        <h3 className="home-section-title" style={{ marginTop: 40 }}>รีวิวล่าสุด</h3>
        <ReviewCard review={mockReview} />
      </div>
    </div>
  );
}
