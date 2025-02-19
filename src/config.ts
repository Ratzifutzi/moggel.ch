export default {
	"pages": {
		"home": {
			displayName: "Home",
			description: "Welcome to Moggel! Come and stay for a while, it's nice here!",
			path: "/",

			buttonIcon: "images/Menu_Home_Icon.jpeg",
			buttonText: "images/Menu_Home_Text.jpeg"
		},
		"applesauce": {
			displayName: "Applesauce",
			description: "Applesauce is good!",
			path: "/applesauce",

			buttonIcon: "images/Menu_Applesauce_Icon.png",
			buttonText: "images/Menu_Applesauce_Text.png"
		},
		"archive": {
			displayName: "Archive",
			description: "This is the archive of all the Moggel comics!",
			path: "/archive",

			buttonIcon: "images/Menu_Archive_Icon.png",
			buttonText: "images/Menu_Archive_Text.png"
		},
		"about": {
			displayName: "About",
			description: "Who and what is Moggel? This page will tell you!",
			path: "/about",

			buttonIcon: "images/Menu_About_Icon.png",
			buttonText: "images/Menu_About_Text.png"
		},
		"deso": {
			displayName: "Deso",
			description: "What is Deso? Why do I use it?",
			path: "/deso",

			buttonIcon: "images/Menu_DeSo_Icon.png",
			buttonText: "images/Menu_DeSo_Text.png"
		},
		"account": {
			displayName: "Account",
			description: "Log in with your Deso account to do some things! Currently only for site-admins :p!",
			path: "/account",

			buttonIcon: "images/Menu_Account_Icon.png",
			buttonText: "images/Menu_Account_Text.png"
		}
	}
} satisfies config

type config = {
	pages: {
		[key: string]: {
			displayName: string;
			description: string;
			path: string;

			buttonIcon: string;
			buttonText: string;
		}
	}
}