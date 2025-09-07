import React from "react";
import toast from "react-hot-toast";
import { useTranslation } from "next-i18next";
import { useFormik } from "formik";
import { InputWithLabel } from "@/components/shared";
import { useDeleteDistributed } from "@/hooks/fleets/distributors/useDeleteDistributor";
import { useDistributors } from "@/hooks/fleets/distributors/useDistributors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/shadcn/ui/dialog";
import { Button } from "@/components/shadcn/ui/button";

const DeleteDistributors = ({
  distributorId,
  visible,
  setVisible,
  fleetTeamId,
}: {
  distributorId: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  fleetTeamId: string;
}) => {
  const { t } = useTranslation("common");
  const deleteDistributor = useDeleteDistributed();
  const { mutateDistributorsTasks } = useDistributors(fleetTeamId);

  const formik = useFormik({
    initialValues: {
      confirm: "",
    },
    onSubmit: async (values) => {
      if (values.confirm.toLowerCase() === "delete") {
        toast.loading(t("deleted"));
        await deleteDistributor(fleetTeamId, distributorId);
        formik.resetForm();
        mutateDistributorsTasks();
        setVisible(false);
      } else {
        toast.error(t("Type confirmation text"));
      }
    },
  });

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("Confirm Permanent Script Delete?")}</DialogTitle>
          <DialogDescription>
            <p className="text-xs">
              {t("script")}:{" "}
              <span className="text-orange-400">{distributorId}</span>
            </p>
            <p className="mt-2">{t("fleet-delete-warning")}</p>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} method="DELETE">
          <div className="flex flex-col space-y-4 mt-4">
            <InputWithLabel
              type="text"
              label={t("confirm")}
              name="confirm"
              placeholder={t("Enter confirmation text")}
              value={formik.values.confirm}
              error={
                formik.touched.confirm ? formik.errors.confirm : undefined
              }
              onChange={formik.handleChange}
            />
            <span className="text-xs">{t("fleet-delete-description")}</span>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setVisible(false)}
            >
              {t("close")}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={formik.isSubmitting || !formik.values.confirm}
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDistributors;
