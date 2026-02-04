const Field = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | JSX.Element;
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
