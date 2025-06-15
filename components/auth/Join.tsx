import { useState, useRef } from "react";
import { useTranslation } from "next-i18next";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import ReCAPTCHA from "react-google-recaptcha";
import { defaultHeaders, validatePassword } from "@/lib/common";
import type { ApiResponse } from "types";
import type { User } from "@prisma/client";

import { Label } from "@/components/shadcn/ui/label";
import { Input } from "@/components/shadcn/ui/input";
import { Button } from "@/components/shadcn/ui/button";
import TogglePasswordVisibility from "@/components/shared/TogglePasswordVisibility";
import GoogleReCAPTCHA from "@/components/shared/GoogleReCAPTCHA";
import AgreeMessage from "@/components/auth/AgreeMessage";
import { Loader2 } from "lucide-react"

interface JoinProps {
  recaptchaSiteKey: string | null;
}

const Join: React.FC<JoinProps> = ({ recaptchaSiteKey }) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      team: "",
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required(t("required")),
      lastName: Yup.string().required(t("required")),
      team: Yup.string()
        .required(t("required"))
        .min(3, t("min-3-chars")),
      email: Yup.string()
        .required(t("required"))
        .email(t("invalid-email")),
      password: Yup.string()
        .required(t("required"))
        .test(
          "strong",
          t("password-criteria"),
          validatePassword
        ),
    }),
    onSubmit: async (values) => {
      const res = await fetch("/api/auth/join", {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify({ ...values, recaptchaToken }),
      });
      const json = (await res.json()) as ApiResponse<User & { confirmEmail: boolean }>;
      recaptchaRef.current?.reset();

      if (!res.ok) {
        toast.error(json.error.message);
      } else {
        formik.resetForm();
        if (json.data.confirmEmail) {
          router.push("/auth/verify-email");
        } else {
          toast.success(t("successfully-joined"));
          router.push("/auth/login");
        }
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      {/* First Name */}
      <div className="grid gap-1">
        <Label htmlFor="firstName">{t("first-name")}</Label>
        <Input
          id="firstName"
          name="firstName"
          placeholder={t("your-first-name")}
          value={formik.values.firstName}
          onChange={formik.handleChange}
          className="text-base"
        />
        {formik.touched.firstName && formik.errors.firstName && (
          <p className="text-destructive text-sm">
            {formik.errors.firstName}
          </p>
        )}
      </div>

      {/* Last Name */}
      <div className="grid gap-1">
        <Label htmlFor="lastName">{t("last-name")}</Label>
        <Input
          id="lastName"
          name="lastName"
          placeholder={t("your-last-name")}
          value={formik.values.lastName}
          onChange={formik.handleChange}
          className="text-base"
        />
        {formik.touched.lastName && formik.errors.lastName && (
          <p className="text-destructive text-sm">
            {formik.errors.lastName}
          </p>
        )}
      </div>

      {/* Team */}
      <div className="grid gap-1">
        <Label htmlFor="team">{t("team")}</Label>
        <Input
          id="team"
          name="team"
          placeholder={t("team-name")}
          value={formik.values.team}
          onChange={formik.handleChange}
          className="text-base"
        />
        {formik.touched.team && formik.errors.team && (
          <p className="text-destructive text-sm">{formik.errors.team}</p>
        )}
      </div>

      {/* Email */}
      <div className="grid gap-1">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="first.last@name.com"
          value={formik.values.email}
          onChange={formik.handleChange}
          className="text-base"
        />
        {formik.touched.email && formik.errors.email && (
          <p className="text-destructive text-sm">{formik.errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="relative grid gap-1">
        <Label htmlFor="password">{t("password")}</Label>
        <div className="relative w-full">
          <Input
            id="password"
            name="password"
            type={isPasswordVisible ? "text" : "password"}
            placeholder={t("password")}
            value={formik.values.password}
            onChange={formik.handleChange}
            className="pr-10 text-base"
          />
          <TogglePasswordVisibility
            isPasswordVisible={isPasswordVisible}
            handlePasswordVisibility={() =>
              setIsPasswordVisible((v) => !v)
            }
          />
        </div>
        {formik.touched.password && formik.errors.password && (
          <p className="text-destructive text-sm">
            {formik.errors.password}
          </p>
        )}
      </div>

      {/* reCAPTCHA */}
      <GoogleReCAPTCHA
        recaptchaRef={recaptchaRef}
        onChange={setRecaptchaToken}
        siteKey={recaptchaSiteKey}
      />

      {/* Submit */}
      <div className="mt-6 space-y-3">
        <Button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full"
        >
          {formik.isSubmitting && <Loader2 className="animate-spin" />}
          {t("create-account")}
        </Button>
        <AgreeMessage text="create-account" />
      </div>
    </form>
  );
};

export default Join;
