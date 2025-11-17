// src/pages/WishlistPage.jsx
import React from 'react';
import { useWishlist } from '../context/WishlistContext'; 
import WishlistCard from '../components/WishlistCard'; 
import Header from '../components/Header';
import './WishlistPage.css'; 

export default function WishlistPage() {
  const {
    wishlistItems,
    loading,
    removeFromWishlist,
    updateWishlistNote,   // ✅ ดึงจาก Context
  } = useWishlist();

  const handleRemoveItem = async (courseId) => {
    try {
      await removeFromWishlist(courseId); 
    } catch (err) {
      alert("ลบไม่สำเร็จ");
    }
  };

  // ✅ ฟังก์ชันสำหรับอัปเดตโน้ต ใช้ courseId ตาม Context
  const handleUpdateNote = async (courseId, newNote) => {
    try {
      await updateWishlistNote(courseId, newNote);
    } catch (err) {
      console.error("Error updating wishlist note:", err);
      alert("บันทึกบันทึกส่วนตัวไม่สำเร็จ");
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading-state">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="wishlist-page-container">
        <div className="wishlist-header">
          <h1>✨ รายการวิชาที่บันทึกไว้</h1>
          <p>วิชาที่คุณสนใจและต้องการติดตาม ({wishlistItems.length} วิชา)</p>
        </div>

        <div className="wishlist-list">
          {wishlistItems.length > 0 ? (
            wishlistItems.map(item => (
              <WishlistCard 
                key={item.id}
                item={item}
                onRemove={handleRemoveItem}
                onUpdateNote={handleUpdateNote}   /* ✅ ส่ง callback ลงไป */
              />
            ))
          ) : (
            <p>คุณยังไม่มีวิชาที่บันทึกไว้</p>
          )}
        </div>
      </div>
    </>
  );
}
