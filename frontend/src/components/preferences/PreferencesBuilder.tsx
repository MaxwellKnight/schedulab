import { DateRange } from "react-day-picker"
import { DailyPreference, PreferenceRange } from "./types"
import { PreferencesContent } from "./PreferencesContent";
import AnimatedSubmitButton from "../AnimatedSubmitButton";


type SetRangeFunction = React.Dispatch<React.SetStateAction<DateRange | undefined>>;

export interface PreferencesGridProps {
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

const PreferencesGrid: React.FC<PreferencesGridProps> = ({
	range,
	setRange,
	timeRanges,
	onUpdateTimeRange,
	onApplyToAll,
	onRemoveTimeRange,
	onAddTimeRange,
	isSubmitting,
	hasTimeRanges,
	error,
	handleSubmit
}) => {
	return (
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
	);
}
export default PreferencesGrid;
