// ComplaintDialog.tsx
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

export default function ComplaintDialog({
  open,
  onOpenChange,
  newComplaint,
  setNewComplaint,
  onSubmit
}: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start h-9 text-sm border-blue-200 hover:border-blue-400 hover:bg-blue-50">
          <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
          Raise Complaint
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-sm">Submit Complaint</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-medium">Title</Label>
            <Input
              value={newComplaint.title}
              onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
              className="mt-1 h-9 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Category</Label>
              <Select value={newComplaint.category} onValueChange={(value) => setNewComplaint({ ...newComplaint, category: value })}>
                <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="cleanliness">Cleanliness</SelectItem>
                  <SelectItem value="noise">Noise</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="amenities">Amenities</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium">Priority</Label>
              <Select value={newComplaint.priority} onValueChange={(value) => setNewComplaint({ ...newComplaint, priority: value })}>
                <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium">Description</Label>
            <Textarea
              value={newComplaint.description}
              onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
              rows={3}
              className="mt-1 text-sm"
            />
          </div>
          <Button onClick={onSubmit} className="w-full bg-blue-600 hover:bg-blue-700 h-9 text-sm">
            Submit Complaint
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}