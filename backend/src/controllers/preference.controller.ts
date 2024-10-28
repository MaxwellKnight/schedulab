import { PreferenceData } from "../interfaces/dto";
import { IPreferenceService } from "../interfaces/services.interface";
import { IRequest, IResponse } from "../interfaces/http.interface";
import { IPreferenceController } from "../interfaces/controllers.interface";

export class PreferenceController implements IPreferenceController{

	private service: IPreferenceService;
	constructor(service: IPreferenceService) {
		this.service = service;
	}

	public create = async (req: IRequest, res: IResponse): Promise<void> => {
		const preference: PreferenceData = req.body;
		try{
			const result = await this.service.create(preference);
			res.json({ message: "Preference created", id: result });
		}catch(error) {
			res.status(400);
			res.json({ error: "Preference already exist" });
		}
	}

	public getOne = async (req: IRequest, res: IResponse): Promise<void> => {
		const id = req.params.id;
		const preferences = await this.service.getOne(Number(id));
		if(preferences) {
			res.json(preferences);
		} else {
			res.status(404);
			res.json({ error: "Preference not found" });
		}
	}

	public getMany = async (req: IRequest, res: IResponse): Promise<void> => {
		const preferences = await this.service.getMany();
		if(preferences.length > 0) {
			res.json(preferences);
		} else {
			res.status(404);
			res.json({ error: "No preferences exist" });
		}
	}

	public getByDates = async (req: IRequest, res: IResponse): Promise<void> => {
		const {start_date, end_date} = req.params;
		const preferences = await this.service.getByDates(new Date(start_date), new Date(end_date));
		if(preferences.length > 0) {
			res.json(preferences);
		} else {
			res.status(404);
			res.json({ error: "Preferences not found" });
		}
	}


	public getByUserId = async (req: IRequest, res: IResponse): Promise<void> => {
		const id = req.params.id;
		const preferences: PreferenceData[] = await this.service.getByUserId(Number(id)) as PreferenceData[];
		if(preferences.length > 0) {
			res.json(preferences);
		} else {
			res.status(404);
			res.json({ error: "Preferences not found" });
		}
	}


	public update = async (req: IRequest, res: IResponse): Promise<void> => {
		const { id, ...rest }: PreferenceData = req.body;
		const preference = await this.service.getOne(id);
		if(!preference){
			res.status(404);
			res.json({ error: "Preference not found" });
			return;
		}
		const result = this.service.update({ ...preference, ...rest });
		if(!result){
			res.status(400);
			res.json({ error: "Preference already exist" });
		}
		else res.json({ message: "Preference updated", id });
	}

	public delete = async (req: IRequest, res: IResponse): Promise<void> => {
		const id = req.params.id;
		const result = await this.service.delete(Number(id));
		if(result !== 0){
			res.json({ message: "Preference deleted" , id });
		}else {
			res.status(404);
			res.json({ error: "Preference not found" });
		}
	}
}