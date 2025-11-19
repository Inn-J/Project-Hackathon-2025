// src/controller/adminController.js
import supabase from "../database/supabase.js";

// --- Helper: เช็กสิทธิ์ Admin ---
const checkAdminRole = async (userId) => {
  if (!userId) return false;
  const { data } = await supabase.from('users').select('role').eq('id', userId).single();
  return data?.role === 'ADMIN';
};

// 1. ดึงรายการ Report (แบบไม่ยุ่งกับ Database Schema) ✅
export const getAllReports = async (req, res) => {
  try {
    // 1. เช็กสิทธิ์
    const isAdmin = await checkAdminRole(req.user_id);
    if (!isAdmin) return res.status(403).json({ error: "Access Denied" });

    // 2. ดึง Reports ทั้งหมดมาก่อน (ข้อมูลดิบ)
    const { data: reports, error: reportErr } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (reportErr) throw reportErr;

    // 3. วนลูปดึงข้อมูลเสริมมาแปะเอง (Manual Join)
    const detailedReports = await Promise.all(reports.map(async (report) => {
        
        // 3.1 หาชื่อคนแจ้ง (Reporter)
        const { data: reporter } = await supabase
            .from('users')
            .select('username')
            .eq('id', report.reporter_id)
            .single();

        // 3.2 หาเนื้อหารีวิว (Review)
        const { data: review } = await supabase
            .from('reviews')
            .select('id, content_pros_cons, content_prerequisite, rating_satisfaction, user_id')
            .eq('id', report.target_review_id) // ใช้ target_review_id ตามที่คุณบอก
            .single();

        // 3.3 หาชื่อเจ้าของรีวิว (Review Author)
        let reviewAuthor = null;
        if (review && review.user_id) {
            const { data: author } = await supabase
                .from('users')
                .select('username')
                .eq('id', review.user_id)
                .single();
            reviewAuthor = author;
        }

        // 4. ประกอบร่างส่งกลับไป
        return {
            ...report,
            reporter: reporter, // { username: '...' }
            review: review ? {
                ...review,
                author: reviewAuthor // { username: '...' }
            } : null
        };
    }));

    res.json(detailedReports);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. ยกฟ้อง (ลบ Report)
export const dismissReport = async (req, res) => {
  try {
    const isAdmin = await checkAdminRole(req.user_id);
    if (!isAdmin) return res.status(403).json({ error: "Access Denied" });
    
    const { id } = req.params;
    const { error } = await supabase.from('reports').delete().eq('id', id);
    
    if (error) throw error;
    res.json({ message: "ลบรายงานสำเร็จ" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. ลบรีวิว (ลบตัวแม่ + ลูกน้อง)
export const deleteReviewByAdmin = async (req, res) => {
  try {
    const isAdmin = await checkAdminRole(req.user_id);
    if (!isAdmin) return res.status(403).json({ error: "Access Denied" });

    const reviewId = req.params.id;

    // ล้างบางลูกน้อง (ใช้ชื่อคอลัมน์ตามที่คุณบอกเป๊ะๆ)
    await supabase.from('reports').delete().eq('target_review_id', reviewId);
    await supabase.from('helpful_votes').delete().eq('review_id', reviewId);
    await supabase.from('instructor_replies').delete().eq('review_id', reviewId);

    // ลบตัวแม่
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
    
    if (error) throw error;
    res.json({ message: "ลบรีวิวเรียบร้อย" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};