import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
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
    secret: process.env.SESSION_SECRET || "yourSecretHere",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60, // 14 днів
    }),
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 днів в мс
      secure: false,
      httpOnly: true,
    },
  })
);

router.post("/game/start", startGame);
router.get("/game/symbols", getSymbols);
router.post("/game/spin", spinRoll);
router.post("/game/cashout", cashOut);

export default router;
