import { PreferencesContent } from "./PreferencesContent"
import AnimatedSubmitButton from "../AnimatedSubmitButton"
import { useState } from "react"
import { Calendar, Edit2, Clock } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePreferences, usePreferencesState } from "@/hooks"

type PreferenceMode = 'create' | 'edit' | 'schedule'

interface ModeOption {
	id: PreferenceMode
	label: string
	icon: React.ReactNode
	badge?: string
}

export interface PreferencesGridProps {
	onSuccess?: () => void;
}

const modeOptions: ModeOption[] = [
	{
		id: 'create',
		label: 'Create New',
		icon: <Clock className="w-4 h-4" />,
	},
	{
		id: 'edit',
		label: 'Edit Existing',
		icon: <Edit2 className="w-4 h-4" />,
		badge: '2'
	},
	{
		id: 'schedule',
		label: 'Schedule View',
		icon: <Calendar className="w-4 h-4" />,
	}
]

const PreferencesGrid: React.FC<PreferencesGridProps> = ({
	onSuccess
}) => {
	const [activeMode, setActiveMode] = useState<PreferenceMode>('create')
	const { timeRanges, range, hasTimeRanges } = usePreferencesState();
	const { isSubmitting, error, handleSubmit } = usePreferences(timeRanges, range, onSuccess);

	const renderContent = () => {
		return (
			activeMode === 'create' &&
			<PreferencesContent />
		)
	}

	return (
		<div className="space-y-6">
			<Tabs
				defaultValue="create"
				value={activeMode}
				onValueChange={(value) => setActiveMode(value as PreferenceMode)}
				className="w-full"
			>
				<TabsList className="grid w-full grid-cols-3 bg-slate-50">
					{modeOptions.map((mode) => (
						<TabsTrigger
							key={mode.id}
							value={mode.id}
							className="relative data-[state=active]:bg-white"
						>
							<span className="flex items-center gap-2">
								{mode.icon}
								<span className="hidden sm:inline">{mode.label}</span>
							</span>
							{mode.badge && (
								<Badge
									variant="secondary"
									className={`
absolute -top-2 -right-2
${activeMode === mode.id
											? 'bg-slate-900 text-white'
											: 'bg-slate-200 text-slate-600'
										}
`}
								>
									{mode.badge}
								</Badge>
							)}
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>

			{/* Content Area */}
			<div className="min-h-[400px]">
				{renderContent()}
			</div>

			{/* Submit Button */}
			{activeMode !== 'schedule' ?
				<div className="flex place-content-center">
					<AnimatedSubmitButton
						onClick={handleSubmit}
						isSubmitting={isSubmitting}
						text={
							activeMode === 'edit'
								? 'Update Preferences'
								: 'Save Preferences'
						}
						error={error}
						disabled={!hasTimeRanges}
						className="w-full sm:w-auto"
					/>
				</div> : null}
		</div>
	)
}

export default PreferencesGrid
