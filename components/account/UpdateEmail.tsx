import * as Yup from "yup";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useTranslation } from "next-i18next";
import { defaultHeaders } from "@/lib/common";
import type { ApiResponse, UserReturned } from "types";
import type { User } from "@prisma/client";

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
  email: Yup.string().required(),
});

interface UpdateEmailProps {
  user: Partial<User>;
  allowEmailChange: boolean;
}

const UpdateEmail: React.FC<UpdateEmailProps> = ({
  user,
  allowEmailChange,
}) => {
  const { t } = useTranslation("common");

  const formik = useFormik({
    initialValues: { email: user.email || "" },
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
      } else {
        toast.success(t("successfully-updated"));
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{t("email-address")}</CardTitle>
          <CardDescription>
            {t("email-address-description")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-1">
            <Label htmlFor="email">{t("email-address")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t("your-email")}
              value={formik.values.email}
              onChange={formik.handleChange}
              disabled={!allowEmailChange}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-destructive text-sm">
                {formik.errors.email}
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

export default UpdateEmail;
