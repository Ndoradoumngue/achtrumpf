import express from "express";
import { signup, signing, passwordRecoveryRequest, logout, passwordUpdate, ResetPassword } from "../controllers/auth.js";
import { tokenVerification } from "../verifyToken.js";

const router = express.Router();

router.post("/sign-up", signup);
router.route("/").post(signing).put(passwordRecoveryRequest);
router.get("/logout", logout);
router.post("/:id", tokenVerification, passwordUpdate);
router.post("/:email/:password_reset_token", ResetPassword);

export default router;