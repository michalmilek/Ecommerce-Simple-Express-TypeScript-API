import { Router } from "express";
import Product from "../models/Product";
import Order from "../models/order";
import OrderItem from "../models/order-item";

interface Product {
	product: string;
	quantity: number;
	price: number;
}

const router: Router = Router();

router.get("/", async (req, res) => {
	try {
		const orders = await Order.find()
			.populate("user", "name")
			.sort({ dateOrdered: -1 });

		if (!orders) {
			return res.status(500).json({ success: false });
		}

		return res.send(orders);
	} catch (error) {
		return res.status(500).json({ success: false, error });
	}
});

router.get("/:id", async (req, res) => {
	try {
		const order = await Order.findById(req.params.id)
			.populate("user", "name")
			.populate({
				path: "orderItems",
				populate: { path: "product", select: "name" },
			});

		if (!order) {
			return res.status(500).json({ success: false });
		}

		return res.send(order);
	} catch (error) {
		return res.status(500).json({ success: false, error });
	}
});

router.post("/", async (req, res) => {
	try {
		const orderItems: Product[] = req.body.orderItems;
		if (!orderItems || orderItems.length === 0) {
			return res.status(400).send("No order items");
		}

		console.log("order Items", orderItems);

		const orderItemsSaved: Record<string, any>[] = [];

		const saveOrderItems = async () => {
			for (const orderItem of orderItems) {
				const newOrderItem = new OrderItem({
					quantity: orderItem.quantity,
					product: orderItem.product,
				});

				const savedOrderItem = await newOrderItem.save();
				if (!savedOrderItem) {
					console.log("error");
					return res.status(500).send("The order item cannot be created");
				}
				orderItemsSaved.push(savedOrderItem);
			}
		};

		await saveOrderItems();

		const totalPrices = await Promise.all(
			orderItems.map(async orderItem => {
				const product = await Product.findById(orderItem.product);
				if (product) {
					return product.price * orderItem.quantity;
				}

				return 0;
			})
		);

		const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

		if (orderItemsSaved.length === 0) {
			return res.status(500).send("The order item cannot be created");
		}

		const order = new Order({
			orderItems: orderItemsSaved,
			shippingAddress1: req.body.shippingAddress1,
			shippingAddress2: req.body.shippingAddress2,
			city: req.body.city,
			zip: req.body.zip,
			country: req.body.country,
			phone: req.body.phone,
			status: req.body.status,
			totalPrice: totalPrice,
			user: req.body.user,
		});

		const savedOrder = await order.save();

		if (!savedOrder) {
			return res.status(500).send("The order cannot be created");
		}

		return res.send(savedOrder);
	} catch (error) {
		return res.status(500).json({ success: false, error });
	}
});

router.patch("/:id", async (req, res) => {
	try {
		const order = await Order.findByIdAndUpdate(
			req.params.id,
			{
				status: req.body.status,
			},
			{ new: true }
		);

		if (!order) {
			return res.status(500).send("The order cannot be updated");
		}

		return res.send(order);
	} catch (error) {
		return res.status(500).json({ success: false, error });
	}
});

router.delete("/:id", async (req, res) => {
	try {
		const order = await Order.findById(req.params.id);

		if (!order) {
			return res
				.status(404)
				.json({ success: false, message: "Order not found" });
		}

		await order.deleteOne();

		order.orderItems.map(async (orderItem: any) => {
			try {
				const orderItemToDelete = await OrderItem.findById(orderItem._id);
				if (orderItemToDelete) {
					await orderItemToDelete.deleteOne();
				}
			} catch (error) {
				return res.status(500).json({ success: false, error });
			}
		});

		return res
			.status(200)
			.json({ success: true, message: "Order deleted successfully" });
	} catch (error) {}
});

export default router;
