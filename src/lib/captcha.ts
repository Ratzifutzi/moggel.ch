import { createClient } from '@private-captcha/private-captcha-js';

type CaptchaClient = ReturnType<typeof createClient>;

class Captcha {
	static #instance: Captcha;
	public readonly client: CaptchaClient;

	private constructor() {
		const apiKey = process.env.PC_API_KEY;

		this.client = createClient({
			apiKey: apiKey,
			domain: 'captcha.hyper-tech.ch',
		});
	}

	public static get instance(): Captcha {
		if (!Captcha.#instance) {
			Captcha.#instance = new Captcha();
		}

		return Captcha.#instance;
	}
}

export const captcha = Captcha.instance.client;
