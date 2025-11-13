import supabase from '../database/supabase.js';

// ----------------------------------------------------------------
// POST /api/reviews (CREATE - สร้างรีวิวใหม่)
// ----------------------------------------------------------------
export const createReview = async (req, res) => {
    // ⚠️ NOTE: req.user_id ควรมาจาก Middleware (เช่น protect) เพื่อยืนยันตัวตนผู้สร้าง
    try {
        const userId = req.user_id; // ดึง User ID จาก Token/Session
        const { course_id, rating, content, semester, academic_year } = req.body;

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!userId || !course_id || !rating || !content) {
            return res.status(400).json({ error: "Required fields (user_id, course_id, rating, content) are missing." });
        }

        // ตรวจสอบว่า rating อยู่ในขอบเขตที่ถูกต้อง (เช่น 1-5)
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
             return res.status(400).json({ error: "Rating must be a number between 1 and 5." });
        }

        const { data, error } = await supabase
            .from('reviews')
            .insert({
                user_id: userId,
                course_id,
                rating,
                content,
                semester,
                academic_year,
            })
            .select();

        if (error) throw error;

        res.status(201).json({ message: "✅ Review created successfully", review: data[0] });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// ----------------------------------------------------------------
// GET /api/reviews/latest (READ - ดึง 5 รีวิวล่าสุด)
// ----------------------------------------------------------------
export const getLatestReviews = async (req, res) => {
    try {
        // ดึง 5 รีวิวล่าสุด (และ Join ข้อมูล User กับ Course มาด้วย)
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                courses (course_code, name_th),
                users (username, role)
            `)
            .order('created_at', { ascending: false })
            .limit(5); // ⬅️ เอาแค่ 5 อันล่าสุด

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
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
                users (username, role)
            `)
            .eq('course_id', courseId) // ⬅️ กรองตาม course_id
            .order('created_at', { ascending: false }); // เรียงจากล่าสุดไปเก่าสุด

        if (error) throw error;

        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// ----------------------------------------------------------------
// GET /api/reviews/:id (READ by ID - ดึงรีวิวตาม ID)
// ----------------------------------------------------------------
export const getReviewById = async (req, res) => {
    try {
        const reviewId = req.params.id;

        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                courses (course_code, name_th),
                users (username, role)
            `)
            .eq('id', reviewId)
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ error: "Review not found" });
        }

        res.status(200).json(data);
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

    return res.status(200).json({message: "✅ Review deleted successfully"});

  } catch (error) {
    console.error("deleteReview error:", error);
    return res.status(500).json({ error: error.message });
  }
};