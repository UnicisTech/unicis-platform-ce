import { copyToClipboard } from '@/lib/common';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-hot-toast';
import DaisyButton from './daisyUI/DaisyButton';

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
    <DaisyButton
      variant="link"
      size="xs"
      className="tooltip p-0"
      data-tip={t('copy-to-clipboard')}
      onClick={handleCopy}
    >
      <ClipboardDocumentIcon className="w-5 h-5 text-secondary" />
    </DaisyButton>
  );
};

export default CopyToClipboardButton;
