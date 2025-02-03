import { useState } from 'react';
import { PreferencesHeader } from "./PreferencesHeader";
import { PreferencesContent } from "./PreferencesContent";
import { usePreferences, usePreferencesState, useTeam } from "@/hooks";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
import AnimatedGradientButton from "../AnimatedButton";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import PreferenceSelector from "./PreferenceSelector";
import { ScrollArea } from "@/components/ui/scroll-area";
import PreferencesSidebar, { SidebarOption } from './PreferencesSidebar';
import AnimatedSubmitButton from '../AnimatedSubmitButton';

export interface PreferencesDrawerProps {
	onSuccess?: () => void;
}

export const PreferencesDrawer: React.FC<PreferencesDrawerProps> = ({ onSuccess }) => {
	const { isAdmin } = useTeam();
	const [currentView, setCurrentView] = useState<SidebarOption>('view');
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
						<PreferencesHeader />
					</div>

					<div className="flex flex-1 min-h-0">
						<div className="flex-1 min-h-0">
							<ScrollArea className="h-full">
								<div className="p-6">
									<motion.div
										key={currentView}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: 20 }}
										transition={{ duration: 0.2 }}
										className="space-y-6"
									>
										{isAdmin ? (
											currentView === 'create' ? (
												<>
													<PreferencesContent
														range={range}
														setRange={setRange}
														timeRanges={timeRanges}
														onAddTimeRange={handleAddTimeRange}
														onRemoveTimeRange={handleRemoveTimeRange}
														onUpdateTimeRange={handleUpdateTimeRange}
														onApplyToAll={handleApplyAll}
													/>
													<div className="flex place-content-center">
														<AnimatedSubmitButton
															onClick={handleSubmit}
															isSubmitting={isSubmitting}
															text='Save Preferences'
															error={error}
															disabled={!hasTimeRanges}
															className="w-full sm:w-auto"
														>
															Save Preferences
														</AnimatedSubmitButton>
													</div>
												</>
											) : (
												<PreferenceSelector />
											)
										) : (
											<PreferenceSelector />
										)}
									</motion.div>
								</div>
							</ScrollArea>
						</div>

						{isAdmin && (
							<PreferencesSidebar
								onViewChange={setCurrentView}
								currentView={currentView}
							/>
						)}
					</div>
				</motion.div>
			</DrawerContent>
		</Drawer>
	);
};
