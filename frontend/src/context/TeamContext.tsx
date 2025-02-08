import { useAuth } from '@/hooks/useAuth/useAuth';
import axios from 'axios';
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

axios.defaults.withCredentials = true;
const BASE_URL = 'http://localhost:5713';
axios.defaults.baseURL = BASE_URL;

interface Team {
	id: number;
	name: string;
	creator_id: number;
	team_code: string;
	notes?: string;
	created_at: Date;
	member_count?: number;
}

export interface Member {
	id: number;
	google_id?: string;
	picture?: string;
	display_name?: string;
	user_role: string;
	first_name: string;
	last_name: string;
	middle_name?: string;
	email: string;
	created_at: Date;
}

interface TeamContextType {
	teams: Team[] | null;
	members: Member[];
	isAdmin: boolean;
	selectedTeam: Team | null;
	setSelectedTeam: (team: Team) => void;
	loading: boolean;
	error: string | null;
	membersLoading: boolean;
	membersError: string | null;
	refetchTeams: () => Promise<void>;
	refetchMembers: () => Promise<void>;
	createTeam: (teamData: { name: string; notes?: string }) => Promise<void>;
	joinTeam: (teamCode: string) => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
	const [teams, setTeams] = useState<Team[] | null>(null);
	const [members, setMembers] = useState<Member[]>([]);
	const [isAdmin, setIsAdmin] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [membersLoading, setMembersLoading] = useState(false);
	const [membersError, setMembersError] = useState<string | null>(null);

	const { user } = useAuth();

	const fetchTeams = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await axios.get<Team[]>('/users/teams');
			setTeams(response.data);
		} catch (error) {
			console.error('Error fetching teams:', error);
			if (axios.isAxiosError(error)) {
				setError(error.response?.data?.message || 'Failed to fetch teams');
			} else {
				setError('Failed to fetch teams');
			}
		} finally {
			setLoading(false);
		}
	}, []);

	const fetchMembers = useCallback(async () => {
		if (!selectedTeam) return;

		try {
			setMembersLoading(true);
			setMembersError(null);
			const response = await axios.get<Member[]>(`/teams/${selectedTeam.id}/members`);
			setMembers(response.data);
		} catch (error) {
			console.error('Error fetching team members:', error);
			if (axios.isAxiosError(error)) {
				setMembersError(error.response?.data?.message || 'Failed to fetch team members');
			} else {
				setMembersError('Failed to fetch team members');
			}
		} finally {
			setMembersLoading(false);
		}
	}, [selectedTeam]);

	// Initial teams fetch
	useEffect(() => {
		fetchTeams();
	}, [fetchTeams]);

	// Fetch members when selected team changes
	useEffect(() => {
		if (selectedTeam) {
			fetchMembers();
		} else {
			setMembers([]);
		}
	}, [selectedTeam, fetchMembers]);

	// Set initial selected team
	useEffect(() => {
		if (teams && teams.length > 0 && !selectedTeam) {
			setSelectedTeam(teams[0]);
		}
	}, [teams, selectedTeam]);

	// Handle selected team persistence and admin status
	useEffect(() => {
		if (selectedTeam) {
			localStorage.setItem('selectedTeam', JSON.stringify(selectedTeam));
			if (selectedTeam.creator_id === user?.id) setIsAdmin(true);
			else setIsAdmin(false);
		}
		return () => localStorage.removeItem('selectedTeam');
	}, [selectedTeam, user]);

	// Load saved selected team
	useEffect(() => {
		const savedTeam = localStorage.getItem('selectedTeam');
		if (savedTeam) {
			try {
				const parsedTeam = JSON.parse(savedTeam);
				setSelectedTeam(parsedTeam);
			} catch (error) {
				console.error('Error parsing saved team:', error);
				localStorage.removeItem('selectedTeam');
			}
		}
	}, []);

	const createTeam = useCallback(async (teamData: { name: string; notes?: string }) => {
		try {
			await axios.post('/teams', {
				creator_id: user?.id,
				name: teamData.name,
				notes: teamData.notes || '',
			});
			await fetchTeams();
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || 'Failed to create team');
			}
			throw error;
		}
	}, [fetchTeams, user]);

	const joinTeam = useCallback(async (teamCode: string) => {
		try {
			await axios.post('/teams/join', { teamCode });
			await fetchTeams();
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || 'Failed to join team');
			}
			throw error;
		}
	}, [fetchTeams]);

	const value = {
		teams,
		members,
		selectedTeam,
		setSelectedTeam,
		loading,
		error,
		membersLoading,
		membersError,
		refetchTeams: fetchTeams,
		refetchMembers: fetchMembers,
		createTeam,
		joinTeam,
		isAdmin,
	};

	return (
		<TeamContext.Provider value={value}>
			{children}
		</TeamContext.Provider>
	);
};

export const useTeam = () => {
	const context = useContext(TeamContext);
	if (context === undefined) {
		throw new Error('useTeam must be used within a TeamProvider');
	}
	return context;
};
