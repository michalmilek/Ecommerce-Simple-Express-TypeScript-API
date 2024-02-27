import bcrypt from "bcrypt";
import { Router } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user";

declare global {
	namespace Express {
		interface Request {
			user: {
				userId: string;
				isAdmin: boolean;
			};
		}
	}
}

declare module "jsonwebtoken" {
	export interface JwtPayload {
		userId: string;
		isAdmin: boolean;
	}
}

const router: Router = Router();

router.get("/", async (req, res) => {
	try {
		const userList = await User.find().select("-password");

		if (!userList) return res.status(400).send("No users found");

		return res.send(userList);
	} catch (error) {
		return res.status(500).json({ success: false, error });
	}
});

router.get("/:id", async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select("-password");
		if (!user) return res.status(400).send("No user found");
		return res.send(user);
	} catch (error) {
		return res.status(500).json({ success: false, error });
	}
});

router.post("/register", async (req, res) => {
	try {
		if (req.body === null) return res.status(400).send("Invalid User Data");

		if (!req.body.name || !req.body.email || !req.body.password)
			return res.status(400).send("Invalid User Data");

		const findEmail = await User.findOne({ email: req.body.email });

		if (findEmail)
			return res.status(400).send("The email is already registered");

		const hashedPassword = await bcrypt.hash(req.body.password, 10);

		const user = new User({
			name: req.body.name,
			email: req.body.email,
			password: hashedPassword,
			street: req.body.street,
			apartment: req.body.apartment,
			zip: req.body.zip,
			city: req.body.city,
			country: req.body.country,
			phone: req.body.phone,
		});

		const savedUser = await user.save();

		if (!savedUser) return res.status(400).send("the user cannot be created!");

		const { password, ...userWithoutPassword } = savedUser.toObject();

		return res.send(userWithoutPassword);
	} catch (error) {
		return res.status(500).json({ success: false, error });
	}
});

router.post("/login", async (req, res) => {
	try {
		if (!req.body.email || !req.body.password)
			return res.status(400).send("Invalid User Data");

		const user = await User.findOne({ email: req.body.email });

		if (!user) return res.status(400).send("The user not found");

		if (user && bcrypt.compareSync(req.body.password, user.password)) {
			const accessToken = jwt.sign(
				{ userId: user.id, isAdmin: user.isAdmin },
				process.env.SECRET_KEY as string,
				{
					expiresIn: "5h",
				}
			);

			const refreshToken = jwt.sign(
				{ userId: user.id, isAdmin: user.isAdmin },
				process.env.REFRESH_KEY as string,
				{
					expiresIn: "7d",
				}
			);

			return res.send({ user: user.email, accessToken, refreshToken });
		} else {
			return res.status(400).send("The password is wrong");
		}
	} catch (error) {
		return res.status(500).json({ success: false, error });
	}
});


router.post('/admin/login', async (req, res) => {
	try {
		if (!req.body.email || !req.body.password)
			return res.status(400).send("Invalid User Data");

		const {email, password } = req.body;

		const user = await User.findOne({ email});

		if (!user) return res.status(400).send("The user not found");

		if(user.isAdmin === false) return res.status(400).send("The user is not an admin");

		if (user && bcrypt.compareSync(password, user.password)) {
			const accessToken = jwt.sign(
				{ userId: user.id, isAdmin: user.isAdmin },
				process.env.SECRET_KEY as string,
				{
					expiresIn: "5h",
				}
			);

			const refreshToken = jwt.sign(
				{ userId: user.id, isAdmin: user.isAdmin },
				process.env.REFRESH_KEY as string,
				{
					expiresIn: "7d",
				}
			);

			return res.send({ user: user.email, accessToken, refreshToken });
		} else {
			return res.status(400).send("The password is wrong");
		}
	} catch (error) {
		return res.status(500).json({ success: false, error });
	}});

router.post("/refresh-token", async (req, res) => {
	try {
		const { accessToken, refreshToken } = req.body;

		if (!accessToken || !refreshToken)
			return res.status(400).send("Invalid Token");

		jwt.verify(
			refreshToken,
			process.env.REFRESH_KEY as string,
			(
				err: jwt.VerifyErrors | null,
				user: string | jwt.JwtPayload | undefined
			) => {
				if (err) return res.status(400).send("Invalid Token");
			}
		);

		jwt.verify(
			accessToken,
			process.env.SECRET_KEY as string,
			{
				ignoreExpiration: true,
			},
			(err, user) => {
				if (err) return res.status(400).send("Invalid Token");

				const newToken = jwt.sign(
					{ userId: user, isAdmin: (user as JwtPayload).isAdmin },
					process.env.SECRET_KEY as string,
					{
						expiresIn: "300s",
					}
				);

				return res.send({ token: newToken });
			}
		);
	} catch (error) {
		return res.status(500).json({ success: false, error });
	}
});

router.patch("/:id", async (req, res) => {
	try {
		const existingUser = await User.findById(req.params.id);

		if (!existingUser) return res.status(400).send("Invalid User ID");

		if (req.body.password) {
			req.body.password = await bcrypt.hash(req.body.password, 10);
		}

		const user = await User.findByIdAndUpdate(
			req.params.id,
			{
				...req.body,
			},
			{ new: true }
		);

		if (!user) return res.status(400).send("The user cannot be updated!");

		const { password, ...userWithoutPassword } = user.toObject();

		return res.send(userWithoutPassword);
	} catch (error) {
		return res.status(500).json({ success: false, error });
	}
});

router.get("/get/count", async (req, res) => {
	try {
		const userCount = await User.countDocuments();

		if (!userCount) return res.status(400).send("No users found");

		return res.send({ userCount });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ success: false, error });
	}
});


export default router;
