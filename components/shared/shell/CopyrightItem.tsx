import { useTranslation } from 'next-i18next';

const CopyrightItem = () => {
  const { t } = useTranslation('common');
  const BRAND = 'Unicis.Tech OÜ';
  const DATE = '2026-05-31';

  return (
    <ul role="list" className="flex flex-1 flex-col justify-end gap-1 mb-1.5">
      <li>
        <p className="text-xs text-center font-semibold">
          {t('copyright', { year: new Date().getFullYear() })}{' '}
          <a
            href="https://www.unicis.tech/?mtm_campaign=platform&mtm_source=platform"
            target="_blank"
          >
            {BRAND}
          </a>
          . <br />
          {t('version')}: {DATE}
          <br />
          {t('made_with_love')}
        </p>
      </li>
    </ul>
  );
};

export default CopyrightItem;
