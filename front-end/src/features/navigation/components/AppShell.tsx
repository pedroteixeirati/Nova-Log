import React from 'react';
import { NavItem } from '../../../shared/types/common.types';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface AppShellProps {
  activeItem: NavItem;
  children: React.ReactNode;
}

export default function AppShell({ activeItem, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar activeItem={activeItem} />
      <TopBar />
      <main className="ml-64 px-10 pb-12 pt-24">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
