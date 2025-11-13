import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { ClockIcon } from '@heroicons/react/solid';
import apiClient from '../services/axiosConfig.js';

// แก้ไข: แก้ชื่อไฟล์ที่พิมพ์ผิด (ตกตัว e)
import AchievementsSection from '../components/AchievementsSection.js'; 
import Settings from '../components/Settings.js';
import ReviewCard from '../components/ReviewCard.js';

// --- Helper Function (สำหรับแปลงวันที่) ---
// (ฟังก์ชันนี้อยู่ใน ProfilePage ถูกต้องแล้ว)
function formatDate(input) {
  if (!input) return '';
  try {
    if (input instanceof Date) {
      return input.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }

    let s = String(input).trim();

    // กรณี "YYYY-MM-DD HH:MM:SS(.micro)+TZ" -> เปลี่ยนช่องว่างเป็น 'T' และตัด microseconds
    const fullMatch = s.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(\.\d+)?(.*)$/);
    if (fullMatch) {
      const datePart = fullMatch[1];
      const timePart = fullMatch[2];
      const tz = fullMatch[4] || '';
      s = `${datePart}T${timePart}${tz}`;
      const d = new Date(s);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('th-TH', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }
    }

    // กรณี "DD/MM/YYYY" หรือ "MM/DD/YYYY" (ambiguous) -> assume DD/MM/YYYY (ไทย) if day>12 or fallback try both
    const slashMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (slashMatch) {
      const a = parseInt(slashMatch[1], 10);
      const b = parseInt(slashMatch[2], 10);
      const y = parseInt(slashMatch[3], 10);

      // ถ้า a > 12 มั่นใจว่า a คือ day (DD/MM/YYYY)
      let day = a;
      let month = b - 1;
      if (a <= 12 && b <= 12) {
        // ทั้งสอง <=12 (กำกวม) -> พยายามตีเป็น DD/MM/YYYY (ไทย)
        day = a;
        month = b - 1;
      }
      const dateObj = new Date(y, month, day);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString('th-TH', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }
    }

    // สุดท้าย try ISO parse
    const d2 = new Date(s);
    if (!isNaN(d2.getTime())) {
      return d2.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }

    return input;
  } catch (err) {
    return input;
  }
}

// --- Component ย่อย: ส่วนหัว Profile ---
function ProfileHeader({ user, stats }) {
  const username = user?.username || 'N/A';
  const emailPrefix = user?.email?.split?.('@')?.[0] || 'User';
  const displayName = username !== 'N/A' ? username : emailPrefix;
  const avatarInitial = String(displayName).charAt(0).toUpperCase();

  const joinedRaw = user?.created_at || user?.createdAt || user?.metadata?.creationTime;
  const joinedDate = formatDate(joinedRaw); // เรียกใช้ฟังก์ชันด้านบน

  const userRole = user?.role || 'Member';

  const reviewCount = stats?.reviewCount ?? 'XX';
  const helpfulCount = stats?.helpfulCount ?? 'XX';
  const subjectsReviewed = stats?.subjectsReviewed ?? 'XX';
  const averageRating = typeof stats?.averageRating === 'number' ? stats.averageRating.toFixed(1) : 'XX';

  return (
    <div className="profile-header">
      <div className="profile-header-info">
        <div className="profile-avatar">{avatarInitial}</div>
        <div className="profile-details">
          <h2 className="profile-name">{displayName}</h2>
          <p className="profile-meta">เข้าร่วมเมื่อ {joinedDate || 'ไม่ระบุ'}</p>
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
          <div className="stat-label">ความช่วยเหลือ</div>
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

// --- หน้าหลัก Profile ---
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('achievements');
  const { currentUser } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // โหลด profile จาก API
  async function fetchProfileData() {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/users/me');
      let data = response.data;
      if (Array.isArray(data) && data.length > 0) data = data[0];
      if (!data && response.data?.user) data = response.data.user;
      setProfileData(data || null);
    } catch (err) {
      console.error('Failed to fetch profile data:', err);
      setError('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // mergedUser = auth + profileData (profileData override)
  const mergedUser = { ...(currentUser || {}), ...(profileData || {}) };

  // callback ให้ Settings แจ้งกลับเมื่อบันทึกเสร็จ
  function handleSettingsSaved(newProfile) {
    const normalized = Array.isArray(newProfile) && newProfile.length > 0 ? newProfile[0] : newProfile;
    if (normalized && typeof normalized === 'object') {
      setProfileData(prev => ({ ...(prev || {}), ...(normalized || {}) }));
    } else {
      // ถ้า server ไม่คืน object ให้รีโหลดใหม่
      fetchProfileData();
    }
  }

  const stats = profileData?.stats;
  const badges = profileData?.badges;
  const activities = profileData?.activities;

  return (
    <div className="profile-page-container">
      {/* header */}
      { (currentUser || profileData) && <ProfileHeader user={mergedUser} stats={stats} /> }

      <div className="profile-content-wrapper">
        <div className="profile-tabs">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
          >
            คำแนะนำของฉัน
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
          >
            ความสำเร็จ
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          >
            ตั้งค่า
          </button>
        </div>

        {isLoading && (
          <div className="tab-placeholder"><p>กำลังโหลดข้อมูล...</p></div>
        )}

        {error && (
          <div className="tab-placeholder"><p style={{ color: 'red' }}>{error}</p></div>
        )}

        {!isLoading && !error && (
          <>
            {activeTab === 'achievements' && (
              <div className="tab-content-grid">
                <div className="badge-section">
                  <h3 className="section-title">🏆 ความสำเร็จของคุณ</h3>
                  <p className="section-description">แบดจ์และความสำเร็จที่คุณได้รับจากการช่วยเหลือชุมชน</p>

                  <div className="badge-grid">
                    {badges && badges.length > 0 ? (
                      badges.map((badge) => (
                        <div key={badge.id || badge.title}>
                          {/* ถ้าคุณใช้ AchievementsSection component ให้แทนที่ส่วนนี้ด้วย <AchievementsSection userId={mergedUser?.id} /> */}
                          <div className="badge-card">
                            <div className="badge-icon">🏆</div>
                            <h4>{badge.title}</h4>
                            <p>{badge.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      // ถ้าต้องการ mock achievements ฝั่ง client ให้แสดง component ที่สร้างไว้แทน
                      <AchievementsSection userId={mergedUser?.id} />
                    )}
                  </div>
                </div>

                <div className="activity-section">
                  <h3 className="section-title">📊 กิจกรรมล่าสุด</h3>
                  <div className="activity-feed">
                    {activities && activities.length > 0 ? (
                      activities.map((activity) => (
                        <ActivityItem
                          key={activity.id || activity.created_at || activity.createdAt}
                          icon={<ClockIcon style={{ height: 20, width: 20, color: '#6D28D9' }} />}
                          text={activity.text}
                          time={formatDate(activity.created_at || activity.createdAt || activity.time)}
                        />
                      ))
                    ) : (
                      <p>ยังไม่มีกิจกรรมล่าสุด</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="tab-placeholder">
                <h2 className="section-title">หน้ารีวิวของฉัน</h2>
                {/* ใช้คอมโพเนนต์ MyReviews ที่ดึงรีวิวจาก API และแสดง ReviewCard แต่ละรายการ */}
               
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="tab-placeholder">
                <h2 className="section-title">ตั้งค่า</h2>
                {/* ส่ง mergedUser ให้ Settings เพื่อไม่ต้อง fetch ซ้ำ */}
                <Settings mergedUser={mergedUser} onSaved={handleSettingsSaved} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}