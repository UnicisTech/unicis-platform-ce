import { useTranslation } from "next-i18next";

const StatusValue = (status: number) => {
  const { t } = useTranslation("common");

  const statusMap: Record<number, string> = {
    0: t("status-new"),
    1: t("status-pending"),
    2: t("status-complete"),
    3: t("status-failed"),
  };

  return <>{statusMap[status] || t("status-unknown")}</>;
};

export default StatusValue;
