import React, { ReactNode, InputHTMLAttributes } from 'react';

interface InputWithLabelProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string | ReactNode;
  error?: string;
  descriptionText?: string;
  className?: string;
}

const InputWithLabel = (props: InputWithLabelProps) => {
  const { label, error, descriptionText, children, ...rest } = props;

  // const classes = Array<string>();

  // if (error) {
  //   classes.push('input-error');
  // }

  return (
    <div className="form-control w-full">
      {typeof label === 'string' ? (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      ) : (
        label
      )}
      {/* {children} */}
      {React.cloneElement(children as React.ReactElement<any>, { ...rest })}
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
