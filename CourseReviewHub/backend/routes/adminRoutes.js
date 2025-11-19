// src/routes/adminRoutes.js
import express from 'express';
import checkAuth from '../middleware/auth.js'; // ยามคนเดิม
import { 
  getAllReports, 
  dismissReport, 
  deleteReviewByAdmin 
} from '../controller/adminController.js';

const router = express.Router();

// ทุกเส้นทางต้องผ่าน checkAuth (เพื่อเช็กว่า login และดึง role มาให้)
router.get('/reports', checkAuth, getAllReports);
router.delete('/reports/:id', checkAuth, dismissReport);
router.delete('/reviews/:id', checkAuth, deleteReviewByAdmin);

export default router;