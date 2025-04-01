import React from 'react';

// Update the component to properly accept children
interface DashboardHeaderProps {
  children?: React.ReactNode;
}

export function DashboardHeader({ children }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-4 md:px-8 border-b">
      {children}
    </div>
  );
}
