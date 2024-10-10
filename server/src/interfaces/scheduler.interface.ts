export type PrefsTable = Array<[string, Array<Array<number>>]>;

export type Schedule = {
	[day: number]: {
		[shift: string]: string[];
	};
};

export type Prefs = [string, number[][]];

export type RankedPrefs = [person: string, day: number, shift: number, score: number];

export type Assigned = {
	[person: string]: {
		[day: number]: {
			[shift: string]: boolean;
		};
	};
};
 
export type LastShift = {
	[person: string]: (string | null)[];
};
 
export type MinusesCount = {
	[person: string]: number;
};

export type ShiftsOnDay = {
	[person: string]: {
		[day: number]: number;
	};
};