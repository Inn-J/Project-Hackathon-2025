import React from 'react';
import Header from '../components/Header';
import CourseCard from '../components/CourseCard';
import './SearchPage.css'; // Import CSS

// Mock Data
const mockCourses = [
  { id: 1, code: 'CS101', title: 'Introduction to Computer Science', difficulty: 3, reviewCount: 45 },
  { id: 2, code: 'CS101', title: 'Introduction to Computer Science', difficulty: 3, reviewCount: 45 },
  { id: 3, code: 'CS101', title: 'Introduction to Computer Science', difficulty: 3, reviewCount: 45 },
  { id: 4, code: 'CS101', title: 'Introduction to Computer Science', difficulty: 3, reviewCount: 45 },
  { id: 5, code: 'CS101', title: 'Introduction to Computer Science', difficulty: 3, reviewCount: 45 },
  { id: 6, code: 'CS101', title: 'Introduction to Computer Science', difficulty: 3, reviewCount: 45 },
];

export default function SearchPage() {
  return (
    <div className="searchpage-container">
      <Header />

      <div className="search-content-wrapper">
        
        <aside className="search-sidebar">
          <div className="filter-box">
            <h3 className="filter-title">ตัวกรอง</h3>
            
            <div className="filter-group">
              <h4 className="filter-group-title">เรียงตาม</h4>
              <input type="text" placeholder="คะแนนสูงสุด" className="filter-input-text" />
            </div>
            
            <div className="filter-group">
              <h4 className="filter-group-title">ระดับความยาก</h4>
              <div className="filter-difficulty-buttons">
                <button className="filter-difficulty-button">1 🔥</button>
                <button className="filter-difficulty-button">2 🔥</button>
                <button className="filter-difficulty-button">3 🔥</button>
                <button className="filter-difficulty-button">4 🔥</button>
                <button className="filter-difficulty-button">5 🔥</button>
              </div>
            </div>

            <div className="filter-group">
              <h4 className="filter-group-title">ปริมาณงาน</h4>
              <label className="filter-checkbox-label">
                <input type="checkbox" className="filter-checkbox"/>
                <span>น้อย</span>
              </label>
              <label className="filter-checkbox-label">
                <input type="checkbox" className="filter-checkbox"/>
                <span>ปานกลาง</span>
              </label>
              <label className="filter-checkbox-label">
                <input type="checkbox" className="filter-checkbox"/>
                <span>มาก</span>
              </label>
            </div>
          </div>
        </aside>

        <main className="search-results-main">
          <h2 className="search-results-title">ผลการค้นหา: "960" (พบ 8 รายวิชา)</h2>
          <div className="search-results-grid">
            {mockCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          <div className="search-load-more">
            <button className="load-more-button">
              โหลดเพิ่มเติม
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
