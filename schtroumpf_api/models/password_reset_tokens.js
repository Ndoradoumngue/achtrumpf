import mongoose from "mongoose";

import User from "./users.js";

const PasswordRequestTokenSchema = new mongoose.Schema({

	user: {
		type: mongoose.Schema.Types.ObjectId,
		refs: User,
		required: true,
	},
	token: {
		type: String,
		required: true,
	}
}, { timestamps: true });

export default mongoose.model("PasswordRequestToken", PasswordRequestTokenSchema);
