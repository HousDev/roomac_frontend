import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut as IconLogOut } from "lucide-react";

interface AccountActionsProps {
  onLogout: () => Promise<void>;
}
