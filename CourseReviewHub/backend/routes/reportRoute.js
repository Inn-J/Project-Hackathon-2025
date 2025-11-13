import express from 'express';
import { createReport, getReports, getReportById, updateReport, deleteReport} from '../controller/reportController.js';
const router = express.Router();

router.post('/', createReport);
// หรือผูกกับ review โดยใช้ param
router.post('/reviews/:reviewId/reports', createReport);

// READ LIST
router.get('/', getReports);

// READ SINGLE
router.get('/:id', getReportById);

// UPDATE
router.put('/:id', updateReport);

// DELETE
router.delete('/:id', deleteReport);

export default router;