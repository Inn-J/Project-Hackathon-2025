import express from 'express';
import { getLatestReviews, createReview, getReviewsByCourse, getReviewById, updateReview, deleteReview,getMyReviews,voteReviewHelpful } from '../controller/reviewController.js';
import checkAuth from "../middleware/auth.js";

const router = express.Router();

// GET /api/reviews/latest
router.get('/latest', getLatestReviews); 
router.get('/course/:courseId', getReviewsByCourse); 
router.get('/my',checkAuth ,getMyReviews);
router.get('/:id', getReviewById);
router.post('/', createReview); 
router.patch('/:id', updateReview);
router.delete('/:id',checkAuth, deleteReview);
router.post('/:id/helpful', checkAuth, voteReviewHelpful);

export default router;