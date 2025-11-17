import express from 'express';
import { getLatestReviews, createReview, getReviewsByCourse, getReviewById, updateReview, deleteReview, getMyReviews, voteReviewHelpful, getMyHelpfulVote, createReviewReply, getMyReviewReplies } from '../controller/reviewController.js';
import checkAuth from "../middleware/auth.js";
const router = express.Router();

// GET /api/reviews/latest
router.get('/latest', getLatestReviews);
router.get('/course/:courseId', getReviewsByCourse);
router.get('/my', checkAuth, getMyReviews);
router.get('/:id', getReviewById);
router.post('/', checkAuth, createReview);
router.patch('/:id', checkAuth, updateReview);
router.delete('/:id', checkAuth, deleteReview);
router.post('/:id/helpful', checkAuth, voteReviewHelpful);
router.get('/:id/helpful/me', checkAuth, getMyHelpfulVote);
//router.get('/faculty', checkAuth, getReviewByFaculty);
router.post('/:id/replies',checkAuth, createReviewReply )        // 1. เช็กว่า Login (ยามคนเดียว)   // 2. ส่งต่อให้ "คนทำงาน;
router.get('/replies/my', checkAuth, getMyReviewReplies);      // ดึง "รีวิวที่ฉันตอบกลับ"

export default router;