// frontend/src/pages/SearchPage.jsx

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import CourseCard from '../components/CourseCard';
import { useLocation } from 'react-router-dom';
import apiClient from '../services/axiosConfig';
import './SearchPage.css';

export default function SearchPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const q = (params.get('q') || '').trim();

  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortBy, setSortBy] = useState('review_count');
  const [difficultyFilter, setDifficultyFilter] = useState(null);
  const [workloadFilter, setWorkloadFilter] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/courses/stats');
        setAllCourses(response.data.courses || []);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("ไม่สามารถโหลดข้อมูลวิชาได้");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // -----------------------------
  // ฟิลเตอร์แบบแก้ง่าย — ใช้ difficulty & workload
  // -----------------------------
  const filteredAndSortedResults = allCourses
    .filter(c =>
      q
        ? (c.course_code || '').toLowerCase().includes(q.toLowerCase()) ||
          (c.name_th || '').toLowerCase().includes(q.toLowerCase())
        : true
    )
    // ⭐ ใช้ c.difficulty (ไม่ใช่ difficulty_avg)
    .filter(c =>
      difficultyFilter ? Math.round(c.difficulty || 0) === difficultyFilter : true
    )
    // ⭐ ใช้ c.workload (ไม่ใช่ workload_avg)
    .filter(c => {
      if (!workloadFilter) return true;
      const rounded = Math.round(c.workload || 0);

      if (workloadFilter === 'low') return rounded === 1 || rounded === 2;
      if (workloadFilter === 'medium') return rounded === 3;
      if (workloadFilter === 'high') return rounded === 4 || rounded === 5;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'difficulty_asc') {
        return (a.difficulty || 0) - (b.difficulty || 0);
      }
      if (sortBy === 'workload_asc') {
        return (a.workload || 0) - (b.workload || 0);
      }
      return (b.review_count || 0) - (a.review_count || 0);
    });

  const toggleFilter = (setter, value) => {
    setter(prev => (prev === value ? null : value));
  };

  return (
    <>
      <Header />

      <style>{`
        .sort-button.active, 
        .filter-difficulty-button.active,
        .filter-workload-button.active {
          background-color: #6D28D9;
          color: white;
          border-color: #6D28D9;
        }
      `}</style>

      <div className="searchpage-container">
        <div className="search-content-wrapper">

          <aside className="search-sidebar">
            <div className="filter-box">
              <h3 className="filter-title">ตัวกรอง</h3>

              <div className="filter-group">
                <h4 className="filter-group-title">เรียงตาม</h4>
                <div className="sort-buttons">
                  <button
                    className={`sort-button ${sortBy === 'review_count' ? 'active' : ''}`}
                    onClick={() => setSortBy('review_count')}
                  >
                    ยอดรีวิวมากสุด
                  </button>
                  <button
                    className={`sort-button ${sortBy === 'difficulty_asc' ? 'active' : ''}`}
                    onClick={() => setSortBy('difficulty_asc')}
                  >
                    ความยากน้อยสุด
                  </button>
                  <button
                    className={`sort-button ${sortBy === 'workload_asc' ? 'active' : ''}`}
                    onClick={() => setSortBy('workload_asc')}
                  >
                    ปริมาณงานน้อยสุด
                  </button>
                </div>
              </div>

              <div className="filter-group">
                <h4 className="filter-group-title">ระดับความยาก</h4>
                <div className="filter-difficulty-buttons">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      className={`filter-difficulty-button ${difficultyFilter === level ? 'active' : ''}`}
                      onClick={() => toggleFilter(setDifficultyFilter, level)}
                    >
                      {level} 🔥
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <h4 className="filter-group-title">ปริมาณงาน</h4>
                <div className="workload-buttons">
                  <button
                    className={`filter-workload-button ${workloadFilter === 'low' ? 'active' : ''}`}
                    onClick={() => toggleFilter(setWorkloadFilter, 'low')}
                  >
                    น้อย
                  </button>
                  <button
                    className={`filter-workload-button ${workloadFilter === 'medium' ? 'active' : ''}`}
                    onClick={() => toggleFilter(setWorkloadFilter, 'medium')}
                  >
                    ปานกลาง
                  </button>
                  <button
                    className={`filter-workload-button ${workloadFilter === 'high' ? 'active' : ''}`}
                    onClick={() => toggleFilter(setWorkloadFilter, 'high')}
                  >
                    มาก
                  </button>
                </div>
              </div>

            </div>
          </aside>

          <main className="search-results-main">
            <h2 className="search-results-title">
              {q
                ? `ผลการค้นหา: "${q}" (พบ ${filteredAndSortedResults.length} รายวิชา)`
                : `รายวิชาทั้งหมด (${filteredAndSortedResults.length} รายวิชา)`}
            </h2>

            <div className="search-results-grid">
              {loading ? (
                <p>กำลังโหลด...</p>
              ) : error ? (
                <p>{error}</p>
              ) : filteredAndSortedResults.length > 0 ? (
                filteredAndSortedResults.map(course => (
                  <CourseCard
                    key={course.id}
                    course={{
                      id: course.id,
                      code: course.course_code,
                      title: course.name_th,
                      difficulty: course.difficulty ?? 0,
                      reviewCount: course.review_count ?? 0
                    }}
                  />
                ))
              ) : (
                <p>ไม่พบวิชาที่ตรงกับคำค้นหา</p>
              )}
            </div>

            <div className="search-load-more">
              <button className="load-more-button">โหลดเพิ่มเติม</button>
            </div>
          </main>

        </div>
      </div>
    </>
  );
}
