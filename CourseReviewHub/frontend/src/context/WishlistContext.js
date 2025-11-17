// src/context/WishlistContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/axiosConfig';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistCourseIds, setWishlistCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const { currentUser } = useAuth();

  // ✅ ฟังก์ชันโหลด wishlist (ใช้ซ้ำได้)
  const fetchWishlist = async () => {
    try {
      // ถ้ายังไม่ได้ login ก็เคลียร์ state
      if (!currentUser) {
        setWishlistItems([]);
        setWishlistCourseIds(new Set());
        setLoading(false);
        return;
      }

      setLoading(true);
      const response = await apiClient.get('/wishlist/my');

      setWishlistItems(response.data);
      const ids = new Set(response.data.map(item => item.course_id));
      setWishlistCourseIds(ids);
    } catch (err) {
      console.error('[WishlistContext] ยิง API ไม่สำเร็จ:', err);
      setWishlistItems([]);
      setWishlistCourseIds(new Set());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [currentUser]); 

  const addToWishlist = async (courseId, note = '') => {
    try {
      await apiClient.post('/wishlist', {
        course_id: courseId,
        personal_note: note,
      });

      // 🔥 รีโหลดจากเซิร์ฟเวอร์ให้ state อัปเดตทุกหน้า
      await fetchWishlist();
    } catch (err) {
      console.error("Error adding to wishlist:", err);
      throw err; 
    }
  };

  const updateWishlistNote = async (courseId, newNote) => {
  try {
    await apiClient.patch(`/wishlist/${courseId}`, {
      personal_note: newNote || null,
    });

    await fetchWishlist();  // โหลดข้อมูลใหม่จาก server

  } catch (err) {
    console.error("Error updating wishlist note:", err);
    throw err;
  }
};


  const removeFromWishlist = async (courseId) => {
    try {
      await apiClient.delete(`/wishlist/${courseId}`);

      // อัปเดต state local ทันที (หรือจะใช้ fetchWishlist() ก็ได้)
      setWishlistItems(prev => prev.filter(item => item.course_id !== courseId));
      setWishlistCourseIds(prev => {
        const newIds = new Set(prev);
        newIds.delete(courseId); 
        return newIds;
      });
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      throw err;
    }
  };

  const isCourseInWishlist = (courseId) => {
    return wishlistCourseIds.has(Number(courseId));
  };

  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    updateWishlistNote,
    isCourseInWishlist,
    refreshWishlist: fetchWishlist, 
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
