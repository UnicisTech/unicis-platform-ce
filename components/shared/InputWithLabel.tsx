import React from 'react';

export interface InputWithLabelProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'color'> {
  label: string | React.ReactNode;
  error?: string;
  descriptionText?: string;
  className?: string;
}

const InputWithLabel = ({
  label,
  error,
  descriptionText,
  className = '',
  ...rest
}: InputWithLabelProps) => {
  const inputClass = `input input-bordered w-full ${error ? 'input-error' : ''} ${className}`;

  return (
    <div className="form-control w-full">
      {typeof label === 'string' ? (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      ) : (
        label
      )}
      <input className={inputClass} {...rest} />
      {(error || descriptionText) && (
        <label className="label">
          <span className={`label-text-alt ${error ? 'text-red-500' : ''}`}>
            {error || descriptionText}
          </span>
        </label>
      )}
    </div>
  );
};

export default InputWithLabel;
