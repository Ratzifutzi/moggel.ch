import { NextFunction, Request, Response } from "express";
import { RouteHandler } from "../types/route";
import database from "../modules/database";
import config from "../config";
import { ComicDocument } from "../types/db/ComicDocument";
import { WithId } from "mongodb";
import renderPage from "../modules/renderPage";


export default {
	Method: "get",
	Path: "/comic/*",
	Priority: 0,

	OnRequest: async function (req: Request, res: Response, next: NextFunction) {
		const db = database.getCurrentDb();
		const comicCollection = db.collection("comics");
		
		const comicId = req.path.split("/").pop();

		console.log("Trying to find comic with ID:", comicId);

		const comicDocument = await comicCollection.findOne({ internalId: comicId }) as ComicDocument | null;

		if (!comicDocument) {
			console.log("Comic not found:", comicId);
			return renderPage(req, res, "errors/404");
		}

		res.redirect(config.URLs.staticServeURL + comicDocument.fadeoutImageName);
	}
} satisfies RouteHandler;