import React from 'react';

interface TopBarProps {
  title: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export function TopBar({ title, leftAction, rightAction }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
      <div className="flex-shrink-0 w-8">{leftAction}</div>
      <h1 className="text-lg font-semibold text-slate-800 truncate">{title}</h1>
      <div className="flex-shrink-0 w-8 flex justify-end">{rightAction}</div>
    </header>
  );
}