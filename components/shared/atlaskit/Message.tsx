import { ReactNode } from 'react';

export type AlertAppearance = 'info' | 'success' | 'warning' | 'error';

const appearanceMap: Record<AlertAppearance, string> = {
  info: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
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
    <div className={`rounded-xl p-4 my-2 text-sm shadow-sm ${appearanceMap[appearance]}`}>
      <div className="flex flex-col">
        {title && <span className="font-semibold">{title}</span>}
        <span className={isBold ? 'font-bold' : ''}>{text}</span>
      </div>
    </div>
  );
};

export default Message;
