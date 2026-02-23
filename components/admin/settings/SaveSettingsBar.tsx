import { Button } from '@/components/ui/button';
import { RefreshCw, Save } from 'lucide-react';

interface SaveSettingsBarProps {
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}

export default function SaveSettingsBar({
  saving,
  onSave,
  onReset,
}: SaveSettingsBarProps) {
  return (
    <div className="mt-4">
      <div className="bg-gradient-to-r from-blue-50 to-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4 shadow-sm">
        
        <div className="flex flex-col gap-3">
          
          {/* Text Section */}
          <div className="text-center sm:text-left">
            <p className="font-semibold text-slate-800 text-sm sm:text-base">
              Save Your Changes
            </p>
            <p className="text-[11px] sm:text-sm text-slate-500 mt-0.5">
              You have unsaved updates.
            </p>
          </div>

          {/* Buttons - ALWAYS side by side */}
          <div className="flex flex-row gap-2 w-full">
            
            <Button
              variant="outline"
              onClick={onReset}
              disabled={saving}
              className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100 transition-all duration-200 h-8 px-2 text-xs sm:text-sm"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>

            <Button
              onClick={onSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-[#004AAD] to-[#0066CC] hover:from-[#003580] hover:to-[#004AAD] shadow-sm transition-all duration-200 h-8 px-2 text-xs sm:text-sm"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 mr-1" />
                  Save
                </>
              )}
            </Button>

          </div>
        </div>
      </div>
    </div>
  );
}