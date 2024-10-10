import { NextFunction, Request, Response } from "express";
import { IRequest, IResponse } from "../interfaces/http.interface";

export const adaptMiddleware = (
	callback: (req: IRequest, res: IResponse) => Promise<void>
) => {
	return async ({ body, params, query, headers }: Request, res: Response, next: NextFunction): Promise<void> => {
		const request: IRequest = { body, headers, params, query };
		const response: IResponse = {
			json: (data: any) => res.json(data),
			status: (code: number) => res.status(code),
			cookie: res.cookie
		};

		if (body.forbidden) res.status(403).json({ error: "Forbidden" });

		try {
			await callback(request, response);
			if (!res.headersSent) next();
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Internal server error" });
		}
	};
};


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
