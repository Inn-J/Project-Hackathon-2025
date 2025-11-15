import React, { useEffect, useState } from "react";
import apiClient from "../services/axiosConfig";
import "./WishlistForm.css";   // เดี๋ยวสร้างต่อด้านล่าง

export default function WishlistModal({ isOpen, onClose, course }) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // รีเซ็ตฟอร์มทุกครั้งที่เปิด modal
  useEffect(() => {
    if (isOpen) {
      setNote("");
      setError("");
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await apiClient.post("/wishlist", {
        course_id: Number(course.id),
        // ไม่บังคับกรอก note ถ้าว่างส่ง null ไป
        personal_note: note.trim() === "" ? null : note.trim(),
      });

      alert("บันทึกวิชาไว้ใน Wishlist แล้ว ✨");
      onClose?.();
    } catch (err) {
      console.error("add wishlist error:", err.response?.data || err);

      if (err.response?.status === 409) {
        alert("วิชานี้อยู่ใน Wishlist ของคุณแล้ว");
        onClose?.();
      } else if (err.response?.status === 401) {
        setError("กรุณาเข้าสู่ระบบก่อนบันทึกวิชา");
      } else {
        setError("ไม่สามารถบันทึก Wishlist ได้ กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-modal__backdrop" onClick={onClose}>
      <div
        className="review-modal__container wishlist-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="wishlist-title">บันทึกช่วยจำ</h2>
        <p className="wishlist-course">
          {course?.course_code} {course?.name_en || course?.name_th}
        </p>

        <form onSubmit={handleSubmit} className="wishlist-form">
          <label className="wishlist-label">
            บันทึกช่วยจำ
            <span className="wishlist-hint"> (ไม่บังคับกรอก)</span>
          </label>

          <textarea
            className="wishlist-textarea"
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="เช่น เรียนกับเพื่อนสนิท วิชานี้น่าจะเก็บเกรดง่าย ฯลฯ"
          />

          {error && <div className="wishlist-error">{error}</div>}

          <div className="wishlist-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="btn-primary wishlist-save-btn"
              disabled={submitting}
            >
              {submitting ? "กำลังบันทึก..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
