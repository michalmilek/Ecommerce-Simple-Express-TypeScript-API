import { Request } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export function getTokenFromRequest(req: Request): JwtPayload | null {
	const authHeader = req.headers.authorization;
	const token = authHeader?.split(" ")[1];

	if (!token) {
		return null;
	}

	try {
		const decoded = jwt.verify(token, process.env.SECRET_KEY as string);
		return decoded as JwtPayload;
	} catch (error) {
		return null;
	}
}
