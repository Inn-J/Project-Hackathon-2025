import React from 'react';
import { FireIcon,BookOpenIcon,StarIcon } from '@heroicons/react/solid';
import './CourseCard.css'; // Import CSS
import { useNavigate } from "react-router-dom";

export default function CourseCard({ course }) {
  const navigate = useNavigate();
  const openDetail = () => {
    navigate(`/courses/${course.id}`);   // ← ไปหน้าแสดงคอร์ส
  };
  const renderDifficulty = (level) => {
    let icons = [];
    for (let i = 0; i < 5; i++) {
      icons.push(
        <FireIcon 
          key={i} 
          className={`difficulty-fire-icon ${i < level ? 'active' : ''}`} 
        />
      );
    }
    return icons;
  };

   const renderWorkload = (level = 0) => {
    return [...Array(5)].map((_, i) => (
      <BookOpenIcon
        key={i}
        className={`workload-icon ${i < level ? 'active' : ''}`}
      />
    ));
  };

  const renderLevelIcons = (IconComponent, value, activeClass) => {
    const level = Math.round(value || 0);
    return (
      <>
        {[...Array(5)].map((_, i) => (
          <IconComponent
            key={i}
            className={`difficulty-fire-icon ${i < level ? activeClass : ''}`}
          />
        ))}
      </>
    );
  };


  return (
    <div className="course-card">
  <div className="course-card-content">

    {/* แถวบน: รหัสวิชา + จำนวนรีวิวชิดขวา */}
    <div className="course-header-row">
      <div className="course-code">{course.code}</div>
      <div className="course-reviews">
        {course.reviewCount} คำแนะนำ
      </div>
    </div>

    <button className="course-title">{course.title}</button>
    
    <div className="course-metric">
      <span className="metric-label">ความพอใจ:</span>
      <span className="metric-icons">
        {renderLevelIcons(StarIcon, course.satisfaction, 'rating-yellow')}
      </span>
    </div>

    <div className="course-difficulty">
      <span className="difficulty-label">ความยาก:</span>
      {renderDifficulty(course.difficulty)}
    </div>

    {course.workload !== undefined && (
      <div className="course-workload">
        <span className="workload-label">ปริมาณงาน:</span>
        {renderWorkload(course.workload)}
      </div>
    )}

    <button className="course-button" onClick={openDetail}>
      ดูรายละเอียด
    </button>
  </div>
</div>
  );
}
