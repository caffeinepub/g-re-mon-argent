import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  value: number;
}

export default function ProgressBar({ value }: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className="space-y-2">
      <Progress value={clampedValue} className="h-3" />
    </div>
  );
}
