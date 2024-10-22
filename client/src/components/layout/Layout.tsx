import { Outlet } from "react-router-dom";
import { Navigation } from "../navigation/Navigation";

export const Layout = () => {
	return (
		<div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
			<header className="bg-white dark:bg-gray-800 shadow-md">
				<div className="w-full mx-auto">
					<Navigation />
				</div>
			</header>

			<main className="flex-grow w-full">
				<div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<Outlet />
				</div>
			</main>

			<footer className="bg-white dark:bg-gray-800 shadow-md mt-auto">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="text-center text-sm text-gray-500 dark:text-gray-400">
						<p>&copy; 2024 Scheduler. All rights reserved.</p>
					</div>
				</div>
			</footer>
		</div>
	);
};
