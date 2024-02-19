import cors from "cors";
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import categoriesRouter from "./routes/categories";
import productsRouter from "./routes/products";

const app = express();

app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(morgan("tiny"));

mongoose.connect(process.env.MONGO_URI as string).then(() => {
	console.log("Connected to MongoDB");
});

app.use("/api/categories", categoriesRouter);
app.use("/api/products", productsRouter);

app.listen(process.env.SERVER_PORT || 6000, () => {
	console.log(`Server is running on port ${process.env.SERVER_PORT || 6000}`);
});

app.get("/", (req, res) => {
	res.json({ message: "Hello World" });
});
