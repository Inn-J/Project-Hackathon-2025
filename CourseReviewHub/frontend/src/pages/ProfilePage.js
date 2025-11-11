import React, { useState } from 'react';
import Header from '../components/Header';
import { ClockIcon } from '@heroicons/react/solid';
import './ProfilePage.css'; // Import CSS

// Component ย่อย: ส่วนหัว Profile
function ProfileHeader() {
  return (
    <div className="profile-header">
      <div className="profile-header-info">
        <div className="profile-avatar">อ</div>
        <div className="profile-details">
          <h2 className="profile-name">อาร์ม วิทยากร</h2>
          <p className="profile-meta">เข้าร่วมเมื่อ มกราคม 2024</p>
          <p className="profile-meta">คณะวิศวกรรมศาสตร์ - วิศวกรรมคอมพิวเตอร์ ชั้นปีที่ 3</p>
        </div>
      </div>
      <div className="profile-stats-grid">
        <div className="profile-stat-box">
          <div className="stat-number">XX</div>
          <div className="stat-label">คำแนะนำ</div>
        </div>
        <div className="profile-stat-box">
          <div className="stat-number">XX</div>
          <div className="stat-label">ความช่วยเหลือ</div>
        </div>
        <div className="profile-stat-box">
          <div className="stat-number">XX</div>
          <div className="stat-label">วิชาที่รีวิว</div>
        </div>
        <div className="profile-stat-box">
          <div className="stat-number">XX</div>
          <div className="stat-label">คะแนนเฉลี่ย</div>
        </div>
      </div>
    </div>
  );
}

// Component ย่อย: Badge
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

// Component ย่อย: Activity
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

// หน้าหลัก Profile
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('achievements');

  return (
    <div className="profile-page-container">
      <Header />
      <ProfileHeader />

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

        {/* Tab ความสำเร็จ */}
        {activeTab === 'achievements' && (
          <div className="tab-content-grid">
            
            <div className="badge-section">
              <h3 className="section-title">🏆 ความสำเร็จของคุณ</h3>
              <p className="section-description">แบดจ์และความสำเร็จที่คุณได้รับจากการช่วยเหลือชุมชน</p>
              
              <div className="badge-grid">
                <BadgeCard title="ผู้ช่วยเหลือ" description="ได้รับ 100+ helpful votes" unlocked={true} />
                <BadgeCard title="นักเขียนมือทอง" description="เขียนคำแนะนำ 10+ ครั้ง" unlocked={true} />
                <BadgeCard title="ตรงประเด็น" description="คะแนนเฉลี่ย 4.5+ ดาว" unlocked={true} />
                <BadgeCard title="นักรีวิว" description="เขียนคำแนะนำ 20+ ครั้ง" unlocked={false} soon={true} />
              </div>
            </div>

            <div className="activity-section">
              <h3 className="section-title">📊 กิจกรรมล่าสุด</h3>
              <div className="activity-feed">
                <ActivityItem 
                  icon={<ClockIcon style={{height: 20, width: 20, color: '#6D28D9'}} />}
                  text="เขียนแนะนำสำหรับวิชา 960100"
                  time="15 ม.ค. 2025"
                />
                <ActivityItem 
                  icon={<ClockIcon style={{height: 20, width: 20, color: '#6D28D9'}} />}
                  text="ได้รับ helpful vote 5 ครั้ง"
                  time="14 ม.ค. 2025"
                />
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

      </div>
    </div>
  );
}
