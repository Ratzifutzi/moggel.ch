import dotenv from 'dotenv';
import { Application, Request, Response } from "express";
import express from 'express';
import config from './config';
import { execSync } from 'child_process';
import path from 'path';
import { hostname } from "os";
import * as mongoDB from "mongodb";
import cookieparser from 'cookie-parser';

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

const generateRandomString = (length: number): string => {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	return Array.from(
		{ length },
		() => chars[Math.floor(Math.random() * chars.length)]
	).join('');
};


async function renderPage(req: Request, res: Response, pageKey: keyof typeof PAGES, cookiesCollection: mongoDB.Collection) {
	let loggedInAccount = null;

	if(req.cookies.auth) {
		const document = await cookiesCollection.findOne({ cookieSecret: req.cookies.auth });
		if(document) {
			loggedInAccount = document.userPublicKey;
		}
	}

	console.log(loggedInAccount);

	res.render('base', {
		pages: PAGES,
		pageToRender: pageKey,
		loggedInAccount: loggedInAccount,
		env: {
			latestCommit: prettyCommit,
			latestLongCommit: latestCommit,
			currentBranch: currentBranch,
			hostname: serverHostname,
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

	const client  = new mongoDB.MongoClient("mongodb://127.0.0.1:27017/");
	await client.connect();
	const db: mongoDB.Db = client.db(process.env.MONGODB_NAME);

	// Collections
	const cookiesCollection = db.collection('cookies');
	console.log("✅ Prepared MongoDB!");

	// Middleware
	app.use(cookieparser());

	// Static Handler
	app.use(express.static(path.join(__dirname, '../static'), {
		maxAge: 60 * 15 * 1000
	}));

	// Prepare all the pages
	for (let pageKey in PAGES) {
		let pageValue = PAGES[pageKey as keyof typeof PAGES];

		app.get(pageValue.path, (req, res) => {
			renderPage(req, res, pageKey as keyof typeof PAGES, cookiesCollection);
		})
	}

	// Deso Auth Handler
	app.get("/auth/callback", async (req: Request, res: Response) => {
		try {
			const authData = req.query;
			const userPublicKey = authData.publicKeyAdded

			const cookie = ".MOGGELSECURITY_" + generateRandomString(512);

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
	app.get("/auth/logout", async (req: Request, res: Response) => {
		const oldCookie = req.cookies.auth

		if(oldCookie !== undefined) {
			await cookiesCollection.deleteOne({ cookieSecret: oldCookie });
		}

		res.clearCookie('auth');
		res.redirect('/auth/success');
	});

	/////////////////////////////////////////////////////

	// 404 Handler
	app.use((req, res) => {
		res.statusCode = 404

		renderPage(req, res, 'errors/404', cookiesCollection);
	})


	/////////////////////////////////////////////////////

	app.listen(PORT, () => {
		console.log(`✅ Server now running on port ${PORT}!`);
	});
}

main();
