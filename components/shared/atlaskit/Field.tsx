const Field = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | JSX.Element;
}) => {
  return (
    <div style={{ marginTop: '12px' }}>
      <p>
        <b>{label}</b>: {value}
      </p>
    </div>
  );
};

export default Field;
