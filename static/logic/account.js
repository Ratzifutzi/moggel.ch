async function getDeSoUsername(publicKey) {
	const apiUrl = 'https://node.deso.org/api/v0/get-single-profile';

	try {
		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				PublicKeyBase58Check: publicKey
			})
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		if (data.Profile && data.Profile.Username) {
			return data.Profile.Username;
		} else {
			return 'Username not found';
		}
	} catch (error) {
		console.error('Error fetching DeSo username:', error);
		return 'A Moggel fan';
	}
}


async function main() {
	let username = document.querySelector("#username");

	// Account is supplied by the page, it is a SSR variable
	// and created in the html file itself
	username.innerHTML = "..."
	username.innerHTML = await getDeSoUsername(account);
}

document.addEventListener("DOMContentLoaded", main);