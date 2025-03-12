let InAuthFlow = false;

function showLoginFrame() {
	if(InAuthFlow) return;
	InAuthFlow = true;

	let button = document.querySelector("#login-button");

	const accessLevelRequest = 2; // For basic authentication
	const callback = encodeURIComponent(`${window.location.origin}/auth/callback`);
	const appName = encodeURIComponent("Moggel Comics");

	button.innerHTML = "In progress...";

	// Construct the URL with parameters
	const url = `https://identity.deso.org/log-in?accessLevelRequest=${accessLevelRequest}&callback=${callback}&appName=${appName}`;

	// center the window.
	const h = 650;
	const w = 500;
	const y = window.outerHeight / 2 + window.screenY - h / 2;
	const x = window.outerWidth / 2 + window.screenX - w / 2;
	const authWindow = window.open(url, null, `toolbar=no, width=${w}, height=${h}, top=${y}, left=${x}`);
}

function handleMessage(event) {
	// Verify the origin of the message
	if (event.origin !== "https://identity.deso.org") {
		return;
	}

	let button = document.querySelector("#login-button");

	// Process the authentication data
	const authData = event.data;
	console.log(authData);
	if(authData.category == "interaction-event") {
		if(authData.payload.event == "close") {
			button.innerHTML = "Redirecting...";

			setTimeout(() => {
				window.location.reload();
			}, 1000);
		}
	}
}

window.addEventListener("message", (event) => this.handleMessage(event));