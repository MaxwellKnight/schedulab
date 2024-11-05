import { Team, TeamRole } from "../models";
import { TeamData } from "../interfaces";
import { TeamRepository } from "../repositories";

type CreateTeamData = Omit<TeamData, 'id' | 'created_at'>;
type UpdateTeamData = Partial<TeamData> & { id: number };

export class TeamService {
	private readonly repo: TeamRepository;

	constructor(repo: TeamRepository) {
		this.repo = repo;
	}

	private transform(team: TeamData): TeamData {
		return {
			id: team.id!,
			name: team.name,
			creator_id: team.creator_id,
			team_code: team.team_code,
			notes: team.notes || '',
			created_at: team.created_at,
			member_count: team.member_count
		};
	}

	public async create(teamData: CreateTeamData): Promise<number> {
		const team: Omit<Team, 'id' | 'created_at'> = {
			name: teamData.name,
			creator_id: teamData.creator_id,
			team_code: teamData.team_code,
		};

		const teamId = await this.repo.create(team);

		// Create default roles
		await this.repo.createDefaultRoles(teamId);

		// Add creator as first team member and admin
		await this.repo.addMember(teamId, team.creator_id);
		await this.repo.setMemberRole(teamId, team.creator_id, 'admin');

		return teamId;
	}

	public async getOne(id: number, userId?: number): Promise<TeamData | null> {
		const team = await this.repo.getOne(id, userId);
		if (!team) return null;

		const memberCount = await this.repo.getMemberCount(id);

		return this.transform({
			...team,
			member_count: memberCount,
			notes: ''
		});
	}

	public async getMany(userId?: number): Promise<TeamData[]> {
		const teams = await this.repo.getMany(userId);
		const teamsWithCounts = await Promise.all(
			teams.map(async team => ({
				...team,
				member_count: await this.repo.getMemberCount(team.id!),
				notes: ''
			}))
		);

		return teamsWithCounts.map(team => this.transform(team));
	}

	public async getByTeamCode(teamCode: string): Promise<TeamData | null> {
		const team = await this.repo.getByTeamCode(teamCode);
		if (!team) return null;

		const memberCount = await this.repo.getMemberCount(team.id!);

		return this.transform({
			...team,
			member_count: memberCount,
			notes: ''
		});
	}

	public async getByCreatorId(creatorId: number): Promise<TeamData[]> {
		const teams = await this.repo.getByCreatorId(creatorId);
		const teamsWithCounts = await Promise.all(
			teams.map(async team => ({
				...team,
				member_count: await this.repo.getMemberCount(team.id!),
				notes: ''
			}))
		);

		return teamsWithCounts.map(team => this.transform(team));
	}

	public async addMember(teamId: number, userId: number): Promise<boolean> {
		const added = await this.repo.addMember(teamId, userId);
		if (added) {
			// Set default role as member
			await this.repo.setMemberRole(teamId, userId, 'member');
		}
		return added;
	}

	public async removeMember(teamId: number, userId: number, requesterId: number): Promise<boolean> {
		// Check if requester has admin rights
		const requesterRole = await this.repo.getMemberRole(teamId, requesterId);
		if (requesterRole !== 'admin') {
			throw new Error('Unauthorized: Only team admins can remove members');
		}

		// Prevent removing the last admin
		if (userId === requesterId) {
			const adminCount = await this.getAdminCount(teamId);
			if (adminCount <= 1) {
				throw new Error('Cannot remove the last admin from the team');
			}
		}

		return await this.repo.removeMember(teamId, userId);
	}

	public async update(teamData: UpdateTeamData, userId?: number): Promise<number> {
		const team: Partial<Team> & { id: number } = {
			id: teamData.id,
			...(teamData.name !== undefined && { name: teamData.name }),
			...(teamData.notes !== undefined && { notes: teamData.notes })
		};

		return await this.repo.update(team, userId);
	}

	public async delete(id: number, userId: number): Promise<number> {
		// Check if user is team admin
		const userRole = await this.repo.getMemberRole(id, userId);
		if (userRole !== 'admin') {
			throw new Error('Unauthorized: Only team admins can delete teams');
		}

		return await this.repo.delete(id);
	}

	public async addRole(
		teamId: number,
		roleName: string,
		requesterId: number
	): Promise<number | null> {
		const requesterRole = await this.repo.getMemberRole(teamId, requesterId);
		if (requesterRole !== 'admin') {
			throw new Error('Unauthorized: Only team admins can add roles');
		}

		if (['admin', 'member'].includes(roleName.toLowerCase())) {
			throw new Error('Cannot create default role names');
		}

		return await this.repo.addRole(teamId, roleName);
	}

	public async deleteRole(
		teamId: number,
		roleId: number,
		requesterId: number
	): Promise<boolean> {
		const requesterRole = await this.repo.getMemberRole(teamId, requesterId);
		if (requesterRole !== 'admin') {
			throw new Error('Unauthorized: Only team admins can delete roles');
		}

		return await this.repo.deleteRole(teamId, roleId);
	}

	public async getMemberRole(teamId: number, userId: number): Promise<string | null> {
		return await this.repo.getMemberRole(teamId, userId);
	}

	public async getRoles(teamId: number): Promise<TeamRole[]> {
		return await this.repo.getRoles(teamId);
	}

	public async setMemberRole(
		teamId: number,
		targetUserId: number,
		newRole: string,
		requesterId: number
	): Promise<boolean> {
		// Check if requester has admin rights
		const requesterRole = await this.repo.getMemberRole(teamId, requesterId);
		if (requesterRole !== 'admin') {
			throw new Error('Unauthorized: Only team admins can change member roles');
		}

		// If demoting an admin, ensure it's not the last one
		if (newRole !== 'admin') {
			const currentRole = await this.repo.getMemberRole(teamId, targetUserId);
			if (currentRole === 'admin') {
				const adminCount = await this.getAdminCount(teamId);
				if (adminCount <= 1) {
					throw new Error('Cannot demote the last admin of the team');
				}
			}
		}

		return await this.repo.setMemberRole(teamId, targetUserId, newRole);
	}

	private async getAdminCount(teamId: number): Promise<number> {
		return this.repo.getAdminCount(teamId);
	}
} 
