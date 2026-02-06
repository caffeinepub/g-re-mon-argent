interface IconTileProps {
  icon: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}

export default function IconTile({ icon, label, selected, onClick }: IconTileProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
        selected
          ? 'border-primary bg-primary/10 shadow-md'
          : 'border-border bg-card hover:border-primary/50'
      }`}
    >
      <img src={icon} alt={label} className="w-20 h-20 mb-3 object-contain" />
      <span className="text-base font-medium text-foreground">{label}</span>
    </button>
  );
}
