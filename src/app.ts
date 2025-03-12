import dotenv from 'dotenv';
import { Application, Request, Response } from "express";
import express from 'express';
import config from './config';
import { execSync } from 'child_process';
import path from 'path';
import { hostname } from "os";

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
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}[]|:;<>,.?/~`';
	return Array.from(
		{ length },
		() => chars[Math.floor(Math.random() * chars.length)]
	).join('');
};


async function renderPage(res: Response, pageKey: keyof typeof PAGES) {
	res.render('base', {
		pages: PAGES,
		pageToRender: pageKey,
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

	const app: Application = express();

	app.set('view engine', 'ejs');
	app.set('views', './views');

	// Static Handler
	app.use(express.static(path.join(__dirname, '../static'), {
		maxAge: 60 * 15 * 1000
	}));

	// Logs to make debugging easier
	console.log(`   ├ 📅 Date: ${new Date().toLocaleString()}`);
	console.log(`   ├ 📌 Current branch: ${currentBranch}`);
	console.log(`   └ 📝 Latest commit:  ${latestCommit}`);

	// Prepare all the pages
	for (let pageKey in PAGES) {
		let pageValue = PAGES[pageKey as keyof typeof PAGES];

		app.get(pageValue.path, (_req, res) => {
			renderPage(res, pageKey as keyof typeof PAGES);
		})
	}

	// Deso Auth Handler
	app.get("/auth/callback", (req: Request, res: Response) => {
		const authData = req.query;
		console.log('Auth callback data:', authData);

		const cookie = generateRandomString(128);

		res.cookie('auth', cookie, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict'
		})
		res.redirect('/auth/success');
	});

	/////////////////////////////////////////////////////

	// 404 Handler
	app.use((req, res) => {
		res.statusCode = 404

		renderPage(res, 'errors/404');
	})


	/////////////////////////////////////////////////////

	app.listen(PORT, () => {
		console.log(`✅ Server now running on port ${PORT}!`);
	});
}

main();
