// routes/courseRoute.js
import express from 'express';
import { getAllCourses,getCourseById,createCourse,updateCourse,deleteCourse } from '../controller/courseController.js';

const router = express.Router();

// GET /api/courses (ดึงทั้งหมด)
// GET /api/courses?search=... (ค้นหา)
router.get('/', getAllCourses); 
router.get('/:id', getCourseById);
router.post('/', createCourse);
router.patch('/:id', updateCourse);
router.delete('/:id', deleteCourse);

export default router;