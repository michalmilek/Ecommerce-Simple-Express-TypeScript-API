import { Router } from "express";
import mongoose from "mongoose";
import multer from "multer";
import Product from "../models/Product";
import Category from "../models/category";

interface FileTypeMap {
	[key: string]: string;
}

const FILE_TYPE_MAP: FileTypeMap = {
	"image/png": "png",
	"image/jpeg": "jpeg",
	"image/jpg": "jpg",
};

const router: Router = Router();

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const isValid = FILE_TYPE_MAP[file.mimetype];
		let uploadError: Error | null = new Error("Invalid image type");
		if (isValid) {
			uploadError = null;
		}

		cb(uploadError, "public/uploads");
	},
	filename: function (req, file, cb) {
		const extension = FILE_TYPE_MAP[file.mimetype];
		const filename = file.originalname.split(" ").join("-");
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, `${filename}-${uniqueSuffix}.${extension}`);
	},
});

const uploadOptions = multer({ storage });

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

router.post("/", uploadOptions.single("image"), async (req, res) => {
	try {
		const category = await Category.findById(req.body.category);

		if (!category) return res.status(400).send("Invalid Category");

		const file = req.file;

		if (!file) return res.status(400).send("No image in the request");

		const fileName = req.file?.filename;

		const basePath = `${req.protocol}://${req.get(
			"host"
		)}/public/uploads/${fileName}`;

		const product = new Product({
			name: req.body.name,
			description: req.body.description,
			richDescription: req.body.richDescription,
			image: basePath,
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

router.patch("/:id", uploadOptions.single("image"), async (req, res) => {
	try {
		if (mongoose.isValidObjectId(req.params.id) === false)
			return res.status(400).send("Invalid Product ID");

		const product = await Product.findById(req.params.id);

		if (!product) return res.status(400).send("Invalid Product ID");

		if (req.body.category) {
			const category = await Category.findById(req.body.category);
			if (!category) return res.status(400).send("Invalid Category");
		}

		const { file } = req;
		let imagePath: string = "";

		if (file) {
			const fileName = file.filename;
			const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
			imagePath = `${basePath}${fileName}`;
		} else {
			imagePath = product.image as string;
		}

		const updatedProduct = await product.updateOne({
			...req.body,
			image: imagePath,
		});

		if (!updatedProduct)
			return res.status(400).send("The product cannot be updated!");
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

router.put(
	`/gallery-images/:id`,
	uploadOptions.array("images", 10),
	async (req, res) => {
		try {
			if (mongoose.isValidObjectId(req.params.id) === false)
				return res.status(400).send("Invalid Product ID");

			const files = req.files as Express.Multer.File[];
			let imagesPaths: string[] = [];
			const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

			if (files) {
				files.map(file => {
					imagesPaths.push(`${basePath}${file.filename}`);
				});
			}

			const product = await Product.findByIdAndUpdate(
				req.params.id,
				{
					images: imagesPaths,
				},
				{ new: true }
			);

			if (!product)
				return res.status(400).send("The product cannot be updated!");

			return res.send(product);
		} catch (error) {
			return res.status(500).json({ success: false, error });
		}
	}
);

export default router;
