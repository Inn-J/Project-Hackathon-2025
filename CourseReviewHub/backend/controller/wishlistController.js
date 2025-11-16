import supabase from '../database/supabase.js';

// ----------------------------------------------------------------
// GET /api/wishlist/my - (1) ดึง Wishlist ทั้งหมดของฉัน
// ----------------------------------------------------------------
export const getMyWishlist = async (req, res) => {
  try {
    // 1. เอา user id จาก middleware (protect)
    const userId = req.user_id; 
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // 2. ดึงข้อมูลจากตาราง wishlist
    //    JOIN ข้อมูลจากตาราง courses มาด้วย
    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        id, 
        user_id,
        course_id,
        personal_note,
        created_at,
        courses ( * ) 
      `)
      .eq('user_id', userId) // กรองเฉพาะของ user นี้
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 3. ส่งข้อมูลกลับไป
    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------------------------------------------------
// POST /api/wishlist - (2) เพิ่มวิชาใน Wishlist
// ----------------------------------------------------------------
export const addWishlist = async (req, res) => {
  try {
    // 1. เอา user id (จาก protect) และ course_id (จาก body)
    const userId = req.user_id;
    const { course_id, personal_note } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!course_id) {
      return res.status(400).json({ error: 'course_id is required.' });
    }

    // 2. (สำคัญ) เช็คก่อนว่ามีซ้ำมั้ย
    const { data: existing, error: findError } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', course_id)
      .maybeSingle();

    if (findError) throw findError;
    
    // ถ้าเจอแล้ว (existing ไม่ใช่ null)
    if (existing) {
      return res.status(409).json({ message: 'Course already in wishlist.' });
    }

    // 3. ถ้าไม่ซ้ำ ก็ Insert แถวใหม่
    const { data, error } = await supabase
      .from('wishlist')
      .insert({
        user_id: userId,
        course_id: Number(course_id), // แปลงเป็นตัวเลขกันเหนียว
        personal_note: personal_note || null,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Added to wishlist', item: data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateWishlistNote = async (req, res) => {
  try {
    const userId = req.user_id;
    const courseId = Number(req.params.courseId);
    const { personal_note } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabase
      .from("wishlist")
      .update({ personal_note: personal_note || null })
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "Updated note", item: data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------------------------------------------------
// DELETE /api/wishlist/:courseId - (3) ลบวิชาออกจาก Wishlist
// ----------------------------------------------------------------
export const removeWishlist = async (req, res) => {
  try {
    // 1. เอา user id (จาก protect) และ courseId (จาก URL param)
    const userId = req.user_id;
    const courseId = req.params.courseId; 

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!courseId) {
      return res.status(400).json({ error: 'courseId parameter is required.' });
    }

    // 2. สั่งลบแถวที่ user_id และ course_id ตรงกัน
    const { data, error, count } = await supabase
      .from('wishlist')
      .delete({ count: 'exact' }) // สั่งให้นับจำนวนแถวที่ลบ
      .eq('user_id', userId)
      .eq('course_id', Number(courseId)); // แปลงเป็นตัวเลข

    if (error) throw error;

    // 3. เช็คว่าลบสำเร็จมั้ย
    if (count === 0) {
      return res.status(404).json({ error: 'Item not found in wishlist.' });
    }

    res.status(200).json({ message: 'Removed from wishlist' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};