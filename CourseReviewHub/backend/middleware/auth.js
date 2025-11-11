import admin from "../firebase/firebase.js";

const checkAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "ไม่มี Token (ตั๋ว)" });
  }
  
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user_id = decoded.uid;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token (ตั๋ว) ไม่ถูกต้อง" });
  }
};

export default checkAuth;
