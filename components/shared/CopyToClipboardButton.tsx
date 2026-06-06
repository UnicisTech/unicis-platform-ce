import { copyToClipboard } from '@/lib/common';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/shadcn/ui/button';

interface CopyToClipboardProps {
  value: string;
}

const CopyToClipboardButton = ({ value }: CopyToClipboardProps) => {
  const { t } = useTranslation('common');

  const handleCopy = () => {
    copyToClipboard(value);
    toast.success(t('copied-to-clipboard'));
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 p-0"
      onClick={handleCopy}
      title={t('copy-to-clipboard')}
      style={{ position: 'absolute', right: '5px', top: '5px' }}
    >
      <ClipboardDocumentIcon className="w-5 h-5 text-muted-foreground hover:text-foreground" />
    </Button>
  );
};

export default CopyToClipboardButton;
