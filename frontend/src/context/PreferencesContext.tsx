import React, { createContext, useContext } from 'react';
import { DateRange } from "react-day-picker";
import { usePreferencesState } from '@/hooks';
import { DailyPreference, PreferenceRange } from '@/components/preferences/types';

interface PreferencesContextType {
	timeRanges: DailyPreference[];
	range: DateRange | undefined;
	setRange: (range: DateRange | undefined) => void;
	handleAddTimeRange: (date: Date) => void;
	handleRemoveTimeRange: (date: Date, index: number) => void;
	handleUpdateTimeRange: (date: Date, index: number, field: 'start_time' | 'end_time', value: string) => void;
	handleApplyAll: (ranges: PreferenceRange[]) => void;
	isEmpty: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const preferences = usePreferencesState();

	return (
		<PreferencesContext.Provider value={preferences}>
			{children}
		</PreferencesContext.Provider>
	);
};

export const usePref = () => {
	const context = useContext(PreferencesContext);
	if (context === undefined) {
		throw new Error('usePreferences must be used within a PreferencesProvider');
	}
	return context;
};
