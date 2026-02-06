import { useEffect, useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useCurrentUserProfile } from './hooks/useCurrentUserProfile';
import { useOfflineSync } from './offline/useOfflineSync';
import WelcomeScreen from './screens/WelcomeScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import DashboardScreen from './screens/DashboardScreen';
import AddSaleScreen from './screens/AddSaleScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import DailySummaryScreen from './screens/DailySummaryScreen';
import MonthlyGoalScreen from './screens/MonthlyGoalScreen';
import SyncStatusChip from './components/SyncStatusChip';
import { Toaster } from '@/components/ui/sonner';

type Screen = 'welcome' | 'profile-setup' | 'dashboard' | 'add-sale' | 'add-expense' | 'daily-summary' | 'monthly-goal';

export default function App() {
  const { identity, loginStatus } = useInternetIdentity();
  const { userProfile, isLoading: profileLoading, isFetched } = useCurrentUserProfile();
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');

  // Initialize offline sync
  useOfflineSync();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;
  const showDashboard = isAuthenticated && !profileLoading && isFetched && userProfile !== null;

  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentScreen('welcome');
    } else if (showProfileSetup) {
      setCurrentScreen('profile-setup');
    } else if (showDashboard) {
      setCurrentScreen('dashboard');
    }
  }, [isAuthenticated, showProfileSetup, showDashboard]);

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  // Show loading state during initialization
  if (loginStatus === 'initializing' || (isAuthenticated && profileLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SyncStatusChip />
      
      {currentScreen === 'welcome' && <WelcomeScreen onNavigate={navigate} />}
      {currentScreen === 'profile-setup' && <ProfileSetupScreen onNavigate={navigate} />}
      {currentScreen === 'dashboard' && <DashboardScreen onNavigate={navigate} />}
      {currentScreen === 'add-sale' && <AddSaleScreen onNavigate={navigate} />}
      {currentScreen === 'add-expense' && <AddExpenseScreen onNavigate={navigate} />}
      {currentScreen === 'daily-summary' && <DailySummaryScreen onNavigate={navigate} />}
      {currentScreen === 'monthly-goal' && <MonthlyGoalScreen onNavigate={navigate} />}
      
      <Toaster />
    </div>
  );
}
