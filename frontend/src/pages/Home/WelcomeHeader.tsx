import React from 'react';
import { Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface WelcomeHeaderProps {
	userName?: string;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ userName }) => (
	<motion.div
		initial={{ opacity: 0, y: -20 }}
		animate={{ opacity: 1, y: 0 }}
		className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
	>
		<div className="space-y-1">
			<h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
				Welcome back{userName ? `, ${userName}` : ''}
			</h1>
			<p className="text-sm text-gray-600 sm:text-base">
				Here&apos;s an overview of your team&apos;s schedule and activities
			</p>
		</div>

		<motion.div
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
		>
			<Button
				className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
			>
				<Settings className="h-4 w-4" />
				Publish Preferences
			</Button>
		</motion.div>
	</motion.div>
);
