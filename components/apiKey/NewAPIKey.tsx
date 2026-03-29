import type { Team } from 'types';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useSWRConfig } from 'swr';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { Label } from '@/components/shadcn/ui/label';
import { Input } from '@/components/shadcn/ui/input';
import type { ApiResponse } from 'types';

interface NewAPIKeyProps {
  team: Team;
  createModalVisible: boolean;
  setCreateModalVisible: (visible: boolean) => void;
}

const NewAPIKey = ({
  team,
  createModalVisible,
  setCreateModalVisible,
}: NewAPIKeyProps) => {
  const { t } = useTranslation('common');
  const { mutate } = useSWRConfig();

  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch(`/api/teams/${team.slug}/api-keys`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });

    const { data, error } = (await res.json()) as ApiResponse<{
      apiKey: string;
    }>;

    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.apiKey) {
      mutate(`/api/teams/${team.slug}/api-keys`);
      setCreatedKey(data.apiKey);
      setName('');
    }
  };

  const handleClose = () => {
    setCreateModalVisible(false);
    setCreatedKey(null);
    setName('');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('copied-to-clipboard'));
    } catch {
      toast.error(t('errors.failedToCopyLink'));
    }
  };

  return (
    <Dialog open={createModalVisible} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {createdKey ? (
          <>
            <DialogHeader>
              <DialogTitle>{t('api-key-created')}</DialogTitle>
              <DialogDescription>{t('new-api-warning')}</DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-muted rounded p-2 break-all select-all">
                  {createdKey}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(createdKey)}
                >
                  {t('copy-to-clipboard')}
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" onClick={handleClose}>
                {t('close')}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit} method="POST">
            <DialogHeader>
              <DialogTitle>{t('new-api-key')}</DialogTitle>
              <DialogDescription>
                {t('new-api-key-description')}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-1">
                <Label htmlFor="name">{t('name')}</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My API Key"
                  className="text-sm"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                {t('close')}
              </Button>

              <Button
                type="submit"
                disabled={submitting || !name}
                className="ml-2"
              >
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t('create-api-key')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewAPIKey;
