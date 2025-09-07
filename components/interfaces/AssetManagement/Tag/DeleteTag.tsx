import React from "react";
import toast from "react-hot-toast";
import { useTranslation } from "next-i18next";
import { useFormik } from "formik";
import { InputWithLabel } from "@/components/shared";
import { useDeleteTag } from "@/hooks/fleets/Tags/useDeleteTag";
import { useTags } from "@/hooks/fleets/Tags/useTags";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/ui/dialog";
import { Button } from "@/components/shadcn/ui/button";

const DeleteTag = ({
  tagId,
  visible,
  setVisible,
  fleetTeamId,
}: {
  tagId: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  fleetTeamId: string;
}) => {
  const { t } = useTranslation("common");

  const deleteTag = useDeleteTag();
  const { mutateTags } = useTags(fleetTeamId);

  const formik = useFormik({
    initialValues: {
      confirm: "",
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      if (values.confirm.toLowerCase() === "delete") {
        try {
          await deleteTag(fleetTeamId, tagId);
          toast.success(t("Delete Tag"));
          mutateTags();
          setVisible(false);
          resetForm();
        } catch {
          toast.error(t("error"));
        }
      } else {
        toast.error(t("Type confirmation text"));
      }
      setSubmitting(false);
    },
  });

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-w-md">
        <form onSubmit={formik.handleSubmit} method="DELETE" className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t("Confirm Permanent Tag Delete?")}</DialogTitle>
          </DialogHeader>

          <div className="mt-2 flex flex-col space-y-4">
            <p className="text-xs">
              {t("tag")}: <span className="text-orange-400">{tagId}</span>
            </p>
            <p>{t("fleet-delete-warning")}</p>
          </div>

          <InputWithLabel
            type="text"
            label={t("confirm")}
            name="confirm"
            placeholder={t("Enter confirmation text")}
            value={formik.values.confirm}
            error={formik.touched.confirm ? formik.errors.confirm : undefined}
            onChange={formik.handleChange}
          />
          <span className="text-xs">{t("fleet-delete-description")}</span>

          <DialogFooter>
            <Button
              type="submit"
              variant="destructive"
              disabled={formik.isSubmitting || !formik.dirty}
            >
              {formik.isSubmitting ? t("deleting...") : t("delete")}
            </Button>
            <Button type="button" variant="outline" onClick={() => setVisible(false)}>
              {t("close")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTag;
