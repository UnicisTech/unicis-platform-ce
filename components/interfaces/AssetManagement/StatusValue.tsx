const StatusValue = (status: number) => {
  const statusMap = {
    0: "NEW",
    1: "PENDING",
    2: "COMPLETE",
    3: "FAILED"
  };

  return <>{statusMap[status] || "UNKNOWN"}</>;
};

export default StatusValue;