import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
}

export function FloatingActionButton({
  onClick,
  icon = <Plus className="w-6 h-6" />,
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-24 right-4 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-lg transition active:scale-95 z-20"
      aria-label="Add"
    >
      {icon}
    </button>
  );
}