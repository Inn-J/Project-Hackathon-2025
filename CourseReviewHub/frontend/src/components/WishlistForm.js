// src/components/WishlistForm.jsx
import React, { useEffect, useState } from "react";
import "./WishlistForm.css";

export default function WishlistForm({
  isOpen,
  onClose,
  course,
  onSave,
  initialNote = "",
}) {
  const [note, setNote] = useState(initialNote);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setNote(initialNote || "");
      setError("");
      setSubmitting(false);
    }
  }, [isOpen, initialNote]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await onSave?.(note);   // ✅ ส่ง note กลับไป
    } catch (err) {
      console.error("add wishlist error:", err);
      setError(err?.message || "ไม่สามารถบันทึก Wishlist ได้");
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
