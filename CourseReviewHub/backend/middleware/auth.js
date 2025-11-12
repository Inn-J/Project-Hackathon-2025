import admin from "../firebase/firebase.js";

const checkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'ไม่พบ Token' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // ตรวจสอบ Token กับ Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // แปะ user_id ไว้ใน request
    req.user_id = decodedToken.uid;
    req.user_email = decodedToken.email;
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({ error: 'Token ไม่ถูกต้อง' });
  }
};

export default checkAuth;