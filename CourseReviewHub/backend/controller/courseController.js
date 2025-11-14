import supabase from '../database/supabase.js';

// ----------------------------------------------------------------
// POST /api/courses (CREATE - สร้างรายวิชาใหม่)
// ----------------------------------------------------------------
export const createCourse = async (req, res) => {
    // ⚠️ NOTE: ควรมีการตรวจสอบสิทธิ์ (Role Check) ว่าผู้ใช้เป็น Admin/Instructor ก่อน
    try {
        const { course_code, name_th, name_en,  credit, description } = req.body;

        // ตรวจสอบข้อมูลที่จำเป็นขั้นต่ำ
        if (!course_code || !name_th) {
            return res.status(400).json({ error: "Required fields (course_code, name_th) are missing." });
        }

        const { data, error } = await supabase
            .from('courses')
            .insert({ 
                course_code, 
                name_th, 
                name_en,  
                credit, 
                description 
            })
            .select(); // เลือกข้อมูลที่ถูกสร้างกลับมา
            
        if (error) throw error;

        res.status(201).json({ message: "✅ Course created successfully", course: data[0] });

    } catch (error) {
        // หากเกิด error จากการซ้ำของ course_code หรือ constraints อื่นๆ
        res.status(400).json({ error: error.message });
    }
};

// ----------------------------------------------------------------
// GET /api/courses (READ - ดึงรายวิชาทั้งหมดพร้อมระบบค้นหา)
// ----------------------------------------------------------------
export const getAllCourses = async (req, res) => {
    try {
        // 1. เช็คว่ามีการค้นหา (Search) ส่งมาด้วยไหม
        const { search } = req.query; 

        // 2. เริ่มสร้างคำสั่ง Query
        let query = supabase.from('courses').select('*');

        // 3. ถ้ามี ?search=... ให้เพิ่มเงื่อนไข
        if (search) {
            const searchPattern = `%${search}%`;
            // ค้นหาทั้งใน 'name_th' และ 'course_code' โดยไม่สนตัวพิมพ์เล็ก/ใหญ่ (ilike)
            query = query.or(`name_th.ilike.${searchPattern},course_code.ilike.${searchPattern}`);
        }
        
        // 4. เพิ่มการเรียงลำดับเพื่อให้ผลลัพธ์มีความสม่ำเสมอ
        query = query.order('course_code', { ascending: true });

        // 5. สั่ง Query
        const { data, error } = await query;
        if (error) throw error;

        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ----------------------------------------------------------------
// GET /api/courses/:id (READ by ID - ดึงรายวิชาตาม ID)
// ----------------------------------------------------------------
export const getCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;

    // 1) ดึงข้อมูลวิชา
    const { data: course, error: courseErr } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .maybeSingle();

    if (courseErr) throw courseErr;
    if (!course) return res.status(404).json({ error: "Course not found" });

    // 2) ดึงรีวิวของคอร์ส
    const { data: reviewsRaw, error: reviewErr } = await supabase
  .from("reviews")
  .select(`
    *,
    users ( username ),
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
  .eq("course_id", courseId)
  .order("created_at", { ascending: false });

if (reviewErr) throw reviewErr;

// 3) จัดรูปแบบข้อมูลรีวิว (ดึง reply ล่าสุดมาแสดง)
//    (เราจะสร้างตัวแปร `author` ให้ Frontend ใช้ง่ายด้วย)
const formattedReviews = (reviewsRaw || []).map(review => {
  const latestReply = review.instructor_replies?.[0] || null;
  return {
    ...review,
    author: review.users?.username || 'นิรนาม', // ส่งชื่อคนรีวิวไปที่ 'author'
    instructor_reply: latestReply?.reply_text || null,
    instructor: latestReply?.instructor || null, // ส่ง object อาจารย์ไปทั้งก้อน
    instructor_reply_date: latestReply?.created_at || null,
  };
});

    // 3) ส่งกลับในรูปแบบที่หน้า React ต้องการ
   res.status(200).json({
  course: {
    id: course.id,
    course_code: course.course_code,
    name_th: course.name_th,
    name_en: course.name_en,
    credit: course.credit,
    description: course.description,
    instructor_summary: course.instructor_summary
  },
  reviews: formattedReviews // ⬅️ ส่ง reviews ใหม่ที่จัดรูปแบบแล้ว
});

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ----------------------------------------------------------------
// PATCH /api/courses/:id (UPDATE - อัปเดตรายวิชา)
// ----------------------------------------------------------------
export const updateCourse = async (req, res) => {
    // ⚠️ NOTE: ควรมีการตรวจสอบสิทธิ์ (Role Check) ว่าผู้ใช้เป็น Admin/Instructor ก่อน
    try {
        const courseId = req.params.id;
        const updates = req.body;

        // ลบ id ออกจาก body เพื่อป้องกันการ update primary key
        delete updates.id; 

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No fields provided for update." });
        }

        const { data, error } = await supabase
            .from('courses')
            .update(updates)
            .eq('id', courseId)
            .select();
            
        if (error) throw error;

        if (data.length === 0) {
            return res.status(404).json({ error: "Course not found or no changes made." });
        }

        res.status(200).json({ message: "✅ Course updated successfully", course: data[0] });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// ----------------------------------------------------------------
// DELETE /api/courses/:id (DELETE - ลบรายวิชา)
// ----------------------------------------------------------------
export const deleteCourse = async (req, res) => {
    // ⚠️ NOTE: ควรมีการตรวจสอบสิทธิ์ (Role Check) ว่าผู้ใช้เป็น Admin ก่อน
    try {
        const courseId = req.params.id;

        // ต้องแน่ใจว่าได้ตั้งค่า Foreign Key Constraints ให้ลบ review ที่เกี่ยวข้องด้วย (CASCADE DELETE)
        const { error, count } = await supabase
            .from('courses')
            .delete()
            .eq('id', courseId)
            .select()
            .single(); // ดึงข้อมูลที่ถูกลบกลับมาเพื่อตรวจสอบว่ามีการลบจริงหรือไม่

        if (error) throw error;
        
        // Supabase อาจคืนค่า row ที่ถูกลบกลับมา ถ้า count เป็น 0 แสดงว่าไม่พบ course นั้น
        if (count === 0) {
            return res.status(404).json({ error: "Course not found" });
        }

        res.status(200).json({ message: "✅ Course deleted successfully", courseId });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ----------------------------------------------------------------
// GET /api/courses/stats (READ - ดึงรายวิชาพร้อมสถิติรีวิว)
// ----------------------------------------------------------------
export const getAllCoursesWithStats = async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('get_courses_with_stats');
    if (error) throw error;

    res.status(200).json({ courses: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
