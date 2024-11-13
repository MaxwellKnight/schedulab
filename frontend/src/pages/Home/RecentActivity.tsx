import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityItem } from './ActivityItem';

interface RecentActivityProps {
	activities: ActivityItem[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => (
	<Card className="border shadow-sm">
		<CardHeader className="border-b px-4">
			<CardTitle className="text-lg py-2.5 font-semibold text-gray-900">Recent Activity</CardTitle>
		</CardHeader>
		<CardContent>
			<motion.div
				className="mt-3 space-y-3"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.3 }}
			>
				{activities.map((activity, index) => (
					<motion.div
						key={activity.id}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: index * 0.1 }}
					>
						<ActivityItem {...activity} />
					</motion.div>
				))}
			</motion.div>
		</CardContent>
	</Card>
);
