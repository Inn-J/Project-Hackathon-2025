import React from 'react';
import { FireIcon } from '@heroicons/react/solid';
import './CourseCard.css'; // Import CSS

export default function CourseCard({ course }) {
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

  return (
    <div className="course-card">
      <div className="course-card-content">
        <div className="course-code">{course.code}</div>
        <button className="course-title">{course.title}</button>
        
        <div className="course-difficulty">
          <span className="difficulty-label">ความยาก:</span>
          {renderDifficulty(course.difficulty)}
        </div>
        
        <div className="course-reviews">
          {course.reviewCount} คำแนะนำ
        </div>

        <button className="course-button">
          ดูรายละเอียด
        </button>
      </div>
    </div>
  );
}
