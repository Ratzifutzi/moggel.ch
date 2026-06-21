import { model, models, Schema } from 'mongoose';

// Define the possible flag values as a String Enum/Union logic in TS
export const VALID_SERVER_FLAGS = ['signup_allowed', 'maintenance'] as const;
export type ServerFlags = (typeof VALID_SERVER_FLAGS)[number];

const ServerConfigSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			enum: ['global_config'],
		},

		flags: {
			type: [String],
			default: [],
			validate: {
				validator: function (flags: string[]) {
					return flags.every((f) =>
						VALID_SERVER_FLAGS.includes(f as ServerFlags),
					);
				},
				message: 'Invalid flag provided.',
			},
		},
	},
	{ timestamps: true },
);

const ServerConfig =
	models.ServerConfig || model('ServerConfig', ServerConfigSchema);

export async function GetServerFlags(): Promise<ServerFlags[]> {
	const config = await ServerConfig.findOneAndUpdate(
		{ name: 'global_config' },
		{ $setOnInsert: { name: 'global_config', flags: [] } },
		{ upsert: true, returnDocument: 'after' },
	);

	return config.flags as ServerFlags[];
}

export async function SetServerFlags(newFlags: ServerFlags[]): Promise<void> {
	await ServerConfig.findOneAndUpdate(
		{ name: 'global_config' },
		{ $set: { flags: newFlags } },
		{ upsert: true },
	);
}

export async function ToggleFlag(flag: ServerFlags): Promise<void> {
	const config = await ServerConfig.findOne({ name: 'global_config' });

	if (!config) return; // Should not happen due to upsert

	const existing = config.flags as string[];

	if (existing.includes(flag)) {
		config.flags = existing.filter((f) => f !== flag);
	} else {
		config.flags = [...existing, flag];
	}

	await config.save();
}

export default ServerConfig;
