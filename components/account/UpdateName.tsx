import * as Yup from "yup";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";
import type { ApiResponse, UserReturned } from "types";
import type { User } from "@prisma/client";
import { defaultHeaders } from "@/lib/common";

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
import { Loader2 } from "lucide-react";

const schema = Yup.object({
  firstName: Yup.string().required(),
  lastName: Yup.string().required(),
});

const UpdateName: React.FC<{ user: Partial<User> }> = ({ user }) => {
  const { t } = useTranslation("common");
  const { data: session, update } = useSession();

  const formik = useFormik({
    initialValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
    },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values) => {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });
      const json = (await res.json()) as ApiResponse<UserReturned>;

      if (!res.ok) {
        toast.error(json.error.message);
        return;
      }

      await update({
        ...session,
        user: {
          ...session?.user,
          name: json.data.name,
          firstName: json.data.firstName,
          lastName: json.data.lastName,
        },
      });

      toast.success(t("successfully-updated"));
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{t("name")}</CardTitle>
          <CardDescription>{t("name-appearance")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-1">
            <Label htmlFor="firstName">{t("first-name")}</Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder={t("your-first-name")}
              value={formik.values.firstName}
              onChange={formik.handleChange}
            />
            {formik.touched.firstName && formik.errors.firstName && (
              <p className="text-destructive text-sm">
                {formik.errors.firstName}
              </p>
            )}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="lastName">{t("last-name")}</Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder={t("your-last-name")}
              value={formik.values.lastName}
              onChange={formik.handleChange}
            />
            {formik.touched.lastName && formik.errors.lastName && (
              <p className="text-destructive text-sm">
                {formik.errors.lastName}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button
            type="submit"
            disabled={!formik.dirty || !formik.isValid}
          >
          {formik.isSubmitting && <Loader2 className="animate-spin" />}
          {t("save-changes")}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default UpdateName;
