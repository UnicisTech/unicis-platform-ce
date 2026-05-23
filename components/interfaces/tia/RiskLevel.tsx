import DaisyBadge from '@/components/shared/daisyUI/DaisyBadge';

const RiskLevel = ({ value }) => (
  <div>
    <span className="font-bold">Risk Level = {value}</span>
    <DaisyBadge appearance="added">PERMITTED</DaisyBadge>
  </div>
);

export default RiskLevel;
