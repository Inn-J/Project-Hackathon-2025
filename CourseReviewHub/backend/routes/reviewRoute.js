import express from 'express';
import { getLatestReviews, createReview, getReviewsByCourse, getReviewById, updateReview, deleteReview } from '../controller/reviewController.js';
// (ยังไม่ต้องใช้ "ยาม" checkAuth ก็ได้ ถ้าอยากให้หน้า Home โหลดเร็ว)

const router = express.Router();

// GET /api/reviews/latest
router.get('/latest', getLatestReviews); 
router.get('/course/:courseId', getReviewsByCourse); 
router.get('/:id', getReviewById);
router.post('/', createReview); 
router.patch('/:id', updateReview);
router.delete('/:id', deleteReview);

export default router;