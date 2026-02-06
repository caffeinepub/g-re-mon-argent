import { useInternetIdentity } from '../hooks/useInternetIdentity';
import PrimaryActionButton from '../components/PrimaryActionButton';

type Screen = 'welcome' | 'profile-setup' | 'dashboard' | 'add-sale' | 'add-expense' | 'daily-summary' | 'monthly-goal';

interface WelcomeScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  const { login, loginStatus } = useInternetIdentity();

  const handleStart = () => {
    login();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Hero Illustration */}
          <div className="w-full aspect-[14/9] rounded-2xl overflow-hidden shadow-lg mb-8">
            <img
              src="/assets/generated/welcome-hero.dim_1400x900.png"
              alt="African market scene"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Welcome Text */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Gère Mon Argent
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Welcome! Manage your money easily
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-8">
            <PrimaryActionButton
              onClick={handleStart}
              disabled={loginStatus === 'logging-in'}
              variant="primary"
              size="large"
            >
              {loginStatus === 'logging-in' ? 'Connecting...' : 'Start'}
            </PrimaryActionButton>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© 2026. Built with ❤️ using <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">caffeine.ai</a></p>
      </footer>
    </div>
  );
}
