import DaisyBadge, { ThemeAppearance } from './daisyUI/DaisyBadge';

const colors: Record<string, ThemeAppearance> = {
  todo: 'default',
  inprogress: 'primary',
  inreview: 'info',
  feedback: 'info',
  done: 'success',
  failed: 'error',
};

const StatusBadge = ({ label, value }: { label: string; value: string }) => {
  const color = colors[value] || 'default';

  return <DaisyBadge color={color}>{label}</DaisyBadge>;
};

export default StatusBadge;
