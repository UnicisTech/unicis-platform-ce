import React, { useState } from 'react';
import { Button } from 'react-daisyui';
import DropdownItem from 'react-daisyui/dist/Dropdown/DropdownItem';

const AssetsSortDropdown = ({ setStatus, canAccess, t }: { setStatus: (status: string) => void; canAccess: Function; t: Function }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  return (
    <>
      {canAccess('team_fleet_node', ['read']) && (
        <div className="relative inline-block text-left">
          <Button
            size="xs"
            color="primary"
            variant="outline"
            onClick={toggleDropdown}
          >
            {t('sort-assets')}
          </Button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                <Button
                  onClick={() => {
                    setStatus('inactive');
                    setDropdownOpen(false);
                  }}
                >
                  {t('inactive-assets')}
                </Button>
                <Button
                  onClick={() => {
                    setStatus('active');
                    setDropdownOpen(false);
                  }}
                >
                  {t('active-assets')}
                </Button>
                <Button
                  onClick={() => {
                    setStatus('all');
                    setDropdownOpen(false);
                  }}
                >
                  {t('all-assets')}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AssetsSortDropdown;
