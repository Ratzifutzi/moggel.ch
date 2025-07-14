import { NextFunction, Request, Response } from "express";
import { RouteHandler } from "../../../../types/route";
import database from "../../../../modules/database";

function clamp(number: number, min: number, max: number): number {
	return Math.max(min, Math.min(number, max));
}

export default {
	Method: "get",
	Path: "/api/v1/comics",
	Priority: 0,

	OnRequest: async function (req: Request, res: Response, next: NextFunction) {
		const db = database.getCurrentDb();
		if (!db) {
			return res.status(500).json({ error: "Database not available" });
		}

		// Prepare DB
		const collection = db.collection("comics");

		// Get query parameters for pagination
		const raw_page = parseInt(req.query.page as string) || 1;
		const raw_limit = parseInt(req.query.limit as string) || 10;

		// Clamp limit per page and then calculate the amount of pages
		const limit = clamp(raw_limit, 1, 50);
		const totalComics = await collection.countDocuments();
		const totalPages = Math.ceil(totalComics / limit);
		const page = clamp(raw_page, 1, totalPages);

		console.log(page, limit, totalComics, totalPages);

		// If the request is off limits, redirect to the page that reflects these limits
		if (raw_page !== page || raw_limit !== limit) {
			const validPage = encodeURIComponent(page);
			const validLimit = encodeURIComponent(limit);
			return res.redirect(`/api/v1/comics?page=${validPage}&limit=${validLimit}`);
		}

		// Fetch comics from the database
		const comics = await collection.aggregate([
			{ $skip: (page - 1) * limit },
			{ $limit: limit},
		]).toArray();

		const sanitizedComics = comics.map(comic => {
			const { _id, ...rest } = comic;
			return rest;
		});

		return res.status(200).json({
			page: page,
			totalPages: totalPages,
			limit: limit,
			total: totalComics,
			comics: sanitizedComics
		});
	}
} satisfies RouteHandler;