// controller/courseController.js
import supabase from '../database/supabase.js';

export const getAllCourses = async (req, res) => {
  try {
    // 1. เช็คว่ามีการค้นหา (Search) ส่งมาด้วยไหม
    const { search } = req.query; 

    // 2. เริ่มสร้างคำสั่ง Query
    let query = supabase.from('courses').select('*');

    // 3. ถ้ามี ?search=... ให้เพิ่มเงื่อนไข
    if (search) {
      // ค้นหาทั้งใน 'name_th' และ 'course_code' โดยไม่สนตัวพิมพ์เล็ก/ใหญ่ (ilike)
      query = query.or(`name_th.ilike.%${search}%,course_code.ilike.%${search}%`);
    }

    // 4. สั่ง Query
    const { data, error } = await query;
    if (error) throw error;

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};