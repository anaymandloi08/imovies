const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "iMovies_secret_jwt_key_2026";

const fetchUser = (req, res, next) => {
  // Get token from auth-token header, Authorization header, or x-auth-token
  let token = req.header("auth-token") || req.header("x-auth-token");
  
  if (!token && req.headers.authorization) {
    if (req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      token = req.headers.authorization;
    }
  }

  if (!token && req.cookies) {
    token = req.cookies.token || req.cookies["auth-token"];
  }

  if (!token) {
    return res.status(401).json({
      error: "Please authenticate using a valid token",
      success: false,
    });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user || data;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired authentication token",
      success: false,
    });
  }
};

module.exports = fetchUser;
