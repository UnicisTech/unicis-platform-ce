import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface TogglePasswordVisibilityProps {
  isPasswordVisible: boolean;
  handlePasswordVisibility: () => void;
}

const TogglePasswordVisibility: React.FC<TogglePasswordVisibilityProps> = ({
  isPasswordVisible,
  handlePasswordVisibility,
}) => {
  return (
    <button
      type="button"
      onClick={handlePasswordVisibility}
      aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
      className="absolute inset-y-0 right-2 flex items-center p-1 text-muted-foreground hover:text-foreground transition-colors"
    >
      {isPasswordVisible ? (
        <EyeSlashIcon className="h-5 w-5" />
      ) : (
        <EyeIcon className="h-5 w-5" />
      )}
    </button>
  );
};

export default TogglePasswordVisibility;
