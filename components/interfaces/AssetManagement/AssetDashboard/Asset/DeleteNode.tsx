'use client'

import React from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/shadcn/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/shadcn/ui/dialog'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { useFormik } from 'formik'
import { Input } from '@/components/shadcn/ui/input'
import { Label } from '@/components/shadcn/ui/label'
import { useDeleteNode } from '@/hooks/fleets/Nodes/useDeleteNode'
import { useNodes } from '@/hooks/fleets/Nodes/useNodes'

const DeleteNode = ({
  nodeId,
  visible,
  setVisible,
  fleetTeamId,
}: {
  nodeId: string
  visible: boolean
  setVisible: (visible: boolean) => void
  fleetTeamId: string
}) => {
  const router = useRouter()
  const { t } = useTranslation('common')

  const deleteNode = useDeleteNode()
  const { mutateNodes } = useNodes(fleetTeamId, 'all')

  const formik = useFormik({
    initialValues: {
      confirm: '',
    },
    onSubmit: async (values, { resetForm }) => {
      if (values.confirm.toLowerCase() === 'delete') {
        const toastId = toast.loading(t('Deleting...'))
        try {
          await deleteNode(fleetTeamId, nodeId)
          mutateNodes()
          toast.success(t('Deleted successfully'), { id: toastId })
          resetForm()
          setVisible(false)
        } catch (err) {
          toast.error(t('Error deleting asset'), { id: toastId })
        }
      } else {
        toast.error(t('Type confirmation text'))
      }
    },
  })

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent
        className="max-w-md max-h-[85vh] overflow-y-auto bg-background text-foreground border-border"
      >
          <form onSubmit={formik.handleSubmit} method="DELETE" className="space-y-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-destructive">
              {t('confirm-permanent-asset-delete')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>
              {t('asset')}: <span className="text-orange-400 break-all">{nodeId}</span>
            </p>
            <p className="text-muted-foreground">{t('fleet-delete-warning')}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-sm font-medium">
              {t('confirm')}
            </Label>
            <Input
              id="confirm"
              name="confirm"
              placeholder={t('Enter confirmation text')}
              value={formik.values.confirm}
              onChange={formik.handleChange}
              className="bg-muted/30"
            />
            <p className="text-xs text-muted-foreground">
              {t('fleet-delete-description')}
            </p>
          </div>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setVisible(false)}
            >
              {t('close')}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={formik.isSubmitting || !formik.values.confirm}
            >
              {t('delete')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteNode
