import User from "../models/User.js";
import bcrypt from "bcryptjs";

const changePassword = async (req, res) => {
  try {
    const userId = req.userInfo.userId;

    // extract old and new password
    const { oldPassword, newPassword } = req.body;

    // check if password are the same
    if (oldPassword === newPassword) {
      return res.status(401).json({
        success: false,
        message: "New password must differ from old one.",
      });
    }

    // find current logged in user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User is not found",
      });
    }

    // check if old password is correct
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is not correct! Please try again.",
      });
    } else {
      // hash new password
      const salt = await bcrypt.genSalt(10);
      const newHashedPassword = await bcrypt.hash(newPassword, salt);

      // update user password
      user.password = newHashedPassword;
      await user.save();

      res.status(201).json({
        success: true,
        message: "Password has been changed successfully",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Some error occured! Please try again",
    });
  }
};

export { changePassword };
