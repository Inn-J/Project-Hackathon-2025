// src/pages/SearchPage.jsx
import React from 'react';
import Header from '../components/Header';
import CourseCard from '../components/CourseCard';
import { useLocation } from 'react-router-dom';
import './SearchPage.css';

// ✅ ใช้ mockCourses ให้ตรงกับตาราง courses ในรูป
const mockCourses = [
  { id: 1, code: '100200', title: 'JavaScript',             difficulty: 3, reviewCount: 12 },
  { id: 2, code: '261101', title: 'Intro to Comp Eng',      difficulty: 2, reviewCount: 5  },
  { id: 3, code: '960100', title: 'Art of Living',          difficulty: 1, reviewCount: 8  },
  { id: 4, code: '001101', title: 'Fundamental English 1',  difficulty: 2, reviewCount: 10 },
  { id: 6, code: '001102', title: 'Fundamental English 2',  difficulty: 3, reviewCount: 7  },
];

export default function SearchPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const q = (params.get('q') || '').trim();

  // ✅ filter จาก mockCourses ตาม q (รหัสวิชา หรือชื่อวิชา)
  const results = q
    ? mockCourses.filter(c =>
        c.code.toLowerCase().includes(q.toLowerCase()) ||
        c.title.toLowerCase().includes(q.toLowerCase())
      )
    : mockCourses;

  return (
    <div className="searchpage-container">
      <Header />

      <div className="search-content-wrapper">
        {/* ----- Sidebar ตัวกรอง (ยังเป็น mock / ยังไม่ต้องมี logic ก็ได้) ----- */}
        <aside className="search-sidebar">
          <div className="filter-box">
            <h3 className="filter-title">ตัวกรอง</h3>

            <div className="filter-group">
              <h4 className="filter-group-title">เรียงตาม</h4>
              <div className="sort-buttons">
                <button className="sort-button">ยอดรีวิวมากสุด</button>
                <button className="sort-button">ความยากน้อยสุด</button>
                <button className="sort-button">ปริมาณงานน้อยสุด</button>
              </div>
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
                <input type="checkbox" className="filter-checkbox" />
                <span>น้อย</span>
              </label>
              <label className="filter-checkbox-label">
                <input type="checkbox" className="filter-checkbox" />
                <span>ปานกลาง</span>
              </label>
              <label className="filter-checkbox-label">
                <input type="checkbox" className="filter-checkbox" />
                <span>มาก</span>
              </label>
            </div>
          </div>
        </aside>

        {/* ----- ส่วนผลลัพธ์ ----- */}
        <main className="search-results-main">
          <h2 className="search-results-title">
            {q
              ? `ผลการค้นหา: "${q}" (พบ ${results.length} รายวิชา)`
              : `รายวิชาทั้งหมด (${results.length} รายวิชา)`}
          </h2>

          <div className="search-results-grid">
            {results.length > 0 ? (
              results.map(course => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <p>ไม่พบวิชาที่ตรงกับคำค้นหา</p>
            )}
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
