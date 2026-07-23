import { mail } from './sendgridClient';

export interface CartoonEmailData {
	cartoon_name: string;
	cartoon_desc: string;
	image_preview: string;
	link_deso: string;
	link_web: string;
}

export async function sendEmail(
	to: string | Array<{ email: string }>,
	data: CartoonEmailData,
	unsubscribeGroupId = 29150,
	templateId = 'd-df2a9b529506435781c6187effd905ac',
	from = 'newsletter@moggel.ch',
): Promise<void> {
	const recipients = typeof to === 'string' ? [{ email: to }] : to;

	return;
	await mail.send({
		to: recipients,
		from,
		templateId,
		dynamicTemplateData: data,
		asm: {
			groupId: unsubscribeGroupId,
		},
	});
}
