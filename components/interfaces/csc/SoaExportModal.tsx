import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import type { ExportFormat } from '@/lib/soa/types';

interface Props {
  isOpen:        boolean;
  onClose:       () => void;
  onExport:      (format: ExportFormat) => Promise<void>;
  frameworkName: string;
}

const FORMAT_VALUES: { value: ExportFormat; icon: string }[] = [
  { value: 'xlsx', icon: '📊' },
  { value: 'pdf',  icon: '📄' },
  { value: 'html', icon: '🌐' },
];

export default function SoaExportModal({ isOpen, onClose, onExport, frameworkName }: Props) {
  const { t } = useTranslation('common');
  const [selected, setSelected] = useState<ExportFormat>('xlsx');
  const [loading,  setLoading]  = useState(false);

  if (!isOpen) return null;

  const formats = FORMAT_VALUES.map((f) => ({
    ...f,
    label:       t(`soa-export.format-${f.value}-label`),
    description: t(`soa-export.format-${f.value}-description`),
  }));

  async function handleDownload() {
    setLoading(true);
    try {
      await onExport(selected);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-md">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
          disabled={loading}
        >
          ✕
        </button>

        <h3 className="font-bold text-lg mb-1">{t('soa-export.modal-title')}</h3>
        <p className="text-sm text-base-content/60 mb-5">
          {t('soa-export.modal-framework')} <strong>{frameworkName}</strong>
        </p>

        <div className="flex flex-col gap-2 mb-6">
          {formats.map((f) => (
            <label
              key={f.value}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selected === f.value
                  ? 'border-primary bg-primary/5'
                  : 'border-base-300 hover:border-base-400'
              }`}
            >
              <input
                type="radio"
                name="soa-format"
                className="radio radio-primary mt-0.5 shrink-0"
                value={f.value}
                checked={selected === f.value}
                onChange={() => setSelected(f.value)}
                disabled={loading}
              />
              <div>
                <div className="font-medium text-sm">{f.icon}&nbsp;{f.label}</div>
                <div className="text-xs text-base-content/50 mt-0.5">{f.description}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="modal-action mt-0">
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={loading}>
            {t('soa-export.cancel')}
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-9 px-4 py-2"
            onClick={handleDownload}
            disabled={loading}
          >
            {loading ? (
              <><span className="loading loading-spinner loading-xs" />{t('soa-export.exporting')}</>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {t('soa-export.download')}
              </>
            )}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose} disabled={loading}>close</button>
      </form>
    </dialog>
  );
}
