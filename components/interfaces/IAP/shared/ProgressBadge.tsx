import { StatusBadge } from '@/components/shared';

const ProgressBadge = ({ progress }: { progress: number }) => {
  return (
    <>
      {progress === 100 ? (
        <StatusBadge label="Passed" value="done" />
      ) : progress > 0 ? (
        <StatusBadge label="In progress" value="inprogress" />
      ) : (
        <StatusBadge label="To do" value="todo" />
      )}
    </>
  );
};

export default ProgressBadge;
