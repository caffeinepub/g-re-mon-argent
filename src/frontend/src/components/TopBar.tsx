import { ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopBarProps {
  title: string;
  onBack?: () => void;
  onSwitchAccount?: () => void;
}

export default function TopBar({ title, onBack, onSwitchAccount }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
        </div>
        
        {onSwitchAccount && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSwitchAccount}
            className="h-10 gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Switch Account</span>
          </Button>
        )}
      </div>
    </header>
  );
}
