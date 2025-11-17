import supabase from '../database/supabase.js';

// ----------------------------------------------------------------
// POST /api/reviews (CREATE - สร้างรีวิวใหม่)
// ----------------------------------------------------------------
export const createReview = async (req, res) => {
  try {
    const userId = req.user_id;        // มาจาก middleware checkAuth
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      course_id,
      rating_satisfaction,
      rating_difficulty,
      rating_workload,
      grade,
      tags = [],
      content_prerequisite,
      content_pros_cons,
      content_tips,
    } = req.body;

    // ---- validate คร่าว ๆ ----
    if (!course_id) {
      return res.status(400).json({ error: "course_id is required" });
    }
    if (
      !rating_satisfaction ||
      !rating_difficulty ||
      !rating_workload ||
      !grade ||
      !content_prerequisite ||
      !content_pros_cons ||
      !content_tips
    ) {
      return res.status(400).json({
        error:
          "rating_satisfaction, rating_difficulty, rating_workload, grade และ content ทั้งสามช่องเป็นค่าบังคับ",
      });
    }

    const inRange = (n) => typeof n === "number" && n >= 1 && n <= 5;
    if (
      !inRange(rating_satisfaction) ||
      !inRange(rating_difficulty) ||
      !inRange(rating_workload)
    ) {
      return res
        .status(400)
        .json({ error: "คะแนนต้องอยู่ระหว่าง 1 ถึง 5" });
    }

    // 🔍 เช็คว่ามีรีวิวเก่าของ user ในวิชานี้อยู่แล้วหรือยัง
    const { data: existingReviews, error: existingErr } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", course_id);

    if (existingErr) throw existingErr;

    if (existingReviews && existingReviews.length > 0) {
      return res.status(400).json({
        error: "คุณได้เขียนรีวิววิชานี้ไปแล้ว ไม่สามารถรีวิวซ้ำได้",
      });
    }

    // ---- insert ลง Supabase ----
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        user_id: userId,
        course_id,
        rating_satisfaction,
        rating_difficulty,
        rating_workload,
        grade,
        tags,
        content_prerequisite,
        content_pros_cons,
        content_tips,
      })
      .select(
        `*,
         users ( username )`
      )
      .single();   // ตรงนี้โอเค เพราะ insert แค่ 1 แถว

    if (error) throw error;

    return res
      .status(201)
      .json({ message: "✅ Review created successfully", ...data });
  } catch (error) {
    console.error("createReview error:", error);
    return res.status(500).json({ error: error.message });
  }
};



// ----------------------------------------------------------------
// GET /api/reviews/latest (READ - ดึง 5 รีวิวล่าสุด)
// ----------------------------------------------------------------
export const getLatestReviews = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
            *,
            courses (id,course_code, name_th),
            users (username, role),
            instructor_replies (
                id,
                reply_text,
                created_at,
                instructor:users!instructor_replies_instructor_id_fkey (
                    id,
                    username,
                    role
                )
            )
          `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    // ⬇️ === (นี่คือ "จุดที่แก้ไข" ครับ) === ⬇️
    const formattedData = data.map(review => {
      const latestReply = review.instructor_replies?.[0] || null;
      return {
        ...review,
        
        // (1. เพิ่มข้อมูล Course ที่ดึงมา)
        course: review.courses  || null, 
        
        // (2. เพิ่มข้อมูล Author)
        author: review.users?.username || 'นักศึกษา',
        authorId: review.user_id,

        // (3. จัดรูปแบบ Ratings)
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

        // (4. จัดรูปแบบ Reply)
        instructor_reply: latestReply?.reply_text || null,
        instructorName: latestReply?.instructor?.username || null, // (ชื่อย่อ)
        instructor: latestReply?.instructor || null, // (ข้อมูลเต็ม)
      };
    });
    // ⬆️ === (สิ้นสุดการแก้ไข) === ⬆️

    res.status(200).json(formattedData);

  } catch (error) {
    console.error('Error in getLatestReviews:', error);
    res.status(500).json({
      error: error.message,
      details: 'Failed to fetch latest reviews'
    });
  }
};

// ----------------------------------------------------------------
// GET /api/reviews/course/:courseId (NEW - ดึงรีวิวทั้งหมดของรายวิชา)
// ----------------------------------------------------------------
export const getReviewsByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        courses (course_code, name_th),
        users (username, role),
        instructor_replies (
          id,
          reply_text,
          created_at,
          instructor:users!instructor_replies_instructor_id_fkey (
            id,
            username,
            role
          )
        )
      `)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // ⬇️ แก้ตรงนี้ให้เหมือน getLatestReviews
    const formattedData = data.map(review => {
      const latestReply = review.instructor_replies?.[0] || null;
      return {
        ...review,
        
        // ✅ เพิ่มข้อมูล Course
        course: review.courses, 
        
        // ✅ เพิ่มข้อมูล Author
        author: review.users?.username || 'นักศึกษา',
        authorId: review.user_id,

        // ✅ จัดรูปแบบ Ratings
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

        // ✅ จัดรูปแบบ Reply
        instructor_reply: latestReply?.reply_text || null,
        instructorName: latestReply?.instructor?.username || null,
        instructor: latestReply?.instructor || null,
      };
    });

    res.status(200).json(formattedData);
    
  } catch (error) {
    console.error("getReviewsByCourse error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ----------------------------------------------------------------
// GET /api/reviews/my - ดึงรีวิวของ user ปัจจุบัน
// ----------------------------------------------------------------
export const getMyReviews = async (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) return res.status(401).json({ error: "Authentication required." });

    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        courses (course_code, name_th),
        users (username, role),
        instructor_replies (
            id,
            reply_text,
            created_at,
            instructor:users!instructor_replies_instructor_id_fkey (
                id,
                username,
                role
            )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // ⬇️ === (นี่คือ "จุดที่แก้ไข" ครับ) === ⬇️
    const formattedData = data.map(review => {
      const latestReply = review.instructor_replies?.[0] || null;
      return {
        ...review,
        
        // (1. เพิ่มข้อมูล Course)
        course: review.courses, 
        
        // (2. เพิ่มข้อมูล Author)
        author: review.users?.username || 'นักศึกษา',
        authorId: review.user_id,

        // (3. จัดรูปแบบ Ratings)
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

        // (4. จัดรูปแบบ Reply)
        instructor_reply: latestReply?.reply_text || null,
        instructorName: latestReply?.instructor?.username || null,
        instructor: latestReply?.instructor || null,
      };
    });
    // ⬆️ === (สิ้นสุดการแก้ไข) === ⬆️

    res.status(200).json(formattedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------------------------------------------------
// GET /api/reviews/:id (READ by ID - ดึงรีวิวตาม ID)
// ----------------------------------------------------------------
export const getReviewById = async (req, res) => {
  try {
    const reviewId = req.params.id; // ✅ แก้ไข

    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users (username, role),
        instructor_replies (
            id,
            reply_text,
            created_at,
            instructor:users!instructor_replies_instructor_id_fkey (
                id,
                username,
                role
            )
        )
      `)
      .eq('id', reviewId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Review not found" });
    }

    // จัดรูปแบบข้อมูล
    const latestReply = data.instructor_replies?.[0] || null;
    const formattedReview = {
      ...data,
      instructor_reply: latestReply?.reply_text || null,
      instructor: latestReply?.instructor || null,
      instructor_reply_date: latestReply?.created_at || null,
    };

    res.status(200).json(formattedReview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ----------------------------------------------------------------
// PATCH /api/reviews/:id (UPDATE - อัปเดตรีวิว)
// ----------------------------------------------------------------
export const updateReview = async (req, res) => {
  // ⚠️ NOTE: ต้องตรวจสอบว่า req.user_id (ผู้ใช้งานปัจจุบัน) ตรงกับ user_id ของรีวิวหรือไม่
  try {
    const userId = req.user_id;
    const reviewId = req.params.id;
    const updates = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }
    delete updates.id;
    delete updates.user_id; // ป้องกันการเปลี่ยนเจ้าของรีวิว

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields provided for update." });
    }

    // อัปเดตข้อมูลโดยมีเงื่อนไขว่าต้องเป็นรีวิวที่มี ID ตรงและผู้ใช้ปัจจุบันเป็นเจ้าของ
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .eq('user_id', userId) // ⬅️ เงื่อนไขสำคัญ: ต้องเป็นเจ้าของรีวิวเท่านั้น
      .select();

    if (error) throw error;

    if (data.length === 0) {
      return res.status(403).json({ error: "Review not found or you are not the owner of this review." });
    }

    res.status(200).json({ message: "✅ Review updated successfully", review: data[0] });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const voteReviewHelpful = async (req, res) => {
  try {
    const userId = req.user_id;        // จาก checkAuth
    const reviewId = req.params.id;
    const { isHelpful } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }

    if (typeof isHelpful !== 'boolean') {
      return res.status(400).json({ error: "isHelpful must be boolean." });
    }

    // 1) ดึง role ของ user
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .maybeSingle();

    if (userErr) throw userErr;
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if ((user.role || '').toLowerCase() !== 'student') {
      return res.status(403).json({ error: "Only students can vote helpful/unhelpful." });
    }

    // 2) เช็คว่ารีวิวมีจริงไหม (กัน user ยิง id มั่ว)
    const { data: review, error: reviewErr } = await supabase
      .from('reviews')
      .select('id')
      .eq('id', reviewId)
      .maybeSingle();

    if (reviewErr) throw reviewErr;
    if (!review) {
      return res.status(404).json({ error: "Review not found." });
    }

    // 3) หา vote เดิมของ user คนนี้ในรีวิวนี้
    const { data: existing, error: exErr } = await supabase
      .from('helpful_votes')
      .select('id, isHelpful')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .maybeSingle();

    if (exErr) throw exErr;

    let savedVote;

    if (!existing) {
      // ยังไม่เคยโหวต → insert แถวใหม่
      const { data, error: insertErr } = await supabase
        .from('helpful_votes')
        .insert({
          user_id: userId,
          review_id: reviewId,
          isHelpful: isHelpful,
        })
        .select('*')
        .single();

      if (insertErr) throw insertErr;
      savedVote = data;
    } else {
      // โหวตแล้ว → update ค่า isHelpful แทน
      const { data, error: updateErr } = await supabase
        .from('helpful_votes')
        .update({ isHelpful: isHelpful })
        .eq('id', existing.id)
        .select('*')
        .single();

      if (updateErr) throw updateErr;
      savedVote = data;
    }

    return res.status(200).json({
      message: "Vote recorded successfully.",
      vote: savedVote,
    });

  } catch (error) {
    console.error("voteReviewHelpful error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getMyHelpfulVote = async (req, res) => {
  try {
    const userId = req.user_id;
    const reviewId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const { data, error } = await supabase
      .from('helpful_votes')
      .select('isHelpful')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    // ถ้าไม่เคยโหวตเลย → isHelpful = null
    return res.status(200).json({
      isHelpful: data ? data.isHelpful : null,
    });

  } catch (err) {
    console.error("getMyHelpfulVote error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ----------------------------------------------------------------
// DELETE /api/reviews/:id (DELETE - ลบรีวิว)
// ----------------------------------------------------------------
export const deleteReview = async (req, res) => {
  try {
    const userId = req.user_id;
    const reviewId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', userId);

    if (error) throw error;

    return res.status(200).json({ message: "✅ Review deleted successfully" });

  } catch (error) {
    console.error("deleteReview error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const createReviewReply = async (req, res) => {
  try {
    // ----------------------------------------------------
    // 👇 2. ย้าย "ยาม" (Logic การเช็ก Role) มาไว้ตรงนี้
    // ----------------------------------------------------
    
    // ดึง ID ผู้ใช้ (จาก 'checkAuth' ตัวเดิม)
    const authUserId = req.user_id; 
    if (!authUserId) {
      return res.status(401).json({ error: 'ไม่พบ ID ผู้ใช้จาก Token' });
    }

    // ค้นหา "Role" ของผู้ใช้คนนี้จาก Database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role') // (ดึงมาแค่ role ก็พอ)
      .eq('id', authUserId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้ในระบบ' });
    }

    // ⭐️ นี่คือการเช็ก Role ที่ปลอดภัย ⭐️
    if (user.role !== 'INSTRUCTOR' && user.role !== 'instructor') {
      return res.status(403).json({ error: 'Permission Denied: ต้องเป็นอาจารย์เท่านั้น' });
    }
    // (ถ้าผ่านตรงนี้ไปได้ = เป็นอาจารย์แน่นอน)
    // ----------------------------------------------------
    // 
    // 
    // 👇 3. เริ่ม "ทำงาน" (โค้ดเดิม)
    // ----------------------------------------------------
    const reviewId = req.params.id; // ID ของรีวิว
    const { content } = req.body;   // เนื้อหาที่ตอบกลับ
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'กรุณาใส่เนื้อหาที่ตอบกลับ' });
    }

    const { data, error } = await supabase
      .from('instructor_replies')
      .insert({
        review_id: reviewId,
        instructor_id: authUserId, // ใช้ ID อาจารย์ที่เช็กแล้ว
        reply_text: content,
      })
      .select()
      .single();

    if (error) { throw error; }

    res.status(201).json(data);

  } catch (err) {
    console.error("Reply error:", err.message);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่ Server' });
  }
};