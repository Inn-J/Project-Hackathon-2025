// src/components/ReportReviewModal.jsx
import React, { useState, useEffect } from "react";
import "./ReportReviewModal.css";

export default function ReportReviewModal({
  isOpen,
  onClose,
  onSubmit,
  reviewAuthor,
}) {
  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");

  // ถ้า modal เพิ่งถูกเปิด ให้เคลียร์ค่าทุกครั้ง
  useEffect(() => {
    if (isOpen) {
      setSelectedReason("");
      setDetails("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const reasons = [
    "เนื้อหาไม่เหมาะสม",
    "ข้อมูลเท็จ",
    "การคุกคามหรือการคุกคามกลั่นแกล้ง",
    "สแปมหรือโฆษณา",
    "ละเมิดความเป็นส่วนตัว",
    "อื่นๆ",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedReason) {
      setError("กรุณาเลือกเหตุผลในการรายงาน");
      return;
    }
    setError("");

    onSubmit?.({
      reason: selectedReason,
      details: details.trim(),
    });

    onClose?.();
  };

  return (
    <div className="report-modal__backdrop" onClick={onClose}>
      <div
        className="report-modal__container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="report-modal__header">
          <div className="report-modal__icon">!</div>
          <div>
            <h2 className="report-modal__title">รายงานผู้ใช้</h2>
            <p className="report-modal__subtitle">
              รายงานรีวิว {reviewAuthor || "ผู้ใช้"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="report-modal__body">
          <section className="report-modal__section">
            <h3 className="report-modal__section-title">
              เลือกเหตุผลการรายงาน
            </h3>

            <div className="report-modal__radio-group">
              {reasons.map((reason) => (
                <label key={reason} className="report-modal__radio-item">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {error && <p className="report-modal__error">{error}</p>}
          </section>

          <section className="report-modal__section">
            <h3 className="report-modal__section-title">
              ข้อมูลเพิ่มเติม (ถ้ามี)
            </h3>
            <textarea
              className="report-modal__textarea"
              placeholder="กรุณาระบุรายละเอียดเพิ่มเติม…"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
            />
          </section>

          <section className="report-modal__section">
            <div className="report-modal__notice">
              ⚠️ การรายงานของคุณจะถูกตรวจสอบโดยทีมงาน
              กรุณาให้ข้อมูลที่ถูกต้องและตรงไปตรงมา
            </div>
          </section>

          <div className="report-modal__footer">
            <button
              type="button"
              className="report-modal__btn report-modal__btn--secondary"
              onClick={onClose}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="report-modal__btn report-modal__btn--primary"
            >
              ส่งรายงาน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
