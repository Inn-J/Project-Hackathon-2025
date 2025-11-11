// src/components/MyWishlistPage.jsx
import { useState } from 'react';
import { Flame, MessageSquare, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

export function MyWishlistPage({ onCourseClick }) {
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [courses, setCourses] = useState([
    {
      courseCode: 'CS101',
      courseName: 'Introduction to Computer Science',
      difficulty: 3,
      guidanceCount: 45,
      personalNote: 'ต้องลงเทอม 1 เพื่อเรียน CS102 ในเทอม 2',
    },
    {
      courseCode: 'MATH201',
      courseName: 'Calculus II',
      difficulty: 5,
      guidanceCount: 67,
      personalNote: 'อาจารย์สมชาย สอนดี ต้องจองที่นั่ง',
    },
    {
      courseCode: 'CS202',
      courseName: 'Web Development',
      difficulty: 2,
      guidanceCount: 56,
      personalNote: 'น่าสนใจ เหมาะกับที่ชอบทำ side project',
    },
    {
      courseCode: 'PHY101',
      courseName: 'General Physics I',
      difficulty: 4,
      guidanceCount: 52,
      personalNote: '',
    },
  ]);

  const updatePersonalNote = (courseCode, note) => {
    setCourses(
      courses.map((course) =>
        course.courseCode === courseCode ? { ...course, personalNote: note } : course
      )
    );
  };

  const removeCourse = (courseCode) => {
    setCourses(courses.filter((course) => course.courseCode !== courseCode));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* <h2 className="mb-2">🔖 รายการวิชาที่บันทึกไว้</h2>
          <p className="text-gray-600">
            วิชาที่คุณสนใจและต้องการติดตาม ({courses.length} วิชา)
          </p>
        </div> */}

        {courses.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-md">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="mb-2">ยังไม่มีวิชาที่บันทึกไว้</h3>
            <p className="text-gray-600 mb-6">
              เริ่มค้นหาและบันทึกวิชาที่คุณสนใจเพื่อติดตามได้ที่นี่
            </p>
            <button className="px-6 py-3 bg-[#6C5CE7] hover:bg-[#5848C7] text-white rounded-lg transition-colors">
              เริ่มค้นหาวิชา
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => {
              const isExpanded = expandedCourse === course.courseCode;

              return (
                <div
                  key={course.courseCode}
                  className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Course Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-[#6C5CE7] mb-1">
                              {course.courseCode}
                            </div>
                            <h4 className="mb-3">{course.courseName}</h4>
                          </div>
                          <button
                            onClick={() => removeCourse(course.courseCode)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Remove from wishlist"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Info Row */}
                        <div className="flex items-center gap-6 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">ความยาก:</span>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Flame
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < course.difficulty
                                      ? 'text-[#FF9F43] fill-[#FF9F43]'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <MessageSquare className="w-4 h-4" />
                            <span>{course.guidanceCount} คำแนะนำ</span>
                          </div>
                        </div>

                        {/* Personal Note Preview */}
                        {!isExpanded && course.personalNote && (
                          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="text-xs text-amber-700 mb-1">
                              บันทึกส่วนตัว:
                            </div>
                            <p className="text-sm text-amber-900 line-clamp-1">
                              {course.personalNote}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => onCourseClick && onCourseClick(course.courseCode)}
                            className="flex-1 py-2.5 px-4 bg-[#00CEC9] hover:bg-[#00b8b3] text-white rounded-lg transition-colors"
                          >
                            ดูรายละเอียด
                          </button>
                          <button
                            onClick={() =>
                              setExpandedCourse(isExpanded ? null : course.courseCode)
                            }
                            className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
                          >
                            {isExpanded ? (
                              <>
                                ซ่อน <ChevronUp className="w-4 h-4" />
                              </>
                            ) : (
                              <>
                                บันทึกส่วนตัว <ChevronDown className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Personal Note Section */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-0">
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <label className="block text-sm text-amber-700 mb-2">
                          บันทึกส่วนตัว
                        </label>
                        <textarea
                          value={course.personalNote}
                          onChange={(e) =>
                            updatePersonalNote(course.courseCode, e.target.value)
                          }
                          placeholder="เพิ่มบันทึกส่วนตัวเกี่ยวกับวิชานี้ เช่น ทำไมอยากลง เทอมไหนควรลง..."
                          className="w-full h-24 px-3 py-2 bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] resize-none text-sm"
                        />
                        <p className="text-xs text-amber-600 mt-2">
                          💡 บันทึกนี้มีเฉพาะคุณเท่านั้นที่เห็น
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
