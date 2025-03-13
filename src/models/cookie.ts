import { ObjectId } from "mongodb";

export default class Game {
	constructor(
		public cookieSecret: string,
		public userPublicKey: number,
		
		public id?: ObjectId)
	{ }
}