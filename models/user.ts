import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },
	street: { type: String },
	apartment: { type: String },
	zip: { type: String },
	city: { type: String },
	country: { type: String },
	phone: { type: String },
	isAdmin: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);

export default User;
