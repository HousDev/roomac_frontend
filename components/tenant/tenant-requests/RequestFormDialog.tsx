import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Send } from 'lucide-react';
import { ChangeBedForm } from './ChangeBedForm';
import type { RequestFormData } from './requestConfig';
import { MouseEventHandler } from 'react';



interface RequestFormDialogProps {
  onSubmit: MouseEventHandler<HTMLButtonElement> | undefined;
  submitting: boolean | undefined;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: RequestFormData;
  setFormData: (data: RequestFormData) => void;
}

export function RequestFormDialog(props: RequestFormDialogProps) {

  
  return (
    <Dialog open={props.isOpen} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Request</DialogTitle>
          <DialogDescription>
            Fill in the details below to submit your request
          </DialogDescription>
        </DialogHeader>
        
        {/* Form content based on request type */}
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => props.onOpenChange(false)}
            disabled={props.submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={props.onSubmit}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={props.submitting}
          >
            {props.submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}