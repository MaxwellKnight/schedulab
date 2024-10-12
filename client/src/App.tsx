import {
	createBrowserRouter,
	RouterProvider,
	Navigate,
	useLocation,
	useRouteError,
	isRouteErrorResponse
} from "react-router-dom";
import Login from './pages/login/Login';
import { Layout } from './components/layout/Layout.tsx';
import { useAuth, AuthProvider } from "./context/AuthContext";
import { ReactNode } from 'react';
import { ScheduleCreator } from "./pages/create/ScheduleCreator.tsx";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
	const { isAuthenticated } = useAuth();
	const location = useLocation();

	if (!isAuthenticated) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	return <>{children}</>;
};

const ErrorBoundary = () => {
	const error = useRouteError();

	if (isRouteErrorResponse(error)) {
		if (error.status === 404) {
			return <div>This page doesn't exist!</div>;
		}

		if (error.status === 401) {
			return <div>You aren't authorized to see this</div>;
		}

		if (error.status === 503) {
			return <div>Looks like our API is down</div>;
		}

		if (error.status === 418) {
			return <div>🫖</div>;
		}
	}

	return <div>Something went wrong</div>;
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
					path: "/create",
					element: <ScheduleCreator />
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
