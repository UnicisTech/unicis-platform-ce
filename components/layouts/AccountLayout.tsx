import { Navbar, Sidebar } from '@/components/shared';
import useCollapse from 'hooks/useCollapse';
import React, { ElementRef, MouseEventHandler, useRef } from 'react';

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const sidebarRef = useRef<ElementRef<'aside'>>(null);
  const [collapse, setCollapse] = useCollapse(sidebarRef, 'dashboard-wrapper');

  const toggleSidebar: MouseEventHandler<HTMLButtonElement> = () => {
    setCollapse((prev) => !prev);
  };

  return (
    <>
      <Navbar toggleSidebar={toggleSidebar} />
      <div id="dashboard-wrapper" className="flex overflow-hidden pt-14 h-full">
        <Sidebar isCollapsed={collapse} ref={sidebarRef} />
        <div className="relative h-full w-full overflow-y-auto lg:ml-64">
          <main>
          {/* <div className="flex h-screen w-full justify-center"> */}
            <div className="flex h-screen w-full justify-center dark:border-gray-600 bg-white dark:bg-black">
              <div className="lg:w-3/4 px-6 py-6 ">{children}</div>
            {/* <div className="flex w-full">
              <div className="w-full px-6 py-6 ">{children}</div> */}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
