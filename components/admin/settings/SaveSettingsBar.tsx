import { Button } from '@/components/ui/button';
import { RefreshCw, Save } from 'lucide-react';

interface SaveSettingsBarProps {
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}

export default function SaveSettingsBar({ saving, onSave, onReset }: SaveSettingsBarProps) {
  return (
    <div className="mt-8">
  <div className="bg-gradient-to-r from-blue-50 to-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">

    <div className="flex flex-col gap-5">

      {/* Text Section */}
      <div className="text-center sm:text-left">
        <p className="font-semibold text-slate-800 text-lg">
          Save Your Changes
        </p>
        <p className="text-sm text-slate-500 mt-1">
          You have unsaved updates. Make sure to save before leaving.
        </p>
      </div>

      {/* Divider (Mobile Only) */}
      <div className="h-px bg-slate-200 sm:hidden" />

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">

        <Button
          variant="outline"
          onClick={onReset}
          disabled={saving}
          className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-blue-500 transition-all duration-200"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset Changes
        </Button>

        <Button
          onClick={onSave}
          disabled={saving}
          className="w-full sm:w-auto bg-gradient-to-r from-[#004AAD] to-[#0066CC] hover:from-[#003580] hover:to-[#004AAD] shadow-md transition-all duration-200"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Settings
            </>
          )}
        </Button>

      </div>
    </div>
  </div>
</div>

  );
}