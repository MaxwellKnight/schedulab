import { Eye, Plus, History } from "lucide-react";
import { PreferencesNavigationConfig } from "./types";

export const preferencesNavigationConfig: PreferencesNavigationConfig = {
	defaultView: 'view',
	items: [
		{
			id: 'view',
			label: 'Current Active',
			icon: Eye,
			description: 'View currently active preference setting and apply',
			enabled: true,
		},
		{
			id: 'playground',
			label: 'Playground',
			icon: Plus,
			description: 'Manage you team\'s preferences',
			enabled: true,
			requiresAdmin: true,
		},
		{
			id: 'history',
			label: 'History',
			icon: History,
			description: 'View preference history',
			enabled: true,
		}
	]
};
