import { Badge as BaseBadge } from 'react-daisyui';

const colors = {
  todo: 'ghost',
  inprogress: 'secondary',
  inreview: 'primary',
  feedback: 'info',
  done: 'success',
};

const StatusBadge = ({ label, value }: { label: string; value: string }) => {
  return (
    <>
      <BaseBadge
        className={`rounded text-xs py-2 text-white whitespace-nowrap`}
        color={colors[value]}
      >
        {label}
      </BaseBadge>
    </>
  );
};

export default StatusBadge;
