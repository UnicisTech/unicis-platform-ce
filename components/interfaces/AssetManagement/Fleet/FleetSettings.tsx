import { useFormik } from "formik"
import { useTranslation } from "next-i18next"
import * as Yup from "yup"
import { passwordPolicies } from "@/lib/common"
import { User } from "@prisma/client"
import FleetStatus from "./FleetStatus"
import { Button } from "@/components/shadcn/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/shadcn/ui/card"
import { Input } from "@/components/shadcn/ui/input"
import { Label } from "@/components/shadcn/ui/label"

const schema = Yup.object().shape({
  id: Yup.string().required(),
  email: Yup.string().required(),
  firstName: Yup.string().required(),
  lastName: Yup.string().required(),
  fleetPassword: Yup.string().required().min(passwordPolicies.minLength),
})

const SettingsFleet = ({ user }: { user: Partial<User> }) => {
  const { t } = useTranslation("common")

  const formik = useFormik({
    initialValues: {
      id: user.id || "",
      email: user.email || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      fleetPassword: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        console.log("Fleet settings saved:", values)
      } catch (error) {
        console.error("Error creating or connecting fleet:", error)
      }
    },
  })

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{t("fleet-settings")}</CardTitle>
          <CardDescription>{t("fleet-settings-description")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <FleetStatus status="connected" />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="firstName">{t("first-name")}</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder={t("first-name")}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="text-sm text-red-500">{formik.errors.firstName}</p>
              )}
            </div>

            <div className="flex flex-col space-y-1">
              <Label htmlFor="lastName">{t("last-name")}</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder={t("last-name")}
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="text-sm text-red-500">{formik.errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder={t("email")}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-sm text-red-500">{formik.errors.email}</p>
            )}
          </div>

          <div className="flex flex-col space-y-1">
            <Label htmlFor="fleetPassword">{t("fleet-password")}</Label>
            <Input
              id="fleetPassword"
              name="fleetPassword"
              type="password"
              value={formik.values.fleetPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder={t("fleet-password")}
              autoComplete="off"
              inputMode="none"
            />
            {formik.touched.fleetPassword && formik.errors.fleetPassword && (
              <p className="text-sm text-red-500">{formik.errors.fleetPassword}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => console.log("Disconnect Fleet")}
          >
            {t("disconnect")}
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? t("saving") : t("save")}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

export default SettingsFleet
