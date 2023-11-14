import Badge from '@atlaskit/badge';

const TransferIs = ({ value }: { value: string }) => (
  <div>
    <span className="font-bold">
      Based on the answers given above, the transfer is
    </span>
    <Badge appearance={value === 'NOT PERMITTED' ? 'important' : 'added'}>
      {value}
    </Badge>
  </div>
);

export default TransferIs;
