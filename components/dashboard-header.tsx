import { ReactNode } from 'react';

interface DashboardHeaderProps {
  children?: ReactNode;
}

export function DashboardHeader({ children }: DashboardHeaderProps) {
  // ...existing code...
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      // ...existing code...
      {children}
    </header>
  );
}
