import React, { useEffect, useMemo, useState } from "react";
import {
  StarIcon as StarSolid,
  FireIcon as FireSolid,
  BookOpenIcon as BookSolid,
} from "@heroicons/react/solid";
import {
  StarIcon as StarOutline,
  FireIcon as FireOutline,
  BookOpenIcon as BookOutline,
} from "@heroicons/react/outline";
import "./ReviewForm.css";

const GRADE_OPTIONS = ["A", "B+", "B", "C+", "C", "D", "F","-"];

export default function ReviewFormModal({
  isOpen,
  mode = "create",          // 'create' | 'edit'
  course,                   // { course_code, name_en, name_th }
  initialReview,            // ใช้ตอน edit (object เดิมของ review)
  onClose,
  onSubmit,
}) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tagOptions, setTagOptions] = useState([]);
  const TAG_OPTIONS = useMemo(() => require(`../data/tags.json`).tags);

  // step 1
  const [satisfaction, setSatisfaction] = useState(0);
  const [grade, setGrade] = useState("");
  const [difficulty, setDifficulty] = useState(0);
  const [workload, setWorkload] = useState(0);
  const [tags, setTags] = useState([]);

  // step 2
  const [prerequisite, setPrerequisite] = useState("");
  const [prosCons, setProsCons] = useState("");
  const [tips, setTips] = useState("");
  

  // โหลดค่าเดิมตอน edit หรือ reset ตอนเปิด modal
  useEffect(() => {
    if (!isOpen) return;

    setStep(1);
    setError("");
    setSubmitting(false);

    if (initialReview) {
      setSatisfaction(initialReview.rating_satisfaction ?? 0);
      setGrade(initialReview.grade ?? "");
      setDifficulty(initialReview.rating_difficulty ?? 0);
      setWorkload(initialReview.rating_workload ?? 0);
      setTags(initialReview.tags ?? []);

      setPrerequisite(initialReview.content_prerequisite ?? "");
      setProsCons(initialReview.content_pros_cons ?? "");
      setTips(initialReview.content_tips ?? "");
    } else {
      setSatisfaction(0);
      setGrade("");
      setDifficulty(0);
      setWorkload(0);
      setTags([]);
      setPrerequisite("");
      setProsCons("");
      setTips("");
    }
  }, [isOpen, initialReview]);

  if (!isOpen) return null;

  const toggleTag = (tag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const canGoNext =
    satisfaction > 0 && grade && difficulty > 0 && workload > 0;

  const handleNext = () => {
    if (!canGoNext) {
      setError(
        "กรุณาให้คะแนนความพอใจ เลือกเกรด ความยาก และปริมาณงานให้ครบก่อน"
      );
      return;
    }
    setError("");
    setStep(2);
  };

  const handlePrev = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prerequisite.trim() || !prosCons.trim() || !tips.trim()) {
      setError("กรุณากรอกทั้ง สิ่งที่ควรรู้ / ข้อดีข้อเสีย / Tips ให้ครบ");
      return;
    }

    setSubmitting(true);
    setError("");

    const payload = {
      rating_satisfaction: satisfaction,
      rating_difficulty: difficulty,
      rating_workload: workload,
      grade,
      tags,
      content_prerequisite: prerequisite.trim(),
      content_pros_cons: prosCons.trim(),
      content_tips: tips.trim(),
    };

    try {
      await onSubmit?.(payload);
      onClose?.();
    } catch (err) {
      console.error("submit review error:", err);

  const backendError = err?.response?.data?.error || err?.message;

  if (backendError?.includes("รีวิววิชานี้ไปแล้ว")) {
    setError("คุณได้รีวิววิชานี้ไปแล้ว ไม่สามารถรีวิวซ้ำได้");
  } else {
    setError(backendError || "บันทึกรีวิวไม่สำเร็จ");
  }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-modal__backdrop" onClick={onClose}>
      <div
        className="review-modal__container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="review-modal__header">
          <h2 className="review-modal__title">
            {mode === "edit" ? "แก้ไขคำแนะนำ" : "เขียนคำแนะนำ"}
          </h2>

          {/* ⭐ รองรับทั้งมี course / ไม่มี course */}
          <p className="review-modal__subtitle">
            {course
              ? `${course.course_code ?? ""} ${course.name_en || course.name_th || ""}`
              : "คำแนะนำรายวิชา"}
          </p>
        </div>

        {/* STEP INDICATOR */}
        <div className="review-modal__steps">
          <div className={`step-item ${step === 1 ? "active" : ""}`}>
            <div className="step-circle">1</div>
            <span>ข้อมูลพื้นฐาน</span>
          </div>
          <span className="step-arrow">&gt;</span>
          <div className={`step-item ${step === 2 ? "active" : ""}`}>
            <div className="step-circle">2</div>
            <span>เล่าประสบการณ์</span>
          </div>
        </div>

        {error && <div className="review-modal__error">{error}</div>}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="review-modal__body">
            {/* ความพอใจ */}
            <section className="field-group">
              <div className="field-label">
                ความพอใจโดยรวม <span className="required">*</span>
              </div>
              <div className="rating-row">
                {[1, 2, 3, 4, 5].map((v) => {
                  const Icon = satisfaction >= v ? StarSolid : StarOutline;
                  return (
                    <button
                      key={v}
                      type="button"
                      className={`icon-button ${
                        satisfaction >= v ? "active" : ""
                      }`}
                      onClick={() => setSatisfaction(v)}
                    >
                      <Icon className="icon-20" />
                    </button>
                  );
                })}
              </div>
            </section>

            {/* เกรด */}
            <section className="field-group">
              <div className="field-label">
                เกรดที่ได้ <span className="required">*</span>
              </div>
              <div className="grade-row">
                {GRADE_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`pill-button ${grade === g ? "active" : ""}`}
                    onClick={() => setGrade(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </section>

            {/* ความยาก */}
            <section className="field-group">
              <div className="field-label">
                ระดับความยาก <span className="required">*</span>
              </div>
              <div className="rating-row">
                {[1, 2, 3, 4, 5].map((v) => {
                  const Icon = difficulty >= v ? FireSolid : FireOutline;
                  return (
                    <button
                      key={v}
                      type="button"
                      className={`icon-button ${
                        difficulty >= v ? "active" : ""
                      }`}
                      onClick={() => setDifficulty(v)}
                    >
                      <Icon className="icon-20" />
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ปริมาณงาน */}
            <section className="field-group">
              <div className="field-label">
                ปริมาณงาน <span className="required">*</span>
              </div>
              <div className="rating-row">
                {[1, 2, 3, 4, 5].map((v) => {
                  const Icon = workload >= v ? BookSolid : BookOutline;
                  return (
                    <button
                      key={v}
                      type="button"
                      className={`icon-button ${
                        workload >= v ? "active" : ""
                      }`}
                      onClick={() => setWorkload(v)}
                    >
                      <Icon className="icon-20" />
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Tags */}
            <section className="field-group">
              <div className="field-label">เลือกแท็กที่เหมาะสม</div>
              <div className="tag-row">
                {TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`tag-pill ${
                      tags.includes(tag) ? "active" : ""
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>

            <div className="review-modal__footer">
              <button type="button" className="btn-primary" onClick={handleNext}>
                ถัดไป
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form className="review-modal__body" onSubmit={handleSubmit}>
            {/* สิ่งที่ควรรู้ */}
            <section className="field-group">
              <div className="field-label">
                สิ่งที่ควรรู้ <span className="required">*</span>
              </div>
              <textarea
                className="textarea"
                rows={4}
                value={prerequisite}
                onChange={(e) => setPrerequisite(e.target.value)}
              />
            </section>

            {/* ข้อดีข้อเสีย */}
            <section className="field-group">
              <div className="field-label">
                ข้อดี / ข้อเสีย <span className="required">*</span>
              </div>
              <textarea
                className="textarea"
                rows={4}
                value={prosCons}
                onChange={(e) => setProsCons(e.target.value)}
              />
            </section>

            {/* Tips */}
            <section className="field-group">
              <div className="field-label">
                Tips <span className="required">*</span>
              </div>
              <textarea
                className="textarea"
                rows={4}
                value={tips}
                onChange={(e) => setTips(e.target.value)}
              />
            </section>

            <div className="review-modal__footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={handlePrev}
                disabled={submitting}
              >
                ย้อนกลับ
              </button>

              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting
                  ? "กำลังบันทึก..."
                  : mode === "edit"
                  ? "บันทึกการแก้ไข"
                  : "ส่งคำแนะนำ"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}