import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/solid';
import './WishlistCard.css'; 

export default function WishlistCard({ item, onRemove }) {
  const navigate = useNavigate();
  // item.courses คือข้อมูลวิชาที่ Backend join มาให้
  const course = item.courses; 

  if (!course) return null; // กันพัง

  const handleDelete = (e) => {
    e.stopPropagation(); 
    if (window.confirm(`ลบวิชา ${course.course_code} ออกจาก Wishlist?`)) {
      onRemove(course.id); // course.id คือ course_id
    }
  };

  return (
    <div className="wishlist-card">
      <div className="wishlist-card-header">
        <div>
          <span className="course-code">{course.course_code}</span>
          <h3 className="course-name">{course.name_th}</h3>
          <p className="course-name-en">{course.name_en || '...'}</p>
        </div>
        <button onClick={handleDelete} className="delete-button">
          <TrashIcon width={24} height={24} />
        </button>
      </div>
      
      {item.personal_note && (
        <div className="personal-note-box">
          <strong>📝 บันทึกส่วนตัว:</strong>
          <p>{item.personal_note}</p>
        </div>
      )}

      <div className="wishlist-card-footer">
        <button onClick={() => navigate(`/course/${course.id}`)} className="details-button">
          ดูรายละเอียด
        </button>
        <button className="edit-note-button">
          บันทึกส่วนตัว ▾
        </button>
      </div>
    </div>
  );
}