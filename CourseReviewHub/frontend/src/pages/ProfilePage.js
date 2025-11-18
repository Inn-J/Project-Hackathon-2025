// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import MyReviewCard from '../components/MyReviewCard.js';
import { useAuth } from '../context/AuthContext.js';
import { ClockIcon } from '@heroicons/react/solid';
import './ProfilePage.css';
import apiClient from '../services/axiosConfig.js';
import { getAuth } from 'firebase/auth';
import 'firebase/auth';
import Header from '../components/Header.js';
import SettingsModal from '../components/SettingsModal.js';

// --- Helper Function แปลงวันที่ ---
const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (error) {
    return isoString;
  }
};

// --- Component ย่อย: ส่วนหัว Profile ---
function ProfileHeader({ currentUser, reviews }) {
  const username = currentUser?.username || 'N/A';
  const displayName = username !== 'N/A' ? username : currentUser?.email?.split('@')[0];
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const joinedDate = formatDate(currentUser?.created_at);
  const userRole = currentUser?.role || 'Member';
  const faculty = currentUser?.faculty || 'ไม่ระบุคณะ';
  const major = currentUser?.major || 'ไม่ระบุสาขา';
  const reviewCount = reviews.length;
  const helpfulCount = reviews.reduce((sum, r) => sum + (r.helpfulCount || 0), 0);
  const subjectsReviewed = new Set(reviews.map(r => r.course_id)).size;
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating_satisfaction || 0), 0) / reviews.length).toFixed(1)
      : '0';

  return (
    <>
      <Header />
      <div className="profile-header">
        <div className="profile-header-info">
          <div className="profile-avatar">{avatarInitial}</div>
          <div className="profile-details">
            <h2 className="profile-name">{displayName}</h2>
            <p className="profile-department">คณะ: {faculty}</p>
            <p className="profile-department">สาขา: {major}</p>
            <p className="profile-meta">เข้าร่วมเมื่อ {joinedDate}</p>
            <p className="profile-meta">สิทธิ์ผู้ใช้: {userRole}</p>
          </div>
        </div>
        <div className="profile-stats-grid">
          <div className="profile-stat-box">
            <div className="stat-number">{reviewCount}</div>
            <div className="stat-label">คำแนะนำ</div>
          </div>
          <div className="profile-stat-box">
            <div className="stat-number">{helpfulCount}</div>
            <div className="stat-label">คะแนนรีวิว</div>
          </div>
          <div className="profile-stat-box">
            <div className="stat-number">{subjectsReviewed}</div>
            <div className="stat-label">วิชาที่รีวิว</div>
          </div>
          <div className="profile-stat-box">
            <div className="stat-number">{averageRating}</div>
            <div className="stat-label">คะแนนเฉลี่ย</div>
          </div>
        </div>
      </div>
    </>
  );
}

// --- Component ย่อย: Badge ---
function BadgeCard({ title, description, unlocked, soon }) {
  const cardClass = `badge-card ${soon ? 'badge-soon' : unlocked ? 'badge-unlocked' : ''}`;
  return (
    <div className={cardClass}>
      <div className="badge-icon">{soon ? '🔒' : '🏆'}</div>
      <h4 className="badge-title">{title}</h4>
      <p className="badge-description">{description}</p>
      {unlocked && <span className="badge-status unlocked">✓ ปลดล็อกแล้ว</span>}
      {soon && <span className="badge-status soon">เร็วๆ นี้</span>}
    </div>
  );
}

// --- Component ย่อย: Activity ---
function ActivityItem({ icon, text, time }) {
  return (
    <div className="activity-item">
      <div className="activity-icon-wrapper">{icon}</div>
      <div>
        <p className="activity-text">{text}</p>
        <p className="activity-time">{time}</p>
      </div>
    </div>
  );
}

// --- Mockup Badges ---
const dummyBadges = [
  { id: 1, title: "ผู้ช่วยเหลือ", description: "ได้รับ 100+ helpful votes", unlocked: true, soon: false },
  { id: 2, title: "นักเขียนมือทอง", description: "เขียนคำแนะนำ 10+ ครั้ง", unlocked: true, soon: false },
  { id: 3, title: "ตรงประเด็น", description: "คะแนนเฉลี่ย 4.5+ ดาว", unlocked: true, soon: false },
  { id: 4, title: "นักรีวิว", description: "เขียนคำแนะนำ 20+ ครั้ง", unlocked: false, soon: false },
  { id: 5, title: "นักสำรวจ", description: "รีวิววิชาจาก 3+ คณะ", unlocked: true, soon: false },
  { id: 6, title: "ผู้มีอิทธิพล", description: "คำแนะนำมีคนโหวต 500+ helpful", unlocked: false, soon: false }

];

// --- หน้าหลัก Profile ---
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('achievements');
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [myReplies, setMyReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        setError(null);

        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) throw new Error('ผู้ใช้ยังไม่ได้ล็อกอิน');

        // ดึง Firebase ID Token
        const token = await user.getIdToken(true);

        // --- ดึงข้อมูลโปรไฟล์ ---
        const profileRes = await apiClient.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileData(profileRes.data);

        // --- ดึงรีวิวของผู้ใช้ ---
        const role = currentUser?.role;
        if (role === 'INSTRUCTOR' || role === 'instructor') {
          // ดึง "รีวิวที่ฉันตอบกลับ"
          const repliesRes = await apiClient.get('/reviews/replies/my', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMyReplies(repliesRes.data?.replies || []);
          setReviews([]); // เคลียร์ reviews เดิม (กันสับสน)
        } else {
          // ดึง "รีวิวที่ฉันเขียนเอง"
          const reviewsRes = await apiClient.get('/reviews/my', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setReviews(reviewsRes.data);
          setMyReplies([]);
        }

      } catch (err) {
        console.error('Failed to fetch profile or reviews:', err);
        setError('ไม่สามารถโหลดข้อมูลโปรไฟล์หรือรีวิวได้');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [currentUser]);

  const isInstructor =
    profileData?.role === 'INSTRUCTOR' || profileData?.role === 'instructor';

  const headerReviews = isInstructor
    ? (myReplies || []).map((rep) => ({
      // ดึงข้อมูลรีวิวจาก nested reviews ใน myReplies
      ...(rep.reviews || {}),
      rating_satisfaction: rep.reviews?.rating_satisfaction ?? 0,
      helpfulCount: rep.reviews?.helpfulCount ?? 0,
      course_id: rep.reviews?.course_id,
    }))
    : reviews;


  const stats = profileData?.stats;
  const badges = profileData?.badges || dummyBadges; // ถ้าไม่มี badges ให้ใช้ mockup
  const activities = profileData?.activities;

  return (
    <div className="profile-page-container">
      {currentUser && <ProfileHeader currentUser={currentUser} reviews={reviews} />}

      <div className="profile-content-wrapper">
        <div className="profile-tabs">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
          >
            {profileData?.role === "INSTRUCTOR" || profileData?.role === "instructor"
              ? "รีวิวที่ฉันตอบกลับ"
              : "คำแนะนำของฉัน"}
          </button>

          {profileData && profileData.role !== 'INSTRUCTOR' && profileData.role !== 'instructor' && (
            <button
              onClick={() => setActiveTab('achievements')}
              className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
            >
              ความสำเร็จ
            </button>
          )}
          <button
            onClick={() => setActiveTab('settings')}
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          >
            ตั้งค่า
          </button>
        </div>

        {isLoading && <div className="tab-placeholder"><p>กำลังโหลดข้อมูล...</p></div>}
        {error && <div className="tab-placeholder"><p style={{ color: 'red' }}>{error}</p></div>}

        {!isLoading && !error && profileData && (
          <>
            {activeTab === 'achievements' && (
              <div className="tab-content-grid">
                <div className="badge-section">
                  <h3 className="section-title">🏆 ความสำเร็จของคุณ</h3>
                  <p className="section-description">แบดจ์และความสำเร็จที่คุณได้รับจากการช่วยเหลือชุมชน</p>
                  <div className="badge-grid">
                    {badges && badges.length > 0
                      ? badges.map((badge) => (
                        <BadgeCard
                          key={badge.id}
                          title={badge.title}
                          description={badge.description}
                          unlocked={badge.unlocked}
                          soon={badge.soon || false}
                        />
                      ))
                      : <p>ยังไม่มีความสำเร็จ</p>}
                  </div>
                </div>

                <div className="activity-section">
                  <h3 className="section-title">📊 กิจกรรมล่าสุด</h3>
                  <div className="activity-feed">
                    {activities && activities.length > 0
                      ? activities.map((activity) => (
                        <ActivityItem
                          key={activity.id}
                          icon={<ClockIcon style={{ height: 20, width: 20, color: '#6D28D9' }} />}
                          text={activity.text}
                          time={formatDate(activity.createdAt)}
                        />
                      ))
                      : <p>ยังไม่มีกิจกรรมล่าสุด</p>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-tab">
                {isInstructor ? (
                  <>
                    {myReplies.length > 0 ? (
                      myReplies.map((rep) => (
                        <MyReviewCard
                          key={rep.id}
                          review={{
                            ...(rep.reviews || {}),
                            instructor_reply: rep.reply_text,
                            instructorName: profileData.username,
                          }}
                          currentUser={currentUser}
                        // ถ้าจะเพิ่มปุ่มแก้ไข/ลบ reply ค่อยใส่ prop เพิ่มทีหลังได้
                        />
                      ))
                    ) : (
                      <p>คุณยังไม่ได้ตอบกลับรีวิวใดๆ</p>
                    )}
                  </>
                ) : (
                  <>
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <MyReviewCard
                          key={review.id}
                          review={review}
                          currentUser={currentUser}
                          onEdit={(r) => console.log('Edit review:', r)}
                          onDelete={(id) =>
                            setReviews((prev) =>
                              prev.filter((rev) => rev.id !== id)
                            )
                          }
                        />
                      ))
                    ) : (
                      <p>คุณยังไม่ได้เขียนรีวิว</p>
                    )}
                  </>
                )}
              </div>
            )}


            {activeTab === 'settings' && (
              <div className="tab-placeholder">
                <h2 className="section-title">ตั้งค่าโปรไฟล์</h2>
                <p className="section-description">
                  นี่คือข้อมูลโปรไฟล์ปัจจุบันของคุณ
                </p>

                <div className="settings-display">
                  <div className="setting-item">
                    <strong>ชื่อผู้ใช้:</strong>
                    <span>{profileData.username || 'N/A'}</span>
                  </div>
                  <div className="setting-item">
                    <strong>คณะ:</strong>
                    <span>{profileData.faculty || 'ไม่ระบุ'}</span>
                  </div>
                  <div className="setting-item">
                    <strong>สาขา:</strong>
                    <span>{profileData.major || 'ไม่ระบุ'}</span>
                  </div>
                </div>

                <button
                  className="edit-profile-btn"
                  onClick={() => setIsModalOpen(true)}
                >
                  แก้ไขโปรไฟล์
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {profileData && (
        <SettingsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userData={profileData}
          onUpdate={(updatedData) => {
            setProfileData(updatedData);
          }}
        />
      )}
    </div>
  );
}
