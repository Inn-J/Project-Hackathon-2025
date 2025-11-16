import React, { useState } from 'react';
import './AuthLayout.css'; // 1. Import CSS เดียวกัน
import { useNavigate } from 'react-router-dom';

// ⬇️ 1. เพิ่ม UserCircleIcon เข้าไปใน import นี้ ⬇️
import { UserIcon, MailIcon, LockClosedIcon, AcademicCapIcon, BriefcaseIcon, ArrowLeftIcon, IdentificationIcon, UserCircleIcon } from '@heroicons/react/solid';

import axios from '../services/axiosConfig'; 
import logo from '../img/logo.png';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = หน้าแรก, 2 = หน้าสอง
  const [error, setError] = useState('');

  // ข้อมูล Step 1
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ข้อมูล Step 2
  const [faculty, setFaculty] = useState('Engineering'); // (ค่าเริ่มต้น)
  const [major, setMajor] = useState('Computer Engineering');
  const [role, setRole] = useState('STUDENT');
  const [studentId, setStudentId] = useState('');

  // ฟังก์ชันไปหน้าถัดไป
  const handleNextStep = (e) => {
    e.preventDefault();
    setError('');

    // --- (สำคัญ!) เช็ค @cmu.ac.th ---
    if (!email.endsWith('@cmu.ac.th')) {
      setError('ต้องใช้อีเมล @cmu.ac.th เท่านั้น');
      return;
    }
    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }
    
    // ถ้าผ่านหมด ให้ไป Step 2
    setStep(2);
    setError('');
  };

  // ฟังก์ชันสมัครจริง (ยิง API)
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    // 1. รวบรวมข้อมูลทั้งหมด
    const formData = {
      username,
      email,
      password,
      faculty,
      major,
      role,
      student_id: role === 'STUDENT' ? studentId : null,
    };

    try {
      // --- (สำคัญ!) ยิง API Register ของอิน ---
      await axios.post('/users/register', formData);

      console.log('Registering with data:', formData);
      
      // 2. ถ้าสำเร็จ ให้เด้งกลับไปหน้า Login
      alert('สมัครสมาชิกสำเร็จ! กรุณาเช็คอีเมลเพื่อยืนยันตัวตน แล้วกลับไปล็อกอินครับ');
      navigate('/login');

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'การสมัครล้มเหลว');
    }
  };

  // ฟอร์มสำหรับ Step 1
  const renderStep1 = () => (
    <form onSubmit={handleNextStep}>
      <div className="auth-input-group">
        <UserIcon className="auth-input-icon" style={{ height: 20, width: 20 }} />
        <input type="text" placeholder="Username" className="auth-input" value={username} onChange={(e) => setUsername(e.target.value)} required />
      </div>
      <div className="auth-input-group">
        <MailIcon className="auth-input-icon" style={{ height: 20, width: 20 }} />
        <input type="email" placeholder="@cmu.ac.th" className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="auth-input-group">
        <LockClosedIcon className="auth-input-icon" style={{ height: 20, width: 20 }} />
        <input type="password" placeholder="Password" className="auth-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <div className="auth-input-group">
        <LockClosedIcon className="auth-input-icon" style={{ height: 20, width: 20 }} />
        <input type="password" placeholder="Confirm Password" className="auth-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
      </div>
      <button type="submit" className="auth-button">Next</button>
    </form>
  );

  // ฟอร์มสำหรับ Step 2
  const renderStep2 = () => (
    <form onSubmit={handleSignUp}>
      {/* (Dropdown ทั้งหมดนี้ ควรจะดึงข้อมูลมาจาก API แต่ตอนนี้ใช้แบบง่ายไปก่อน) */}
      <div className="auth-input-group">
        <AcademicCapIcon className="auth-input-icon" style={{ height: 20, width: 20 }} />
        <input type="text" placeholder="Faculty (e.g. Engineering)" className="auth-input" value={faculty} onChange={(e) => setFaculty(e.target.value)} required />
      </div>
      <div className="auth-input-group">
        <BriefcaseIcon className="auth-input-icon" style={{ height: 20, width: 20 }} />
        <input type="text" placeholder="Major (e.g. Computer Engineering)" className="auth-input" value={major} onChange={(e) => setMajor(e.target.value)} required />
      </div>
      <div className="auth-input-group">
        <UserIcon className="auth-input-icon" style={{ height: 20, width: 20 }} />
        <select className="auth-input" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="STUDENT">Student</option>
          <option value="INSTRUCTOR">Instructor</option>
        </select>
      </div>

      {/* โชว์ช่องรหัสนักศึกษา เฉพาะถ้าเป็น STUDENT */}
      {role === 'STUDENT' && (
        <div className="auth-input-group">
          <IdentificationIcon className="auth-input-icon" style={{ height: 20, width: 20 }} />
          <input type="text" placeholder="Student ID (e.g. 67...)" className="auth-input" value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
        </div>
      )}

      <button type="submit" className="auth-button">Sign Up</button>
    </form>
  );

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
        
        {/* ปุ่ม Back (ถ้าอยู่ Step 2 ให้โชว์ / ถ้า Step 1 ให้กลับไป Login) */}
        <button 
          onClick={() => step === 1 ? navigate('/login') : setStep(1)} 
          className="auth-back-button"
        >
          <ArrowLeftIcon style={{ height: 20, width: 20 }} />
        </button>

        <div className="auth-form-wrapper">
          
          {/* ⬇️ 2. แก้ไข div นี้ ⬇️ */}
          <div className="auth-avatar-placeholder">
            <UserCircleIcon className="auth-avatar-icon" />
          </div>

          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

          {/* 3. เช็คว่าอยู่ Step ไหน แล้วโชว์ฟอร์มที่ถูกต้อง */}
          {step === 1 ? renderStep1() : renderStep2()}
          
          <div className="auth-link-container">
            Already have an account?{' '}
            <span className="auth-link" onClick={() => navigate('/login')}>
              Login
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}