import { Router } from "express";
import mongoose from "mongoose";
import Product from "../models/Product";
import Category from "../models/category";

const router: Router = Router();

router.get("/", async (req, res) => {
	try {
		let filters: string[] = [];
		if (req.query.categories) {
			const categories = req.query.categories as string;
			filters = categories.split(",");
		}

		const productList = await Product.find({
			category: filters,
		}).select("name image -_id");

		if (!productList) return res.status(500).json({ success: false });

		return res.send(productList);
	} catch (error) {
		return res.status(500).json({ success: false, error });
	}
});

router.post("/", async (req, res) => {
	try {
		const category = await Category.findById(req.body.category);

		if (!category) return res.status(400).send("Invalid Category");

		const product = new Product({
			name: req.body.name,
			description: req.body.description,
			richDescription: req.body.richDescription,
			image: req.body.image,
			images: req.body.images,
			brand: req.body.brand,
			price: req.body.price,
			category: req.body.category,
			countInStock: req.body.countInStock,
			rating: req.body.rating,
			isFeatured: req.body.isFeatured,
		});

		const savedProduct = await product.save();

		return res.send(savedProduct);
	} catch (error) {
		return res.status(500).json({ success: false, error });
	}
});

router.get(`/:id`, async (req, res) => {
	try {
		if (mongoose.isValidObjectId(req.params.id) === false)
			return res.status(400).send("Invalid Product ID");

		const product = await Product.findById(req.params.id).populate("category");

		if (!product) return res.status(400).send("Product not found");

		return res.send(product);
	} catch (error) {
		return res.status(500).json({ success: false, error });
	}
});

router.patch("/:id", async (req, res) => {
	try {
		if (mongoose.isValidObjectId(req.params.id) === false)
			return res.status(400).send("Invalid Product ID");

		const category = await Category.findById(req.body.category);
		if (!category) return res.status(400).send("Invalid Category");

		const product = await Product.findByIdAndUpdate(req.params.id, {
			...req.body,
		});

		if (!product) return res.status(400).send("The product cannot be updated!");
	} catch (error) {
		return res.status(500).json({ success: false, error });
	}
});

router.delete("/:id", async (req, res) => {
	try {
		if (mongoose.isValidObjectId(req.params.id) === false)
			return res.status(400).send("Invalid Product ID");

		const product = await Product.findByIdAndDelete(req.params.id);

		if (!product) return res.status(400).send("The product cannot be deleted!");

		return res.send(product);
	} catch (error) {
		return res.status(500).json({ success: false, error });
	}
});

router.get("/get/count", async (req, res) => {
	try {
		const productCount = await Product.countDocuments(
			(count: number): number => count
		);

		if (!productCount) return res.json({ productCount: 0 });

		return res.send({ productCount });
	} catch (error) {
		return res.status(500).json({ success: false, error });
	}
});

export default router;
