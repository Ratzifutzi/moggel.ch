import { model, models, Schema, type Model } from 'mongoose';

export interface ISlide {
	url: string;
	alt: string;
}

export interface IViewEntry {
	utm: string;
	session: string;
	at: Date;
}

export interface IComic {
	title: string;
	description: string;
	desoLink: string;
	faviconUrl: string;
	permalink: string;
	slide1: ISlide;
	slide2: ISlide;
	meta: string;
	views: IViewEntry[];
	desoClicks: number;
	createdAt: Date;
	updatedAt: Date;
}

const SlideSchema = new Schema<ISlide>(
	{
		url: { type: String, required: true },
		alt: { type: String, required: true },
	},
	{ _id: false },
);

const ViewEntrySchema = new Schema<IViewEntry>(
	{
		utm: { type: String, default: '' },
		session: { type: String, required: true, index: true },
		at: { type: Date, default: Date.now },
	},
	{ _id: false },
);

const ComicSchema = new Schema<IComic>(
	{
		title: { type: String, required: true },
		description: { type: String, required: true },
		desoLink: { type: String, required: true },
		faviconUrl: { type: String, default: '' },
		permalink: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		slide1: { type: SlideSchema, required: true },
		slide2: { type: SlideSchema, required: true },
		meta: { type: String, default: '' },
		views: { type: [ViewEntrySchema], default: [] },
		desoClicks: { type: Number, default: 0 },
	},
	{ timestamps: true },
);

const Comic: Model<IComic> =
	(models.Comic as Model<IComic>) || model<IComic>('Comic', ComicSchema);

export default Comic;
