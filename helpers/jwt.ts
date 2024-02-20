import { expressjwt } from "express-jwt";
import { JwtPayload } from "jsonwebtoken";

function authJwt() {
	const secret = process.env.SECRET_KEY;
	if (!secret) {
		console.log("FATAL ERROR: jwtPrivateKey is not defined.");
		throw new Error("FATAL ERROR: jwtPrivateKey is not defined.");
	}

	return expressjwt({
		secret: secret,
		algorithms: ["HS256"],
		// isRevoked: isRevoked as unknown as IsRevoked,
	}).unless({
		path: [
			{ url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
			{ url: /\/api\/products(.*)/, methods: ["GET", "OPTIONS"] },
			{ url: /\/api\/categories(.*)/, methods: ["GET", "OPTIONS"] },
			"/api/users/login",
			"/api/users/register",
			"/api/users/refresh-token",
		],
	});
}

async function isRevoked(req: Request, token: JwtPayload) {
	if (!token.payload.isAdmin) {
		return true;
	}

	return false;
}

export default authJwt;
