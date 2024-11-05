import { useAuth } from '@/hooks/useAuth/useAuth';
import { useAuthenticatedFetch } from '@/hooks/useAuthFetch';
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

interface TeamContextType {
	teams: Team[] | null;
	selectedTeam: Team | null;
	setSelectedTeam: (team: Team) => void;
	loading: boolean;
	error: string | null;
	refetchTeams: () => Promise<void>;
	createTeam: (teamData: { name: string; notes?: string }) => Promise<void>;
	joinTeam: (teamCode: string) => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
	const { user } = useAuth();
	const {
		data: teams = [],
		loading,
		error,
		fetchData: refetchTeams
	} = useAuthenticatedFetch<Team[]>('/users/teams');

	useEffect(() => {
		if (teams && teams.length > 0 && !selectedTeam) {
			setSelectedTeam(teams[0]);
		}
	}, [teams, selectedTeam]);

	useEffect(() => {
		if (selectedTeam) {
			localStorage.setItem('selectedTeam', JSON.stringify(selectedTeam));
		}
	}, [selectedTeam]);

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

		return () => localStorage.removeItem('selectedTeam');
	}, []);

	const createTeam = useCallback(async (teamData: { name: string; notes?: string }) => {
		try {
			await axios.post('/teams', {
				creator_id: user?.id,
				name: teamData.name,
				notes: teamData.notes || '',
			});
			await refetchTeams();
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || 'Failed to create team');
			}
			throw error;
		}
	}, [refetchTeams, user]);

	const joinTeam = useCallback(async (teamCode: string) => {
		try {
			await axios.post('/teams/join', { teamCode });
			await refetchTeams();
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || 'Failed to join team');
			}
			throw error;
		}
	}, [refetchTeams]);

	const value = {
		teams,
		selectedTeam,
		setSelectedTeam,
		loading,
		error,
		refetchTeams,
		createTeam,
		joinTeam
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
