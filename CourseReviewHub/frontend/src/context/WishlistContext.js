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

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      
      // ⬇️ === (แก้ไข) ลบ /api/ ออก === ⬇️
      apiClient.get('/wishlist/my') 
        .then(response => {
          console.log('[WishlistContext] ยิง API สำเร็จ! ได้ข้อมูล:', response.data);
          setWishlistItems(response.data);
          const ids = new Set(response.data.map(item => item.course_id));
          setWishlistCourseIds(ids);
        })
        .catch(err => {
          console.error('[WishlistContext] ยิง API ไม่สำเร็จ (พัง)!:', err);
          setWishlistItems([]);
          setWishlistCourseIds(new Set());
        })
        .finally(() => setLoading(false));
    } else {
      setWishlistItems([]);
      setWishlistCourseIds(new Set());
      setLoading(false);
    }
  }, [currentUser]); 

  const addToWishlist = async (courseId, note = '') => {
    try {
      // ⬇️ === (แก้ไข) ลบ /api/ ออก === ⬇️
      await apiClient.post('/wishlist', {
        course_id: courseId,
        personal_note: note,
      });
      
      // ⬇️ === (แก้ไข) ลบ /api/ ออก === ⬇️
      const newResponse = await apiClient.get('/wishlist/my');
      setWishlistItems(newResponse.data);
      const ids = new Set(newResponse.data.map(item => item.course_id));
      setWishlistCourseIds(ids);

    } catch (err) {
      console.error("Error adding to wishlist:", err);
      throw err; 
    }
  };

  const removeFromWishlist = async (courseId) => {
    try {
      // ⬇️ === (แก้ไข) ลบ /api/ ออก === ⬇️
      await apiClient.delete(`/wishlist/${courseId}`);
      
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
    isCourseInWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};