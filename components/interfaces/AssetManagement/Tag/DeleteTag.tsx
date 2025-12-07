'use client'

import React from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'next-i18next'
import { useFormik } from 'formik'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/shadcn/ui/dialog'
import { Button } from '@/components/shadcn/ui/button'
import { Input } from '@/components/shadcn/ui/input'
import { Label } from '@/components/shadcn/ui/label'
import { useDeleteTag } from '@/hooks/fleets/Tags/useDeleteTag'
import { useTags } from '@/hooks/fleets/Tags/useTags'

const DeleteTag = ({
  tagId,
  visible,
  setVisible,
  fleetTeamId,
}: {
  tagId: string
  visible: boolean
  setVisible: (visible: boolean) => void
  fleetTeamId: string
}) => {
  const { t } = useTranslation('common')
  const deleteTag = useDeleteTag()
  const { mutateTags } = useTags(fleetTeamId)

  const formik = useFormik({
    initialValues: {
      confirm: '',
    },
    onSubmit: async (values, { resetForm }) => {
      if (values.confirm.toLowerCase() === 'delete') {
        const toastId = toast.loading(t('deleting'))
        try {
          await deleteTag(fleetTeamId, tagId)
          mutateTags()
          toast.success(t('deleted-successfully'), { id: toastId })
          resetForm()
          setVisible(false)
        } catch (err) {
          toast.error(t('error-deleting-tag'), { id: toastId })
        }
      } else {
        toast.error(t('type-confirmation-text'))
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
              {t('confirm-permanent-tag-delete')}
            </DialogTitle>
          </DialogHeader>
  
          <div className="space-y-3 text-sm">
            <p>
              {t('tag')}: <span className="text-orange-400 break-all">{tagId}</span>
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
              placeholder={t('enter-confirmation-text')}
              value={formik.values.confirm}
              onChange={formik.handleChange}
              className="bg-muted/30"
            />
            <p className="text-xs text-muted-foreground">
              {t('fleet-delete-description')}
            </p>
          </div>
  
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setVisible(false)}>
              {t('close')}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={formik.isSubmitting || !formik.values.confirm}
            >
              {formik.isSubmitting ? t('deleting') : t('delete')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
  
}

export default DeleteTag
