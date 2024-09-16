const FormattedDate = ({ dateString, style }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    
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

  return (
    <span className={`${style}`}>{formatDate(dateString)}</span>
  );
};

export default FormattedDate;
