import { Outlet } from "react-router-dom";
import { Navigation } from "../navigation/Navigation";

export const Layout = () => {
	return (
		<div className="min-h-screen flex flex-col w-full bg-background text-foreground">
			<header className="bg-secondary text-secondary-foreground p-4 w-full">
				<Navigation />
			</header>

			<main className="flex-grow w-full p-4">
				<Outlet />
			</main>

			<footer className="bg-secondary text-secondary-foreground p-4 w-full">
				<div className="text-center">
					<p>&copy; 2024 Scheduler. All rights reserved.</p>
				</div>
			</footer>
		</div>
	);
};
