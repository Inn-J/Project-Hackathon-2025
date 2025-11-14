import express from 'express';
import {
  getMyWishlist,
  addWishlist,
  removeWishlist,
} from '../controller/wishlistController.js';

// ⬅️ 1. Import "ยาม" (middleware) ของคุณ
import checkAuth from "../middleware/auth.js"; // Import "ยาม"

const router = express.Router();

// ✅ แก้ไขตรงนี้ ✅
// router.use(protect); // ใช้วิธีนี้ก็ได้ (ถ้าอยากให้ 'protect' ทุกอัน)

// หรือจะใส่ทีละอันก็ได้:
router.get('/my', checkAuth, getMyWishlist); // ⬅️ 2. เพิ่ม 'protect'
router.post('/', checkAuth, addWishlist); // ⬅️ 3. เพิ่ม 'protect'
router.delete('/:courseId', checkAuth, removeWishlist); // ⬅️ 4. เพิ่ม 'protect'

export default router;