import { sendgridRequest } from './sendgridClient';

export async function addToList(
	listIds: string[],
	contacts: Array<{
		email: string;
	}>,
): Promise<{ job_id: string }> {
	return sendgridRequest<{ job_id: string }>('PUT', '/v3/marketing/contacts', {
		list_ids: listIds,
		contacts,
	});
}
