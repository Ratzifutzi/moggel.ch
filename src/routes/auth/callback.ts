import { NextFunction, Request, Response } from "express";
import database from "../../modules/database";
import { generateRandomString } from "../../helpers/generateRandomString";
import { RouteHandler } from "../../types/route";

export default {
	Method: "get",
	Path: "/auth/callback",
	Priority: 0,

	OnRequest: async function (req: Request, res: Response, next: NextFunction) {
		try {
			const db = database.getCurrentDb();
			const cookiesCollection = db.collection('cookies');

			const authData = req.query;
			const userPublicKey = authData.publicKeyAdded

			const cookie = ".MOGGELSECURITY_" + await generateRandomString(1024);

			await cookiesCollection.insertOne({
				cookieSecret: cookie,
				userPublicKey: userPublicKey
			});

			res.cookie('auth', cookie, {
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
				maxAge: 1000 * 60 * 60 * 24 * 7
			})
			res.redirect('/auth/success');
		} catch (err) {
			res.status(500).send(err);
		}
	}
} satisfies RouteHandler