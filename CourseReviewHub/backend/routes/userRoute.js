import { Router } from "express";
import checkAuth from "../middleware/auth.js"; // Import "ยาม"

// Import Logic ทั้งหมดมาจาก Controller
import {
  registerUser,
  getUserProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserPublicProfile
} from "../controller/userController.js";

const router = Router();

// ----------------------------------------------------------------
// 🚀 เส้นทางหลักที่ Frontend ต้องใช้
// ----------------------------------------------------------------

// (Public) สร้างบัญชี
router.post("/register", registerUser);

// (Private) ดึงข้อมูลโปรไฟล์และ Role ของตัวเอง
router.get("/me", checkAuth, getUserProfile);
router.get("/:id/profile", checkAuth, getUserPublicProfile);

// ----------------------------------------------------------------
// 🔒 เส้นทางสำหรับ Admin (ถ้ามี)
// ----------------------------------------------------------------

// (Private) ดึงผู้ใช้ทั้งหมด (อาจจะสำหรับ Admin)
router.get("/", checkAuth, getAllUsers);

// (Private) ดึง/แก้ไข/ลบ ผู้ใช้คนอื่น (สำหรับ Admin)
router.get("/:uid", checkAuth, getUserById);
router.patch("/", checkAuth, updateUser);
router.delete("/:uid", checkAuth, deleteUser);

export default router;