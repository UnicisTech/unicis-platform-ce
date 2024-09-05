import { Badge as BaseBadge } from 'react-daisyui';

const colors = {
  linux: 'ghost',
  window: 'secondary',
  darwin: 'primary',
  freebsd: 'info',
  posix: 'success',
  all: 'accent',
};

const PlatformBadge = ({ label, value }: { label: string; value: string }) => {
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

export default PlatformBadge;
