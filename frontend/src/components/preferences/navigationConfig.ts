import { Eye, Plus, History } from "lucide-react";
import { PreferencesNavigationConfig } from "./types";

export const preferencesNavigationConfig: PreferencesNavigationConfig = {
	defaultView: 'view',
	items: [
		{
			id: 'create',
			label: 'Create New',
			icon: Plus,
			description: 'Create a new preference setting',
			enabled: true,
			requiresAdmin: true,
		},
		{
			id: 'view',
			label: 'Current Active',
			icon: Eye,
			description: 'View currently active preference setting and apply',
			enabled: true,
		},
		{
			id: 'history',
			label: 'History',
			icon: History,
			description: 'View preference history',
			enabled: true,
			requiresAdmin: true,
		}
	]
};
