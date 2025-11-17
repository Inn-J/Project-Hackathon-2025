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
    const { search } = req.query;

    let query = supabase.from("courses").select("*");

    if (search) {
      const searchPattern = `%${search}%`;

      query = query.or(
        `name_th.ilike."${searchPattern}",
         name_en.ilike."${searchPattern}",
         course_code.ilike."${searchPattern}"`
      );
    }

    query = query.order("course_code", { ascending: true });

    const { data, error } = await query;
    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error("search error:", error);
    res.status(500).json({ error: error.message });
  }
};


// ----------------------------------------------------------------
// GET /api/courses/:id (READ by ID - ดึงรายวิชาตาม ID)
// ----------------------------------------------------------------
export const getCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;

    // 1) ดึงข้อมูลวิชา (เรามี 'course' ที่นี่)
    const { data: course, error: courseErr } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .maybeSingle();

    if (courseErr) throw courseErr;
    if (!course) return res.status(404).json({ error: "Course not found" });

    // 2) ดึงรีวิวของคอร์ส (พร้อม Author และ Reply)
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

    // ⬇️ === (นี่คือ "จุดที่แก้ไข" ครับ) === ⬇️
    const formattedReviews = (reviewsRaw || []).map(review => {
      const latestReply = review.instructor_replies?.[0] || null;
      return {
        ...review,

        // (1. "ยัด" Course ที่เราดึงมา (ข้อ 1) เข้าไป)
        course: {
          id: course.id,
          course_code: course.course_code,
          name_th: course.name_th
        },

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

    // 3) ส่งกลับ (ข้อมูลวิชา + รีวิวที่จัดรูปแบบแล้ว)
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
      reviews: formattedReviews // ⬅️ (ใช้ตัวที่จัดรูปแบบแล้ว)
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

export const getReviewByFaculty = async (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id, faculty')
      .eq('id', userId)
      .maybeSingle();

    if (userErr) throw userErr;
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const userFaculty = user.faculty || null;

    const { data: courses, error: coursesErr } = await supabase
      .from('courses')
      .select('id, course_code, name_th,name_en');

    if (coursesErr) throw coursesErr;

    const { data: reviews, error: reviewsErr } = await supabase
      .from('reviews')
      .select(`
        id,
        course_id,
        rating_difficulty,
        users (
          faculty
        )
      `);

    if (reviewsErr) throw reviewsErr;

    const statsByCourse = new Map();

    for (const review of reviews) {
      const courseId = review.course_id;
      if (!courseId) continue;

      if (!statsByCourse.has(courseId)) {
        statsByCourse.set(courseId, {
          review_count: 0,
          difficultySum: 0,
          sameFacultyCount: 0,
        });
      }

      const stat = statsByCourse.get(courseId);
      stat.review_count += 1;
      stat.difficultySum += Number(review.rating_difficulty || 0);

      const reviewerFaculty = review.users?.faculty || null;
      if (userFaculty && reviewerFaculty === userFaculty) {
        stat.sameFacultyCount += 1;
      }
    }

    let result = courses.map((course) => {
      const s = statsByCourse.get(course.id) || {
        review_count: 0,
        difficultySum: 0,
        sameFacultyCount: 0,
      };

      const review_count = s.review_count;
      const difficulty =
        review_count > 0 ? s.difficultySum / review_count : 0;

      return {
        id: course.id,
        course_code: course.course_code,
        name_th: course.name_th,
        name_en: course.name_en,
        difficulty,
        review_count,
        same_faculty_reviewers: s.sameFacultyCount,
      };
    });

    result.sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0));

    return res.status(200).json({ courses: result });

  } catch (error) {
    console.error("getReviewByFaculty error:", error);
    return res.status(500).json({ error: error.message });
  }
};


