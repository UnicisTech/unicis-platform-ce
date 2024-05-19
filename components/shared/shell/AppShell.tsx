import { useEffect, useState } from 'react';
import { Loading } from '@/components/shared';
import { useSession } from 'next-auth/react';
import React from 'react';
import Header from './Header';
import Drawer from './Drawer';

export default function AppShell({ children }) {
  const { data, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      const { email, name } = data.user;
      if (email && name) {
        const [firstName, lastName] = name.split(' ') as string[]
        (window as any).mt &&
          (window as any).mt('send', 'pageview', {
            email: email,
            firstname: firstName,
            lastname: lastName,
            tags: 'CE',
          });
      }
    }
  }, [status]);

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'unauthenticated') {
    return <p>Access Denied</p>;
  }

  return (
    <div>
      <Drawer sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="lg:pl-64">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="py-10">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
