import Badge from '@atlaskit/badge';

const RiskLevel = ({ value }) => (
  <div>
    <span className="font-bold">Risk Level = {value}</span>
    <Badge appearance="added">PERMITTED</Badge>
  </div>
);

export default RiskLevel;
