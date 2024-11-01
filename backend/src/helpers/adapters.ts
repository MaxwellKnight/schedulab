// Function to convert input data to the Scheduler preferences format
// export const  AdaptPreferences = (inputData: PreferenceData[]): PreferencesTable => {
// 	const preferencesTable: PreferencesTable = inputData.map(user => {
// 		const userName = `User${user.user_id}`;  // Assuming user name can be derived from user_id

// 		const dailyPreferences: string[][] = user.daily_preferences.map((dailyPref: any) => {
// 			const morningPref = dailyPref.morning === 1 ? '+' : '-';
// 			const noonPref = dailyPref.noon === 1 ? '+' : '-';
// 			const nightPref = dailyPref.night === 1 ? '+' : '-';

// 			return [morningPref, noonPref, nightPref];
// 		});

// 		return [userName, dailyPreferences];
// 	});

// 	return preferencesTable;
// }
