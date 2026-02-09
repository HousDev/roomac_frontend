import { Button } from '@/components/ui/button';
import { Home, LogOut } from 'lucide-react';

interface ProfileHeaderProps {
  tenantName: string;
  onLogout: () => void;
}

export default function ProfileHeader({ tenantName, onLogout }: ProfileHeaderProps) {
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Home className="h-7 w-7 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold">Tenant Portal</h1>
            <p className="text-xs text-slate-600">Welcome back!</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{tenantName}</span>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}