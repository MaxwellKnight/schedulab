import React from 'react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks';
import { ActivityItem } from './ActivityItem';
import { WelcomeHeader } from './WelcomeHeader';
import { ScheduleView } from './ScheduleView';
import { RecentActivity } from './RecentActivity';

const Home: React.FC = () => {
	const { user, error } = useAuth();
	const recentActivity: ActivityItem[] = [
		{
			id: '1',
			title: 'Schedule Updated',
			description: 'Week of Nov 20 schedule has been published',
			timestamp: '2h ago',
			type: 'schedule'
		},
		{
			id: '2',
			title: 'New Team Member',
			description: 'Sarah Smith has joined the team',
			timestamp: '1d ago',
			type: 'team'
		}
	];

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertDescription>
					There was an error loading your dashboard. Please try again later.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="bg-gray-50 p-6"
		>
			<div className="mx-auto space-y-6">
				<WelcomeHeader userName={user?.display_name} />

				<div className="grid gap-6 lg:grid-cols-12">
					<motion.div
						className="lg:col-span-9"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
					>
						<ScheduleView />
					</motion.div>

					<motion.div
						className="lg:col-span-3"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						<RecentActivity activities={recentActivity} />
					</motion.div>
				</div>
			</div>
		</motion.div>
	);
};

export default Home;
