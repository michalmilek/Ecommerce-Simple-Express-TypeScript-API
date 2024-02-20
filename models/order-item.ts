import mongoose from "mongoose";
import Product from "./Product";

const orderItemSchema = new mongoose.Schema({
	quantity: { type: Number, required: true },
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product",
		required: true,
	},
});

orderItemSchema.methods.toJSON = async function () {
	const obj = this.toObject();
	const product = await Product.findById(obj.product);
	if (!product) return;
	obj.price = product.price;
	obj.productId = product._id;
	delete obj.product;
	return obj;
};

const OrderItem = mongoose.model("OrderItem", orderItemSchema);

export default OrderItem;
