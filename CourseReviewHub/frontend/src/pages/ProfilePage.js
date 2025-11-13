import React, { useState, useEffect } from 'react';
import Header from '../components/Header.js'; // 1. แก้ไข
import { useAuth } from '../context/AuthContext.js'; // 2. แก้ไข
import { ClockIcon } from '@heroicons/react/solid'; // (อันนี้แก้ไว้ตั้งแต่ก่อนหน้า)
import './ProfilePage.css'; // (CSS ไม่ต้อง .js)

import apiClient from '../services/axiosConfig.js'; // 3. แก้ไข

// --- Helper Function (สำหรับแปลงวันที่) ---
const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    // แปลงเป็น "วัน เดือน ปี" (เช่น "15 ม.ค. 2025")
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (error) {
    return isoString; // คืนค่าเดิมถ้าแปลงไม่ได้
  }
};

// --- Component ย่อย: ส่วนหัว Profile ---
function ProfileHeader({ currentUser, stats }) {

  // เตรียมข้อมูลจาก currentUser (พร้อม fallback)
  const username = currentUser?.username || 'N/A';
  const emailPrefix = currentUser?.email?.split('@')[0] || 'User';
  const displayName = username !== 'N/A' ? username : emailPrefix;
  const avatarInitial = displayName.charAt(0).toUpperCase();

  const joinedDate = formatDate(currentUser?.createdAt);
  const userRole = currentUser?.role || 'Member';

  // ใช้ข้อมูล stats ที่ยิง API มา (ถ้ายังไม่มีให้โชว์ 'XX')
  const reviewCount = stats?.reviewCount || 'XX';
  const helpfulCount = stats?.helpfulCount || 'XX';
  const subjectsReviewed = stats?.subjectsReviewed || 'XX';
  const averageRating = stats?.averageRating ? stats.averageRating.toFixed(1) : 'XX';

  return (
    
    <div className="profile-header">
      <div className="profile-header-info">
        <div className="profile-avatar">{avatarInitial}</div>
        <div className="profile-details">
          <h2 className="profile-name">{displayName}</h2>
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

// --- Component ย่อย: Badge ---
function BadgeCard({ title, description, unlocked, soon }) {
  const cardClass = `badge-card ${soon ? 'badge-soon' : (unlocked ? 'badge-unlocked' : '')}`;
  return (
    <div className={cardClass}>
      <div className="badge-icon">{soon ? '🔒' : '🏆'}</div>
      <h4 className="badge-title">{title}</h4>
      <p className="badge-description">{description}</p>
      {unlocked && (
        <span className="badge-status unlocked">✓ ปลดล็อกแล้ว</span>
      )}
      {soon && (
        <span className="badge-status soon">เร็วๆ นี้</span>
      )}
    </div>
  );
}

// --- Component ย่อย: Activity ---
function ActivityItem({ icon, text, time }) {
  return (
    <div className="activity-item">
      <div className="activity-icon-wrapper">
        {icon}
      </div>
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
  const { currentUser } = useAuth(); // ดึงข้อมูล Auth

  // สร้าง State สำหรับเก็บข้อมูลที่ยิง API มา
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ใช้ useEffect ยิง API เมื่อ Component โหลด
  useEffect(() => {
    // ต้องแน่ใจว่ามี currentUser ก่อน ถึงจะยิง API
    if (currentUser) {
      const fetchProfileData = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          // --- นี่คือจุดที่ยิง API ---
          // สมมติว่า endpoint คือ '/profile/me'
          const response = await apiClient.get('/users/me'); 
          
          setProfileData(response.data); // เก็บข้อมูลที่ได้
          
        } catch (err) {
          console.error("Failed to fetch profile data:", err);
          setError("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
        } finally {
          setIsLoading(false);
        }
      };

      fetchProfileData();
    }
  }, [currentUser]); // สั่งให้ยิง API ใหม่ถ้า currentUser เปลี่ยน

  // เตรียมข้อมูลที่จะส่งให้ Component ลูก
  const stats = profileData?.stats;
  const badges = profileData?.badges;
  const activities = profileData?.activities;

  return (
    <div className="profile-page-container">
      
      {/* ส่ง stats ที่ได้จาก API ไปให้ ProfileHeader */}
      {currentUser && (
        <ProfileHeader currentUser={currentUser} stats={stats} />
      )}

      <div className="profile-content-wrapper">
        <div className="profile-tabs">
          {/* (Tabs) */}
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

        {/* --- แสดงผล Loading หรือ Error --- */}
        {isLoading && (
          <div className="tab-placeholder"><p>กำลังโหลดข้อมูล...</p></div>
        )}
        
        {error && (
          <div className="tab-placeholder"><p style={{color: 'red'}}>{error}</p></div>
        )}

        {/* --- แสดงผลข้อมูลเมื่อโหลดเสร็จ (ซ่อนไว้ตอน Loading/Error) --- */}
        {!isLoading && !error && profileData && (
          <>
            {/* Tab ความสำเร็จ */}
            {activeTab === 'achievements' && (
              <div className="tab-content-grid">
                
                <div className="badge-section">
                  <h3 className="section-title">🏆 ความสำเร็จของคุณ</h3>
                  <p className="section-description">แบดจ์และความสำเร็จที่คุณได้รับจากการช่วยเหลือชุมชน</p>
                  
                  {/* Map ข้อมูล Badges ที่ได้จาก API */}
                  <div className="badge-grid">
                    {badges && badges.length > 0 ? (
                      badges.map((badge) => (
                        <BadgeCard 
                          key={badge.id} // สมมติว่ามี id
                          title={badge.title}
                          description={badge.description}
                          unlocked={badge.unlocked}
                          soon={badge.soon || false}
                        />
                      ))
                    ) : (
                      <p>ยังไม่มีความสำเร็จ</p>
                    )}
                  </div>
                </div>

                <div className="activity-section">
                  <h3 className="section-title">📊 กิจกรรมล่าสุด</h3>
                  
                  {/* Map ข้อมูล Activities ที่ได้จาก API */}
                  <div className="activity-feed">
                    {activities && activities.length > 0 ? (
                      activities.map((activity) => (
                        <ActivityItem 
                          key={activity.id} // สมมติว่ามี id
                          icon={<ClockIcon style={{height: 20, width: 20, color: '#6D28D9'}} />}
                          text={activity.text}
                          time={formatDate(activity.createdAt)} // ใช้ helper แปลงวันที่
                        />
                      ))
                    ) : (
                      <p>ยังไม่มีกิจกรรมล่าสุด</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab อื่นๆ */}
            {activeTab === 'reviews' && (
              <div className="tab-placeholder">
                <h2 className="section-title">หน้ารีวิวของฉัน</h2>
                <p>... (ส่วนนี้จะแสดง ReviewCard ที่คุณเขียน) ...</p>
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="tab-placeholder">
                <h2 className="section-title">ตั้งค่า</h2>
                <p>... (ส่วนนี้จะเป็นฟอร์มแก้ไขโปรไฟล์) ...</p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
