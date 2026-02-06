import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface PrimaryActionButtonProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'success' | 'warning';
  size?: 'default' | 'large';
  icon?: ReactNode;
}

export default function PrimaryActionButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'default',
  icon,
}: PrimaryActionButtonProps) {
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    success: 'bg-success hover:bg-success/90 text-white',
    warning: 'bg-warning hover:bg-warning/90 text-white',
  };

  const sizeClasses = {
    default: 'h-14 text-lg',
    large: 'h-16 text-xl',
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`w-full font-semibold rounded-xl shadow-lg transition-all ${variantClasses[variant]} ${sizeClasses[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'
      }`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Button>
  );
}
