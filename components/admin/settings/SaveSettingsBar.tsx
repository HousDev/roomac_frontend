import { Button } from '@/components/ui/button';
import { RefreshCw, Save } from 'lucide-react';

interface SaveSettingsBarProps {
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}

export default function SaveSettingsBar({ saving, onSave, onReset }: SaveSettingsBarProps) {
  return (
    <div className="mt-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-medium text-slate-800">Made changes to your settings?</p>
          <p className="text-sm text-slate-500">Don't forget to save your changes</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onReset}
            disabled={saving}
            className="border-slate-300 text-slate-700 hover:bg-blue-500 min-w-[120px]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Changes
          </Button>
          <Button
            onClick={onSave}
            disabled={saving}
            className="bg-gradient-to-r from-[#004AAD] to-[#0066CC] hover:from-[#003580] hover:to-[#004AAD] min-w-[140px] shadow-md"
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
  );
}