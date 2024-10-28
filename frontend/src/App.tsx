import { Layout } from './components/layout/Layout.tsx';
import { AuthProvider } from "./context/AuthContext";
import { ReactNode } from 'react';
import { useAuth } from "./hooks/useAuth/useAuth.ts";
import { createBrowserRouter, RouterProvider, Navigate, useLocation } from "react-router-dom";
import { ScheduleBuilder, ErrorBoundary, Schedule, Login, Home, Members } from "./pages";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
	const { isAuthenticated } = useAuth();
	const location = useLocation();

	if (!isAuthenticated) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	return <>{children}</>;
};

const AppRoutes: React.FC = () => {
	const router = createBrowserRouter([
		{
			path: "/login",
			element: <Login />,
			errorElement: <ErrorBoundary />
		},
		{
			path: "/",
			element: (
				<ProtectedRoute>
					<Layout />
				</ProtectedRoute>
			),
			errorElement: <ErrorBoundary />,

			children: [
				{
					index: true,
					element: <Home />
				},
				{
					path: "/build",
					element: <ScheduleBuilder />
				},
				{
					path: "/members",
					element: <Members />
				},
				{
					path: "/schedule",
					element: <Schedule />
				},
			]
		},
	]);

	return <RouterProvider router={router} />;
};

const App = () => {
	return (
		<AuthProvider>
			<AppRoutes />
		</AuthProvider>
	);
};

export default App;
