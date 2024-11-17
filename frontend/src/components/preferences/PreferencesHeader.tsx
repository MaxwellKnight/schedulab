import { motion } from "framer-motion";
import { DrawerDescription, DrawerHeader, DrawerTitle } from "../ui/drawer";

export const PreferencesHeader = () => (
	<DrawerHeader className="w-full grid place-items-center">
		<motion.div
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.1 }}
		>
			<DrawerTitle className="text-2xl font-bold text-blue-900">
				Preferences
			</DrawerTitle>
		</motion.div>
		<motion.div
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<DrawerDescription className="text-blue-600">
				Manage your preferences simpler than ever.
			</DrawerDescription>
		</motion.div>
	</DrawerHeader>
);
