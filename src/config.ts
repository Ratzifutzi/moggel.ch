export default {
	"pages": {
		"pages/home": {
			displayName: "Home",
			description: "Welcome to Moggel! Come and stay for a while, it's nice here!",
			path: "/",

			buttonIcon: "/images/Menu_Home_Icon.jpeg",
			buttonText: "/images/Menu_Home_Text.jpeg"
		},
		"pages/applesauce": {
			displayName: "Applesauce",
			description: "Applesauce is good!",
			path: "/applesauce",

			buttonIcon: "/images/Menu_Applesauce_Icon.png",
			buttonText: "/images/Menu_Applesauce_Text.png"
		},
		"pages/archive": {
			displayName: "Archive",
			description: "This is the archive of all the Moggel comics!",
			path: "/archive",

			buttonIcon: "/images/Menu_Archive_Icon.png",
			buttonText: "/images/Menu_Archive_Text.png"
		},
		"pages/about": {
			displayName: "About",
			description: "Who and what is Moggel? This page will tell you!",
			path: "/about",

			buttonIcon: "/images/Menu_About_Icon.png",
			buttonText: "/images/Menu_About_Text.png"
		},
		"pages/deso": {
			displayName: "Deso",
			description: "What is Deso? Why do I use it?",
			path: "/deso",

			buttonIcon: "/images/Menu_DeSo_Icon.png",
			buttonText: "/images/Menu_DeSo_Text.png"
		},
		"pages/account": {
			displayName: "Account",
			description: "Log in with your Deso account to do some things! Currently only for site-admins :p!",
			path: "/account",

			buttonIcon: "/images/Menu_Account_Icon.png",
			buttonText: "/images/Menu_Account_Text.png"
		},

		"pages/admin": {
			displayName: "Admin",
			description: "No one will ever read this because this page cannot be embedded anywhere!",
			path: "/admin",

			buttonIcon: "",
			buttonText: "",

			noButton: true,
			adminOnly: true,
		},

		"errors/404": {
			displayName: "Page not found",
			description: "Where are you trying to go?",
			path: "/404",

			buttonIcon: "",
			buttonText: "",

			noButton: true,
		},
		"errors/429": {
			displayName: "Too many requests",
			description: "Are you a real human?",
			path: "/429",

			buttonIcon: "",
			buttonText: "",

			noButton: true,
		},
		"errors/403": {
			displayName: "Forbidden",
			description: "Where are you trying to go?",
			path: "/403",

			buttonIcon: "",
			buttonText: "",

			noButton: true,
		},

		"events/auth_success": {
			displayName: "Auth Success",
			description: "You have successfully authenticated with Deso!",
			path: "/auth/success",

			buttonIcon: "",
			buttonText: "",

			noButton: true,
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

			// Optional tags:
			noButton?: boolean;
			adminOnly?: boolean;
		}
	}
}