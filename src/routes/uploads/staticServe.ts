import { NextFunction, Request, Response, } from "express";
import { RouteHandler } from "../../types/route";
import uploads from "../../modules/uploads";
import express from "express";


export default {
	Method: "use",
	Path: "/uploads/static",
	Priority: 0,

	Middleware: express.static(uploads.getUploadsPath()),

	OnRequest: function (req: Request, res: Response, next: NextFunction) {
		// Handled by the static middleware
		res.setHeader("Cache-Control", "public, max-age=60*15"); // 15 minutes cache
		next();
	}
} satisfies RouteHandler;