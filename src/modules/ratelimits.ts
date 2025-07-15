type RateLimitType = Record<string, { windowMs: number; max: number }>
import { NextFunction, Request, Response } from "express";
import { rateLimit } from 'express-rate-limit'
import renderPage from "./renderPage";
import database from "./database";

function sendRateLimitPageJson(req: Request, res: Response) {
	res.status(429).json({
		error: "Too many requests",
		message: "You have exceeded the rate limit. Please try again later.",
	});
}

function renderRateLimitPage(req: Request, res: Response) {
	res.status(429)
	renderPage(req, res, "errors/429")
}

export default {
	api_comics: rateLimit({
		windowMs: 60 * 1000, // 1 minute
		max: 5,
		keyGenerator: (req) => req.ip || 'unknown',
		handler: sendRateLimitPageJson,
	}),
	
	pages: rateLimit({
		windowMs: 60 * 1000, // 1 minute
		max: 90,
		keyGenerator: (req) => req.ip || 'unknown',
		handler: renderRateLimitPage,
	})
};