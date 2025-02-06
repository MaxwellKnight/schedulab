import { useState } from 'react';
import { usePreferences, usePreferencesState, useTeam } from "@/hooks";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "../ui/drawer";
import AnimatedGradientButton from "../AnimatedButton";
import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "lucide-react";
import PreferenceSelector from "./PreferenceSelector";
import { ScrollArea } from "@/components/ui/scroll-area";
import PreferencesSidebar from './PreferencesSidebar';
import AnimatedSubmitButton from '../AnimatedSubmitButton';
import { NavigationItemId } from './types';
import PreferencesHistory from './PreferencesHistory';
import PreferencesGrid, { PreferencesGridProps } from './PreferencesGrid';

export interface PreferencesDrawerProps {
	onSuccess?: () => void;
}

const ViewComponents: Record<NavigationItemId, React.FC<PreferencesGridProps>> = {
	playground: (props) => <PreferencesGrid {...props} />,
	view: () => <PreferenceSelector />,
	history: () => <PreferencesHistory />,
	settings: ({ handleSubmit, isSubmitting, error }) => (
		<div className="text-center">
			<AnimatedSubmitButton
				onClick={handleSubmit}
				isSubmitting={isSubmitting}
				text='Save Settings'
				error={error}
				className="w-full sm:w-auto"
			/>
		</div>
	)
};

export const PreferencesDrawer: React.FC<PreferencesDrawerProps> = ({ onSuccess }) => {
	const { isAdmin } = useTeam();
	const [currentView, setCurrentView] = useState<NavigationItemId>('view');

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
		error,
		handleSubmit
	} = usePreferences(timeRanges, range, onSuccess);

	const viewProps: PreferencesGridProps = {
		range,
		setRange,
		timeRanges,
		onAddTimeRange: handleAddTimeRange,
		onRemoveTimeRange: handleRemoveTimeRange,
		onUpdateTimeRange: handleUpdateTimeRange,
		onApplyToAll: handleApplyAll,
		handleSubmit,
		isSubmitting,
		error,
		hasTimeRanges
	};

	const Component =
		ViewComponents[currentView] ? ViewComponents[currentView] : ViewComponents.view;

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
					className="flex flex-col h-[calc(90vh-2rem)] mx-auto w-full"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<div className="flex-shrink-0 border-b">
						<DrawerTitle></DrawerTitle>
					</div>
					<div className="flex flex-1 min-h-0">
						<div className="flex-1 min-h-0">
							<ScrollArea className="h-full">
								<div className="p-6">
									<AnimatePresence mode="wait">
										<motion.div
											key={currentView}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											transition={{ duration: 0.2 }}
											className="space-y-6"
										>
											<Component {...viewProps} />
										</motion.div>
									</AnimatePresence>
								</div>
							</ScrollArea>
						</div>
						<PreferencesSidebar
							onViewChange={setCurrentView}
							currentView={currentView}
							isAdmin={isAdmin}
						/>
					</div>
				</motion.div>
			</DrawerContent>
		</Drawer>
	);
};

export default PreferencesDrawer;
