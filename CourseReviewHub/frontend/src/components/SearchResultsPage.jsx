// src/components/SearchResultsPage.jsx
import { useState } from 'react';
import { Filter, TrendingUp, Clock, Flame, BookOpen } from 'lucide-react';
import { CourseCard } from './CourseCard';

export function SearchResultsPage({ searchQuery = '', onCourseClick }) {
  const [sortBy, setSortBy] = useState('topRated');
  const [difficultyFilter, setDifficultyFilter] = useState([]);
  const [workloadFilter, setWorkloadFilter] = useState([]);

  const courses = [
    { code: 'CS101', name: 'Introduction to Computer Science', difficulty: 3, guidanceCount: 45 },
    { code: 'CS102', name: 'Data Structures and Algorithms', difficulty: 5, guidanceCount: 38 },
    { code: 'CS201', name: 'Database Systems', difficulty: 4, guidanceCount: 29 },
    { code: 'CS202', name: 'Web Development', difficulty: 2, guidanceCount: 56 },
    { code: 'CS301', name: 'Artificial Intelligence', difficulty: 5, guidanceCount: 42 },
    { code: 'CS302', name: 'Mobile Application Development', difficulty: 3, guidanceCount: 33 },
    { code: 'MATH201', name: 'Calculus II', difficulty: 5, guidanceCount: 67 },
    { code: 'PHY101', name: 'General Physics I', difficulty: 4, guidanceCount: 52 },
  ];

  const sortOptions = [
    { value: 'topRated', label: 'คะแนนสูงสุด', icon: TrendingUp },
    { value: 'latest', label: 'ล่าสุด', icon: Clock },
    { value: 'easiest', label: 'ง่ายที่สุด', icon: Flame },
    { value: 'hardest', label: 'ยากที่สุด', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Summary */}
        <div className="mb-6">
          <h3 className="mb-2">
            {searchQuery ? `ผลการค้นหา: "${searchQuery}"` : 'รายวิชาทั้งหมด'}
          </h3>
          <p className="text-gray-600">พบ {courses.length} รายวิชา</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-md sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-[#6C5CE7]" />
                <h4>ตัวกรอง</h4>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-3">เรียงตาม</div>
                <div className="space-y-2">
                  {sortOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          sortBy === option.value
                            ? 'bg-[#6C5CE7] text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-3">ระดับความยาก</div>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={difficultyFilter.includes(level)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDifficultyFilter([...difficultyFilter, level]);
                          } else {
                            setDifficultyFilter(difficultyFilter.filter((l) => l !== level));
                          }
                        }}
                        className="w-4 h-4 text-[#6C5CE7] rounded focus:ring-[#6C5CE7]"
                      />
                      <div className="flex gap-0.5">
                        {[...Array(level)].map((_, i) => (
                          <Flame key={i} className="w-3.5 h-3.5 text-[#FF9F43] fill-[#FF9F43]" />
                        ))}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Workload Filter (UI เท่านั้น ณ ตอนนี้) */}
              <div>
                <div className="text-sm text-gray-600 mb-3">ปริมาณงาน</div>
                <div className="space-y-2">
                  {[
                    { range: [1, 2], label: 'น้อย' },
                    { range: [3], label: 'ปานกลาง' },
                    { range: [4, 5], label: 'มาก' },
                  ].map((option) => (
                    <label key={option.label} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-[#6C5CE7] rounded focus:ring-[#6C5CE7]"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWorkloadFilter([...workloadFilter, option.label]);
                          } else {
                            setWorkloadFilter(workloadFilter.filter((l) => l !== option.label));
                          }
                        }}
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setSortBy('topRated');
                  setDifficultyFilter([]);
                  setWorkloadFilter([]);
                }}
                className="w-full mt-6 py-2 text-sm text-[#6C5CE7] hover:bg-[#F0EEFF] rounded-lg transition-colors"
              >
                รีเซ็ตตัวกรอง
              </button>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            <div className="grid sm:grid-cols-2 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.code}
                  courseCode={course.code}
                  courseName={course.name}
                  difficulty={course.difficulty}
                  guidanceCount={course.guidanceCount}
                  onClick={() => onCourseClick && onCourseClick(course.code)}
                />
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <button className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl transition-colors shadow-sm">
                โหลดเพิ่มเติม
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
