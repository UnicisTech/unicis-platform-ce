import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { defaultHeaders, domainRegex } from "@/lib/common";
import type { Team } from "@prisma/client";
import type { ApiResponse } from "types";
import { AccessControl } from "@/components/shared/AccessControl";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/shadcn/ui/card";
import { Label } from "@/components/shadcn/ui/label";
import { Input } from "@/components/shadcn/ui/input";
import { Button } from "@/components/shadcn/ui/button";
import { Loader2 } from "lucide-react"

interface TeamSettingsProps {
  team: Team;
}

const TeamSettings: React.FC<TeamSettingsProps> = ({ team }) => {
  const router = useRouter();
  const { t } = useTranslation("common");

  const formik = useFormik({
    initialValues: {
      name: team.name,
      slug: team.slug,
      domain: team.domain ?? "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required(t("team-name-required")),
      slug: Yup.string().required(t("team-slug-required")),
      domain: Yup.string()
        .nullable()
        .matches(domainRegex, t("invalid-domain")),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      const res = await fetch(`/api/teams/${team.slug}`, {
        method: "PUT",
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });
      const json = (await res.json()) as ApiResponse<Team>;

      if (!res.ok) {
        toast.error(json.error.message);
      } else {
        toast.success(t("successfully-updated"));
        router.push(`/teams/${json.data.slug}/settings`);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{t("team-settings")}</CardTitle>
          <CardDescription>{t("team-settings-config")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-1">
            <Label htmlFor="name">{t("team-name")}</Label>
            <Input
              id="name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-destructive text-sm">{formik.errors.name}</p>
            )}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="slug">{t("team-slug")}</Label>
            <Input
              id="slug"
              name="slug"
              value={formik.values.slug}
              onChange={formik.handleChange}
            />
            {formik.touched.slug && formik.errors.slug && (
              <p className="text-destructive text-sm">{formik.errors.slug}</p>
            )}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="domain">{t("team-domain")}</Label>
            <Input
              id="domain"
              name="domain"
              value={formik.values.domain}
              onChange={formik.handleChange}
              placeholder="example.com"
            />
            {formik.touched.domain && formik.errors.domain && (
              <p className="text-destructive text-sm">{formik.errors.domain}</p>
            )}
          </div>
        </CardContent>

        <AccessControl resource="team" actions={["update"]}>
          <CardFooter className="flex justify-end">
            <Button
              type="submit"
              disabled={!formik.isValid || !formik.dirty || formik.isSubmitting}
            >
              {formik.isSubmitting && <Loader2 className="animate-spin" />}
              {t("save-changes")}
            </Button>
          </CardFooter>
        </AccessControl>
      </Card>
    </form>
  );
};

export default TeamSettings;
