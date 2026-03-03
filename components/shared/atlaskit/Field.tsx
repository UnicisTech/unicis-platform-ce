const Field = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | React.ReactNode;
}) => {
  return (
    <div className="mt-3">
      <p>
        <b>{label}</b>: {value}
      </p>
    </div>
  );
};

export default Field;
