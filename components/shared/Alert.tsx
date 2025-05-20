import React from 'react';

export type AlertStatus = 'info' | 'success' | 'warning' | 'error';

interface CustomAlertProps {
  children: React.ReactNode;
  status?: AlertStatus;
  className?: string;
}

const statusMap: Record<AlertStatus, string> = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
};

const Alert = ({
  children,
  status = 'info',
  className = '',
}: CustomAlertProps) => {
  return (
    <div className={`alert ${statusMap[status]} rounded px-4 py-3 ${className}`}>
      {children}
    </div>
  );
};

export default Alert;
