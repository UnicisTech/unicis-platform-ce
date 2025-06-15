import { useState, useRef, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import * as Yup from "yup";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import ReCAPTCHA from "react-google-recaptcha";
import { defaultHeaders, validatePassword } from "@/lib/common";
import useInvitation from "hooks/useInvitation";
import type { ApiResponse } from "types";
import type { User } from "@prisma/client";

import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Button } from "@/components/shadcn/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/shadcn/ui/alert";
import { Loader2 } from "lucide-react"
import TogglePasswordVisibility from "@/components/shared/TogglePasswordVisibility";
import GoogleReCAPTCHA from "@/components/shared/GoogleReCAPTCHA";
import AgreeMessage from "@/components/auth/AgreeMessage";

interface JoinWithInvitationProps {
  inviteToken: string;
  recaptchaSiteKey: string | null;
}

const JoinWithInvitation: React.FC<JoinWithInvitationProps> = ({
  inviteToken,
  recaptchaSiteKey,
}) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { isLoading, error, invitation } = useInvitation();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    // reset recaptcha on mount
    recaptchaRef.current?.reset();
  }, []);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      password: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required(t("required")),
      lastName: Yup.string().required(t("required")),
      password: Yup.string()
        .required(t("required"))
        .test(
          "strong",
          t("password-criteria"),
          validatePassword
        ),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      const res = await fetch("/api/auth/join", {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify({
          ...values,
          recaptchaToken,
          inviteToken,
        }),
      });
      const json = (await res.json()) as ApiResponse<User>;
      recaptchaRef.current?.reset();

      if (!res.ok) {
        toast.error(json.error.message);
      } else {
        formik.resetForm();
        toast.success(t("successfully-joined"));
        router.push(`/auth/login?token=${inviteToken}`);
      }
    },
  });

  if (isLoading) return null;
  if (error || !invitation) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>{t("error")}</AlertTitle>
        <AlertDescription>{error?.message}</AlertDescription>
      </Alert>
    );
  }

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

      {/* Email (disabled) */}
      <div className="grid gap-1">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={invitation.email}
          disabled
          className="text-base"
        />
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
          // isLoading={formik.isSubmitting}
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

export default JoinWithInvitation;
