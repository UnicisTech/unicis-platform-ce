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
import { Team, User } from '@prisma/client'
import FleetStatus from './FleetStatus'
import RenewFleetSecret from './RenewFleetSecret'
import useCanAccess from '@/hooks/useCanAccess'
import { useCreateFleetAccount, useAccessFleetAccount, useCreateFleetTeam } from '@/hooks/fleets'
import { useOrderFleetSecret } from '@/hooks/fleets/connect/useOrderFleetSecret'
import { useGetFleetSecret } from '@/hooks/fleets/connect/useGetFleetSecret'
import { useDeleteFleetSecret } from '@/hooks/fleets/connect/useDeleteFleetSecret'
import { getSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import Cookies from 'js-cookie'
import { CodeBlock } from '@/components/shared/CodeBlock'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

const FleetSecret = ({
  user,
  team,
}: {
  user: Partial<User>
  team: Team
}) => {
  const { t } = useTranslation('common')
  const userId = user.id
  const teamId = team.id
  const [safe, setSafe] = useState(true)

  const createFleetAccount = useCreateFleetAccount()
  const accessFleetAccount = useAccessFleetAccount()
  const createFleetTeam = useCreateFleetTeam()
  const orderFleetSecret = useOrderFleetSecret()
  const deleteFleetSecret = useDeleteFleetSecret()
  const [renewVisible, setRenewVisible] = useState(false)
  const { canAccess } = useCanAccess()

  const { secret, isLoading, isError, mutateFleetSecret } = useGetFleetSecret(team.id)

  const handleOrderSecret = async () => {
    const session = await getSession()
    console.log(session)
    try {
      await createFleetAccount(
        'c2690d45-ab9f-4bbb-bd0e-fc75f3c56b8d',
        'vnezdd@gmail.com',
        'Vitalii',
        'Nezdvetskyi',
        'Ocean@25Navigator'
      ).then(async () => {
        const { fleet_access } = await accessFleetAccount('vnezdd@gmail.com', 'Ocean@25Navigator')
        console.log('fleet_access', fleet_access)
        Cookies.set(
          'ufs-J69MRTGVH$-RD6FTTMERCJ2R4VK5ECLLQOM5CC5C26C-TSA',
          fleet_access.secret_key
        )
      })
    } catch (error) {
      console.log('createFleetAccount error', error)
    }
  
    try {
      if (!userId) throw new Error('User ID is not defined')
      if (secret?.id === undefined) {
        await createFleetTeam(team.name, team.id)
        await orderFleetSecret(team.id)
        mutateFleetSecret()
        toast.success(t('fleet-enrollment-secret-ordered'))
      }
    } catch (error: any) {
      console.log('error', error)
      toast.error(isError?.message)
    }
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
          <CardTitle>{t('fleet-secret')}</CardTitle>
          <CardDescription>{t('fleet-secret-description')}</CardDescription>
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
              {t('fleet-order-secret')}
            </Button>
          ) : (
            <>
              <Button
                disabled={isLoading || !secret?.secret}
                onClick={handleDelete}
                variant="destructive"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('fleet-secret-reset')}
              </Button>

              <Button
                type="submit"
                disabled={isLoading || !secret?.secret}
                onClick={() => setRenewVisible(true)}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('fleet-renew-secret')}
              </Button>
            </>
          )}
        </div>
      </CardContent>

      <RenewFleetSecret teamId={teamId} setVisible={setRenewVisible} visible={renewVisible} />
    </Card>
  )
}

export default FleetSecret
