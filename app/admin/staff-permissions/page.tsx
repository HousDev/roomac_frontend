"use client";

import { AdminHeader } from '@/components/admin/admin-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Shield, UserCheck, Plus, Edit, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
}

interface Module {
  id: string;
  name: string;
  display_name: string;
  icon?: string;
}

interface Permission {
  id: string;
  module_id: string;
  name: string;
  display_name: string;
  action: string;
}

interface RolePermission {
  id?: string;
  role_id: string;
  permission_id: string;
  granted: boolean;
}

export default function StaffPermissionsPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  // API endpoints (adjust if your backend routes differ)
  const api = {
    staff: '/api/staff',
    roles: '/api/roles',
    modules: '/api/modules',
    permissions: '/api/permissions',
    rolePermissions: '/api/role-permissions',
    userRoles: '/api/user-roles'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        staffRes,
        rolesRes,
        modulesRes,
        permissionsRes,
        rolePermsRes
      ] = await Promise.all([
        fetch(api.staff),
        fetch(api.roles),
        fetch(api.modules),
        fetch(api.permissions),
        fetch(api.rolePermissions)
      ]);

      if (!staffRes.ok) throw new Error('Failed to load staff');
      if (!rolesRes.ok) throw new Error('Failed to load roles');
      if (!modulesRes.ok) throw new Error('Failed to load modules');
      if (!permissionsRes.ok) throw new Error('Failed to load permissions');
      if (!rolePermsRes.ok) throw new Error('Failed to load role permissions');

      const staffData = await staffRes.json();
      const rolesData = await rolesRes.json();
      const modulesData = await modulesRes.json();
      const permissionsData = await permissionsRes.json();
      const rolePermsData = await rolePermsRes.json();

      setStaff(Array.isArray(staffData) ? staffData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setModules(Array.isArray(modulesData) ? modulesData : []);
      setPermissions(Array.isArray(permissionsData) ? permissionsData : []);
      setRolePermissions(Array.isArray(rolePermsData) ? rolePermsData : []);
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Failed to load permissions data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle or create a role-permission entry.
   * If an existing entry is present (has an id) it will be updated (PUT).
   * Otherwise a new entry will be created (POST).
   */
  const handlePermissionChange = async (roleId: string, permissionId: string, granted: boolean) => {
    try {
      const existing = rolePermissions.find(
        rp => rp.role_id === roleId && rp.permission_id === permissionId
      );

      if (existing && existing.id) {
        // Update existing entry
        const res = await fetch(`${api.rolePermissions}/${existing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ granted })
        });
        if (!res.ok) throw new Error('Failed to update permission');
      } else {
        // Create new mapping
        const res = await fetch(api.rolePermissions, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role_id: roleId, permission_id: permissionId, granted })
        });
        if (!res.ok) throw new Error('Failed to create role-permission mapping');
      }

      toast.success('Permission updated');
      await loadData();
    } catch (err) {
      console.error('Error changing permission:', err);
      toast.error('Failed to update permission');
    }
  };

  /**
   * Assign a role to a staff member.
   * This sends a POST to user-roles; backend should upsert or handle duplicates.
   */
  const handleAssignRole = async (staffId: string, roleId: string) => {
    setSaving(true);
    try {
      const res = await fetch(api.userRoles, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: staffId, user_type: 'staff', role_id: roleId, is_active: true })
      });

      if (!res.ok) throw new Error('Failed to assign role');

      toast.success('Role assigned successfully');
      setShowAssignDialog(false);
      setSelectedStaff(null);
      await loadData();
    } catch (err) {
      console.error('Error assigning role:', err);
      toast.error('Failed to assign role');
    } finally {
      setSaving(false);
    }
  };

  const getModulePermissions = (moduleId: string) => {
    return permissions.filter(p => p.module_id === moduleId);
  };

  const isPermissionGranted = (roleId: string, permissionId: string) => {
    const rp = rolePermissions.find(
      rp => rp.role_id === roleId && rp.permission_id === permissionId
    );
    return rp?.granted || false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminHeader title="Staff Permissions" description={''} />
        <div className="p-6">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader title="Staff Permissions" description={''} />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Total Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{staff.length}</div>
              <p className="text-sm text-slate-600">Active staff members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{roles.length}</div>
              <p className="text-sm text-slate-600">Defined roles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Modules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{modules.length}</div>
              <p className="text-sm text-slate-600">System modules</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="roles" className="space-y-6">
          <TabsList>
            <TabsTrigger value="roles">Role Permissions</TabsTrigger>
            <TabsTrigger value="staff">Staff Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="roles">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6" />
                    Role-Based Permissions
                  </CardTitle>
                  <CardDescription>
                    Configure module access permissions for each role
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4">
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Select a role to configure" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedRole ? (
                  <div className="space-y-6">
                    {modules.map(module => {
                      const modulePerms = getModulePermissions(module.id);
                      return (
                        <Card key={module.id}>
                          <CardHeader>
                            <CardTitle className="text-lg">{module.display_name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                              {modulePerms.map(perm => (
                                <div key={perm.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={perm.id}
                                    checked={isPermissionGranted(selectedRole, perm.id)}
                                    onCheckedChange={(checked) =>
                                      handlePermissionChange(selectedRole, perm.id, checked as boolean)
                                    }
                                  />
                                  <label
                                    htmlFor={perm.id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                                  >
                                    {perm.action}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    Select a role above to configure its permissions
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-6 w-6" />
                    Staff Role Assignments
                  </CardTitle>
                  <CardDescription>
                    Assign roles to staff members
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  {staff.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50"
                    >
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-slate-600">{member.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="capitalize">
                          {member.role || '—'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedStaff(member);
                            setShowAssignDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Assign Role
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Role to {selectedStaff?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Role</label>
                <Select
                  onValueChange={(roleId) => {
                    if (selectedStaff) {
                      handleAssignRole(selectedStaff.id, roleId);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        <div>
                          <p className="font-medium">{role.display_name}</p>
                          <p className="text-xs text-slate-600">{role.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
