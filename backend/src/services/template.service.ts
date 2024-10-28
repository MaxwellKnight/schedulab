import { ITemplateScheduleRepository, ITemplateService } from "../interfaces";
import { TemplateConstraintData, TemplateScheduleData, TemplateShiftData } from "../interfaces/dto";
import { TemplateSchedule } from "../models";

export class TemplateService implements ITemplateService {
	private readonly repo: ITemplateScheduleRepository;

	constructor(repo: ITemplateScheduleRepository) {
		this.repo = repo;
	}

	public async transform({ id, team_id, name, start_date, end_date, notes, shifts, constraints, created_at }: TemplateSchedule): Promise<TemplateScheduleData> {
		const transformedShifts: TemplateShiftData[] = shifts.map(shift => ({
			id: shift.id,
			template_schedule_id: shift.template_schedule_id,
			shift_type_id: shift.shift_type_id,
			shift_name: shift.shift_name,
			required_count: shift.required_count,
			day_of_week: shift.day_of_week,
			ranges: shift.ranges,
			created_at: shift.created_at
		}));

		const transformedConstraints: TemplateConstraintData[][] = constraints.map(pair =>
			pair.filter(constraint => constraint !== null).map(constraint => ({
				id: constraint.id,
				template_schedule_id: constraint.template_schedule_id,
				shift_type: constraint.shift_type,
				shift_type_id: constraint.shift_type_id,
				next_shift_type_id: constraint.next_shift_type_id,
				created_at: constraint.created_at
			}))
		);

		console.log("here");

		return {
			id,
			team_id,
			name,
			start_date,
			end_date,
			notes,
			shifts: transformedShifts,
			constraints: transformedConstraints,
			created_at
		};
	}

	public async create(data: Omit<TemplateScheduleData, "id" | "created_at">): Promise<number> {
		return await this.repo.create(data);
	}

	public async getOne(id: number): Promise<TemplateScheduleData | null> {
		const result = await this.repo.getOne(id);
		if (result.length === 0) return null;
		return this.transform(result[0]);
	}

	public async getMany(): Promise<TemplateScheduleData[]> {
		const res = await this.repo.getMany();
		return await Promise.all(res.map(async (template) => this.transform(template)));
	}

	public async update(data: TemplateScheduleData): Promise<number> {
		return await this.repo.update(data);
	}

	public async delete(id: number): Promise<number> {
		return await this.repo.delete(id);
	}

	public async getByTeamId(teamId: number): Promise<TemplateScheduleData[]> {
		const result = await this.repo.getByTeamId(teamId);
		return Promise.all(result.map(async (template) => this.transform(template)));
	}

	public async createScheduleFromTemplate(templateId: number, startDate: Date): Promise<number> {
		return await this.repo.createScheduleFromTemplate(templateId, startDate);
	}

}
