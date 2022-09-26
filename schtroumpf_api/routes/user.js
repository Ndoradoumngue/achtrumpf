import express from "express";
import { tokenVerification } from "../verifyToken.js";

import { usersList, userDetails, userUpdate, addFriend, removeFriend } from "../controllers/user.js"

const router = express.Router();

router.get("/", usersList);
router.route("/:id").get(userDetails).post(tokenVerification, userUpdate);
router.route("/friend/:id").put(tokenVerification, addFriend).delete(tokenVerification, removeFriend);

export default router;
