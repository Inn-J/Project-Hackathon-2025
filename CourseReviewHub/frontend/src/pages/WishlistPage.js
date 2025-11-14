import React from 'react';
import { useWishlist } from '../context/WishlistContext'; 
import WishlistCard from '../components/WishlistCard'; 
import Header from '../components/Header'; // ⬅️ หน้านี้ใช้ Header แบบไม่มีค้นหา
import './WishlistPage.css'; 

export default function WishlistPage() {
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();

  const handleRemoveItem = async (courseId) => {
    try {
      await removeFromWishlist(courseId); 
    } catch (err) {
      alert("ลบไม่สำเร็จ");
    }
  };

  if (loading) return <div><Header /><div className="loading-state">กำลังโหลด...</div></div>;

  return (
    <>
      <Header /> {/* ⬅️ เรียกใช้ Header ที่นี่ */}
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