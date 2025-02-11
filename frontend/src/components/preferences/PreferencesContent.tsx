import { motion } from "framer-motion";
import { DateRangePicker } from "../DateRangePicker";
import PreferencesApply from "./PreferencesApply";
import { usePref } from "@/context/PreferencesContext";
import AnimatedSubmitButton from "../AnimatedSubmitButton";
import { usePreferences } from "@/hooks";

export interface PreferencesContentProps {
	onSuccess?: () => void;
}

export const PreferencesContent: React.FC<PreferencesContentProps> = ({ onSuccess }) => {
	const { range, setRange, timeRanges } = usePref();
	const { isSubmitting, error, handleSubmit } = usePreferences(timeRanges, range, onSuccess);

	return (
		<motion.div
			className="grid place-items-center p-4 w-full min-h-[500px]"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 0.3 }}
		>
			<DateRangePicker
				className="mb-4"
				range={range}
				setRange={setRange}
			/>
			<PreferencesApply />

			<div className="mt-10 flex justify-center px-4 md:px-0">
				<AnimatedSubmitButton
					onClick={handleSubmit}
					isSubmitting={isSubmitting}
					text='Create Template'
					error={error}
					disabled={false}
					className="w-full sm:w-auto"
				/>
			</div>
		</motion.div>
	)
};
