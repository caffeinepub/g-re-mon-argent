import { useState } from 'react';
import { useSetMonthlyGoal, useMonthlyGoalProgress, useAvailableCash } from '../hooks/useQueries';
import { useSwitchAccount } from '../hooks/useSwitchAccount';
import { useOfflineQueue } from '../offline/offlineQueue';
import TopBar from '../components/TopBar';
import PrimaryActionButton from '../components/PrimaryActionButton';
import ProgressBar from '../components/ProgressBar';
import SwitchAccountConfirmDialog from '../components/SwitchAccountConfirmDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatGNF, parseGNF } from '../utils/money';
import { getCurrentMonth, getCurrentYear } from '../utils/dates';
import { toast } from 'sonner';

type Screen = 'welcome' | 'profile-setup' | 'dashboard' | 'add-sale' | 'add-expense' | 'daily-summary' | 'monthly-goal';

interface MonthlyGoalScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function MonthlyGoalScreen({ onNavigate }: MonthlyGoalScreenProps) {
  const [goalAmount, setGoalAmount] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();
  
  const { data: availableCash = 0 } = useAvailableCash();
  const { data: progressPercent = 0 } = useMonthlyGoalProgress(currentYear, currentMonth);
  const { mutate: setGoal, isPending } = useSetMonthlyGoal();
  const { switchAccount } = useSwitchAccount();
  const { queueLength } = useOfflineQueue();

  const handleSwitchAccountClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSwitch = async () => {
    setShowConfirmDialog(false);
    await switchAccount();
  };

  const handleSetGoal = () => {
    const parsedAmount = parseGNF(goalAmount);
    
    if (parsedAmount === null || parsedAmount <= 0) {
      toast.error('Please enter a valid goal amount');
      return;
    }

    setGoal(
      { month: currentMonth, goalAmount: parsedAmount },
      {
        onSuccess: () => {
          toast.success('Monthly goal set!');
          setGoalAmount('');
        },
        onError: (error) => {
          toast.error('Failed to set goal: ' + error.message);
        },
      }
    );
  };

  // Calculate remaining amount based on progress
  const goalValue = parseGNF(goalAmount) || 0;
  const remaining = goalValue > 0 ? Math.max(0, goalValue - availableCash) : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar 
        title="Monthly Goal" 
        onBack={() => onNavigate('dashboard')}
        onSwitchAccount={handleSwitchAccountClick}
      />

      <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
        <div className="space-y-8">
          {/* Current Progress */}
          <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
            <h2 className="text-xl font-semibold">Current Progress</h2>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progressPercent.toFixed(0)}%</span>
              </div>
              <ProgressBar value={progressPercent} />
            </div>

            <div className="pt-2 space-y-1">
              <p className="text-sm text-muted-foreground">
                You are at <span className="font-bold text-foreground">{formatGNF(availableCash)}</span>
              </p>
              {goalValue > 0 && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">{formatGNF(remaining)}</span> remaining to reach your goal
                </p>
              )}
            </div>
          </div>

          {/* Set New Goal */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Set Monthly Goal</h2>
            
            <div className="space-y-3">
              <Label htmlFor="goalAmount" className="text-lg font-medium">
                Goal Amount (GNF)
              </Label>
              <Input
                id="goalAmount"
                type="number"
                inputMode="numeric"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                placeholder="100000"
                className="h-16 text-2xl"
              />
            </div>

            <PrimaryActionButton
              onClick={handleSetGoal}
              disabled={isPending}
              variant="primary"
              size="large"
            >
              {isPending ? 'Setting...' : 'Set Goal'}
            </PrimaryActionButton>
          </div>
        </div>
      </main>

      <SwitchAccountConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmSwitch}
        hasPendingActions={queueLength > 0}
      />
    </div>
  );
}
