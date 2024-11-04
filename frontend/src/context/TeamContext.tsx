import { useAuthenticatedFetch } from '@/hooks/useAuthFetch';
import axios from 'axios';
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface Team {
	id: number;
	name: string;
	creator_id: number;
	team_code: string;
	created_at: Date;
}

interface TeamContextType {
	teams: Team[] | null;
	selectedTeam: Team | null;
	setSelectedTeam: (team: Team) => void;
	loading: boolean;
	error: string | null;
	refetchTeams: () => Promise<void>;
	createTeam: (name: string) => Promise<void>;
	joinTeam: (teamCode: string) => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
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
	}, []);

	const createTeam = useCallback(async (name: string) => {
		await axios.post('/teams', { name });
		await refetchTeams();
	}, [refetchTeams]);

	const joinTeam = useCallback(async (teamCode: string) => {
		await axios.post('/teams/join', { team_code: teamCode });
		await refetchTeams();
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
