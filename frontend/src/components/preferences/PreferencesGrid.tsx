import { PreferencesContent } from "./PreferencesContent"
import AnimatedSubmitButton from "../AnimatedSubmitButton"
import { useState } from "react"
import { Calendar, Edit2, Clock } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePreferences, usePreferencesState } from "@/hooks"
import { PreferencesEdit } from "./PreferencesEdit"
import { PreferenceTemplate } from "./types.d.ts";
import { useAuthenticatedFetch } from "@/hooks/useAuthFetch";

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
    badge: true
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
  const { 
    data: templates,
    loading: templateLoading,
    error: templateError
  } = useAuthenticatedFetch<PreferenceTemplate[]>('/preferences');


  const renderContent = () => {
    switch(activeMode) {
      case "create":
        return <PreferencesContent />;
      case "edit":
        return <PreferencesEdit templates={templates} loading={templateLoading} error={templateError} />
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="create"
        value={activeMode}
        onValueChange={(value) => setActiveMode(value as PreferenceMode)}
        className="w-full"
      >
        <TabsList className="w-full h-12 bg-white border-b border-blue-100 overflow-x-auto overflow-y-hidden no-scrollbar">
          {modeOptions.map((mode) => (
            <TabsTrigger
              key={mode.id}
              value={mode.id}
              className="relative h-full min-w-[100px] md:min-w-0 px-3 md:px-6 text-gray-500 
                         hover:text-blue-600 whitespace-nowrap
                         data-[state=active]:text-blue-600 data-[state=active]:font-medium
                         data-[state=active]:border-b-2 data-[state=active]:border-blue-600
                         transition-all duration-200"
            >
              <span className="flex items-center gap-2">
                <span className="transition-colors duration-200">
                  {mode.icon}
                </span>
                <span className="text-xs md:text-sm">{mode.label}</span>
                {mode.badge && (
                  <Badge
                    variant="secondary"
                    className={`
                      hidden md:inline-flex px-1.5 py-0.5 text-xs font-medium
                      ${activeMode === mode.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}
                  >
                    {templates && templates.length}
                  </Badge>
                )}
              </span>
              {mode.badge && (
                <Badge
                  variant="secondary"
                  className={`
                    md:hidden absolute -top-1 -right-1 px-1 py-0.5 min-w-[18px] h-[18px]
                    text-[10px] font-medium flex items-center justify-center
                    ${activeMode === mode.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
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
      <div className="min-h-[400px] px-2 md:px-0">
        {renderContent()}
      </div>

      {/* Submit Button */}
      {activeMode !== 'schedule' && (
        <div className="flex justify-center px-4 md:px-0">
          <AnimatedSubmitButton
            onClick={handleSubmit}
            isSubmitting={isSubmitting}
            text={activeMode === 'edit' ? 'Update Preferences' : 'Save Preferences'}
            error={error}
            disabled={!hasTimeRanges}
            className="w-full sm:w-auto"
          />
        </div>
      )}
    </div>
  )
}

export default PreferencesGrid
