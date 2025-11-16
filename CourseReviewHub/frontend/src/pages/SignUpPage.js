import React, { useState } from 'react';
import './AuthLayout.css';
import { useNavigate } from 'react-router-dom';
import {
  UserIcon,
  MailIcon,
  LockClosedIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ArrowLeftIcon,
  IdentificationIcon,
  UserCircleIcon,
} from '@heroicons/react/solid';

import axios from '../services/axiosConfig';
import logo from '../img/logo.png';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = หน้าแรก, 2 = หน้าสอง
  const [error, setError] = useState('');

  // ตัวเลือกคณะ / วิทยาลัย (ไทย + อังกฤษ)
  const facultyOptions = [
    'คณะมนุษยศาสตร์ (Faculty of Humanities)',
    'คณะศึกษาศาสตร์ (Faculty of Education)',
    'คณะวิจิตรศิลป์ (Faculty of Fine Arts)',
    'คณะสังคมศาสตร์ (Faculty of Social Sciences)',
    'คณะวิทยาศาสตร์ (Faculty of Science)',
    'คณะวิศวกรรมศาสตร์ (Faculty of Engineering)',
    'คณะแพทยศาสตร์ (Faculty of Medicine)',
    'คณะเกษตรศาสตร์ (Faculty of Agriculture)',
    'คณะทันตแพทยศาสตร์ (Faculty of Dentistry)',
    'คณะเภสัชศาสตร์ (Faculty of Pharmacy)',
    'คณะเทคนิคการแพทย์ (Faculty of Associated Medical Sciences)',
    'คณะพยาบาลศาสตร์ (Faculty of Nursing)',
    'คณะอุตสาหกรรมเกษตร (Faculty of Agro-Industry)',
    'คณะสัตวแพทยศาสตร์ (Faculty of Veterinary Medicine)',
    'คณะบริหารธุรกิจ (Faculty of Business Administration)',
    'คณะเศรษฐศาสตร์ (Faculty of Economics)',
    'คณะสถาปัตยกรรมศาสตร์ (Faculty of Architecture)',
    'คณะการสื่อสารมวลชน (Faculty of Mass Communication)',
    'คณะรัฐศาสตร์และรัฐประศาสนศาสตร์ (Faculty of Political Science and Public Administration)',
    'คณะนิติศาสตร์ (Faculty of Law)',
    'วิทยาลัยศิลปะ สื่อและเทคโนโลยี (College of Arts, Media and Technology)',
    'วิทยาลัยนานาชาตินวัตกรรมดิจิทัล (International College of Digital Innovation)',
  ];

  // mapping: คณะ -> ลิสต์สาขา
  const facultyMajors = {
    'คณะวิศวกรรมศาสตร์ (Faculty of Engineering)': [
      'วิศวกรรมคอมพิวเตอร์  / Computer Engineering ',
      'วิศวกรรมเครื่องกล  / Mechanical Engineering ',
      'วิศวกรรมเครื่องกลและการบริหารโครงการวิศวกรรม (หลักสูตรนานาชาติ)/ Mechanical Engineering and Engineering Project Management (International Program) ',
      'วิศวกรรมเซมิคอนดักเตอร์ / Semiconductor Engineering',
      'วิศวกรรมบูรณาการ  / Integrated Engineering ',
      'วิศวกรรมบูรณาการและพหุวิทยาการ (หลักสูตรนานาชาติ) / Integrated and Multi-disciplinary Engineering (International Program) ',
      'วิศวกรรมไฟฟ้า / Electrical Engineering',
      'วิศวกรรมไฟฟ้าและเทคโนโลยีโครงข่ายไฟฟ้าอัจฉริยะ (หลักสูตรนานาชาติ)  / Electrical Engineering and Smart Grid Technology (International Program)',
      'วิศวกรรมโยธา / Civil Engineering ',
      'วิศวกรรมโยธา (หลักสูตรนานาชาติ)/ Civil Engineering (International Program) ',
      'วิศวกรรมระบบสารสนเทศและเครือข่าย (หลักสูตรนานาชาติ) / Information Systems and Network Engineering (International Program)',
      'วิศวกรรมสิ่งแวดล้อม  / Environmental Engineering',
      'วิศวกรรมหุ่นยนต์และปัญญาประดิษฐ์  / Robotics Engineering and Artificial Intelligence',
      'วิศวกรรมเหมืองแร่และปิโตรเลียม / Mining and Petroleum Engineering ',
      'วิศวกรรมอุตสาหการ / Industrial Engineering ',
      'วิศวกรรมอุตสาหการและการจัดการโลจิสติกส์ (หลักสูตรนานาชาติ)  / Industrial Engineering and Logistics Management (International Program)',
    ],
    'วิทยาลัยศิลปะ สื่อและเทคโนโลยี (College of Arts, Media and Technology)': [
      'SE – วิศวกรรมซอฟต์แวร์ (หลักสูตรนานาชาติ) / Software Engineering (International Program)',
      'MMIT – การจัดการสมัยใหม่ / Modern Management and Information Technology',
      'ANI – แอนิเมชัน & วิชวลเอฟเฟกต์ / Animation & Visual Effects',
      'DG – ดิจิทัลเกม / Digital Games',
      'DII – บูรณาการอุตสาหกรรมดิจิทัล / Digital Industry Integration',
    ],
  };

  // ข้อมูล Step 1
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ข้อมูล Step 2
  const [faculty, setFaculty] = useState(''); // ยังไม่เลือก
  const [major, setMajor] = useState(''); // ยังไม่เลือก
  const [role, setRole] = useState('STUDENT');
  const [studentId, setStudentId] = useState('');

  // ฟังก์ชันไปหน้าถัดไป
  const handleNextStep = (e) => {
    e.preventDefault();
    setError('');

    if (!email.endsWith('@cmu.ac.th')) {
      setError('ต้องใช้อีเมล @cmu.ac.th เท่านั้น');
      return;
    }

    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setStep(2);
    setError('');
  };

  // ฟังก์ชันสมัครจริง (ยิง API)
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

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
      await axios.post('/users/register', formData);

      console.log('Registering with data:', formData);

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
        <input
          type="text"
          placeholder="Username"
          className="auth-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

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

      <div className="auth-input-group">
        <LockClosedIcon className="auth-input-icon" style={{ height: 20, width: 20 }} />
        <input
          type="password"
          placeholder="Confirm Password"
          className="auth-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="auth-button">
        Next
      </button>
    </form>
  );

  // ฟอร์มสำหรับ Step 2
  const renderStep2 = () => {
    const majorsForFaculty = facultyMajors[faculty] || [];

    return (
      <form onSubmit={handleSignUp}>
        {/* Faculty: select + placeholder */}
        <div className="auth-input-group">
          <AcademicCapIcon className="auth-input-icon" style={{ height: 20, width: 20 }} />
          <select
            className="auth-input"
            value={faculty}
            onChange={(e) => {
              setFaculty(e.target.value);
              setMajor(''); // รีเซ็ต major ทุกครั้งที่เปลี่ยนคณะ
            }}
            required
          >
            <option value="" disabled>
              Choose a faculty
            </option>

            {facultyOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Major: เปลี่ยนตามคณะที่เลือก */}
        <div className="auth-input-group">
          <BriefcaseIcon className="auth-input-icon" style={{ height: 20, width: 20 }} />

          <select
            className="auth-input"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            disabled={!faculty || majorsForFaculty.length === 0}
            required={majorsForFaculty.length > 0}
          >
            {!faculty && (
              <option value="">
                Choose a major
              </option>
            )}

            {faculty && majorsForFaculty.length === 0 && (
              <option value="">
                ยังไม่มีรายการสาขาสำหรับคณะนี้
              </option>
            )}

            {faculty && majorsForFaculty.length > 0 && (
              <>
                <option value="" disabled>
                  Choose a major
                </option>
                {majorsForFaculty.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        <div className="auth-input-group">
          <UserIcon className="auth-input-icon" style={{ height: 20, width: 20 }} />
          <select
            className="auth-input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="STUDENT">Student</option>
            <option value="INSTRUCTOR">Instructor</option>
          </select>
        </div>

        {role === 'STUDENT' && (
          <div className="auth-input-group">
            <IdentificationIcon
              className="auth-input-icon"
              style={{ height: 20, width: 20 }}
            />
            <input
              type="text"
              placeholder="Student ID (e.g. 67...)"
              className="auth-input"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </div>
        )}

        <button type="submit" className="auth-button">
          Sign Up
        </button>
      </form>
    );
  };

  return (
    <div className="auth-container">
      {/* ฝั่งซ้าย (Logo) */}
      <div className="auth-sidebar">
        <div className="auth-logo-wrapper">
          <img src={logo} alt="CourseReviewHub Logo" />
        </div>
      </div>

      {/* ฝั่งขวา (Form) */}
      <div className="auth-form-container">
        <button
          type="button"
          onClick={() => (step === 1 ? navigate('/login') : setStep(1))}
          className="auth-back-button"
        >
          <ArrowLeftIcon style={{ height: 20, width: 20 }} />
        </button>

        <div className="auth-form-wrapper">
          <div className="auth-avatar-placeholder">
            <UserCircleIcon className="auth-avatar-icon" />
          </div>

          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

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
