'use client';

import { memo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  CreditCard,
  FileText,
  Calendar,
  Settings,
  CheckCheck,
  Trash2,
  Archive,
  Eye,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

interface NotificationsTabProps {
  notifications: any[];
  markAllNotificationsRead: () => void;
}

function NotificationsTab({ notifications, markAllNotificationsRead }: NotificationsTabProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    paymentReminders: true,
    maintenanceUpdates: true,
    communityEvents: true,
    documentAlerts: true,
  });

  // Sample notifications data
  const allNotifications = [
    {
      id: "1",
      title: "Rent Payment Reminder",
      message: "Your rent payment is due in 7 days",
      time: "2 hours ago",
      read: false,
      type: "payment",
      priority: "high",
      timestamp: "2024-01-25T09:00:00Z"
    },
    {
      id: "2",
      title: "Complaint Update",
      message: "Your maintenance request is now in progress",
      time: "1 day ago",
      read: false,
      type: "maintenance",
      priority: "medium",
      timestamp: "2024-01-24T14:30:00Z"
    },
    {
      id: "3",
      title: "Community Event",
      message: "Monthly dinner party this Friday at 7 PM",
      time: "3 days ago",
      read: true,
      type: "event",
      priority: "low",
      timestamp: "2024-01-22T11:00:00Z"
    },
    {
      id: "4",
      title: "Document Ready",
      message: "Your rental agreement has been updated",
      time: "5 days ago",
      read: true,
      type: "document",
      priority: "medium",
      timestamp: "2024-01-20T16:45:00Z"
    },
    {
      id: "5",
      title: "Payment Received",
      message: "Your rent payment for January has been confirmed",
      time: "1 week ago",
      read: true,
      type: "payment",
      priority: "low",
      timestamp: "2024-01-18T10:15:00Z"
    },
    {
      id: "6",
      title: "Maintenance Scheduled",
      message: "AC repair scheduled for tomorrow at 10 AM",
      time: "2 weeks ago",
      read: true,
      type: "maintenance",
      priority: "medium",
      timestamp: "2024-01-15T14:20:00Z"
    },
  ];

  const filteredNotifications = allNotifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    if (activeTab === "read") return notification.read;
    if (activeTab === "payment") return notification.type === "payment";
    if (activeTab === "maintenance") return notification.type === "maintenance";
    if (activeTab === "events") return notification.type === "event";
    return true;
  });

  const unreadCount = allNotifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case "maintenance":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case "event":
        return <Calendar className="h-4 w-4 text-green-600" />;
      case "document":
        return <FileText className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-slate-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive" className="text-xs">High</Badge>;
      case "medium":
        return <Badge variant="default" className="text-xs">Medium</Badge>;
      case "low":
        return <Badge variant="outline" className="text-xs">Low</Badge>;
      default:
        return null;
    }
  };

  const handleMarkAsRead = (id: string) => {
    toast.success("Notification marked as read");
    // Update notification status
  };

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev =>
      prev.includes(id) ? prev.filter(nId => nId !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedNotifications.length === 0) {
      toast.error("No notifications selected");
      return;
    }
    toast.success(`Deleted ${selectedNotifications.length} notification(s)`);
    setSelectedNotifications([]);
  };

  const handleArchiveSelected = () => {
    if (selectedNotifications.length === 0) {
      toast.error("No notifications selected");
      return;
    }
    toast.success(`Archived ${selectedNotifications.length} notification(s)`);
    setSelectedNotifications([]);
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    // Open notification details
    toast.info(`Opening: ${notification.title}`);
  };

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border border-slate-200/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Unread</p>
                <p className="text-xl font-bold text-blue-700">{unreadCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-xl font-bold text-slate-900">{allNotifications.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Bell className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Last 7 Days</p>
                <p className="text-xl font-bold text-green-700">{allNotifications.filter(n => 
                  new Date(n.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="border border-slate-200/80">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Left: Bulk Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllNotificationsRead}
                className="h-8 text-xs"
                disabled={unreadCount === 0}
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                Mark All Read
              </Button>
              
              {selectedNotifications.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleArchiveSelected}
                    className="h-8 text-xs"
                  >
                    <Archive className="h-3.5 w-3.5 mr-1.5" />
                    Archive Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteSelected}
                    className="h-8 text-xs text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete Selected
                  </Button>
                  <Badge variant="secondary" className="text-xs">
                    {selectedNotifications.length} selected
                  </Badge>
                </>
              )}
            </div>

            {/* Right: Settings */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                toast.info("Opening notification settings");
              }}
              className="h-8 text-xs"
            >
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-white/80 backdrop-blur-sm border border-slate-200 p-0.5 rounded-lg overflow-x-auto">
          <TabsTrigger value="all" className="flex-1 text-xs py-2">
            All
            <Badge variant="outline" className="ml-1.5 text-[10px]">
              {allNotifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex-1 text-xs py-2">
            Unread
            <Badge variant="destructive" className="ml-1.5 text-[10px]">
              {unreadCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex-1 text-xs py-2">
            <CreditCard className="h-3 w-3 mr-1" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex-1 text-xs py-2">
            <AlertCircle className="h-3 w-3 mr-1" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="events" className="flex-1 text-xs py-2">
            <Calendar className="h-3 w-3 mr-1" />
            Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card className="border border-slate-200/80 shadow-sm">
            <CardContent className="p-0">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Bell className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">No notifications</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {activeTab === "unread" 
                      ? "You're all caught up!" 
                      : "No notifications in this category"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 transition-colors cursor-pointer hover:bg-slate-50/50 ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Selection Checkbox */}
                        <div className="mt-1">
                          <input
                            type="checkbox"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectNotification(notification.id);
                            }}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>

                        {/* Notification Icon */}
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                          notification.read ? 'bg-slate-100' : 'bg-blue-100'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-sm text-slate-900">
                                  {notification.title}
                                </p>
                                {getPriorityBadge(notification.priority)}
                                {!notification.read && (
                                  <Badge variant="secondary" className="text-[10px]">
                                    New
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                {notification.message}
                              </p>
                            </div>
                            <div className="shrink-0">
                              <div className="flex items-center gap-1">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(notification.id);
                                    }}
                                    className="h-6 w-6 hover:bg-slate-100"
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.info("Opening notification");
                                  }}
                                  className="h-6 w-6 hover:bg-slate-100"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-[10px] text-slate-500">
                              {notification.time} • {new Date(notification.timestamp).toLocaleDateString()}
                            </p>
                            <Badge variant="outline" className="text-[10px]">
                              {notification.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notification Settings */}
      <Card className="border border-slate-200/80">
        <CardHeader className="px-4 py-3 border-b border-slate-100">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Notification Channels */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Notification Channels</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Email</span>
                  </div>
                  <Switch
                    checked={notificationSettings.email}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, email: checked})
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Push</span>
                  </div>
                  <Switch
                    checked={notificationSettings.push}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, push: checked})
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">SMS</span>
                  </div>
                  <Switch
                    checked={notificationSettings.sms}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, sms: checked})
                    }
                  />
                </div>
              </div>
            </div>

            {/* Notification Types */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Notification Types</h4>
              <div className="space-y-2">
                {[
                  { key: 'paymentReminders', label: 'Payment Reminders', icon: CreditCard },
                  { key: 'maintenanceUpdates', label: 'Maintenance Updates', icon: AlertCircle },
                  { key: 'communityEvents', label: 'Community Events', icon: Calendar },
                  { key: 'documentAlerts', label: 'Document Alerts', icon: FileText },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-slate-100 flex items-center justify-center">
                        <item.icon className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-slate-500">Receive alerts for {item.label.toLowerCase()}</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, [item.key]: checked})
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default memo(NotificationsTab);