import dotenv from 'dotenv';
import { Application } from "express";
import express from 'express';
import config from './config';

dotenv.config();

/////////////////////////////////////////////////////

// This looks a bit confusing, but it is just checking if plesk was so kind
// and gave us a port. if not, we use the fallback port from the .env
const PORT  = process.env.PORT ? parseInt(process.env.PORT, 10) : process.env.FALLBACK_PORT;

const PAGES = config.pages

/////////////////////////////////////////////////////

async function main() {
	console.log("⚙️  Preparing to start express.js server...");

	const app: Application = express();

	app.set('view engine', 'ejs');
	app.set('views', './views');

	// For now, it is only a static page
	app.get("/", (_req, res) => {
		res.render('pages/base', { pages: PAGES, pageToRender: "home" });
	} )

	// Static Handler
	app.use("/", express.static("./static"))
	
	/////////////////////////////////////////////////////

	app.listen(PORT, () => {
		console.log(`✅ Server now running on port ${PORT}!`);
	});
}

main();
