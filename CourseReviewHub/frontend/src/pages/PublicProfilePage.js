// (โค้ด (ข้อความธรรมดา) ของไฟล์ใหม่: frontend/src/pages/PublicProfilePage.jsx)

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // ⬅️ (สำคัญ)
import ReviewCard from '../components/ReviewCard.js'; // ⬅️ (สำคัญ) ใช้การ์ดสาธารณะ
import { useAuth } from '../context/AuthContext.js';
import { ClockIcon } from '@heroicons/react/solid';
import './ProfilePage.css'; // (ใช้ CSS เดียวกันเป๊ะ!)
import apiClient from '../services/axiosConfig.js';
import Header from '../components/Header'; // ⬅️ (เรียก Header)

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
// (Component นี้เหมือนใน ProfilePage.jsx ครับ)
function ProfileHeader({ profileUser, reviews }) {
  const username = profileUser?.username || 'N/A';
  // (เราไม่มี email, เลยใช้ username เป็นหลัก)
  const displayName = username; 
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const joinedDate = formatDate(profileUser?.created_at);
  const userRole = profileUser?.role || 'Member';
const faculty = profileUser?.faculty || 'ไม่ระบุคณะ';
const major = profileUser?.major || 'ไม่ระบุสาขา';

  // (โค้ดคำนวณสถิติ - เหมือนเดิม)
  const reviewCount = reviews.length;
  const helpfulCount = reviews.reduce((sum, r) => sum + (r.helpfulCount || 0), 0);
  const subjectsReviewed = new Set(reviews.map(r => r.course_id)).size;
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating_satisfaction || 0), 0) / reviews.length).toFixed(1)
      : '0';

  return (
    // ❌ (ลบ Header ออกจากตรงนี้) ❌
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
          <div className="stat-label">ยอด Helpful Votes</div>
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
  );
}

// --- Component ย่อย: Badge ---
// (Component นี้เหมือนใน ProfilePage.jsx เป๊ะๆ ครับ)
function BadgeCard({ title, description, unlocked, soon }) {
  // ... (โค้ด BadgeCard เหมือนเดิม) ...
}

// --- Component ย่อย: Activity ---
// (Component นี้เหมือนใน ProfilePage.jsx เป๊ะๆ ครับ)
function ActivityItem({ icon, text, time }) {
  // ... (โค้ด ActivityItem เหมือนเดิม) ...
}


// --- หน้าหลัก (Public) Profile ---
export default function PublicProfilePage() {
  const [activeTab, setActiveTab] = useState('achievements');
  const { userId } = useParams(); // ⬅️ (สำคัญ) ดึง ID จาก URL
  const { currentUser } = useAuth(); // (ดึง User ปัจจุบันไว้เช็ค)
  const navigate = useNavigate(); // ⬅️ (ไว้เด้งกลับ)

  const [profileData, setProfileData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ⬅️ (สำคัญ) เช็คว่าเป็นโปรไฟล์เราเองหรือของคนอื่น
  const isMyProfile = currentUser?.id === userId;

  useEffect(() => {
    // (ถ้า User พยายามส่องโปรไฟล์ตัวเอง ให้เด้งกลับไปหน้า /profile)
    if (isMyProfile) {
      navigate('/profile', { replace: true });
      return;
    }

    const fetchPublicProfileData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // ⬅️ (สำคัญ) ยิง API ใหม่ที่เราสร้าง
        const profileRes = await apiClient.get(`/users/${userId}/profile`);
        
        setProfileData(profileRes.data.user);
        setReviews(profileRes.data.reviews);
      } catch (err) {
        console.error('Failed to fetch public profile:', err);
        setError('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
      } finally {
        setIsLoading(false);
      }
    };

    // (ป้องกันการยิง API ถ้าเป็นโปรไฟล์ตัวเอง)
    if (!isMyProfile) {
      fetchPublicProfileData();
    }
  }, [userId, isMyProfile, navigate]); // (ทำงานใหม่ถ้า ID เปลี่ยน)

  // (ดึง Stats/Badges/Activities จาก profileData)
  const stats = profileData?.stats;
  const badges = profileData?.badges;
  const activities = profileData?.activities;

  return (
    <>
      <Header /> {/* ⬅️ (เรียก Header) */}
      <div className="profile-page-container">

        {/* ⬅️ (ส่ง profileData (ไม่ใช่ currentUser) เข้าไป) */}
        {profileData && <ProfileHeader profileUser={profileData} reviews={reviews} />}

        <div className="profile-content-wrapper">
          <div className="profile-tabs">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
            >
              คำแนะนำ (Reviews)
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
            >
              ความสำเร็จ (Achievements)
            </button>
            
            {/* ❌ (ลบ) "ตั้งค่า" (Settings) ออกไป (เพื่อความปลอดภัย) ❌ */}
            
          </div>

          {isLoading && <div className="tab-placeholder"><p>กำลังโหลดข้อมูล...</p></div>}
          {error && <div className="tab-placeholder"><p style={{ color: 'red' }}>{error}</p></div>}

          {!isLoading && !error && profileData && (
            <>
              {activeTab === 'achievements' && (
                <div className="tab-content-grid">
                  <div className="badge-section">
                    <h3 className="section-title">🏆 ความสำเร็จของ {profileData.username}</h3>
                    <p className="section-description">แบดจ์และความสำเร็จที่ได้รับจากการช่วยเหลือชุมชน</p>
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
                  <h2 className="section-title">รีวิวของ {profileData.username}</h2>
                  {reviews.length > 0
                    ? reviews.map((review) => (
                      // ⬅️ (สำคัญ) ใช้ 'ReviewCard' (ตัวสาธารณะ)
                      // ❌ ไม่ใช่ 'MyReviewCard' (ที่แก้ไข/ลบได้)
                      <ReviewCard
                        key={review.id}
                        review={review}
                        // (ไม่ต้องส่ง onEdit/onDelete)
                      />
                    ))
                    : <p>ผู้ใช้คนนี้ยังไม่ได้เขียนรีวิว</p>}
                </div>
              )}
              
              {/* (ลบ tab 'settings' ออกไป) */}

            </>
          )}
        </div>
      </div>
    </>
  );
}