import { NextFunction, Request, Response } from "express";
import { RouteHandler } from "../../types/route";


export default {
	Method: "get",
	Path: "/test",
	Priority: 0,

	OnRequest: function (req: Request, res: Response, next: NextFunction) {
		res.send("This is used for internal testing, I don't know why you are here.");
	}
} satisfies RouteHandler;