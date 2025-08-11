import express from "express";
import { changePassword } from "../controllers/userController.js";
import authMiddlware from "../middlware/authMiddlware.js";

const router = express.Router();

router.post("/changepassword", authMiddlware, changePassword);

export default router;
