import React, { useState } from 'react';
import './AuthLayout.css';
import { useNavigate } from 'react-router-dom';
import { MailIcon, LockClosedIcon } from '@heroicons/react/solid';
import { auth } from '../services/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
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
      // 1. Login กับ Firebase (ตรงนี้สำคัญ!)
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. ดึง Token
      const idToken = await userCredential.user.getIdToken();
      
      // 3. เช็ค Role กับ Backend
      const response = await axios.get('/users/me');
      const userRole = response.data.role;
      
      console.log('Login successful!', response.data);
      
      // 4. Navigate ไปหน้า Home
      navigate('/');

    } catch (err) {
      console.error('Login Error:', err);
      
      // แสดง Error ตามประเภท
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else if (err.code === 'auth/user-not-found') {
        setError('ไม่พบผู้ใช้นี้ในระบบ');
      } else if (err.code === 'auth/invalid-email') {
        setError('รูปแบบอีเมลไม่ถูกต้อง');
      } else if (err.code === 'auth/too-many-requests') {
        setError('พยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่');
      } else {
        setError('เกิดข้อผิดพลาด: ' + err.message);
      }
    } finally {
      setLoading(false);
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
          <div className="auth-avatar-placeholder"></div>

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

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'Login'}
            </button>
          </form>
          
          <div className="auth-link-container">
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