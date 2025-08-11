import jwt from "jsonwebtoken";

const createJWT = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "120m",
    }
  );
};

export default createJWT;
