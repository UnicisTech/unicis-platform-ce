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
      toast.success(t('api-key-created'));
      setCreateModalVisible(false);
      setName('');
    }
  };

  return (
    <Dialog open={createModalVisible} onOpenChange={setCreateModalVisible}>
      <DialogContent className="sm:max-w-md">
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateModalVisible(false)}
            >
              {t('close')}
            </Button>

            <Button
              type="submit"
              disabled={submitting || !name}
              className="ml-2"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('create-api-key')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewAPIKey;
