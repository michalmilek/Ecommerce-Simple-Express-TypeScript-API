import cors from "cors";
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import { errorHandler } from "./helpers/error-handler";
import categoriesRouter from "./routes/categories";
import ordersRouter from "./routes/orders";
import productsRouter from "./routes/products";
import usersRouter from "./routes/users";

const app = express();

app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(morgan("tiny"));
// app.use(authJwt());
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(errorHandler);

mongoose.connect(process.env.MONGO_URI as string).then(() => {
	console.log("Connected to MongoDB");
});

app.use("/api/categories", categoriesRouter);
app.use("/api/products", productsRouter);
app.use("/api/users", usersRouter);
app.use("/api/orders", ordersRouter);

app.listen(process.env.SERVER_PORT || 6000, () => {
	console.log(`Server is running on port ${process.env.SERVER_PORT || 6000}`);
});

app.get("/", (req, res) => {
	res.json({ message: "Hello World" });
});
