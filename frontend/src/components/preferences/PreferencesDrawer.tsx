import { useState } from 'react';
import { PreferencesContent } from "./PreferencesContent";
import { usePreferences, usePreferencesState, useTeam } from "@/hooks";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "../ui/drawer";
import AnimatedGradientButton from "../AnimatedButton";
import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "lucide-react";
import PreferenceSelector from "./PreferenceSelector";
import { ScrollArea } from "@/components/ui/scroll-area";
import PreferencesSidebar from './PreferencesSidebar';
import AnimatedSubmitButton from '../AnimatedSubmitButton';
import { DailyPreference, NavigationItemId, PreferenceRange } from './types';
import type { DateRange } from "react-day-picker";
import PreferencesHistory from './PreferencesHistory';

export interface PreferencesDrawerProps {
	onSuccess?: () => void;
}

type SetRangeFunction = React.Dispatch<React.SetStateAction<DateRange | undefined>>;

interface ViewProps {
	range: DateRange | undefined;
	setRange: SetRangeFunction;
	timeRanges: DailyPreference[];
	onAddTimeRange: (date: Date) => void;
	onRemoveTimeRange: (date: Date, index: number) => void;
	onUpdateTimeRange: (date: Date, index: number, field: 'start_time' | 'end_time', value: string) => void;
	onApplyToAll: (ranges: PreferenceRange[]) => void;
	handleSubmit: () => Promise<void>;
	isSubmitting: boolean;
	error: string | null;
	hasTimeRanges: boolean;
}

const ViewComponents: Record<NavigationItemId, React.FC<ViewProps>> = {
	create: ({
		range,
		setRange,
		timeRanges,
		onAddTimeRange,
		onRemoveTimeRange,
		onUpdateTimeRange,
		onApplyToAll,
		handleSubmit,
		isSubmitting,
		error,
		hasTimeRanges
	}) => (
		<>
			<PreferencesContent
				range={range}
				setRange={setRange}
				timeRanges={timeRanges}
				onAddTimeRange={onAddTimeRange}
				onRemoveTimeRange={onRemoveTimeRange}
				onUpdateTimeRange={onUpdateTimeRange}
				onApplyToAll={onApplyToAll}
			/>
			<div className="flex place-content-center">
				<AnimatedSubmitButton
					onClick={handleSubmit}
					isSubmitting={isSubmitting}
					text='Save Preferences'
					error={error}
					disabled={!hasTimeRanges}
					className="w-full sm:w-auto"
				/>
			</div>
		</>
	),
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

	const viewProps: ViewProps = {
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

	const Component = isAdmin
		? ViewComponents[currentView] ?? ViewComponents.view
		: ViewComponents.view;

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
