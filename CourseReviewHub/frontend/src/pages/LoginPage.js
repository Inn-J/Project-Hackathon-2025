import React, { useState } from 'react';
import './AuthLayout.css';
import { useNavigate } from 'react-router-dom';
import { MailIcon, LockClosedIcon,UserCircleIcon } from '@heroicons/react/solid';
import { auth } from '../services/firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'; 
import axios from '../services/axiosConfig';
import logo from '../img/logo.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      const response = await axios.get('/users/me');
      navigate('/');
    } catch (err) {
      console.error('Login Error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else if (err.code === 'auth/user-not-found') {
        setError('ไม่พบผู้ใช้นี้ในระบบ');
      } else {
        setError('เกิดข้อผิดพลาด: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const emailToReset = prompt("กรุณากรอกอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน:");
    if (!emailToReset) return;

    try {
      await sendPasswordResetEmail(auth, emailToReset);
      alert("ส่งอีเมลรีเซ็ตรหัสผ่านให้แล้ว! กรุณาตรวจสอบใน Inbox (และ Junk mail)");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      if (error.code === 'auth/user-not-found') {
        alert('ไม่พบอีเมลนี้ในระบบ');
      } else {
        alert("ไม่สามารถส่งอีเมลได้: " + error.message);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-sidebar">
        <div className="auth-logo-wrapper">
          <img src={logo} alt="CourseReviewHub Logo" />
        </div>
      </div>

      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          <div className="auth-avatar-placeholder">
            <UserCircleIcon className="auth-avatar-icon" />
          </div>

          <form onSubmit={handleLogin}>
            <div className="auth-input-group">
              <MailIcon className="auth-input-icon" style={{ height: 20, width: 20 }} />
              <input 
                type="email" 
                placeholder="@cmu.ac.th" 
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="auth-input-group">
              <LockClosedIcon className="auth-input-icon" style={{ height: 20, width: 20 }} />
              <input 
                type="password" 
                placeholder="Password" 
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && <p style={{ color: 'red', textAlign: 'center', fontSize: '14px', marginTop: '10px' }}>{error}</p>}

            {/* ⬇️ === (จุดที่ 1: เพิ่ม/ย้ายมาตรงนี้) === ⬇️ */}
            <div className="forgot-password-container">
              <span className="auth-link" onClick={handlePasswordReset}>
                Forget Password?
              </span>
            </div>
            {/* ⬆️ === สิ้นสุดจุดที่เพิ่ม === ⬆️ */}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'Login'}
            </button>
          </form>
          
          {/* ⬇️ === (จุดที่ 2: แก้ไขส่วนล่าง) === ⬇️ */}
          <div className="auth-link-container">
            {/* (ลบ "ลืมรหัสผ่าน?" และ "|" ออกจากตรงนี้) */}
            Don't have an account?{' '}
            <span className="auth-link" onClick={() => navigate('/signup')}>
              Sign Up
            </span>
          </div>
          
        </div>
      </div>
    </div>
  );
}