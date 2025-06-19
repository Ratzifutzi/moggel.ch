import { NextFunction, Request, Response } from "express";
import { RouteHandler } from "../../types/route";
import database from "../../modules/database";


export default {
	Method: "use",
	Path: "/admin/*",
	Priority: 0,

	OnRequest: async function (req: Request, res: Response, next: NextFunction) {
		const db = database.getCurrentDb();
		const cookiesCollection = db.collection('cookies');

		let loggedInAccount = null;

		if (req.cookies.auth) {
			const document = await cookiesCollection.findOne({ cookieSecret: req.cookies.auth });
			if (document) {
				loggedInAccount = document.userPublicKey;
			}
		}

		if (loggedInAccount) {
			next();
		} else {
			res.redirect("/account")
			return;
		}
	}
} satisfies RouteHandler;