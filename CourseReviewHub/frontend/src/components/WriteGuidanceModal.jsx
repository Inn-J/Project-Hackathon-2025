// src/components/WriteGuidanceModal.jsx
import { useState } from 'react';
import { X, ChevronRight, Star, Flame, BookOpen } from 'lucide-react';

export function WriteGuidanceModal({
  isOpen,
  onClose,
  courseCode,
  courseName,
}) {
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [grade, setGrade] = useState('');
  const [difficulty, setDifficulty] = useState(0);
  const [workload, setWorkload] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [whatToKnow, setWhatToKnow] = useState('');
  const [prosAndCons, setProsAndCons] = useState('');
  const [tips, setTips] = useState('');

  const availableTags = [
    '#เน้นเกรด',
    '#สายชิล',
    '#ชอบทำงานกลุ่ม',
    '#ชอบทำงานคนเดียว',
    '#เข้าใจง่าย',
    '#ต้องฝึกเยอะ',
    '#อาจารย์สอนดี',
    '#มีงานกลุ่ม',
    '#มี Presentation',
    '#มีแล็บ',
  ];

  const grades = ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    // TODO: ส่งข้อมูลไป backend / บันทึกสถานะ
    console.log({
      rating,
      grade,
      difficulty,
      workload,
      tags: selectedTags,
      whatToKnow,
      prosAndCons,
      tips,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3>เขียนคำแนะนำ</h3>
            <p className="text-gray-600 mt-1">
              {courseCode} {courseName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-[#6C5CE7] text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                1
              </div>
              <span className={step >= 1 ? 'text-[#6C5CE7]' : 'text-gray-500'}>
                ข้อมูลพื้นฐาน
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-[#6C5CE7] text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                2
              </div>
              <span className={step >= 2 ? 'text-[#6C5CE7]' : 'text-gray-500'}>
                เล่าประสบการณ์
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 220px)' }}>
          {step === 1 ? (
            <div className="space-y-6">
              {/* Overall Rating */}
              <div>
                <label className="block mb-3">
                  ⭐ ความพึงพอใจโดยรวม <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setRating(value)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          value <= rating
                            ? 'text-[#FFB400] fill-[#FFB400]'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Grade */}
              <div>
                <label className="block mb-3">
                  เกรดที่ได้ <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {grades.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGrade(g)}
                      className={`py-3 rounded-lg border-2 transition-all ${
                        grade === g
                          ? 'bg-[#6C5CE7] text-white border-[#6C5CE7]'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#6C5CE7]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block mb-3">
                  😈 ระดับความยาก <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setDifficulty(value)}
                      className="transition-transform hover:scale-110"
                    >
                      <Flame
                        className={`w-10 h-10 ${
                          value <= difficulty
                            ? 'text-[#FF9F43] fill-[#FF9F43]'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>ง่ายมาก</span>
                  <span>ยากมาก</span>
                </div>
              </div>

              {/* Workload */}
              <div>
                <label className="block mb-3">
                  📚 ปริมาณงาน <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setWorkload(value)}
                      className="transition-transform hover:scale-110"
                    >
                      <BookOpen
                        className={`w-10 h-10 ${
                          value <= workload
                            ? 'text-[#6C5CE7] fill-[#6C5CE7]'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>น้อยมาก</span>
                  <span>มากมาก</span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block mb-3">เลือกแท็กที่เหมาะสม</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-full border transition-all ${
                        selectedTags.includes(tag)
                          ? 'bg-[#6C5CE7] text-white border-[#6C5CE7]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#6C5CE7]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* What to Know */}
              <div>
                <label className="block mb-2">
                  สิ่งที่ควรรู้ <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  บอกน้องๆ ว่าควรรู้อะไรก่อนลงวิชานี้ หรือสิ่งสำคัญที่ควรตระหนัก
                </p>
                <textarea
                  value={whatToKnow}
                  onChange={(e) => setWhatToKnow(e.target.value)}
                  placeholder="เช่น วิชานี้เน้นความเข้าใจมากกว่าท่องจำ..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] resize-none"
                />
              </div>

              {/* Pros and Cons */}
              <div>
                <label className="block mb-2">
                  ข้อดี / ข้อเสีย <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  บอกข้อดีและข้อเสียของวิชานี้
                </p>
                <textarea
                  value={prosAndCons}
                  onChange={(e) => setProsAndCons(e.target.value)}
                  placeholder="ข้อดี: อาจารย์สอนดี มี TA ช่วยเหลือ | ข้อเสีย: งานเยอะหน่อย..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] resize-none"
                />
              </div>

              {/* Tips */}
              <div>
                <label className="block mb-2">
                  Tips <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  แบ่งปันเทคนิคหรือคำแนะนำที่จะช่วยให้น้องๆ ผ่านวิชานี้ได้ดี
                </p>
                <textarea
                  value={tips}
                  onChange={(e) => setTips(e.target.value)}
                  placeholder="เช่น ทำการบ้านทุกครั้ง อย่าสะสมงาน..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          {step === 1 ? (
            <>
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!rating || !grade || !difficulty || !workload}
                className="px-6 py-3 bg-[#6C5CE7] hover:bg-[#5848C7] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ถัดไป
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={handleSubmit}
                disabled={!whatToKnow || !prosAndCons || !tips}
                className="px-6 py-3 bg-[#FF9F43] hover:bg-[#ff8c1f] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ส่งคำแนะนำ
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
