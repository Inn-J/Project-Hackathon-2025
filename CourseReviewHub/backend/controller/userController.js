import admin from "../firebase/firebase.js";
import supabase from "../database/supabase.js";

// POST /api/users/register (สร้างบัญชี)
export const registerUser = async (req, res) => {
  try {
    const { email, password, username, student_id, faculty, major, role } = req.body;
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

    // (ตั้งค่า Role เริ่มต้นให้ User)
    await admin.auth().setCustomUserClaims(uid, { role: role || 'STUDENT' });

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
        role: role || 'STUDENT',
      });
    if (error) throw error;

    res.status(201).json({ message: "✅ สร้างผู้ใช้สำเร็จ", uid });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ----------------------------------------------------------------
// GET /api/users/me (เช็ค Role ของตัวเอง) ⬅️ (API สำคัญสำหรับ Frontend)
// ----------------------------------------------------------------
export const getUserProfile = async (req, res) => {
  try {
    // "ยาม" (checkAuth) ได้ตรวจตั๋วและแปะ user_id มาให้แล้ว
    const uid = req.user_id; 

    const { data, error } = await supabase
      .from("users")
      .select("id,email, username, role, student_id, faculty, major,created_at") 
      .eq("id", uid)
      .single();

    if (error) throw error;
    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------------------------------------------------
// (API ที่เหลือจากไฟล์ของคุณ)
// ----------------------------------------------------------------

// GET /api/users/
export const getAllUsers = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    // (Logic การดึง User ทั้งหมด... เหมาะสำหรับ Admin)
    const { data, error, count } = await supabase.from("users").select("*");
    if (error) throw new Error(error.message);
    res.json({ users: data, count });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/users/:uid
export const getUserById = async (req, res) => {
  try {
    const uid = req.params.uid;
    const { data, error } = await supabase.from("users").select("*").eq("id", uid).maybeSingle();
    if (error) throw new Error(error.message);
    res.json({ profile: data || null });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    // 1) ได้ user_id จาก middleware ตรวจ token (เช่น checkAuth)
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // 2) รับค่าที่จะอัปเดต
    const { username } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ error: "กรุณาระบุ username" });
    }

    // 3) อัปเดตใน Supabase
    const { data, error } = await supabase
      .from("users")
      .update({ username: username.trim() })
      .eq("id", userId)
      .select()
      .maybeSingle(); // ใช้ maybeSingle ป้องกัน PGRST116

    if (error) {
      console.error("Update failed:", error);
      return res.status(500).json({ error: "อัปเดตไม่สำเร็จ" });
    }

    if (!data) {
      // ไม่มี row ที่อัปเดตได้ = ไม่เจอ user หรือโดน RLS บล็อก
      return res
        .status(404)
        .json({ error: "ไม่พบผู้ใช้ หรือไม่มีสิทธิ์แก้ไข" });
    }

    // 4) ส่งข้อมูลใหม่กลับไปให้ frontend
    return res.json({
      message: "อัปเดตชื่อผู้ใช้สำเร็จ",
      user: data,
    });
  } catch (err) {
    console.error("updateMe error:", err);
    return res
      .status(500)
      .json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};


// DELETE /api/users/:uid
export const deleteUser = async (req, res) => {
  try {
    const uid = req.params.uid;
    
    // 1. ลบใน Supabase
    const { error: delProfErr } = await supabase.from("users").delete().eq("id", uid);
    if (delProfErr) throw new Error(delProfErr.message);

    // 2. ลบใน Firebase
    await admin.auth().deleteUser(uid);

    res.json({ message: "ลบผู้ใช้สำเร็จ" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// ----------------------------------------------------------------
// GET /api/users/:id/profile (ดึงโปรไฟล์สาธารณะของ "คนอื่น")
// ----------------------------------------------------------------
export const getUserPublicProfile = async (req, res) => {
  try {
    const { id } = req.params; // ID ของคนที่เราจะไปส่อง

    // 1. ดึงข้อมูล User (ที่ปลอดภัย)
    // ❌ (ห้าม) SELECT 'email' หรือ 'student_id'
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id, username, faculty,major, role, created_at') // ⬅️ (เลือกเฉพาะข้อมูลสาธารณะ)
      .eq('id', id)
      .single();

    if (userErr) throw userErr;
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 2. ดึง "ทุก" รีวิวของ User คนนี้ (พร้อมชื่ออาจารย์ที่ตอบ และ ชื่อวิชา)
    const { data: reviews, error: reviewsErr } = await supabase
      .from('reviews')
      .select(`
        *,
        users ( username ),
        courses ( course_code, name_th ),
        instructor_replies (
          reply_text,
          created_at,
          instructor:users!instructor_replies_instructor_id_fkey (
            username, role
          )
        )
      `)
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    if (reviewsErr) throw reviewsErr;
    
    // 3. จัดรูปแบบรีวิว (เพื่อให้ ReviewCard ใช้งานได้เลย)
    const formattedReviews = reviews.map(review => {
      const latestReply = review.instructor_replies?.[0] || null;
      return {
        ...review,
        author: review.users?.username || 'นักศึกษา', // (ส่งชื่อผู้เขียน)
        authorId: review.user_id, // (ส่ง ID ผู้เขียน)
        course: review.courses, // (ส่งข้อมูลวิชา)
        // (แปลงข้อมูลให้ ReviewCard ใช้ง่าย)
        ratings: {
          satisfaction: review.rating_satisfaction,
          difficulty: review.rating_difficulty,
          workload: review.rating_workload,
        },
        content: {
          prerequisite: review.content_prerequisite,
          prosCons: review.content_pros_cons,
          tips: review.content_tips,
        },
        instructor_reply: latestReply?.reply_text || null,
        instructorName: latestReply?.instructor?.username || null,
      };
    });

    // 4. ส่งกลับ
    res.status(200).json({
      user: user,
      reviews: formattedReviews
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};