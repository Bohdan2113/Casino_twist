import express from "express";
import cors from "cors";
import session from "express-session";
import {
  startGame,
  getSymbols,
  spinRoll,
  cashOut,
} from "../controllers/gameController.js";
import { changePassword, getMeInfo } from "../controllers/userController.js";
import authMiddlware from "../middlware/authMiddlware.js";

const router = express.Router();
router.use(authMiddlware);

router.get("/", getMeInfo);
router.post("/changepassword", changePassword);

router.use(cors({ origin: "http://localhost:3000", credentials: true }));
router.use(
  session({
    secret: "supersecret",
    resave: false,
    saveUninitialized: true,
  })
);

router.post("/game/start", startGame);
router.get("/game/symbols", getSymbols);
router.post("/game/spin", spinRoll);
router.post("/game/cashout", cashOut);

export default router;
