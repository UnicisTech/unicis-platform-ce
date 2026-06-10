import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import TeamDropdown from '../TeamDropdown';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Brand from './Brand';
import Navigation from './Navigation';

interface DrawerProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Drawer = ({ sidebarOpen, setSidebarOpen }: DrawerProps) => {
  const { t } = useTranslation('common');
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerPanelRef = useRef<HTMLDivElement>(null);

  // Move focus into the drawer when it opens; restore on close
  useEffect(() => {
    if (sidebarOpen) {
      closeButtonRef.current?.focus();
    }
  }, [sidebarOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    if (sidebarOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, setSidebarOpen]);

  // Trap focus within the drawer panel
  const handleTabKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !drawerPanelRef.current) return;
    const focusable = Array.from(
      drawerPanelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.closest('[hidden]'));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };

  return (
    <>
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          {/* Backdrop — clicking it closes the drawer */}
          <div
            className="fixed inset-0 bg-gray-600/80"
            aria-hidden="true"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-0 flex">
            {/* Drawer panel — role=dialog for screen readers */}
            <div
              ref={drawerPanelRef}
              role="dialog"
              aria-modal="true"
              aria-label={t('navigation')}
              className="relative mr-16 flex w-full max-w-xs flex-1"
              onKeyDown={handleTabKey}
            >
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button
                  ref={closeButtonRef}
                  type="button"
                  className="-m-2.5 p-2.5"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">{t('close-sidebar')}</span>
                  <XMarkIcon
                    className="h-6 w-6 text-white"
                    aria-hidden="true"
                  />
                </button>
              </div>
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-background px-3 pb-4">
                <Brand />
                <TeamDropdown />
                <Navigation />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r px-3">
          <Brand />
          <TeamDropdown />
          <Navigation />
        </div>
      </div>
    </>
  );
};

export default Drawer;
