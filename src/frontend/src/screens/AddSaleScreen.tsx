import { useState } from 'react';
import { useCreateSale } from '../hooks/useQueries';
import { useSwitchAccount } from '../hooks/useSwitchAccount';
import { useOfflineQueue } from '../offline/offlineQueue';
import TopBar from '../components/TopBar';
import PrimaryActionButton from '../components/PrimaryActionButton';
import SwitchAccountConfirmDialog from '../components/SwitchAccountConfirmDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { parseGNF } from '../utils/money';

type Screen = 'welcome' | 'profile-setup' | 'dashboard' | 'add-sale' | 'add-expense' | 'daily-summary' | 'monthly-goal';

interface AddSaleScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function AddSaleScreen({ onNavigate }: AddSaleScreenProps) {
  const [amount, setAmount] = useState('');
  const [product, setProduct] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { mutate: createSale, isPending } = useCreateSale();
  const { switchAccount } = useSwitchAccount();
  const { queueLength } = useOfflineQueue();

  const handleSwitchAccountClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSwitch = async () => {
    setShowConfirmDialog(false);
    await switchAccount();
  };

  const handleSubmit = () => {
    const parsedAmount = parseGNF(amount);
    
    if (parsedAmount === null || parsedAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    createSale(
      {
        amount: parsedAmount,
        product: product.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success('Sale recorded!');
          onNavigate('dashboard');
        },
        onError: (error) => {
          toast.error('Failed to record sale: ' + error.message);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar 
        title="Add Sale" 
        onBack={() => onNavigate('dashboard')}
        onSwitchAccount={handleSwitchAccountClick}
      />

      <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
        <div className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-lg font-medium">
              Amount (GNF) *
            </Label>
            <Input
              id="amount"
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="h-16 text-2xl"
            />
          </div>

          {/* Product Input (Optional) */}
          <div className="space-y-3">
            <Label htmlFor="product" className="text-lg font-medium">
              Product (Optional)
            </Label>
            <Input
              id="product"
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="What did you sell?"
              className="h-14 text-lg"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-8">
            <PrimaryActionButton
              onClick={handleSubmit}
              disabled={isPending}
              variant="success"
              size="large"
            >
              {isPending ? 'Recording...' : 'Validate'}
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
