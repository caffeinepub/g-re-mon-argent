import { useCurrentUserProfile } from '../hooks/useCurrentUserProfile';
import { useAvailableCash, useTodayStats } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import PrimaryActionButton from '../components/PrimaryActionButton';
import TopBar from '../components/TopBar';
import ProfitStatusChip from '../components/ProfitStatusChip';
import { formatGNF } from '../utils/money';
import { ShoppingBag, TrendingDown, Calendar, Target } from 'lucide-react';

type Screen = 'welcome' | 'profile-setup' | 'dashboard' | 'add-sale' | 'add-expense' | 'daily-summary' | 'monthly-goal';

interface DashboardScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function DashboardScreen({ onNavigate }: DashboardScreenProps) {
  const { userProfile } = useCurrentUserProfile();
  const { data: availableCash, isLoading: cashLoading } = useAvailableCash();
  const { data: todayStats } = useTodayStats();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const todayProfit = todayStats ? todayStats.salesTotal - todayStats.expensesTotal : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar title="Dashboard" onLogout={handleLogout} />

      <main className="flex-1 px-6 py-6 space-y-6 max-w-2xl mx-auto w-full">
        {/* Greeting */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Hello, {userProfile?.firstName || 'Friend'}!
          </h1>
          <p className="text-muted-foreground">Welcome back to your cashbook</p>
        </div>

        {/* Available Cash Card */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 shadow-lg text-primary-foreground">
          <div className="space-y-2">
            <p className="text-sm opacity-90">Available Cash</p>
            <p className="text-4xl font-bold">
              {cashLoading ? '...' : formatGNF(availableCash || 0)}
            </p>
          </div>
        </div>

        {/* Today's Profit Status */}
        <ProfitStatusChip profit={todayProfit} />

        {/* Primary Actions */}
        <div className="space-y-4 pt-4">
          <PrimaryActionButton
            onClick={() => onNavigate('add-sale')}
            variant="success"
            size="large"
            icon={<ShoppingBag className="w-6 h-6" />}
          >
            I Sold
          </PrimaryActionButton>

          <PrimaryActionButton
            onClick={() => onNavigate('add-expense')}
            variant="warning"
            size="large"
            icon={<TrendingDown className="w-6 h-6" />}
          >
            I Spent
          </PrimaryActionButton>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <button
            onClick={() => onNavigate('daily-summary')}
            className="flex flex-col items-center justify-center p-6 bg-card rounded-xl border-2 border-border hover:border-primary transition-colors"
          >
            <Calendar className="w-8 h-8 text-primary mb-2" />
            <span className="text-sm font-medium text-foreground">Daily Summary</span>
          </button>

          <button
            onClick={() => onNavigate('monthly-goal')}
            className="flex flex-col items-center justify-center p-6 bg-card rounded-xl border-2 border-border hover:border-primary transition-colors"
          >
            <Target className="w-8 h-8 text-primary mb-2" />
            <span className="text-sm font-medium text-foreground">Monthly Goal</span>
          </button>
        </div>
      </main>
    </div>
  );
}
