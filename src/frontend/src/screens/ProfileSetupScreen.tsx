import { useState } from 'react';
import { useSaveProfile } from '../hooks/useQueries';
import { Language } from '../backend';
import PrimaryActionButton from '../components/PrimaryActionButton';
import IconTile from '../components/IconTile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type Screen = 'welcome' | 'profile-setup' | 'dashboard' | 'add-sale' | 'add-expense' | 'daily-summary' | 'monthly-goal';

interface ProfileSetupScreenProps {
  onNavigate: (screen: Screen) => void;
}

const activityTypes = [
  { id: 'shop', label: 'Shop', icon: '/assets/generated/icon-activity-shop.dim_256x256.png' },
  { id: 'food', label: 'Food', icon: '/assets/generated/icon-activity-food.dim_256x256.png' },
  { id: 'clothing', label: 'Clothing', icon: '/assets/generated/icon-activity-clothing.dim_256x256.png' },
  { id: 'transport', label: 'Transport', icon: '/assets/generated/icon-activity-transport.dim_256x256.png' },
];

export default function ProfileSetupScreen({ onNavigate }: ProfileSetupScreenProps) {
  const [firstName, setFirstName] = useState('');
  const [activityType, setActivityType] = useState('');
  const { mutate: saveProfile, isPending } = useSaveProfile();

  const handleSubmit = () => {
    if (!firstName.trim()) {
      toast.error('Please enter your first name');
      return;
    }
    if (!activityType) {
      toast.error('Please select your activity type');
      return;
    }

    saveProfile(
      {
        firstName: firstName.trim(),
        activityType,
        language: Language.fr,
      },
      {
        onSuccess: () => {
          toast.success('Profile created!');
          onNavigate('dashboard');
        },
        onError: (error) => {
          toast.error('Failed to create profile: ' + error.message);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Create Your Profile</h1>
            <p className="text-muted-foreground">Tell us about yourself</p>
          </div>

          {/* First Name Input */}
          <div className="space-y-3">
            <Label htmlFor="firstName" className="text-lg font-medium">
              First Name
            </Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              className="h-14 text-lg"
            />
          </div>

          {/* Activity Type Selection */}
          <div className="space-y-4">
            <Label className="text-lg font-medium">Activity Type</Label>
            <div className="grid grid-cols-2 gap-4">
              {activityTypes.map((type) => (
                <IconTile
                  key={type.id}
                  icon={type.icon}
                  label={type.label}
                  selected={activityType === type.id}
                  onClick={() => setActivityType(type.id)}
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <PrimaryActionButton
              onClick={handleSubmit}
              disabled={isPending}
              variant="primary"
              size="large"
            >
              {isPending ? 'Creating...' : 'Start'}
            </PrimaryActionButton>
          </div>
        </div>
      </main>
    </div>
  );
}
