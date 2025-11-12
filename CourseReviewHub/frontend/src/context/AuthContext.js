import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // ⬅️ เพิ่ม signOut
import axios from '../services/axiosConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const response = await axios.get('/users/me');
          setUserProfile(response.data);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ⬅️ เพิ่มฟังก์ชัน Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    logout // ⬅️ Export ออกมาให้ใช้ได้
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};