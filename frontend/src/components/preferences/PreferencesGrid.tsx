import { useState } from "react";
import { Calendar, Edit2, Clock } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreferencesEdit } from "./PreferencesEdit";
import { useAuthenticatedFetch } from "@/hooks/useAuthFetch";
import { PreferenceTemplate } from "./types";
import { PreferencesContent } from "./PreferencesContent";
import PreferencesPublish from "./PreferencesPublish";

type PreferenceMode = 'create' | 'edit' | 'publish';

interface ModeOption {
  id: PreferenceMode;
  label: string;
  icon: React.ReactNode;
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
  },
  {
    id: 'publish',
    label: 'Publish',
    icon: <Calendar className="w-4 h-4" />,
  }
];

const PreferencesGrid: React.FC<PreferencesGridProps> = ({
  onSuccess
}) => {
  const [activeMode, setActiveMode] = useState<PreferenceMode>('create');

  const {
    data: templates,
    loading: templateLoading,
    error: templateError,
    fetchData: refetchPrefs,
  } = useAuthenticatedFetch<PreferenceTemplate[]>('/preferences');

  const renderContent = () => {
    switch (activeMode) {
      case "create":
        return <PreferencesContent onSuccess={onSuccess} refetch={() => refetchPrefs()} />;
      case "edit":
        return <PreferencesEdit templates={templates} loading={templateLoading} error={templateError} />;
      case "publish":
        return <PreferencesPublish />;
      default:
        return null;
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      <div className="sticky top-0 z-30 bg-white shadow-sm">
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
                className="relative h-full min-w-[100px] md:min-w-0 px-3 md:px-6 
                           text-gray-500 hover:text-blue-600 whitespace-nowrap
                           data-[state=active]:text-blue-600 
                           data-[state=active]:font-medium
                           data-[state=active]:border-b-2 
                           data-[state=active]:border-blue-600
                           transition-all duration-200"
              >
                <span className="flex items-center gap-2">
                  <span className="transition-colors duration-200">
                    {mode.icon}
                  </span>
                  <span className="text-xs md:text-sm">{mode.label}</span>
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="min-h-[400px] px-2 md:px-0 py-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PreferencesGrid;
