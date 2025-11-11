// src/components/CourseDetailPage.jsx
import { useState } from 'react';
import { Bookmark, Plus, Flame, BookOpen, GraduationCap } from 'lucide-react';
import { GuidanceCard } from './GuidanceCard';

export function CourseDetailPage({ courseCode, onWriteGuidanceClick }) {
  const [gradeFilter, setGradeFilter] = useState('all');
  const [isWishlisted, setIsWishlisted] = useState(false);

  const courseData = {
    code: 'CS101',
    name: 'Introduction to Computer Science',
    credits: 3,
    avgDifficulty: 3,
    avgWorkload: 4,
    topTags: ['#เข้าใจง่าย', '#ต้องฝึกเยอะ', '#อาจารย์สอนดี', '#มีงานกลุ่ม'],
    instructor: 'ผศ.ดร.สมชาย ใจดี',
    instructorNote: 'วิชานี้เน้นพื้นฐานการเขียนโปรแกรม เหมาะสำหรับผู้เริ่มต้น มีแล็บทุกสัปดาห์',
  };

  const guidances = [
    {
      userName: 'อาร์ม',
      isVerified: true,
      grade: 'A',
      tags: ['#เน้นเกรด', '#ตั้งใจทำงาน'],
      overallRating: 5,
      difficulty: 3,
      workload: 4,
      whatToKnow:
        'วิชานี้เน้นความเข้าใจมากกว่าท่องจำ ต้องฝึกทำโจทย์เยอะๆ เพราะสอบจะมีโจทย์ใหม่ๆ ที่ต้องใช้ logic',
      prosAndCons:
        'ข้อดี: อาจารย์สอนดี TA ช่วยเหลือดีมาก มี slide ครบ | ข้อเสีย: งานแล็บเยอะหน่อย บางทีต้องใช้เวลานานกว่าจะเข้าใจ',
      tips:
        'ทำการบ้านทุกครั้ง อย่าสะสมงาน ถ้ามีปัญหาให้ไปถาม TA เลย เค้าช่วยดีมาก ก่อนสอบให้ทำโจทย์เก่าๆ เยอะๆ',
    },
    {
      userName: 'มินท์',
      isVerified: true,
      grade: 'B+',
      tags: ['#สายชิล', '#มีงานเยอะ'],
      overallRating: 4,
      difficulty: 4,
      workload: 5,
      whatToKnow:
        'ถ้าไม่เคยเขียนโปรแกรมมาก่อนอาจจะเครียดหน่อย ต้องใช้เวลาศึกษาเพิ่ม',
      prosAndCons:
        'ข้อดี: ได้ทักษะที่เป็นประโยชน์มาก เนื้อหาใช้ได้จริง | ข้อเสีย: งานเยอะ ใช้เวลาทำนานมาก',
      tips:
        'เริ่มทำการบ้านตั้งแต่ได้รับ อย่ารอจนถึงกำหนดส่ง หาเพื่อนทำงานด้วยจะช่วยได้เยอะ',
    },
    {
      userName: 'พีท',
      isVerified: false,
      grade: 'C+',
      tags: ['#สายชิล', '#ขาดเรียนบ่อย'],
      overallRating: 3,
      difficulty: 4,
      workload: 4,
      whatToKnow:
        'วิชานี้ต้องเข้าเรียนให้ครบ เพราะอาจารย์สอนอธิบายละเอียดกว่าใน slide',
      prosAndCons:
        'ข้อดี: เนื้อหาน่าสนใจ | ข้อเสีย: ถ้าไม่เข้าเรียนจะตามไม่ทัน',
      tips: 'อย่าขาดเรียน และทำการบ้านให้ครบ',
    },
  ];

  const filteredGuidances = guidances.filter((g) => {
    if (gradeFilter === 'high') return ['A', 'B+', 'B'].includes(g.grade);
    if (gradeFilter === 'low') return ['C+', 'C', 'D', 'F'].includes(g.grade);
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="bg-white rounded-xl p-8 shadow-md mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl text-[#6C5CE7]">{courseData.code}</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                  {courseData.credits} หน่วยกิต
                </span>
              </div>
              <h2 className="mb-1">{courseData.name}</h2>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                  isWishlisted
                    ? 'bg-[#6C5CE7] text-white border-[#6C5CE7]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#6C5CE7]'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isWishlisted ? 'fill-white' : ''}`} />
                <span>{isWishlisted ? 'บันทึกแล้ว' : 'บันทึก'}</span>
              </button>

              <button
                onClick={onWriteGuidanceClick}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#FF9F43] hover:bg-[#ff8c1f] text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>เขียนคำแนะนำ</span>
              </button>
            </div>
          </div>

          {/* Summary Section */}
          <div className="grid grid-cols-2 gap-8 py-6 border-y border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-[#FF9F43]" />
                <span className="text-gray-600">ความยากเฉลี่ย</span>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Flame
                    key={i}
                    className={`w-6 h-6 ${
                      i < courseData.avgDifficulty
                        ? 'text-[#FF9F43] fill-[#FF9F43]'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-[#6C5CE7]" />
                <span className="text-gray-600">ปริมาณงานเฉลี่ย</span>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <BookOpen
                    key={i}
                    className={`w-6 h-6 ${
                      i < courseData.avgWorkload
                        ? 'text-[#6C5CE7] fill-[#6C5CE7]'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Top Tags */}
          <div className="mt-6">
            <div className="text-sm text-gray-600 mb-3">แท็กยอดนิยม</div>
            <div className="flex flex-wrap gap-2">
              {courseData.topTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-[#F0EEFF] text-[#6C5CE7] rounded-full border border-[#E0DCFF]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Instructor Note */}
        <div className="bg-gradient-to-r from-[#00CEC9]/10 to-[#00CEC9]/5 border border-[#00CEC9]/20 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#00CEC9] rounded-full flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="mb-1">ผู้สอน: {courseData.instructor}</div>
              <p className="text-gray-700">{courseData.instructorNote}</p>
            </div>
          </div>
        </div>

        {/* Guidance Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3>💬 คำแนะนำจากรุ่นพี่</h3>
            <div className="text-sm text-gray-600">
              {filteredGuidances.length} คำแนะนำ
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setGradeFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                gradeFilter === 'all'
                  ? 'bg-[#6C5CE7] text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#6C5CE7]'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setGradeFilter('high')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                gradeFilter === 'high'
                  ? 'bg-[#6C5CE7] text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#6C5CE7]'
              }`}
            >
              A/B+
            </button>
            <button
              onClick={() => setGradeFilter('low')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                gradeFilter === 'low'
                  ? 'bg-[#6C5CE7] text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#6C5CE7]'
              }`}
            >
              C/D/F
            </button>
          </div>

          {/* Guidance List */}
          <div className="space-y-6">
            {filteredGuidances.map((guidance, idx) => (
              <GuidanceCard key={idx} {...guidance} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
