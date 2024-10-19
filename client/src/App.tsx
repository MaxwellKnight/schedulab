import {
	createBrowserRouter,
	RouterProvider,
	Navigate,
	useLocation,
} from "react-router-dom";
import Login from './pages/login/Login';
import { Layout } from './components/layout/Layout.tsx';
import { AuthProvider } from "./context/AuthContext";
import { ReactNode } from 'react';
import { ScheduleBuilder } from "./pages/ScheduleBuilder/ScheduleBuilder.tsx";
import { useAuth } from "./hooks/useAuth/useAuth.ts";
import ErrorBoundary from "./pages/ErrorBoundary/ErrorBoundary.tsx";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
	const { isAuthenticated } = useAuth();
	const location = useLocation();

	if (!isAuthenticated) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	return <>{children}</>;
};

const AppRoutes = () => {
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
					element: <div>Home</div>
				},
				{
					path: "/build",
					element: <ScheduleBuilder />
				},
				{
					path: "/members",
					element: <div>Members</div>
				},
				{
					path: "/schedule",
					element: <div>Schedule</div>
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
