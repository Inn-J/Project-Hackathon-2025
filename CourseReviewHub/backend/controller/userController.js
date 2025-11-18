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
    const uid = req.user_id; 

    // 1. ดึงข้อมูล User
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email, username, role, student_id, faculty, major, created_at") 
      .eq("id", uid)
      .single();
    
    if (userError) throw userError;

    // 2. (เพิ่ม) ดึงจำนวนรีวิวที่เขียน
    const { count: reviewCount, error: countError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true }) // head: true = ไม่เอาเนื้อหา เอาแต่จำนวน
      .eq('user_id', uid);
      
    // 3. (เพิ่ม) ดึงจำนวน Helpful Votes ที่ "ได้รับ"
    //    (หา review ของฉัน -> แล้วหา vote ของ review เหล่านั้น)
    const { data: myReviews } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', uid);
      
    const myReviewIds = myReviews?.map(r => r.id) || [];
    
    const { count: helpfulCount } = await supabase
      .from('helpful_votes')
      .select('*', { count: 'exact', head: true })
      .in('review_id', myReviewIds) // vote ที่อยู่ในรีวิวของฉัน
      .eq('isHelpful', true); // เฉพาะที่เป็น true

    // 4. รวมร่าง
    const responseData = {
      ...userData,
      stats: {
        reviewCount: reviewCount || 0,
        helpfulCount: helpfulCount || 0
      }
    };

    res.status(200).json(responseData);

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
    const { id } = req.params;

    // 1. ดึงข้อมูล User (เฉพาะข้อมูลสาธารณะ)
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id, username, faculty, major, role, created_at')
      .eq('id', id)
      .single();

    if (userErr || !user) return res.status(404).json({ error: 'User not found' });

    // 2. ดึง "ทุก" รีวิวของ User คนนี้
    const { data: reviews, error: reviewsErr } = await supabase
      .from('reviews')
      .select(`
        *,
        courses (id, course_code, name_th),
        instructor_replies (
          reply_text, created_at,
          instructor:users!instructor_replies_instructor_id_fkey (username, role)
        )
      `)
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    if (reviewsErr) throw reviewsErr;

    // -------------------------------------------------------
    // 👇 3. (เพิ่มใหม่) ดึงข้อมูล Helpful Votes ของรีวิวเหล่านี้
    // -------------------------------------------------------
    const reviewIds = reviews.map(r => r.id);
    
    // ไปหาว่ารีวิวกลุ่มนี้ มีใครมากด isHelpful = true บ้าง
    const { data: votes, error: votesErr } = await supabase
      .from('helpful_votes')
      .select('review_id')
      .in('review_id', reviewIds)
      .eq('isHelpful', true);

    if (votesErr) throw votesErr;
    // -------------------------------------------------------


    // 4. จัดรูปแบบรีวิว (รวมคะแนนโหวตเข้าไป)
    const formattedReviews = reviews.map(review => {
      // นับคะแนนโหวตของรีวิวนี้
      const voteCount = votes.filter(v => v.review_id === review.id).length;
      const latestReply = review.instructor_replies?.[0] || null;

      return {
        ...review,
        helpfulCount: voteCount, // ✅ ใส่คะแนนโหวตให้ Frontend ใช้
        
        author: user.username,   // ใช้ชื่อเจ้าของ Profile
        authorId: user.id,
        course: review.courses,
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

    // 5. (แถม) คำนวณ Stats ส่งไปให้เลย Frontend จะได้ไม่ต้องคิดเยอะ
    const stats = {
       reviewCount: reviews.length,
       // นับจำนวนวิชาที่ไม่ซ้ำกัน (subjectsReviewed)
       subjectsReviewed: new Set(reviews.map(r => r.course_id)).size, 
       // รวมคะแนนช่วยเหลือทั้งหมด
       totalHelpful: votes.length, 
       // คะแนนเฉลี่ย
       averageRating: reviews.length > 0 
         ? (reviews.reduce((acc, r) => acc + r.rating_satisfaction, 0) / reviews.length).toFixed(1) 
         : 0
    };

    // 6. ส่งกลับ
    res.status(200).json({
      user: user,
      reviews: formattedReviews,
      stats: stats // ✅ ส่ง stats ไปด้วย
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};