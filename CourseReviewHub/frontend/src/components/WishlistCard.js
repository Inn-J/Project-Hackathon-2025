// src/components/WishlistCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/solid';
import WishlistForm from './WishlistForm';
import './WishlistCard.css'; 

export default function WishlistCard({ item, onRemove, onUpdateNote }) {
  const navigate = useNavigate();
  const course = item.courses;
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  if (!course) return null;

  const handleDelete = (e) => {
    e.stopPropagation(); 
    if (window.confirm(`ลบวิชา ${course.course_code} ออกจาก Wishlist?`)) {
      onRemove(course.id);          // ✅ ใช้ course.id เป็น courseId
    }
  };

  const handleOpenEditNote = (e) => {
    e.stopPropagation();
    setIsNoteModalOpen(true);
  };

  const handleCloseNoteModal = () => {
    setIsNoteModalOpen(false);
  };

  const handleSaveNote = async (newNote) => {
    if (onUpdateNote) {
      await onUpdateNote(course.id, newNote);   // ✅ ส่ง course.id ให้ Context
    }
    setIsNoteModalOpen(false);
  };

  return (
    <>
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
          <button
            onClick={() => navigate(`/courses/${course.id}`)}
            className="details-button"
          >
            ดูรายละเอียด
          </button>

          <button
            className="edit-note-button"
            onClick={handleOpenEditNote}
          >
            แก้ไขบันทึกส่วนตัว ▾
          </button>
        </div>
      </div>

      <WishlistForm
        isOpen={isNoteModalOpen}
        onClose={handleCloseNoteModal}
        course={course}
        initialNote={item.personal_note || ''}
        onSave={handleSaveNote}
      />
    </>
  );
}
