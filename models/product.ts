import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
	name: { type: String, required: true },
	description: { type: String },
	richDescription: { type: String },
	image: { type: String },
	images: { type: [String], default: [] },
	brand: { type: String, required: true },
	price: { type: Number, required: true },
	category: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Category",
		required: true,
	},
	countInStock: { type: Number, required: true, min: 0, max: 255 },
	rating: { type: Number },
	isFeatured: { type: Boolean, default: false },
	dataCreated: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
