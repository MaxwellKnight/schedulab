import { motion } from "framer-motion";
import { DateRangePicker } from "../DateRangePicker";
import PreferencesApply from "./PreferencesApply";
import { usePref } from "@/context/PreferencesContext";
import AnimatedSubmitButton from "../AnimatedSubmitButton";
import { usePreferences } from "@/hooks/usePreferences";
import { Input } from "../ui/input";
import { useState } from "react";

export interface PreferencesContentProps {
	onSuccess?: () => void;
	refetch: () => void;
}

export const PreferencesContent: React.FC<PreferencesContentProps> = ({ onSuccess, refetch }) => {
	const { range, setRange, timeRanges } = usePref();
	const [success, setSuccess] = useState(false);
	const { isSubmitting, error, handleSubmit, name, handleName } = usePreferences(timeRanges, range, () => {
		setSuccess(true);
		onSuccess?.();
		// Reset success state after animation
		setTimeout(() => {
			setSuccess(false);
		}, 2000);
	});

	const handleFormSubmit = async () => {
		try {
			await handleSubmit();
			// Only refetch if submission was successful
			refetch();
		} catch (err) {
			console.error('Error submitting form:', err);
		}
	};

	return (
		<motion.div
			className="grid place-items-center p-4 w-full min-h-[500px]"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 0.3 }}
		>
			<div className="max-w-[300px] grid place-items-center space-y-2.5 py-4">
				<Input
					id="templateName"
					placeholder="Enter template name"
					value={name}
					onChange={(e) => handleName(e.target.value)}
					className="w-full text-center bg-blue-50/50 border-blue-200 placeholder-blue-400 text-blue-900
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                   hover:border-blue-400 transition-all duration-200"
				/>
				<p className="text-xs text-blue-600">
					Enter a descriptive name for your template
				</p>
			</div>
			<DateRangePicker
				className="mb-4"
				range={range}
				setRange={setRange}
			/>
			<PreferencesApply />
			<div className="mt-10 flex justify-center px-4 md:px-0">
				<AnimatedSubmitButton
					onClick={handleFormSubmit}
					isSubmitting={isSubmitting}
					text='Create Template'
					error={error}
					onSuccess={success}
					disabled={!name.trim()}
					className="w-full sm:w-auto"
				/>
			</div>
		</motion.div>
	);
};
