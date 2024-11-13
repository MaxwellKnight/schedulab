import React from 'react';
import { Bell, Users, Calendar, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export type ActivityItem = {
	id: string;
	title: string;
	description: string;
	timestamp: string;
	type: 'schedule' | 'team' | 'alert' | 'other';
};

export const ActivityItem: React.FC<ActivityItem> = ({ title, description, timestamp, type }) => {
	const getIcon = () => {
		switch (type) {
			case 'schedule':
				return <Calendar className="h-4 w-4 text-indigo-500" />;
			case 'team':
				return <Users className="h-4 w-4 text-emerald-500" />;
			case 'alert':
				return <AlertCircle className="h-4 w-4 text-rose-500" />;
			default:
				return <Bell className="h-4 w-4 text-gray-500" />;
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			whileHover={{ scale: 1.02 }}
			className="group flex items-center gap-3 rounded-lg border bg-white p-3 transition-all hover:border-indigo-100 hover:shadow-sm"
		>
			<motion.div
				whileHover={{ rotate: 360 }}
				transition={{ duration: 0.3 }}
				className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-indigo-50"
			>
				{getIcon()}
			</motion.div>
			<div className="flex-1 space-y-0.5">
				<p className="font-medium text-gray-900">{title}</p>
				<p className="text-xs text-gray-600">{description}</p>
			</div>
			<div className="text-xs text-gray-400">{timestamp}</div>
		</motion.div>
	);
};
