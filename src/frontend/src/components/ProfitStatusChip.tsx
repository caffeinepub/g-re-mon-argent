import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatGNF } from '../utils/money';

interface ProfitStatusChipProps {
  profit: number;
}

export default function ProfitStatusChip({ profit }: ProfitStatusChipProps) {
  const isPositive = profit > 0;
  const isNegative = profit < 0;
  const isZero = profit === 0;

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border-2 ${
        isPositive
          ? 'bg-success/10 border-success text-success'
          : isNegative
          ? 'bg-destructive/10 border-destructive text-destructive'
          : 'bg-muted border-border text-muted-foreground'
      }`}
    >
      <div className="flex items-center gap-2">
        {isPositive && <TrendingUp className="w-5 h-5" />}
        {isNegative && <TrendingDown className="w-5 h-5" />}
        {isZero && <Minus className="w-5 h-5" />}
        <span className="font-medium">Today's Profit</span>
      </div>
      <span className="text-lg font-bold">{formatGNF(profit)}</span>
    </div>
  );
}
