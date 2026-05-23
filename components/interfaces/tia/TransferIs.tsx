import DaisyBadge from '@/components/shared/daisyUI/DaisyBadge';

const TransferIs = ({ value }: { value: string }) => (
  <div>
    <span className="font-bold">
      Based on the answers given above, the transfer is
    </span>
    <DaisyBadge appearance={value === 'NOT PERMITTED' ? 'important' : 'added'}>
      {value}
    </DaisyBadge>
  </div>
);

export default TransferIs;
