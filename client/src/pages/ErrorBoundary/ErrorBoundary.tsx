import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const ErrorBoundary = () => {
	const error = useRouteError();

	const renderErrorContent = () => {
		if (isRouteErrorResponse(error)) {
			switch (error.status) {
				case 404:
					return (
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertTitle>Not Found</AlertTitle>
							<AlertDescription>This page doesn't exist!</AlertDescription>
						</Alert>
					);
				case 401:
					return (
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertTitle>Unauthorized</AlertTitle>
							<AlertDescription>You aren't authorized to see this</AlertDescription>
						</Alert>
					);
				case 503:
					return (
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertTitle>Service Unavailable</AlertTitle>
							<AlertDescription>Looks like our API is down</AlertDescription>
						</Alert>
					);
				case 418:
					return (
						<Alert>
							<AlertTitle>I'm a teapot</AlertTitle>
							<AlertDescription className="text-4xl">🫖</AlertDescription>
						</Alert>
					);
				default:
					return (
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>An unexpected error occurred</AlertDescription>
						</Alert>
					);
			}
		}
		return (
			<Alert variant="destructive">
				<AlertTriangle className="h-4 w-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>Something went wrong</AlertDescription>
			</Alert>
		);
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<Card className="w-[350px]">
				<CardHeader>
					<CardTitle>Oops!</CardTitle>
				</CardHeader>
				<CardContent>
					{renderErrorContent()}
				</CardContent>
			</Card>
		</div>
	);
};

export default ErrorBoundary;
