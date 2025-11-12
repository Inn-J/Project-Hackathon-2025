import React, { useState } from 'react';
import './AuthLayout.css'; // 1. Import CSS ที่ใช้ร่วมกัน
import { useNavigate } from 'react-router-dom';
import { MailIcon, LockClosedIcon } from '@heroicons/react/solid';
// import { auth } from '../services/firebaseConfig'; // (Import Firebase Auth)
// import { signInWithEmailAndPassword } from 'firebase/auth';
// import axios from '../services/axiosConfig'; // (Import Axios)
import logo from '../img/logo.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // เคลียร์ Error เก่า

    // --- 1. (สำคัญ!) ล็อกอินกับ Firebase Client ---
    try {
      // (นี่คือโค้ดจริงที่ต้องใช้ - ตอนนี้ขอ Comment ไว้ก่อน)
      // const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // const idToken = await userCredential.user.getIdToken();
      
      // --- (สำคัญ!) ยิงไปเช็ค Role กับ Backend ของอิน ---
      // const response = await axios.get('/users/me'); // (Interceptor จะแนบตั๋วไปเอง)
      // const userRole = response.data.role;
      // alert('ยินดีต้อนรับ ' + response.data.username + ' Role: ' + userRole);

      // (โค้ดจำลองการทำงาน)
      console.log('Login successful, Token received, Role checked');
      
      // 2. ถ้าสำเร็จ ให้เด้งไปหน้า Home
      navigate('/home'); 

    } catch (err) {
      console.error(err);
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="auth-container">
      {/* 1. ฝั่งซ้าย (Logo) */}
     <div className="auth-sidebar">
        <div className="auth-logo-wrapper">
          <img src={logo} alt="CourseReviewHub Logo" /> {/* ⬅️ เอามาวางตรงนี้เลย */}
        </div>
      </div>

      {/* 2. ฝั่งขวา (Form) */}
      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          
          <div className="auth-avatar-placeholder"></div>

          <form onSubmit={handleLogin}>
            {/* Input อีเมล */}
            <div className="auth-input-group">
              <MailIcon className="auth-input-icon" style={{ height: 20, width: 20 }} />
              <input 
                type="email" 
                placeholder="@cmu.ac.th" 
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            {/* Input รหัสผ่าน */}
            <div className="auth-input-group">
              <LockClosedIcon className="auth-input-icon" style={{ height: 20, width: 20 }} />
              <input 
                type="password" 
                placeholder="Password" 
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            <button type="submit" className="auth-button">
              Login
            </button>
          </form>
          
          <div className="auth-link-container">
            Don't have an account?{' '}
            {/* 3. ลิงก์ไปหน้า Sign Up */}
            <span className="auth-link" onClick={() => navigate('/signup')}>
              Sign Up
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}