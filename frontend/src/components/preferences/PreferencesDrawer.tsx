import { PreferencesHeader } from "./PreferencesHeader";
import { PreferencesContent } from "./PreferencesContent";
import { PreferencesFooter } from "./PreferencesFooter";
import { usePreferences, usePreferencesState } from "@/hooks";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
import AnimatedGradientButton from "../AnimatedButton";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";

export interface PreferencesDrawerProps {
	onSuccess?: () => void
}

export const PreferencesDrawer: React.FC<PreferencesDrawerProps> = ({ onSuccess }) => {
	const {
		timeRanges,
		range,
		setRange,
		handleAddTimeRange,
		handleRemoveTimeRange,
		handleUpdateTimeRange,
		handleApplyAll,
		hasTimeRanges
	} = usePreferencesState();

	const {
		isSubmitting,
		isSuccess,
		error,
		handleSubmit
	} = usePreferences(timeRanges, range, onSuccess);

	return (
		<Drawer>
			<DrawerTrigger asChild>
				<AnimatedGradientButton
					onClick={() => console.log("preferences...")}
					disabled={false}
					icon={Settings}
					text="Preferences"
				/>
			</DrawerTrigger>
			<DrawerContent>
				<motion.div
					className="grid place-items-center w-full"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<PreferencesHeader />

					<PreferencesContent
						range={range}
						setRange={setRange}
						timeRanges={timeRanges}
						onAddTimeRange={handleAddTimeRange}
						onRemoveTimeRange={handleRemoveTimeRange}
						onUpdateTimeRange={handleUpdateTimeRange}
						onApplyToAll={handleApplyAll}
					/>

					<PreferencesFooter
						error={error}
						isSubmitting={isSubmitting}
						isSuccess={isSuccess}
						hasTimeRanges={hasTimeRanges}
						onSubmit={handleSubmit}
					/>
				</motion.div>
			</DrawerContent>
		</Drawer>
	);
};
