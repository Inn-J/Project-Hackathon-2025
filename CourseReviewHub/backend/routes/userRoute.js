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

router.get("/", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const offset = Math.max(parseInt(req.query.offset || "0", 10), 0);

    let query = supabase
      .from("users")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (q) {
      query = query.or(`email.ilike.%${q}%,username.ilike.%${q}%`);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    res.json({ users: data, count, limit, offset });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ============================================================
   READ ONE: GET /api/users/:uid  (uid = Firebase UID)
============================================================ */
router.get("/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;

    const [authRec, profRes] = await Promise.all([
      admin.auth().getUser(uid).catch(() => null),
      supabase.from("users").select("*").eq("id", uid).maybeSingle(),
    ]);
    if (profRes.error) throw new Error(profRes.error.message);

    res.json({profile: profRes.data || null,});
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/* ============================================================
   UPDATE: PATCH /api/users/:uid
   - อัปเดต email/password บน Firebase
   - อัปเดตโปรไฟล์บน Supabase
   - อัปเดต role (custom claims + table)
============================================================ */
router.patch("/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;
    const { email, password, username, student_id, faculty, major, tags, role } = req.body;

    // ตรวจสอบว่าผู้ใช้มีอยู่ใน Supabase
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("id", uid)
      .maybeSingle();

    if (checkError) throw new Error(checkError.message);
    if (!existingUser) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    }

    // 1) อัปเดต Firebase Authentication
    const firebaseUpdates = {};
    if (email !== undefined && email !== existingUser.email) {
      // ตรวจสอบโดเมน @cmu.ac.th
      if (!email.endsWith("@cmu.ac.th")) {
        return res.status(400).json({ error: "ต้องใช้ @cmu.ac.th เท่านั้น" });
      }
      firebaseUpdates.email = email;
      firebaseUpdates.emailVerified = false;
    }
    if (password !== undefined && password.trim() !== "") {
      firebaseUpdates.password = password;
    }
    if (username !== undefined) {
      firebaseUpdates.displayName = username;
    }

    // อัปเดต Firebase ถ้ามีการเปลี่ยนแปลง
    if (Object.keys(firebaseUpdates).length > 0) {
      await admin.auth().updateUser(uid, firebaseUpdates);
    }

    // อัปเดต Custom Claims สำหรับ role
    if (role !== undefined && role !== existingUser.role) {
      await admin.auth().setCustomUserClaims(uid, { role });
    }

    // 2) อัปเดต Supabase
    const supabaseUpdates = {};
    if (email !== undefined && email !== existingUser.email) {
      supabaseUpdates.email = email;
    }
    if (username !== undefined && username !== existingUser.username) {
      supabaseUpdates.username = username;
    }
    if (student_id !== undefined && student_id !== existingUser.student_id) {
      supabaseUpdates.student_id = student_id;
    }
    if (faculty !== undefined && faculty !== existingUser.faculty) {
      supabaseUpdates.faculty = faculty;
    }
    if (major !== undefined && major !== existingUser.major) {
      supabaseUpdates.major = major;
    }
    if (tags !== undefined) {
      supabaseUpdates.tags = tags;
    }
    if (role !== undefined && role !== existingUser.role) {
      supabaseUpdates.role = role;
    }

    // อัปเดต Supabase ถ้ามีการเปลี่ยนแปลง
    if (Object.keys(supabaseUpdates).length > 0) {
      const { data, error } = await supabase
        .from("users")
        .update(supabaseUpdates)
        .eq("id", uid)
        .select()
        .single();

      if (error) throw new Error(error.message);

      return res.json({ message: "อัปเดตผู้ใช้สำเร็จ", profile: data });
    }

    // ถ้าไม่มีการเปลี่ยนแปลง
    res.json({ message: "ไม่มีการเปลี่ยนแปลง", profile: existingUser });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ============================================================
   DELETE: DELETE /api/users/:uid
   - ลบโปรไฟล์ใน Supabase
   - ลบผู้ใช้ใน Firebase
============================================================ */
router.delete("/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;

    const { error: delProfErr } = await supabase.from("users").delete().eq("id", uid);
    if (delProfErr) throw new Error(delProfErr.message);

    await admin.auth().deleteUser(uid);

    res.json({ message: "ลบผู้ใช้สำเร็จ" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;