// src/components/HomePage.jsx
import { Search } from 'lucide-react';
import { CourseCard } from './CourseCard';
import { GuidanceCard } from './GuidanceCard';

export function HomePage({ onCourseClick, onSearch }) {
  const trendingCourses = [
    { code: 'CS101', name: 'Introduction to Computer Science', difficulty: 3, guidanceCount: 45 },
    { code: 'MATH201', name: 'Calculus II', difficulty: 5, guidanceCount: 67 },
    { code: 'ENG102', name: 'English for Communication', difficulty: 2, guidanceCount: 34 },
    { code: 'PHY101', name: 'General Physics I', difficulty: 4, guidanceCount: 52 },
    { code: 'CHEM101', name: 'General Chemistry', difficulty: 4, guidanceCount: 41 },
  ];

  const recentGuidance = [
    {
      userName: 'อาร์ม',
      isVerified: true,
      grade: 'A',
      tags: ['#เน้นเกรด', '#ตั้งใจทำงาน'],
      overallRating: 5,
      difficulty: 3,
      workload: 4,
      whatToKnow: 'วิชานี้เน้นความเข้าใจมากกว่าท่องจำ ต้องฝึกทำโจทย์เยอะๆ',
      prosAndCons: 'ข้อดี: อาจารย์สอนดี มี TA ช่วยเหลือ | ข้อเสีย: งานเยอะหน่อย',
      tips: 'ทำการบ้านทุกครั้ง อย่าสะสมงาน แล้วจะผ่านได้ไม่ยาก',
    },
    {
      userName: 'มินท์',
      isVerified: true,
      grade: 'B+',
      tags: ['#สายชิล', '#ชอบทำงานกลุ่ม'],
      overallRating: 4,
      difficulty: 2,
      workload: 3,
      whatToKnow: 'เป็นวิชาที่ต้องใช้ภาษาอังกฤษ แต่ไม่ยากมาก',
      prosAndCons: 'ข้อดี: บรรยากาศสนุก ได้พัฒนาทักษะการพูด | ข้อเสีย: บางครั้งต้อง present',
      tips: 'เข้าเรียนให้ครบ มีส่วนร่วมในชั้นเรียน',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-white mb-4">ค้นหาคำแนะนำจากรุ่นพี่</h2>
          <p className="text-lg mb-8 text-white/90">
            เลือกวิชาที่เหมาะกับคุณด้วยคำแนะนำจริงจากนักศึกษาคนอื่นๆ
          </p>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาวิชาที่ใช่…"
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-white text-gray-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl text-lg"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Trending Courses Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h3>🔥 วิชายอดนิยม</h3>
            <button className="text-[#6C5CE7] hover:text-[#5848C7]">
              ดูทั้งหมด →
            </button>
          </div>

          <div className="overflow-x-auto -mx-4 px-4 pb-4">
            <div className="flex gap-4 min-w-max">
              {trendingCourses.map((course) => (
                <div key={course.code} className="w-80 flex-shrink-0">
                  <CourseCard
                    courseCode={course.code}
                    courseName={course.name}
                    difficulty={course.difficulty}
                    guidanceCount={course.guidanceCount}
                    onClick={() => onCourseClick?.(course.code)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Guidance Section */}
        <section>
          <div className="mb-6">
            <h3>💬 คำแนะนำล่าสุด</h3>
            <p className="text-gray-600 mt-2">
              อัปเดตความคิดเห็นและประสบการณ์ใหม่ๆ จากรุ่นพี่
            </p>
          </div>

          <div className="grid gap-6 max-w-4xl">
            {recentGuidance.map((guidance, idx) => (
              <GuidanceCard key={idx} {...guidance} />
            ))}
          </div>

          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-[#6C5CE7] hover:bg-[#5848C7] text-white rounded-xl transition-colors">
              โหลดเพิ่มเติม
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
