import dotenv from 'dotenv';
import { Application, Request, Response } from "express";
import express from 'express';
import config from './config';
import { execSync } from 'child_process';
import path from 'path';
import { hostname } from "os";
import * as mongoDB from "mongodb";
import cookieparser from 'cookie-parser';
import { generateRandomString } from './helpers/generateRandomString';
import { verifyAdminRightsForPublicKey } from './helpers/verifyAdminRightsForPublicKey';
import rateLimit from 'express-rate-limit';

dotenv.config();

/////////////////////////////////////////////////////

// This looks a bit confusing, but it is just checking if plesk was so kind
// and gave us a port. if not, we use the fallback port from the .env
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : process.env.FALLBACK_PORT;

const PAGES = config.pages

// Environment Variables
const latestCommit = execSync(`cd ${process.env.GIT_PATH} && git rev-parse HEAD`).toString().trim() || "unknown";
const currentBranch = execSync(`cd ${process.env.GIT_PATH} && git rev-parse --abbrev-ref HEAD`).toString().trim() || "unknown";
const prettyCommit = `${latestCommit.substring(0, 7)}..${latestCommit.substring(latestCommit.length - 7, latestCommit.length)}`
const serverHostname = hostname();

/////////////////////////////////////////////////////


async function renderPage(req: Request, res: Response, pageKey: keyof typeof PAGES, db: mongoDB.Db) {
	let loggedInAccount = null;
	let [hasAdminPerms, userRole] = [false, "Error"];
	const page = PAGES[pageKey];

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
		await renderPage(req, res, 'errors/403', db);

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

async function main() {
	console.log("⚙️  Preparing to start express.js server...");
	console.log(`   ├ 📅 Date: ${new Date().toLocaleString()}`);
	console.log(`   ├ 📌 Current branch: ${currentBranch}`);
	console.log(`   └ 📝 Latest commit:  ${latestCommit}`);

	const app: Application = express();

	app.set('view engine', 'ejs');
	app.set('views', './views');

	// Database
	console.log("🔌 Connecting to MongoDB...");

	const client = new mongoDB.MongoClient(process.env.MONGODB_URI);
	await client.connect();
	const db: mongoDB.Db = client.db(process.env.MONGODB_NAME);

	// Collections
	const cookiesCollection = db.collection('cookies');

	console.log("✅ Prepared MongoDB!");

	// Middleware
	app.use(cookieparser());

	// Rate Limiter
	const rateLimitTime = 5 * 60 * 1000; // 5 minutes
	const limiterAction = (req: Request, res: Response) => {
		res.status(429)
		renderPage(req, res, 'errors/429', db);
	}

	const pageLimiter = rateLimit({
		windowMs: rateLimitTime,
		max: 75, 
		handler: (req, res) => limiterAction(req, res),
	});
	const authRateLimiter = rateLimit({
		windowMs: rateLimitTime,
		max: 5,
		handler: (req, res) => limiterAction(req, res),
	});

	// Static Handler
	app.use(express.static(path.join(__dirname, '../static'), {
		maxAge: 60 * 15 * 1000
	}));

	// Prepare all the pages
	for (let pageKey in PAGES) {
		let pageValue = PAGES[pageKey as keyof typeof PAGES];

		app.get(pageValue.path, pageLimiter, (req, res) => {
			renderPage(req, res, pageKey as keyof typeof PAGES, db);
		})
	}

	// Deso Auth Handler
	app.get("/auth/callback", authRateLimiter, async (req: Request, res: Response) => {
		try {
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
	});

	// Logout Handler
	app.get("/auth/logout", authRateLimiter, async (req: Request, res: Response) => {
		const oldCookie = req.cookies.auth

		if (oldCookie !== undefined) {
			await cookiesCollection.deleteOne({ cookieSecret: oldCookie });
		}

		res.clearCookie('auth');
		res.redirect('/account');
	});

	/////////////////////////////////////////////////////

	// 404 Handler
	app.use((req, res) => {
		res.statusCode = 404

		renderPage(req, res, 'errors/404', db);
	})


	/////////////////////////////////////////////////////

	app.listen(PORT, () => {
		console.log(`✅ Server now running on port ${PORT}!`);
	});
}

// noinspection JSIgnoredPromiseFromCall
main();
