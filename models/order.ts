import mongoose from "mongoose";
import OrderItem from "./order-item";

const orderSchema = new mongoose.Schema({
	orderItems: { type: [OrderItem.schema], required: true },
	shippingAddress1: { type: String, required: true },
	shippingAddress2: { type: String },
	city: { type: String, required: true },
	zip: { type: String, required: true },
	country: { type: String, required: true },
	phone: { type: String, required: true },
	status: { type: String, default: "Ordered" },
	totalPrice: { type: Number, required: true },
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	dateOrdered: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
