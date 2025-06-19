import { NextFunction, Request, Response } from "express";
import database from "../../modules/database";
import { generateRandomString } from "../../helpers/generateRandomString";
import { RouteHandler } from "../../types/route";

export default {
	Method: "get",
	Path: "/auth/logout",
	Priority: 0,

	OnRequest: async function (req: Request, res: Response, next: NextFunction) {
		const db = database.getCurrentDb();
		const cookiesCollection = db.collection('cookies');

		const oldCookie = req.cookies.auth
		if (oldCookie !== undefined) {
			await cookiesCollection.deleteOne({ cookieSecret: oldCookie });
		}

		res.clearCookie('auth');
		res.redirect('/account');
	}
} satisfies RouteHandler