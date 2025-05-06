import { ReactNode } from 'react';

export type AlertAppearance = 'info' | 'success' | 'warning' | 'error';

const appearanceMap: Record<AlertAppearance, string> = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
};

const Message = ({
  title,
  appearance = 'info',
  text,
  isBold,
}: {
  title?: string;
  appearance?: AlertAppearance;
  text: ReactNode;
  isBold?: boolean;
}) => {
  return (
    <div className={`alert ${appearanceMap[appearance]} alert-soft shadow-sm rounded-xl my-2`}>
      <div className="flex flex-col">
        {title && <span className="font-semibold">{title}</span>}
        <span className={isBold ? 'font-bold' : ''}>{text}</span>
      </div>
    </div>
  );
};

export default Message;
