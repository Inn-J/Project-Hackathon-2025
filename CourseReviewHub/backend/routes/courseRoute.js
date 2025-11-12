// routes/courseRoute.js
import express from 'express';
import { getAllCourses } from '../controller/courseController.js';

const router = express.Router();

// GET /api/courses (ดึงทั้งหมด)
// GET /api/courses?search=... (ค้นหา)
router.get('/', getAllCourses); 

export default router;