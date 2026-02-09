import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SwitchAccountConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  hasPendingActions: boolean;
}

export default function SwitchAccountConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  hasPendingActions,
}: SwitchAccountConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Switch Account?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>You are about to log out and switch to a different account.</p>
            {hasPendingActions && (
              <p className="font-semibold text-warning">
                Warning: You have pending offline actions that will be cleared and lost if you proceed.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Switch Account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
