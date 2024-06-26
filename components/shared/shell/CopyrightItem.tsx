const CopyrightItem = () => {
  return (
    <ul role="list" className="flex flex-1 flex-col justify-end gap-1 mb-1.5">
      <li>
        <p className="text-xs text-center font-semibold">
          Copyright © {new Date().getFullYear()}{' '}
          <a
            href="https://www.unicis.tech/?mtm_campaign=platform&mtm_source=platform_beta"
            target="_blank"
          >
            Unicis.Tech OÜ
          </a>
          . <br />
          Made with 💙 in 🇪🇺.
        </p>
      </li>
    </ul>
  );
};

export default CopyrightItem;
