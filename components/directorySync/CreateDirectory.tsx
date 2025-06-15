import React from "react";
import { useTranslation } from "next-i18next";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import { defaultHeaders } from "@/lib/common";
import useDirectory from "hooks/useDirectory";
import type { Directory } from "@boxyhq/saml-jackson";
import type { Team } from "@prisma/client";
import type { ApiResponse } from "types";

import { Loading } from "@/components/shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/shadcn/ui/dialog";
import { Label } from "@/components/shadcn/ui/label";
import { Input } from "@/components/shadcn/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/shadcn/ui/select";
import { Button } from "@/components/shadcn/ui/button";
import { Loader2 } from "lucide-react"

interface CreateDirectoryProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  team: Team;
}

const CreateDirectory: React.FC<CreateDirectoryProps> = ({
  visible,
  setVisible,
  team,
}) => {
  const { t } = useTranslation("common");
  const { data } = useSWR("/api/idp", fetcher);
  const { mutateDirectory } = useDirectory(team.slug);

  const formik = useFormik({
    initialValues: {
      name: "",
      provider: "generic-scim-v2",
    },
    validationSchema: Yup.object({
      name: Yup.string().required(t("required")),
      provider: Yup.string().required(t("required")),
    }),
    onSubmit: async (values) => {
      const res = await fetch(
        `/api/teams/${team.slug}/directory-sync`,
        {
          method: "POST",
          headers: defaultHeaders,
          body: JSON.stringify(values),
        }
      );
      const json = (await res.json()) as ApiResponse<Directory>;
      if (!res.ok) {
        toast.error(json.error.message);
      } else {
        toast.success(t("directory-connection-created"));
        mutateDirectory();
        setVisible(false);
        formik.resetForm();
      }
    },
  });

  if (!data) {
    return <Loading />;
  }

  const providers: Record<string, string> = data.data;

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={formik.handleSubmit}>
          <DialogHeader className="pt-4">
            <DialogTitle>
              {t("create-directory-connection")}
            </DialogTitle>
            <DialogDescription>
              {t("create-directory-message")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-1">
              <Label htmlFor="name">{t("directory-name")}</Label>
              <Input
                id="name"
                name="name"
                placeholder={t("directory-name-placeholder")}
                value={formik.values.name}
                onChange={formik.handleChange}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-destructive text-sm">
                  {formik.errors.name}
                </p>
              )}
            </div>

            <div className="grid gap-1">
              <Label htmlFor="provider">
                {t("directory-sync-provider")}
              </Label>
              <Select
                name="provider"
                value={formik.values.provider}
                onValueChange={(val) =>
                  formik.setFieldValue("provider", val)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("select-provider")} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(providers).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.provider && formik.errors.provider && (
                <p className="text-destructive text-sm">
                  {formik.errors.provider}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full"
            >
              {formik.isSubmitting && <Loader2 className="animate-spin" />}
              {t("create-directory")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDirectory;