import { PreferencesHeader } from "./PreferencesHeader";
import { PreferencesContent } from "./PreferencesContent";
import { PreferencesFooter } from "./PreferencesFooter";
import { usePreferences, usePreferencesState, useTeam } from "@/hooks";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
import AnimatedGradientButton from "../AnimatedButton";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import PreferenceSelector from "./PreferenceSelector";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface PreferencesDrawerProps {
	onSuccess?: () => void;
}

export const PreferencesDrawer: React.FC<PreferencesDrawerProps> = ({ onSuccess }) => {
	const { isAdmin } = useTeam();
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
					disabled={false}
					icon={Settings}
					text="Preferences"
				/>
			</DrawerTrigger>
			<DrawerContent>
				<motion.div
					className="flex flex-col h-[calc(90vh-2rem)] px-2 mx-auto w-full"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<div className="flex-shrink-0">
						<PreferencesHeader />
					</div>

					<div className="flex-1 min-h-0"> {/* This ensures proper scroll containment */}
						<ScrollArea className="h-full">
							<div className="px-4 py-2">
								{isAdmin ? (
									<PreferencesContent
										range={range}
										setRange={setRange}
										timeRanges={timeRanges}
										onAddTimeRange={handleAddTimeRange}
										onRemoveTimeRange={handleRemoveTimeRange}
										onUpdateTimeRange={handleUpdateTimeRange}
										onApplyToAll={handleApplyAll}
									/>
								) : (
									<PreferenceSelector />
								)}
							</div>
						</ScrollArea>
					</div>

					{isAdmin && (
						<div className="flex-shrink-0 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
							<PreferencesFooter
								error={error}
								isSubmitting={isSubmitting}
								isSuccess={isSuccess}
								hasTimeRanges={hasTimeRanges}
								onSubmit={handleSubmit}
							/>
						</div>
					)}
				</motion.div>
			</DrawerContent>
		</Drawer>
	);
};
