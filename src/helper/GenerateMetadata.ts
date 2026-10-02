import { Metadata } from 'next';

export type MetadataConfig = {
	PageName: string;
	Description: string;
};

export async function GeneratePresetMetadata(
	config: MetadataConfig,
): Promise<Metadata> {
	return {
		title: `${config.PageName} | Moggel`,
		description: config.Description,
	};
}
