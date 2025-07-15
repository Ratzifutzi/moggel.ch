async function getDeSoUsername(publicKey) {
	const apiUrl = 'https://node.deso.org/api/v0/get-single-profile';

	// Check if a username for this public key is already cached
	const cachedUsername = localStorage.getItem(`username:${publicKey}`);
	if (cachedUsername) {
		return cachedUsername;
	}

	try {
		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ PublicKeyBase58Check: publicKey })
		});

		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

		const data = await response.json();

		if (data.Profile && data.Profile.Username) {
			localStorage.setItem(`username:${publicKey}`, data.Profile.Username);
			return data.Profile.Username;
		} else {
			return 'Username not found';
		}
	} catch (error) {
		console.error('Error fetching DeSo username:', error);
		return 'Moggel Fan';
	}
}

async function cacheImageAsBase64(url, key) {
	const response = await fetch(url);
	const blob = await response.blob();

	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			const base64data = reader.result;
			localStorage.setItem(`profilepic:${key}`, base64data);
			resolve(base64data);
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

async function main() {
	let usernameFields = document.querySelectorAll(".username");

	usernameFields.forEach(async (username) => {
		username.innerHTML = "...";
		username.innerHTML = await getDeSoUsername(account);
	});

	let profilePicFields = document.querySelectorAll(".load-profile-pic");

	for (const profilePic of profilePicFields) {
		const cachedImage = localStorage.getItem(`profilepic:${account}`);

		if (cachedImage) {
			profilePic.src = cachedImage;
		} else {
			try {
				const base64Image = await cacheImageAsBase64(profilePic.dataset.src || profilePic.src, account);
				profilePic.src = base64Image;
			} catch (error) {
				console.error("Error caching profile picture:", error);
			}
		}
	}
}

document.addEventListener("DOMContentLoaded", main);
