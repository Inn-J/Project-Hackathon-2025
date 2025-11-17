import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import apiClient from '../services/axiosConfig'; // ⬅️ ต้องใช้ตัวนี้เพื่อดึง Role

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. คอยฟัง Firebase ตลอดเวลา
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 2. ถ้า Firebase บอกว่า "ล็อกอินแล้ว" 
        try {
          // 3. ยิง API ของอิน (/me) เพื่อเอา Role (Interceptor จะแนบ Token ไปให้)
          const response = await apiClient.get('/users/me');
          
          // 4. (สำคัญมาก!) เก็บข้อมูลโปรไฟล์ที่รวม Role แล้ว
          setCurrentUser(response.data); 
          
        } catch (error) {
          // 5. ถ้าดึง Role จาก Backend ไม่ได้ (เช่น 401 Unauthorized หรือ 500)
          console.error("Auth Error: Could not fetch user profile (Role) from Backend. Forcing Logout.", error);
          
          // ถ้าดึง Role ไม่ได้ ให้ Force Logout เพื่อบังคับให้ User ล็อกอินใหม่
          setCurrentUser(null);
          auth.signOut(); 
        }
      } else {
        // 6. ถ้า Logout
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe; 
  }, []);

  const value = {
    currentUser, // ข้อมูลโปรไฟล์ (มี Role)
    loading      // สถานะการโหลด
  };

  return (
    <AuthContext.Provider value={value}>
      {/* โชว์หน้าเว็บก็ต่อเมื่อเช็ค Token เสร็จแล้วเท่านั้น */}
      {!loading && children} 
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}