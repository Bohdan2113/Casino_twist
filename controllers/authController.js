import User from "../models/User.js";
import bcrypt from "bcryptjs";
import createJWT from "../helpers/jwtHelper.js";

const registerUser = async (req, res) => {
  try {
    // extract user info from our request body
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password must be provided.",
      });
    }

    // check if user is already exists in our db
    const checkExistingUser = await User.findOne({ username });
    if (checkExistingUser) {
      return res.status(400).json({
        success: false,
        message:
          "User already exists with same username. Please try with different username.",
      });
    }

    // hash user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create a new user and save to db
    const newUser = new User({
      username,
      password: hashedPassword,
    });
    if (!newUser) {
      res.status(400).json({
        success: false,
        message: "Unable to register. Please try again",
      });
    }
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registereed successfully.",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Some error occured! Please try again",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password must be provided.",
      });
    }

    // find if the current user exist in db
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User doesn't exist!",
      });
    }

    console.log(user);
    // if the password is correct or not
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid username or password!",
      });
    }

    // create user jwt
    const accessToken = createJWT(user);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      accessToken,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Some error occured! Please try again",
    });
  }
};

export { registerUser, loginUser };
