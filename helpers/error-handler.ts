import { NextFunction, Request, Response } from "express";

export const errorHandler = (
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction
) => {
	if (err.name === "UnauthorizedError") {
		return res.status(401).send("Invalid Token or Unauthorized Access");
	}

	if (err.name === "ValidationError") {
		return res.status(400).send("User Validation Failed: " + err.message);
	}

	return res.status(500).json({ success: false, error: err.message });
};
