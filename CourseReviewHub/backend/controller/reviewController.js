import supabase from '../database/supabase.js';

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