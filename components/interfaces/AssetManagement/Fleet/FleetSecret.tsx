import { useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'next-i18next'
import { Button } from '@/components/shadcn/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/shadcn/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/shadcn/ui/dialog'
import { Input } from '@/components/shadcn/ui/input'
import { Label } from '@/components/shadcn/ui/label'
import { Team, User } from '@/generated/client'
import FleetStatus from './FleetStatus'
import RenewFleetSecret from './RenewFleetSecret'
import useCanAccess from '@/hooks/useCanAccess'
import { useBootstrapFleet } from '@/hooks/fleets'
import { useGetFleetSecret } from '@/hooks/fleets/connect/useGetFleetSecret'
import { useDeleteFleetSecret } from '@/hooks/fleets/connect/useDeleteFleetSecret'
import { Loader2 } from 'lucide-react'
import Cookies from 'js-cookie'
import { CodeBlock } from '@/components/shared/CodeBlock'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { passwordPolicies } from '@/lib/common'
import { useFormik } from 'formik'
import * as Yup from 'yup'

const passwordSchema = Yup.object({
  password: Yup.string()
    .required('Password is required')
    .min(passwordPolicies.fleetMinLength, `Password must be at least ${passwordPolicies.fleetMinLength} characters`),
})

const FleetSecret = ({
  user,
  team,
}: {
  user: Partial<User>
  team: Team
}) => {
  const { t } = useTranslation(['common', 'fleet'])
  const userId = user.id
  const teamId = team.id
  const [safe, setSafe] = useState(true)
  const [passwordDialogVisible, setPasswordDialogVisible] = useState(false)

  const bootstrapFleet = useBootstrapFleet()
  const deleteFleetSecret = useDeleteFleetSecret()
  const [renewVisible, setRenewVisible] = useState(false)

  const { secret, isLoading, isError, mutateFleetSecret } = useGetFleetSecret(team.id)

  const formik = useFormik({
    initialValues: { password: '' },
    validationSchema: passwordSchema,
    onSubmit: async ({ password }) => {
      try {
        console.log('[FleetSecret] Bootstrapping Fleet...')
        const response = await bootstrapFleet(teamId, password)

        console.log('[FleetSecret] Bootstrap successful:', response)

        // Store Fleet token in cookie for future requests
        Cookies.set(
          'ufs-J69MRTGVH$-RD6FTTMERCJ2R4VK5ECLLQOM5CC5C26C-TSA',
          response.fleetToken
        )

        setPasswordDialogVisible(false)
        formik.resetForm()
        mutateFleetSecret()
        toast.success(t('fleet:fleet-enrollment-secret-ordered'))
      } catch (error: any) {
        console.error('[FleetSecret] Error:', error)
        toast.error(error?.message || t('error-ordering-fleet-secret'))
      }
    },
  })

  const handleOrderSecret = () => {
    setPasswordDialogVisible(true)
  }
  
  const handleDelete = async () => {
    try {
      await deleteFleetSecret(teamId)
      mutateFleetSecret()
      toast.success(t('successfully-deleted'))
    } catch {
      toast.error(t('error-deleting-fleet-secret'))
    }
  }  

  const toggleSafe = () => setSafe(!safe)

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
          <CardTitle>{t('fleet:fleet-secret')}</CardTitle>
          <CardDescription>{t('fleet:fleet-secret-description')}</CardDescription>
        </div>

        <button
          type="button"
          onClick={toggleSafe}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Safe Sensitives
          {safe ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </CardHeader>

      <CardContent className="space-y-4">
        {!user ? (
          <FleetStatus status="access-not-granted" />
        ) : (
          <>
            {secret?.secret && (
              <CodeBlock
                text={safe ? '*'.repeat(secret?.secret?.length || 0) : secret.secret}
              />
            )}
            {!secret?.secret && <FleetStatus status="no-fleet-secret" />}
          </>
        )}

        <div className="flex justify-between items-center mt-3">
          {secret?.secret === undefined ? (
            <Button
              type="button"
              disabled={isLoading || secret?.id === null}
              onClick={handleOrderSecret}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('fleet:fleet-order-secret')}
            </Button>
          ) : (
            <>
              <Button
                disabled={isLoading || !secret?.secret}
                onClick={handleDelete}
                variant="destructive"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('fleet:fleet-secret-reset')}
              </Button>

              <Button
                type="submit"
                disabled={isLoading || !secret?.secret}
                onClick={() => setRenewVisible(true)}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('fleet:fleet-renew-secret')}
              </Button>
            </>
          )}
        </div>
      </CardContent>

      <RenewFleetSecret teamId={teamId} setVisible={setRenewVisible} visible={renewVisible} />

      <Dialog open={passwordDialogVisible} onOpenChange={setPasswordDialogVisible}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={formik.handleSubmit}>
            <DialogHeader>
              <DialogTitle>{t('fleet:fleet-enter-password')}</DialogTitle>
              <DialogDescription>
                {t('fleet:fleet-password-description')}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t('fleet:fleet-user-password')}</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  autoComplete="current-password"
                />
                {formik.touched.password && formik.errors.password && (
                  <p className="text-sm text-red-500">{formik.errors.password}</p>
                )}
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordDialogVisible(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={formik.isSubmitting}>
                {formik.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('continue')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default FleetSecret
