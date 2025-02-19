import dotenv from 'dotenv';
import { Application } from "express";
import express from 'express';
import config from './config';
import { execSync } from 'child_process';
import * as git from 'git-rev-sync';

dotenv.config();

/////////////////////////////////////////////////////

// This looks a bit confusing, but it is just checking if plesk was so kind
// and gave us a port. if not, we use the fallback port from the .env
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : process.env.FALLBACK_PORT;

const PAGES = config.pages

/////////////////////////////////////////////////////

async function main() {
	console.log("⚙️  Preparing to start express.js server...");

	const app: Application = express();

	app.set('view engine', 'ejs');
	app.set('views', './views');

	// Static Handler
	app.use(express.static('./static', {
		maxAge: 60 * 15 * 1000
	}));

	// Environment Variables
	const latestCommit = execSync('cd ~/git/moggel.ch && git rev-parse HEAD').toString().trim() || "unknown";
	const currentBranch = execSync('cd ~/git/moggel.ch && git rev-parse --abbrev-ref HEAD').toString().trim() || "unknown";

	// Prepare all the pages
	for (let pageKey in PAGES) {
		let pageValue = PAGES[pageKey as keyof typeof PAGES];

		app.get(pageValue.path, (_req, res) => {
			res.render('base', {
				pages: PAGES,
				pageToRender: pageKey,
				env: {
					latestCommit: latestCommit.substring(0, 7), //git.short(process.env.GIT_PATH || './'),
					currentBranch: currentBranch //git.branch(process.env.GIT_PATH || './')
				}
			});
		})
	}


	/////////////////////////////////////////////////////

	app.listen(PORT, () => {
		console.log(`✅ Server now running on port ${PORT}!`);
	});
}

main();
