import { Outlet, Link } from "react-router-dom";

export const Layout = () => {
	return (
		<div className="min-h-screen flex flex-col w-full bg-background text-foreground">
			<header className="bg-secondary text-secondary-foreground p-4 w-full">
				<nav className="flex justify-between items-center">
					<h1 className="text-2xl font-bold"><Link to="/" className="hover:text-primary">S</Link></h1>
					<ul className="flex space-x-4">
						<li><Link to="/employees" className="hover:text-primary">Employees</Link></li>
						<li><Link to="/schedule" className="hover:text-primary">Schedule</Link></li>
						<li><Link to="/shifts" className="hover:text-primary">Shifts</Link></li>
					</ul>
				</nav>
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
