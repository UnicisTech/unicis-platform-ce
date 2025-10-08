import { Message } from '@/components/shared';
import DaisyBadge from '@/components/shared/daisyUI/DaisyBadge';
import { isTranferPermitted } from '@/lib/tia';

interface ConclusionStepProps {
  procedure: any;
}

export default function ConclusionStep({ procedure }: ConclusionStepProps) {
  return (
    <>
      <Message text={`To be completed by the exporter`} />

      <p>
        <span className="font-bold">
          In view of the above and applicable data protection laws, the transfer
          is:
        </span>
        {isTranferPermitted(procedure) ? (
          <DaisyBadge color="success">PERMITTED</DaisyBadge>
        ) : (
          <DaisyBadge color="error">NOT PERMITTED</DaisyBadge>
        )}
      </p>
    </>
  );
}
