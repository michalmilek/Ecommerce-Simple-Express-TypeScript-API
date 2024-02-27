import { Request, Response, Router } from "express";
import { CategoryInterface } from "../models/allTypes";
import Category from "../models/category";

const router: Router = Router();

router.get(`/`, async (req: Request, res: Response) => {
	try {
		const categoryList: CategoryInterface[] = await Category.find();

		if (!categoryList) {
			res.status(500).json({ success: false });
		}
		res.status(200).send(categoryList);
	} catch (error) {
		res.status(500).json({ success: false, error });
	}
});

router.get("/:id", async (req: Request, res: Response) => {
	try {
		const category: CategoryInterface | null = await Category.findById(
			req.params.id
		);

		if (!category) {
			res
				.status(500)
				.json({ message: "The category with the given ID was not found." });
		}
		res.status(200).send(category);
	} catch (error) {
		res.status(500).json({ success: false, error });
	}
});

router.post("/", async (req: Request, res: Response) => {
	try {
		const category = new Category({
			name: req.body.name,
			icon: req.body.icon,
			color: req.body.color,
		});
		const savedCategory = await category.save();

		if (!savedCategory)
			return res.status(400).send("the category cannot be created!");

		res.send(savedCategory);
	} catch (error) {
		res.status(500).json({ success: false, error });
	}
});

router.patch("/:id", async (req: Request, res: Response) => {
	try {
		const category = await Category.findByIdAndUpdate(
			req.params.id,
			{
				...req.body,
			},
			{ new: true }
		);

		if (!category)
			return res.status(400).send("the Category cannot be updated!");

		res.send(category);
	} catch (error) {
		res.status(500).json({ success: false, error });
	}
});

router.delete("/:id", async (req: Request, res: Response) => {
	try {
		const deletedCategory = await Category.findByIdAndDelete(req.params.id);

		if (deletedCategory) {
			return res
				.status(200)
				.json({ success: true, message: "the category is deleted!" });
		} else {
			return res
				.status(404)
				.json({ success: false, message: "category not found!" });
		}
	} catch (error) {
		res.status(500).json({ success: false, error });
	}
});

router.get(`/get/featured/:count`, async (req: Request, res: Response) => {
	try {
		const count = req.params.count ? parseInt(req.params.count) : 0;
		const categories = await Category.find({ isFeatured: true }).limit(count);

		if (!categories) {
			res.status(500).json({ success: false });
		}
		res.status(200).send(categories);
	} catch (error) {
		res.status(500).json({ success: false, error });
	}
});


router.get('/get/count', async (req: Request, res: Response) => {
	try {
		const categoryCount = await Category.countDocuments();

		if (!categoryCount) {
			return res.status(500).json({ success: false });
		}
		return res.status(200).json({ categoryCount });
	} catch (error) {
		return res.status(500).json({ success: false, error });
	}
});

export default router;
