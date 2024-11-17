import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Greeting } from './Greeting';
import { PreferencesDrawer } from '@/components/preferences/PreferencesDrawer';

interface WelcomeHeaderProps {
	userName?: string;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ userName }) => {
	const { greeting, icon } = Greeting();

	return (
		<motion.div
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
		>
			<div className="space-y-1">
				<div className="flex items-center gap-4">
					<h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
						{greeting}{userName ? `, ${userName.split(" ")[0]}` : ''}
					</h1>
					{icon}
				</div>
				<div className="flex items-center gap-2">
					<Clock className="h-4 w-4 text-gray-500" />
					<p className="text-sm text-gray-600 sm:text-base">
						Here&apos;s an overview of your team&apos;s schedule and activities
					</p>
				</div>
			</div>
			<motion.div
				whileHover={{ scale: 1.015 }}
				whileTap={{ scale: 1 }}
			>
				<PreferencesDrawer />
			</motion.div>
		</motion.div>
	);
};

export default WelcomeHeader;
