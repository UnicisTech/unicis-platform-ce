import { Navbar, Sidebar } from '@/components/shared';
import React from 'react';

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <>
      <Navbar />
      <div className="flex overflow-hidden pt-16 h-full">
        <Sidebar />
        <div className="relative h-full w-full overflow-y-auto lg:ml-64">
          <main>
            <div className="flex w-full">
              <div className="w-full px-6 py-6 ">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
