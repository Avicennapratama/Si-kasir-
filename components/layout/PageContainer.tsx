import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function PageContainer({
  children,
  className = '',
  noPadding = false,
}: PageContainerProps) {
  return (
    <div className={`w-full h-full flex flex-col ${noPadding ? '' : 'p-4'} ${className}`}>
      {children}
    </div>
  );
}