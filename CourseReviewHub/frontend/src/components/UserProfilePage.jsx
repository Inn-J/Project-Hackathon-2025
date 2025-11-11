// src/components/UserProfilePage.jsx
import { useState } from "react";
import {
  User,
  Edit2,
  Mail,
  Calendar,
  Award,
  MessageSquare,
  ThumbsUp,
  TrendingUp,
  Settings,
  BarChart3,
  Flag,
} from "lucide-react";
import { GuidanceCard } from "./GuidanceCard";
import { ReportModal } from "./ReportModal";
import { EditProfileModal } from "./EditProfileModal";

export function UserProfilePage({ onCourseClick }) {
  const [activeTab, setActiveTab] = useState("guidance"); // 'guidance' | 'stats' | 'settings' | 'reports'
  const [isEditing, setIsEditing] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [userProfile, setUserProfile] = useState({
    name: "อาร์ม วิทยากร",
    username: "@arm_review",
    email: "arm.wittaya@cmu.ac.th",
    avatar: "",
    faculty: "คณะวิศวกรรมศาสตร์",
    major: "วิศวกรรมคอมพิวเตอร์",
    year: 3,
    joinedDate: "มกราคม 2024",
    bio: "ชอบแชร์ประสบการณ์เรียน เน้นเกรดแต่ก็ไม่ลืมสนุก 🎓",
    isVerified: true,
  });

  const stats = {
    totalGuidance: 12,
    helpfulVotes: 156,
    coursesReviewed: 12,
    avgRating: 4.5,
  };

  const myGuidances = [
    {
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
      userName: "อาร์ม",
      isVerified: true,
      grade: "A",
      tags: ["#เน้นเกรด", "#ตั้งใจทำงาน"],
      overallRating: 5,
      difficulty: 3,
      workload: 4,
      whatToKnow:
        "วิชานี้เน้นความเข้าใจมากกว่าท่องจำ ต้องฝึกทำโจทย์เยอะๆ",
      prosAndCons:
        "ข้อดี: อาจารย์สอนดี มี TA ช่วยเหลือ | ข้อเสีย: งานเยอะหน่อย",
      tips: "ทำการบ้านทุกครั้ง อย่าสะสมงาน แล้วจะผ่านได้ไม่ยาก",
      date: "15 ม.ค. 2025",
      helpfulCount: 45,
    },
    {
      courseCode: "MATH201",
      courseName: "Calculus II",
      userName: "อาร์ม",
      isVerified: true,
      grade: "B+",
      tags: ["#เน้นเกรด", "#ต้องฝึกเยอะ"],
      overallRating: 4,
      difficulty: 5,
      workload: 5,
      whatToKnow: "ยากมาก ต้องมีพื้นฐาน Calculus I ดีก่อน",
      prosAndCons:
        "ข้อดี: ได้ความรู้เยอะ | ข้อเสีย: ยากและใช้เวลาเตรียมตัวสอบเยอะ",
      tips: "ทำโจทย์ทุกวัน ไปพบอาจารย์บ่อยๆ ถ้าไม่เข้าใจ",
      date: "10 ม.ค. 2025",
      helpfulCount: 38,
    },
  ];

  const achievements = [
    { icon: "🏆", title: "ผู้ช่วยเหลือ", description: "ได้รับ 100+ helpful votes", earned: true },
    { icon: "⭐", title: "นักเขียนมือทอง", description: "เขียนคำแนะนำ 10+ ครั้ง", earned: true },
    { icon: "🎯", title: "ตรงประเด็น", description: "คะแนนเฉลี่ย 4.5+ ดาว", earned: true },
    { icon: "🔥", title: "นักรีวิว", description: "เขียนคำแนะนำ 20+ ครั้ง", earned: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] rounded-2xl p-8 text-white mb-6 shadow-lg">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-[#6C5CE7]">
                  {userProfile.avatar ? (
                    <img
                      src={userProfile.avatar}
                      alt={userProfile.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12" />
                  )}
                {/* </div>
                {userProfile.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#00CEC9] rounded-full flex items-center justify-center border-4 border-white">
                    <span className="text-sm">✓</span>
                  </div>
                )}
              </div> */}

              {/* Info */}
              <div>
                <h2 className="text-white mb-1">{userProfile.name}</h2>
                <p className="text-white/80 mb-3">{userProfile.username}</p>
                <div className="flex flex-wrap gap-3 text-sm text-white/90">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    {userProfile.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    เข้าร่วมเมื่อ {userProfile.joinedDate}
                  </span>
                </div>
                <div className="mt-3 text-white/90">
                  <p>{userProfile.faculty} • {userProfile.major}</p>
                  <p>ชั้นปีที่ {userProfile.year}</p>
                </div>
                {userProfile.bio && (
                  <p className="mt-3 text-white/95">{userProfile.bio}</p>
                )}
              </div>
            </div>

            {/* Report/Edit Button */}
            {!hasReported ? (
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors"
              >
                <Flag className="w-4 h-4" />
                <span>รายงาน</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>แก้ไขข้อมูล</span>
              </button>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="mb-1">{stats.totalGuidance}</div>
              <div className="text-sm text-white/80">คำแนะนำ</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <div className="mb-1">{stats.helpfulVotes}</div>
              <div className="text-sm text-white/80">ความช่วยเหลือ</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-5 h-5" />
              </div>
              <div className="mb-1">{stats.coursesReviewed}</div>
              <div className="text-sm text-white/80">วิชาที่รีวิว</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="mb-1">{stats.avgRating.toFixed(1)} ⭐</div>
              <div className="text-sm text-white/80">คะแนนเฉลี่ย</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("guidance")}
              className={`flex-1 px-6 py-4 transition-colors ${activeTab === "guidance" ? "bg-[#6C5CE7] text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <div className="flex items-center justify-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <span>คำแนะนำของฉัน</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex-1 px-6 py-4 transition-colors ${activeTab === "stats" ? "bg-[#6C5CE7] text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <div className="flex items-center justify-center gap-2">
                <Award className="w-5 h-5" />
                <span>ความสำเร็จ</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`flex-1 px-6 py-4 transition-colors ${activeTab === "reports" ? "bg-[#6C5CE7] text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <div className="flex items-center justify-center gap-2">
                <BarChart3 className="w-5 h-5" />
                <span>รายงาน</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 px-6 py-4 transition-colors ${activeTab === "settings" ? "bg-[#6C5CE7] text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <div className="flex items-center justify-center gap-2">
                <Settings className="w-5 h-5" />
                <span>ตั้งค่า</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "guidance" && (
            <div>
              <div className="mb-6">
                <h3>คำแนะนำทั้งหมด ({myGuidances.length})</h3>
                <p className="text-gray-600 mt-2">คำแนะนำที่คุณเขียนไว้สำหรับรุ่นน้อง</p>
              </div>

              <div className="space-y-6">
                {myGuidances.map((guidance, idx) => (
                  <div key={idx}>
                    {/* Course Info Header */}
                    <button
                      onClick={() => onCourseClick && onCourseClick(guidance.courseCode)}
                      className="mb-3 flex items-center gap-2 text-[#6C5CE7] hover:text-[#5848C7] transition-colors"
                    >
                      <span className="font-medium">{guidance.courseCode}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-700">{guidance.courseName}</span>
                    </button>

                    {/* Guidance Card */}
                    <div className="relative">
                      <GuidanceCard {...guidance} />
                      <div className="mt-3 flex items-center justify-between text-sm text-gray-500 px-2">
                        <span>{guidance.date}</span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          {guidance.helpfulCount} คนว่ามีประโยชน์
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "stats" && (
            <div>
              <div className="mb-6">
                <h3>🏆 ความสำเร็จของคุณ</h3>
                <p className="text-gray-600 mt-2">แบดจ์และความสำเร็จที่คุณได้รับจากการช่วยเหลือชุมชน</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {achievements.map((achievement, idx) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      achievement.earned
                        ? "bg-gradient-to-br from-[#6C5CE7]/5 to-[#A29BFE]/5 border-[#6C5CE7]/30"
                        : "bg-gray-50 border-gray-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="mb-1">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        {achievement.earned && (
                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-[#00CEC9]/10 text-[#00CEC9] rounded-full text-xs">
                            <span>✓</span>
                            <span>ปลดล็อกแล้ว</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Activity List */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h4 className="mb-4">📊 กิจกรรมล่าสุด</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#6C5CE7]/10 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-[#6C5CE7]" />
                      </div>
                      <div>
                        <div className="mb-1">เขียนคำแนะนำสำหรับ CS101</div>
                        <div className="text-sm text-gray-500">15 ม.ค. 2025</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#00CEC9]/10 rounded-full flex items-center justify-center">
                        <ThumbsUp className="w-5 h-5 text-[#00CEC9]" />
                      </div>
                      <div>
                        <div className="mb-1">ได้รับ helpful vote 5 ครั้ง</div>
                        <div className="text-sm text-gray-500">14 ม.ค. 2025</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FF9F43]/10 rounded-full flex items-center justify-center">
                        <Award className="w-5 h-5 text-[#FF9F43]" />
                      </div>
                      <div>
                        <div className="mb-1">ปลดล็อกแบดจ์ "นักเขียนมือทอง"</div>
                        <div className="text-sm text-gray-500">12 ม.ค. 2025</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div>
              <div className="mb-6">
                <h3>📊 รายงานสถิติ</h3>
                <p className="text-gray-600 mt-2">สรุปภาพรวมและข้อมูลเชิงลึกเกี่ยวกับการมีส่วนร่วมของคุณ</p>
              </div>

              {/* Overview Stats */}
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-[#6C5CE7]/10 to-[#A29BFE]/10 border border-[#6C5CE7]/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-[#6C5CE7]">ยอดดูทั้งหมด</div>
                    <TrendingUp className="w-5 h-5 text-[#6C5CE7]" />
                  </div>
                  <div className="text-3xl mb-1">1,247</div>
                  <div className="text-sm text-gray-600">
                    <span className="text-green-600">↑ 12%</span> จากเดือนที่แล้ว
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#00CEC9]/10 to-[#00CEC9]/5 border border-[#00CEC9]/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-[#00CEC9]">อัตราความช่วยเหลือ</div>
                    <ThumbsUp className="w-5 h-5 text-[#00CEC9]" />
                  </div>
                  <div className="text-3xl mb-1">87%</div>
                  <div className="text-sm text-gray-600">ดีกว่าค่าเฉลี่ย 15%</div>
                </div>

                <div className="bg-gradient-to-br from-[#FF9F43]/10 to-[#FF9F43]/5 border border-[#FF9F43]/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-[#FF9F43]">การตอบกลับเฉลี่ย</div>
                    <BarChart3 className="w-5 h-5 text-[#FF9F43]" />
                  </div>
                  <div className="text-3xl mb-1">13</div>
                  <div className="text-sm text-gray-600">ต่อหนึ่งคำแนะนำ</div>
                </div>
              </div>

              {/* Detailed Analytics */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="mb-4">🔥 คำแนะนำยอดนิยม</h4>
                  <div className="space-y-3">
                    {[
                      { code: "CS101", name: "Introduction to Computer Science", helpful: 45 },
                      { code: "MATH201", name: "Calculus II", helpful: 38 },
                      { code: "PHY101", name: "General Physics I", helpful: 29 },
                    ].map((item) => (
                      <div key={item.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="mb-1">{item.code}</div>
                          <div className="text-sm text-gray-500">{item.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[#6C5CE7]">{item.helpful}</div>
                          <div className="text-xs text-gray-500">helpful</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="mb-4">📈 การกระจายเกรด</h4>
                  <div className="space-y-3">
                    {[
                      { label: "A", pct: 42, color: "bg-green-500" },
                      { label: "B+", pct: 25, color: "bg-blue-500" },
                      { label: "B", pct: 17, color: "bg-[#6C5CE7]" },
                      { label: "C+", pct: 10, color: "bg-yellow-500" },
                      { label: "C หรือต่ำกว่า", pct: 6, color: "bg-red-500" },
                    ].map((row) => (
                      <div key={row.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{row.label}</span>
                          <span className="text-sm text-gray-600">{row.pct}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`${row.color} h-2 rounded-full`} style={{ width: `${row.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="mb-4">🏷️ แท็กที่ใช้บ่อย</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { tag: "#เน้นเกรด", count: 8, cls: "bg-[#6C5CE7]/10 text-[#6C5CE7] border-[#6C5CE7]/20" },
                      { tag: "#ตั้งใจทำงาน", count: 6, cls: "bg-[#00CEC9]/10 text-[#00CEC9] border-[#00CEC9]/20" },
                      { tag: "#ต้องฝึกเยอะ", count: 5, cls: "bg-[#FF9F43]/10 text-[#FF9F43] border-[#FF9F43]/20" },
                      { tag: "#สายชิล", count: 3, cls: "bg-gray-100 text-gray-700 border-gray-200" },
                      { tag: "#มีงานกลุ่ม", count: 2, cls: "bg-gray-100 text-gray-700 border-gray-200" },
                    ].map((t) => (
                      <span key={t.tag} className={`px-4 py-2 rounded-full text-sm border ${t.cls}`}>
                        {t.tag} <span className="ml-1">{t.count}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="mb-4">💫 ผลกระทบของคุณ</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">👥</span>
                      </div>
                      <div>
                        <div className="mb-1">ช่วยเหลือนักศึกษา</div>
                        <div className="text-2xl text-[#6C5CE7]">1,247 คน</div>
                        <div className="text-sm text-gray-500">อ่านคำแนะนำของคุณ</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">⏱️</span>
                      </div>
                      <div>
                        <div className="mb-1">ประหยัดเวลา</div>
                        <div className="text-2xl text-[#00CEC9]">~40 ชม.</div>
                        <div className="text-sm text-gray-500">โดยประมาณสำหรับนักศึกษา</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-3xl">
              <div className="mb-6">
                <h3>⚙️ ตั้งค่าบัญชี</h3>
                <p className="text-gray-600 mt-2">จัดการข้อมูลส่วนตัวและการแจ้งเตือน</p>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="mb-4">ข้อมูลส่วนตัว</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">ชื่อที่แสดง</label>
                      <input
                        type="text"
                        defaultValue={userProfile.name}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Bio</label>
                      <textarea
                        defaultValue={userProfile.bio}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] resize-none"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">อีเมล</label>
                      <input
                        type="email"
                        defaultValue={userProfile.email}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                      />
                    </div>
                  </div>
                  <button className="mt-4 px-6 py-2 bg-[#6C5CE7] hover:bg-[#5848C7] text-white rounded-lg transition-colors">
                    บันทึกการเปลี่ยนแปลง
                  </button>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="mb-4">การแจ้งเตือน</h4>
                  <div className="space-y-4">
                    {[
                      { title: "แจ้งเตือนเมื่อได้รับ helpful vote", desc: "รับการแจ้งเตือนเมื่อมีคนกด helpful ในคำแนะนำของคุณ" },
                      { title: "แจ้งเตือนคำแนะนำใหม่", desc: "รับการแจ้งเตือนเมื่อมีคำแนะนำใหม่สำหรับวิชาที่บันทึกไว้" },
                      { title: "แจ้งเตือนความสำเร็จใหม่", desc: "รับการแจ้งเตือนเมื่อปลดล็อกแบดจ์ใหม่" },
                    ].map((row) => (
                      <label key={row.title} className="flex items-center justify-between cursor-pointer">
                        <div>
                          <div className="mb-1">{row.title}</div>
                          <div className="text-sm text-gray-500">{row.desc}</div>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-[#6C5CE7] rounded focus:ring-[#6C5CE7]" />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="mb-4">ความเป็นส่วนตัว</h4>
                  <div className="space-y-4">
                    {[
                      { title: "แสดงโปรไฟล์สาธารณะ", desc: "ให้ผู้อื่นสามารถดูโปรไฟล์และคำแนะนำของคุณได้" },
                      { title: "แสดงสถิติ", desc: "แสดงจำนวนคำแนะนำและ helpful votes" },
                    ].map((row) => (
                      <label key={row.title} className="flex items-center justify-between cursor-pointer">
                        <div>
                          <div className="mb-1">{row.title}</div>
                          <div className="text-sm text-gray-500">{row.desc}</div>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-[#6C5CE7] rounded focus:ring-[#6C5CE7]" />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <h4 className="text-red-700 mb-2">Danger Zone</h4>
                  <p className="text-sm text-red-600 mb-4">การดำเนินการเหล่านี้ไม่สามารถย้อนกลับได้</p>
                  <button className="px-6 py-2 bg-white border border-red-300 text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                    ลบบัญชี
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        userName={userProfile.name}
        onSubmit={() => {
          setHasReported(true);
          setIsReportModalOpen(false);
        }}
      />

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentProfile={userProfile}
        onSave={(updatedProfile) => {
          setUserProfile({ ...userProfile, ...updatedProfile });
          setIsEditModalOpen(false);
        }}
      />
    </div>
  );
}
