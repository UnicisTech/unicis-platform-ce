import React from "react";
import toast from "react-hot-toast";
import { useTranslation } from "next-i18next";
import { useFormik } from "formik";
import { useDeleteQuery } from "@/hooks/fleets/queries/useDeleteQuery";
import { InputWithLabel } from "@/components/shared";
import { useQueries } from "@/hooks/fleets/queries/useQueries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/shadcn/ui/dialog";
import { Button } from "@/components/shadcn/ui/button";

const DeleteQuery = ({
  queryId,
  visible,
  setVisible,
  fleetTeamId,
}: {
  queryId: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  fleetTeamId: string;
}) => {
  const { t } = useTranslation("common");

  const deleteQuery = useDeleteQuery();
  const { mutateQueries } = useQueries(fleetTeamId);

  const formik = useFormik({
    initialValues: {
      confirm: "",
    },
    onSubmit: async (values) => {
      if (values.confirm.toLowerCase() === "delete") {
        toast.loading(t("deleting-query"));
        await deleteQuery(fleetTeamId, queryId);
        mutateQueries();
        formik.resetForm();
        setVisible(false);
        toast.success(t("deleted-successfully"));
      } else {
        toast.error(t("type-confirmation-text"));
      }
    },
  });

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-w-md">
        <form onSubmit={formik.handleSubmit} method="DELETE" className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t("confirm-permanent-query-delete")}</DialogTitle>
            <DialogDescription>
              <span className="text-xs">
                {t("query")}: <span className="text-orange-400">{queryId}</span>
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <p>{t("fleet-delete-warning")}</p>

            <InputWithLabel
              type="text"
              label={t("confirm")}
              name="confirm"
              placeholder={t("enter-confirmation-text")}
              value={formik.values.confirm}
              error={formik.touched.confirm ? formik.errors.confirm : undefined}
              onChange={formik.handleChange}
            />

            <span className="text-xs">{t("fleet-delete-description")}</span>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              variant="destructive"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? t("deleting") : t("delete")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setVisible(false)}
            >
              {t("close")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteQuery;
