import { NextFunction, Request, Response } from "express";
import { RouteHandler } from "../../types/route";
import multer from "multer";
import uploads from "../../modules/uploads";
import path from "path";
import database from "../../modules/database";
import { ComicDocument } from "../../types/db/ComicDocument";

// Multer for file uploads with original extension
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploads.getUploadsPath());
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname);
		const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
		cb(null, uniqueName + ext);
	}
});
const upload = multer({
	storage,
	fileFilter: function (req, file, cb) {
		const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
		if (allowedTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error('Only image files are allowed!'));
		}
	},
	limits: { fileSize: 15 * 1024 * 1024 }
});

export default {
	Method: "post",
	Path: "/admin/add-comic",
	Priority: 10,

	Middleware: upload.fields([
		{ name: "PreviewImage", maxCount: 1 },
		{ name: "FadeoutImage", maxCount: 1 }
	]),

	OnRequest: async function (req: Request, res: Response, next: NextFunction) {
		const db = database.getCurrentDb();
		const comicsCollection = db.collection("comics");

		// Form content
		const internalId = req.body["InternalID"];
		const title = req.body["Title"];
		const subtitle = req.body["Subtitle"];
		const desoLink = req.body["DesoLink"];

		// Get file names
		const files = req.files as { [fieldname: string]: Express.Multer.File[] };
		if (!files?.PreviewImage?.[0]) {
			throw new Error("PreviewImage is required.");
		}
		if (!files?.FadeoutImage?.[0]) {
			throw new Error("FadeoutImage is required.");
		}

		const previewImageFilename = files.PreviewImage[0].filename;
		const fadeoutImageFilename = files.FadeoutImage[0].filename;

		// Insert into the database
		const newComic: ComicDocument = {
			internalId: internalId,
			title: title,
			subtitle: subtitle,
			desoLink: desoLink,
			previewImageName: previewImageFilename,
			fadeoutImageName: fadeoutImageFilename,
			createdAt: new Date(),
			updatedAt: new Date()
		}

		await comicsCollection.insertOne(newComic);

		res.send(newComic);
	}
} satisfies RouteHandler;