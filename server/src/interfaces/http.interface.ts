export type IRequest = {
	[key: string]: any;
}

export interface IResponse {
	json: (data: any) => void;
	status: (status: number) => IResponse;
	cookie: Function;
}
