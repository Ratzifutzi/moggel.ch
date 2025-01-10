export default {
	pages: {
		home: {
			displayName: "Home",
			description: "Welcome to Moggel! Come and stay for a while, it's nice here!",
			path: "/",

			buttonIcon: "images/Menu_Applesauce_Icon.png",
			buttonText: "images/Menu_Applesauce_Text.png"
		},
		applesauce: {
			displayName: "Applesauce",
			description: "",
			path: "/applesauce",

			buttonIcon: "images/Menu_Applesauce_Icon.png",
			buttonText: "images/Menu_Applesauce_Text.png"
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