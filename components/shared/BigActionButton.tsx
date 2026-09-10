import React from 'react';

interface BigActionButtonProps {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function BigActionButton({
  label,
  onClick,
  icon,
  variant = 'primary',
  disabled = false,
}: BigActionButtonProps) {
  const baseStyle =
    'w-full py-4 rounded-xl flex items-center justify-center font-medium shadow transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </button>
  );
}