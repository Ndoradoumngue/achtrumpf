import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({

	full_name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	role: {
		type: String,
		default: "",
	},
	password: {
		type: String,
		required: true
	},
	friends: {
		type: Array,
		default: [],
	}

}, { timestamps: true});

export default mongoose.model("User", UserSchema);
