import React from 'react';
import CopyToClipboardButton from './CopyToClipboardButton';

interface InputWithCopyButtonProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'color'> {
  label: string;
  description?: string;
}

const InputWithCopyButton = ({
  label,
  value,
  description,
  className = '',
  ...rest
}: InputWithCopyButtonProps) => {
  return (
    <div className="form-control w-full">
      <div className="flex justify-between items-center">
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
        <CopyToClipboardButton value={value?.toString() || ''} />
      </div>
      <input
        className={`input input-bordered w-full ${className}`}
        value={value}
        {...rest}
      />
      {description && (
        <label className="label">
          <span className="label-text-alt">{description}</span>
        </label>
      )}
    </div>
  );
};

export default InputWithCopyButton;
