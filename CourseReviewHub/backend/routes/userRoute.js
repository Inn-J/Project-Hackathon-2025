import { Router } from "express";
import admin from "../firebase/firebase.js";
import supabase from "../database/supabase.js";

const router = Router();

// POST /api/users/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, username, student_id, faculty, major, role} = req.body;

    // บังคับโดเมน
    if (!email || !email.endsWith("@cmu.ac.th")) {
      return res.status(400).json({ error: "ต้องใช้ @cmu.ac.th เท่านั้น" });
    }

    // 1) สร้างผู้ใช้ใน Firebase
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: username,
    });

    const uid = userRecord.uid;

    // 2) เก็บโปรไฟล์ใน Supabase
    const { error } = await supabase
      .from("users")
      .insert({
        id: uid,
        email,
        username,
        student_id,
        faculty,
        major,
        role,
      });

    if (error) throw error;

    res.status(201).json({
      message: "✅ สร้างผู้ใช้สำเร็จ",
      uid,
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
