export const metadata = {
	title: 'Privacy Policy',
	description: 'How moggel.ch handles your personal data.',
};

const LAST_UPDATED = '20/06/2027';
const CONTACT_EMAIL = 'privacy@hyper-tech.ch';
const OPERATOR_NAME = 'Joshua Schmidt';
const OPERATOR_ADDRESS = 'Switzerland';

export default function PrivacyPolicy() {
	return (
		<div className='mx-auto max-w-3xl px-6 py-12 leading-relaxed'>
			<h1 className='mb-2 text-3xl font-bold'>Privacy Policy</h1>
			<p className='mb-8 text-sm text-gray-500'>Last updated: {LAST_UPDATED}</p>

			<section className='mb-8'>
				<h2 className='mb-2 text-xl font-semibold'>1. Who we are</h2>
				<p>
					This website (moggel.ch) is operated by {OPERATOR_NAME},{' '}
					{OPERATOR_ADDRESS}. We are the controller responsible for the personal
					data processed via this website under the Swiss Federal Act on Data
					Protection (FADP) and, where applicable, the EU General Data
					Protection Regulation (GDPR).
				</p>
				<p className='mt-2'>
					Contact for data protection matters:{' '}
					<a className='underline' href={`mailto:${CONTACT_EMAIL}`}>
						{CONTACT_EMAIL}
					</a>
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='mb-2 text-xl font-semibold'>
					2. What data we process and why
				</h2>

				<h3 className='mt-4 font-semibold'>a) Server log files</h3>
				<p>
					Our hosting provider automatically records technical information for
					every request to this website. This includes your IP address, the date
					and time of the request, the requested URL, HTTP status code, referrer
					URL, and your browser&apos;s user agent string.
				</p>
				<p className='mt-2'>
					<strong>Purpose:</strong> ensuring the technical operation, stability
					and security of the website.
					<br />
					<strong>Legal basis:</strong> legitimate interest (Art. 31(1) FADP /
					Art. 6(1)(f) GDPR).
					<br />
					<strong>Retention:</strong> 10 days, then automatically deleted.
				</p>

				<h3 className='mt-4 font-semibold'>b) User accounts</h3>
				<p>
					If you create an account, we store the username and email address you
					provide, together with a securely hashed password.
				</p>
				<p className='mt-2'>
					<strong>Purpose:</strong> providing the account and the associated
					features.
					<br />
					<strong>Legal basis:</strong> performance of a contract (Art. 31(2)(a)
					FADP / Art. 6(1)(b) GDPR).
					<br />
					<strong>Retention:</strong> for as long as your account exists.
					Deleted on request or after prolonged inactivity.
				</p>

				<h3 className='mt-4 font-semibold'>c) Login attempt logs</h3>
				<p>
					To protect accounts from brute-force attacks, we log each login
					attempt with: IP address, attempted username, user agent, timestamp,
					whether the attempt was successful, and (on failure) the reason for
					failure. We never log the attempted password.
				</p>
				<p className='mt-2'>
					<strong>Purpose:</strong> security, abuse prevention, rate-limiting.
					<br />
					<strong>Legal basis:</strong> legitimate interest (Art. 31(1) FADP /
					Art. 6(1)(f) GDPR).
					<br />
					<strong>Retention:</strong> 90 days, then automatically deleted.
				</p>

				<h3 className='mt-4 font-semibold'>d) Session cookies</h3>
				<p>
					We use a strictly necessary session cookie to keep you logged in. No
					tracking, advertising or analytics cookies are set.
				</p>
				<p className='mt-2'>
					<strong>Legal basis:</strong> legitimate interest / contract
					performance. No consent is required for strictly necessary cookies.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='mb-2 text-xl font-semibold'>
					3. Who has access to your data
				</h2>
				<p>
					Your data is processed on a server hosted in Germany by our hosting
					provider, who acts as our processor. We do not sell or share personal
					data with third parties for marketing purposes. Data may be disclosed
					to authorities only where we are legally required to do so.
				</p>
				<p className='mt-2'>
					Because our server is in the EU (Germany), data transfers between
					Switzerland and the EU are covered by adequacy decisions in both
					directions.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='mb-2 text-xl font-semibold'>4. Your rights</h2>
				<p>Under FADP and (where applicable) GDPR you have the right to:</p>
				<ul className='mt-2 list-disc space-y-1 pl-6'>
					<li>request information about the data we hold about you;</li>
					<li>request correction of inaccurate data;</li>
					<li>request deletion of your data;</li>
					<li>request restriction of processing;</li>
					<li>receive your data in a portable format;</li>
					<li>object to processing based on legitimate interests;</li>
					<li>
						lodge a complaint with a supervisory authority &mdash; in
						Switzerland the{' '}
						<a
							className='underline'
							href='https://www.edoeb.admin.ch'
							target='_blank'
							rel='noreferrer'
						>
							FDPIC
						</a>
						.
					</li>
				</ul>
				<p className='mt-2'>
					To exercise these rights, email{' '}
					<a className='underline' href={`mailto:${CONTACT_EMAIL}`}>
						{CONTACT_EMAIL}
					</a>
					.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='mb-2 text-xl font-semibold'>5. Data security</h2>
				<p>
					All traffic is encrypted via HTTPS. Passwords are stored as salted
					hashes. Access to server infrastructure is restricted and
					authenticated.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='mb-2 text-xl font-semibold'>
					6. Changes to this policy
				</h2>
				<p>
					We may update this policy to reflect changes in our processing or in
					the law. The &ldquo;last updated&rdquo; date at the top of the page
					shows when the current version took effect.
				</p>
			</section>
		</div>
	);
}
