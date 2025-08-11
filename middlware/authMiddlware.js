import jwt from "jsonwebtoken";

const authMiddlware = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided. Please login to continue.",
      });
    }

    const decodedTokenInfo = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log(decodedTokenInfo);

    req.userInfo = decodedTokenInfo;
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Access denied. Token is expired. Please login to continue.",
    });
  }
};

export default authMiddlware;
