const FormattedDate = ({ dateString, style }) => {
  const formatDate = (dateStr) => {
    // Check if the input is a Unix timestamp (number or a string of digits)
    const isUnixTimestamp = /^\d+$/.test(dateStr);

    const date = isUnixTimestamp
      ? new Date(parseInt(dateStr) * 1000)
      : new Date(dateStr);

    const options = {
      year: 'numeric' as const,
      month: 'short' as const,
      day: 'numeric' as const,
      hour: '2-digit' as const,
      minute: '2-digit' as const,
      second: '2-digit' as const,
      hour12: false,
    };

    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  return <div className={`${style}`}>{formatDate(dateString)}</div>;
};

export default FormattedDate;
