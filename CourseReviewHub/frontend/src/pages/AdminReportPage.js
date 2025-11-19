import React, { useState, useEffect } from 'react';
import apiClient from '../services/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// 👇 1. Import Firebase เพื่อทำ Logout เอง
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

// 👇 2. Import Logo/Icons
import logo from '../img/logo.png'; 
import { LogoutIcon, UserCircleIcon } from '@heroicons/react/solid';

export default function AdminReportPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Logic เช็กสิทธิ์ ---
  useEffect(() => {
    if (currentUser && currentUser.role !== 'ADMIN') {
      alert("สำหรับผู้ดูแลระบบเท่านั้น");
      navigate('/');
    }
  }, [currentUser, navigate]);

  // --- Logic ดึงข้อมูล ---
  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/reports');
      setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      fetchReports();
    }
  }, [currentUser]);

  // --- Logic ลบ/ยกฟ้อง ---
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("ยืนยันลบรีวิวนี้?")) return;
    try {
      await apiClient.delete(`/admin/reviews/${reviewId}`);
      alert("ลบรีวิวเรียบร้อยแล้ว");
      fetchReports();
    } catch (err) {
      alert("ลบไม่สำเร็จ");
    }
  };

  const handleDismissReport = async (reportId) => {
    if (!window.confirm("ต้องการยกฟ้องรายงานนี้?")) return;
    try {
      await apiClient.delete(`/admin/reports/${reportId}`);
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err) {
      alert("เกิดข้อผิดพลาด");
    }
  };

  // 👇 3. ฟังก์ชัน Logout (ก๊อปมาจาก Header เป๊ะๆ)
  const handleLogout = async () => {
    try {
      await signOut(auth); // สั่ง Firebase ออก
      navigate('/login');  // ดีดไปหน้า Login
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Admin Dashboard...</div>;

  return (
    <div className="admin-page-container" style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', paddingBottom: '40px' }}>
      
      {/* =====================================================
          🛡️ ส่วน Header สำหรับ Admin เท่านั้น (ไม่ใช้ Component รวม)
         ===================================================== */}
      <header style={{ 
        backgroundColor: 'white', 
        padding: '10px 30px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* ฝั่งซ้าย: โลโก้ (กดแล้วไม่ไปไหน หรือรีเฟรชหน้าเดิม) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logo} alt="Logo" style={{ height: '40px', objectFit: 'contain' }} />
          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#6D28D9', letterSpacing: '0.5px' }}>
            Admin Panel
          </span>
        </div>

        {/* ฝั่งขวา: ชื่อแอดมิน และปุ่ม Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          {/* แสดงชื่อ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
            <UserCircleIcon style={{ height: '24px', width: '24px', color: '#9ca3af' }} />
            <span style={{ fontWeight: '600' }}>{currentUser?.username || 'Admin'}</span>
          </div>

          {/* เส้นคั่น */}
          <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }}></div>

          {/* ปุ่ม Logout */}
          <button 
            onClick={handleLogout}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              border: '1px solid #fca5a5', 
              backgroundColor: '#fef2f2', 
              color: '#dc2626', 
              padding: '8px 16px', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              transition: '0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
          >
            <LogoutIcon style={{ height: '18px', width: '18px' }} />
            ออกจากระบบ
          </button>
        </div>
      </header>
      {/* ===================================================== */}


      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', marginTop: '20px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                จัดการรายงานความไม่เหมาะสม
            </h1>
        </div>

        {/* ... (ส่วนแสดงผลรายการ Reports เหมือนเดิมเป๊ะ ไม่ต้องแก้) ... */}
        {reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
             <p style={{ fontSize: '4rem', margin: 0 }}>🎉</p>
             <h2 style={{ color: '#059669', marginTop: '10px' }}>เย้! ไม่มีรายการแจ้งปัญหา</h2>
             <p style={{ color: '#6b7280' }}>ระบบสะอาด ปราศจากดราม่า</p>
          </div>
        ) : (
          <div className="report-list">
            {reports.map((report) => (
              <div key={report.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', borderLeft: '6px solid #ef4444' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', marginBottom: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 12px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 'bold' }}>{report.reason}</span>
                            <span style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Report ID: #{report.id}</span>
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '0.9rem', color: '#374151' }}>
                            <strong>ผู้แจ้ง:</strong> {report.reporter?.username || 'Unknown'} <span style={{ margin: '0 8px', color: '#d1d5db' }}>|</span> <strong>วันที่แจ้ง:</strong> {new Date(report.created_at).toLocaleDateString('th-TH')}
                        </div>
                    </div>
                 </div>

                 <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    {report.review ? (
                        <>
                            <div style={{ marginBottom: '8px', fontSize: '0.9rem', color: '#4b5563' }}>
                                <strong>เจ้าของรีวิว:</strong> {report.review.author?.username || 'Unknown'} <span style={{color: '#fbbf24', marginLeft: '5px'}}>(Rating: {report.review.rating_satisfaction}⭐)</span>
                            </div>
                            <p style={{ fontStyle: 'italic', color: '#1f2937', lineHeight: '1.6', fontSize: '1.05rem' }}>"{report.review.content_pros_cons || report.review.content_prerequisite || '(ไม่มีข้อความ)'}"</p>
                        </>
                    ) : (
                        <div style={{ color: '#ef4444', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>🚫 <span>รีวิวนี้ถูกลบไปแล้ว (ไม่พบข้อมูลในระบบ)</span></div>
                    )}
                    {report.details && (
                        <div style={{ marginTop: '16px', borderTop: '1px dashed #d1d5db', paddingTop: '12px' }}>
                            <span style={{ fontSize: '0.85rem', color: '#b91c1c', fontWeight: 'bold' }}>หมายเหตุจากผู้แจ้ง: </span>
                            <span style={{ fontSize: '0.9rem', color: '#b91c1c', marginLeft: '6px' }}>{report.details}</span>
                        </div>
                    )}
                 </div>

                 <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                    <button onClick={() => handleDismissReport(report.id)} style={{ padding: '10px 20px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '6px', color: '#374151', cursor: 'pointer', fontWeight: '600', transition: '0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>ยกฟ้อง (ลบ Report)</button>
                    {report.review && (
                        <button onClick={() => handleDeleteReview(report.review.id)} style={{ padding: '10px 20px', backgroundColor: '#dc2626', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontWeight: '600', boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)', transition: '0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}>ลบรีวิว (Ban Content)</button>
                    )}
                 </div>
              </div>
            ))}
         </div>
        )}
      </div>
    </div>
  );
}