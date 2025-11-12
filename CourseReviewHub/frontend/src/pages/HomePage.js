import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '2px solid #eee',
        paddingBottom: '10px'
      }}>
        <div>
          <h1>หน้า Home</h1>
          <p>ยินดีต้อนรับ! คุณล็อกอินสำเร็จแล้ว</p>
        </div>
        
        <button 
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
        >
          Logout
        </button>
      </div>

      {/* แสดงข้อมูล User */}
      {userProfile && (
        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <h3>ข้อมูลผู้ใช้:</h3>
          <p><strong>Username:</strong> {userProfile.username}</p>
          <p><strong>Email:</strong> {userProfile.email}</p>
          <p><strong>Role:</strong> {userProfile.role}</p>
          <p><strong>Faculty:</strong> {userProfile.faculty}</p>
          <p><strong>Major:</strong> {userProfile.major}</p>
          {userProfile.student_id && (
            <p><strong>Student ID:</strong> {userProfile.student_id}</p>
          )}
        </div>
      )}
    </div>
  );
}