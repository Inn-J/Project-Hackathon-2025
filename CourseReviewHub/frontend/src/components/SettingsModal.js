// src/components/SettingsModal.jsx
import React, { useState, useEffect } from 'react';
import './SettingsModal.css';
import apiClient from '../services/axiosConfig';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

function SettingsModal({ isOpen, onClose, userData, onUpdate }) {

    const [username, setUsername] = useState("");
    const [message, setMessage] = useState("");
    const { updateCurrentUserLocal } = useAuth();

    // โหลดค่าจริงเข้าฟอร์ม
    useEffect(() => {
        if (userData) {
            setUsername(userData.username || "");
        }
    }, [isOpen, userData]);

    // SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("กำลังบันทึก...");

        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) throw new Error("กรุณาล็อกอิน");

            const token = await user.getIdToken(true);

            // ส่งเฉพาะ username ไปอัปเดต
            const response = await apiClient.patch(
                "/users",
                { username },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage("บันทึกสำเร็จ!");

            // ส่งกลับไปหน้า ProfilePage ให้มัน refresh UI ทันที
            onUpdate?.(response.data.user);


            updateCurrentUserLocal?.(response.data.user);

            // ปิด modal
            setTimeout(() => onClose(), 800);

        } catch (err) {
            console.error("update error:", err);
            setMessage("เกิดข้อผิดพลาด: " + (err.response?.data?.error || "ไม่สามารถอัปเดตได้"));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2 className="modal-title">แก้ไขโปรไฟล์</h2>

                <form onSubmit={handleSubmit} className="settings-form">

                    {/* Username */}
                    <div className="form-group">
                        <label htmlFor="username">ชื่อผู้ใช้:</label>
                        <input
                            type="text"
                            id="username"
                            placeholder="กรอกชื่อผู้ใช้ใหม่"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    {/* Faculty */}
                    <div className="form-group">
                        <label>คณะ</label>
                        <div className="readonly-field">
                            {userData?.faculty || "ไม่ระบุ"}
                        </div>
                    </div>

                    {/* Major */}
                    <div className="form-group">
                        <label>คณะ</label>
                        <div className="readonly-field">
                            {userData?.major || "ไม่ระบุ"}
                        </div>
                    </div>

                    <button type="submit" className="submit-btn">บันทึก</button>

                    {message && <p className="form-message">{message}</p>}
                </form>
            </div>
        </div>
    );
}

export default SettingsModal;
