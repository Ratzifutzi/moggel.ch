import dotenv from 'dotenv';
import { Db } from "mongodb";
import config from "../config";
import { Request, Response } from "express";
import { verifyAdminRightsForPublicKey } from "../helpers/verifyAdminRightsForPublicKey";
import { execSync } from "child_process";
import { hostname } from "os";
import database from './database';

dotenv.config();

const PAGES = config.pages;

const latestCommit = execSync(`cd ${process.env.GIT_PATH} && git rev-parse HEAD`).toString().trim() || "unknown";
const currentBranch = execSync(`cd ${process.env.GIT_PATH} && git rev-parse --abbrev-ref HEAD`).toString().trim() || "unknown";
const prettyCommit = `${latestCommit.substring(0, 7)}..${latestCommit.substring(latestCommit.length - 7, latestCommit.length)}`
const serverHostname = hostname();

export default async function renderPage(req: Request, res: Response, pageKey: keyof typeof PAGES) {
	let loggedInAccount = null;
	let [hasAdminPerms, userRole] = [false, "Error"];
	const page = PAGES[pageKey];

	const db = database.getCurrentDb();
	const cookiesCollection = db.collection('cookies');

	if (req.cookies.auth) {
		const document = await cookiesCollection.findOne({ cookieSecret: req.cookies.auth });
		if (document) {
			loggedInAccount = document.userPublicKey;
		}
	}

	if (loggedInAccount) {
		[hasAdminPerms, userRole] = await verifyAdminRightsForPublicKey(loggedInAccount);
	}

	if ('adminOnly' in page && page.adminOnly && !hasAdminPerms) {
		res.statusCode = 403;
		await renderPage(req, res, 'errors/403');

		return;
	}

	res.render('base', {
		pages: PAGES,
		pageToRender: pageKey,
		loggedInAccount: loggedInAccount,
		hasAdminPerms: hasAdminPerms,
		userRoleName: userRole,
		env: {
			latestCommit: prettyCommit,
			latestLongCommit: latestCommit,
			currentBranch: currentBranch,
			hostname: serverHostname,
			banners: {
				showDevBanner: process.env.LOCAL_ENV === "1",
				showProdBanner: process.env.LOCAL_ENV !== "1" && hasAdminPerms,
			}
		}
	});
}