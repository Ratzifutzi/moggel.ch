import { client } from './sendgridClient';

export async function addToList(
	listIds: string[],
	contacts: Array<{
		email: string;
	}>,
): Promise<string> {
	const [response, body] = await client.request({
		method: 'PUT',
		url: '/v3/marketing/contacts',
		body: {
			list_ids: listIds,
			contacts,
		},
	});

	return body;
}
