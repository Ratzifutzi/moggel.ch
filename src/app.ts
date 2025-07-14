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
import { RouteHandler } from './types/route';
import { readDirRecursive } from './helpers/readDirRecursive';
import { exit } from 'process';
import database from './modules/database';
import 'fs';
import { mkdirSync } from 'fs';
import uploads from './modules/uploads';
import renderPage from './modules/renderPage';

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

async function main() {
	console.log("⚙️  Preparing to start express.js server...");
	console.log(`   ├ 📅 Date: ${new Date().toLocaleString()}`);
	console.log(`   ├ 📌 Current branch: ${currentBranch}`);
	console.log(`   └ 📝 Latest commit:  ${latestCommit}`);

	const app: Application = express();
	let routes: RouteHandler[] = []

	app.set('view engine', 'ejs');
	app.set('views', './views');
	app.use(express.urlencoded({ extended: true }));

	// Env
	dotenv.config();
	
	// Database
	console.log("🔌 Connecting to MongoDB...");

	const db = await database.connect();

	// Uploads
	uploads.init();

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

		if('dontIndex' in pageValue && pageValue.dontIndex) continue;
		app.get(pageValue.path, (req, res) => {
			renderPage(req, res, pageKey as keyof typeof PAGES);
		})
	}

	/////////////////////////////////////////////////////
	// Route Manager
	console.log("⌛ Gathering routes...\n");
	try {
		const files: string[] = await readDirRecursive('./dist/routes');

		for (const filePath of files) {
			console.log("🔗 " + filePath);

			const absolutePath = path.resolve(process.cwd(), filePath);
			const routeModule = await import(`file://${absolutePath}`);

			if (path.dirname(absolutePath).endsWith("examples")) continue;

			if (routeModule.default && typeof routeModule.default === 'object') {
				routes.push(routeModule.default.default as RouteHandler);
			}
		}
	} catch (error) {
		console.log('🛑 Error reading directory:', error);
		exit(1);
	}

	console.log("✅ Routes gathered\n");

	console.log("⌛ Sorting routes...");
	routes.sort((a, b) => a.Priority - b.Priority);

	console.log("✅ Routes sorted by priority.\n");


	// Register Routes in app
	routes.forEach(route => {
		if (!route.Middleware) {
			app[route.Method](route.Path, route.OnRequest);
			console.log(`🚀 Registered ${route.Method.toUpperCase()} route: ${route.Path}`);
		} else {
			app[route.Method](route.Path, route.Middleware, route.OnRequest);
			console.log(`🚀 Registered ${route.Method.toUpperCase()} route: ${route.Path}`);
			console.log(`└  Registered some middleware for this route.`);
		}
	})

	// 404 Handler
	app.use((req, res) => {
		res.statusCode = 404

		renderPage(req, res, 'errors/404');
	})

	// Reverse Proxy Handler
	if(process.env.REVERSE_PROXY === "1") {
		app.set('trust proxy', true);
		console.log("⚠️ Reverse proxy enabled. Trusting the first proxy.");
	}

	app.listen(PORT, () => {
		console.log(`✅ Server now running on port ${PORT}!`);
	});
}

// noinspection JSIgnoredPromiseFromCall
main();
