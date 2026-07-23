import client from '@sendgrid/client';
import { MailService } from '@sendgrid/mail';

const apiKey = process.env.SENDGRID_API_KEY;

if (!apiKey) {
	throw new Error('SENDGRID_API_KEY is not set');
}

client.setApiKey(apiKey);

export const mail = new MailService();
mail.setApiKey(apiKey);

export { client };
