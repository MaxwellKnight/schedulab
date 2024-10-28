import { Outlet } from "react-router-dom";
import { Navigation } from "../navigation/Navigation";

export const Layout = () => {
	return (
		<div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
			<header className="bg-white dark:bg-gray-800 shadow-md">
				<div className="max-w-[2000px] w-full mx-auto">
					<Navigation />
				</div>
			</header>
			<main className="flex-grow w-full">
				<div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 xl:py-12">
					<Outlet />
				</div>
			</main>
			<footer className="bg-white dark:bg-gray-800 shadow-md mt-auto">
				<div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 xl:py-8">
					<div className="text-center text-sm md:text-base text-gray-500 dark:text-gray-400">
						<p>&copy; 2024 Scheduler. All rights reserved.</p>
					</div>
				</div>
			</footer>
		</div>
	);
};
