import { NextFunction, Request, Response } from "express";
import { RouteHandler } from "../../../../types/route";

export default {
	Method: "get",
	Path: "/api/v1/ip",
	Priority: 0,

	OnRequest: async function (req: Request, res: Response, next: NextFunction) {
		res.send(req.ip || "IP not available");
	}
} satisfies RouteHandler;