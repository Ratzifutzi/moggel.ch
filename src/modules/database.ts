import { Db, MongoClient } from "mongodb";

let connected: boolean = false;
let currentDb: Db;

export default {
	connect: async function(): Promise<Db> {
		if(connected) {
			console.warn("⚠️ Database connection already established.");
			return currentDb;
		}

		const client = new MongoClient(process.env.MONGODB_URI);
		await client.connect();
		const db: Db = client.db(process.env.MONGODB_NAME);

		connected = true;
		currentDb = db;

		return currentDb;
	},

	getCurrentDb: function(): Db {
		if(!connected) {
			throw new Error("Database not connected. Please call connect() first.");
		}

		return currentDb;
	},
}