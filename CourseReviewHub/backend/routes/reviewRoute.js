import express from 'express';
import { getLatestReviews } from '../controller/reviewController.js';
// (ยังไม่ต้องใช้ "ยาม" checkAuth ก็ได้ ถ้าอยากให้หน้า Home โหลดเร็ว)

const router = express.Router();

// GET /api/reviews/latest
router.get('/latest', getLatestReviews); 

export default router;