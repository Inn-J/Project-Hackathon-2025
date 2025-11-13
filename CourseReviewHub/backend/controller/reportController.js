import supabase from '../database/supabase.js';

export const createReport = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const {
      reporterId,
      targetUserId,
      targetReviewId,
      reason,
      details,
    } = req.body;

    const finalTargetReviewId = targetReviewId || reviewId;

    if (!reporterId)
      return res.status(400).json({ message: "reporterId is required" });

    if (!finalTargetReviewId)
      return res.status(400).json({ message: "targetReviewId is required" });

    if (!reason)
      return res.status(400).json({ message: "reason is required" });

    const { data, error } = await supabase
      .from("reports")
      .insert({
        reporter_id: reporterId,
        target_user_id: targetUserId || null,
        target_review_id: Number(finalTargetReviewId),
        reason,
        details: details || "",
        status: "PENDING",
      })
      .select()
      .single();

    if (error)
      return res.status(500).json({ message: "Failed to create report", error });

    return res.status(201).json({
      message: "Report created",
      data,
    });
  } catch (err) {
    console.error("createReport exception:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//
// GET REPORTS LIST
//
export const getReports = async (req, res) => {
  try {
    const { reporterId, targetUserId, targetReviewId, status } = req.query;

    let query = supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (reporterId) query = query.eq("reporter_id", reporterId);
    if (targetUserId) query = query.eq("target_user_id", targetUserId);
    if (targetReviewId) query = query.eq("target_review_id", Number(targetReviewId));
    if (status) query = query.eq("status", status);

    const { data, error } = await query;

    if (error)
      return res.status(500).json({ message: "Failed to get reports", error });

    return res.status(200).json({ data });
  } catch (err) {
    console.error("getReports exception:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//
// GET ONE REPORT
//
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("id", Number(id))
      .single();

    if (error)
      return res.status(404).json({ message: "Report not found" });

    return res.status(200).json({ data });
  } catch (err) {
    console.error("getReportById exception:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//
// UPDATE REPORT
//
export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("reports")
      .update(updates)
      .eq("id", Number(id))
      .select()
      .single();

    if (error)
      return res.status(500).json({ message: "Failed to update report", error });

    return res.status(200).json({
      message: "Report updated",
      data,
    });
  } catch (err) {
    console.error("updateReport exception:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//
// DELETE REPORT
//
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("reports")
      .delete()
      .eq("id", Number(id));

    if (error)
      return res.status(500).json({ message: "Failed to delete report", error });

    return res.status(200).json({ message: "Report deleted" });
  } catch (err) {
    console.error("deleteReport exception:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};