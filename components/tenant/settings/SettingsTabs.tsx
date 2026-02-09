import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";
import {
  Settings as IconSettings,
  Shield as IconShield,
  Bell as IconBell,
} from "lucide-react";

interface SettingsTabsProps {
  children: ReactNode[];
}

export default function SettingsTabs({ children }: SettingsTabsProps) {
  const [generalContent, deletionContent, actionsContent, securityContent, notificationsContent] = children;

  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general">
          <IconSettings className="mr-2 h-4 w-4" />
          General
        </TabsTrigger>
        <TabsTrigger value="security">
          <IconShield className="mr-2 h-4 w-4" />
          Security
        </TabsTrigger>
        <TabsTrigger value="notifications">
          <IconBell className="mr-2 h-4 w-4" />
          Notifications
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-6">
        {generalContent}
        {deletionContent}
        {actionsContent}
      </TabsContent>

      <TabsContent value="security" className="space-y-6">
        {securityContent}
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6">
        {notificationsContent}
      </TabsContent>
    </Tabs>
  );
}