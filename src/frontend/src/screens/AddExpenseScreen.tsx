import { useState } from 'react';
import { useCreateExpense } from '../hooks/useQueries';
import { ExpenseCategory } from '../backend';
import TopBar from '../components/TopBar';
import PrimaryActionButton from '../components/PrimaryActionButton';
import IconTile from '../components/IconTile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { parseGNF } from '../utils/money';

type Screen = 'welcome' | 'profile-setup' | 'dashboard' | 'add-sale' | 'add-expense' | 'daily-summary' | 'monthly-goal';

interface AddExpenseScreenProps {
  onNavigate: (screen: Screen) => void;
}

const expenseCategories = [
  { id: ExpenseCategory.product, label: 'Merchandise', icon: '/assets/generated/icon-expense-merchandise.dim_256x256.png' },
  { id: ExpenseCategory.travel, label: 'Transport', icon: '/assets/generated/icon-expense-transport.dim_256x256.png' },
  { id: ExpenseCategory.other, label: 'Food', icon: '/assets/generated/icon-expense-food.dim_256x256.png' },
  { id: ExpenseCategory.other, label: 'Other', icon: '/assets/generated/icon-expense-other.dim_256x256.png' },
];

export default function AddExpenseScreen({ onNavigate }: AddExpenseScreenProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory | ''>('');
  const { mutate: createExpense, isPending } = useCreateExpense();

  const handleSubmit = () => {
    const parsedAmount = parseGNF(amount);
    
    if (parsedAmount === null || parsedAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!category) {
      toast.error('Please select a category');
      return;
    }

    createExpense(
      {
        amount: parsedAmount,
        category: category as ExpenseCategory,
      },
      {
        onSuccess: () => {
          toast.success('Expense recorded!');
          onNavigate('dashboard');
        },
        onError: (error) => {
          toast.error('Failed to record expense: ' + error.message);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar title="Add Expense" onBack={() => onNavigate('dashboard')} />

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

          {/* Category Selection */}
          <div className="space-y-4">
            <Label className="text-lg font-medium">Category *</Label>
            <div className="grid grid-cols-2 gap-4">
              {expenseCategories.map((cat, idx) => (
                <IconTile
                  key={`${cat.id}-${idx}`}
                  icon={cat.icon}
                  label={cat.label}
                  selected={category === cat.id && (idx === 2 ? cat.label === 'Food' : idx === 3 ? cat.label === 'Other' : true)}
                  onClick={() => setCategory(cat.id)}
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-8">
            <PrimaryActionButton
              onClick={handleSubmit}
              disabled={isPending}
              variant="warning"
              size="large"
            >
              {isPending ? 'Recording...' : 'Validate'}
            </PrimaryActionButton>
          </div>
        </div>
      </main>
    </div>
  );
}
