import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut as IconLogOut } from "lucide-react";

interface AccountActionsProps {
  onLogout: () => Promise<void>;
}

export default function AccountActions({ onLogout }: AccountActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Actions</CardTitle>
        <CardDescription>Manage your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-semibold">Logout</h4>
            <p className="text-sm text-gray-500">Sign out from your account</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <IconLogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}