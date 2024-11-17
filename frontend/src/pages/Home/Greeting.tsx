import { Moon, Sun, Sunset } from "lucide-react";

export const Greeting = () => {
	const hour = new Date().getHours();

	if (hour < 12) {
		return {
			greeting: 'Good morning',
			icon: <Sun className="h-8 w-8 text-yellow-500" />,
		};
	}
	if (hour < 17) {
		return {
			greeting: 'Good afternoon',
			icon: <Sun className="h-8 w-8 text-orange-500" />,
		};
	}
	if (hour < 21) {
		return {
			greeting: 'Good evening',
			icon: <Sunset className="h-8 w-8 text-purple-500" />,
		};
	}
	return {
		greeting: 'Good night',
		icon: <Moon className="h-8 w-8 text-blue-500" />,
	};
};
