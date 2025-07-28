const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Token missing in Authorization header",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch(err) {
    console.error("JWT verification failed:", err.message);

    return res.status(403).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
};
