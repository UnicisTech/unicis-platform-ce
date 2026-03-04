import { useMemo } from 'react';
import { useRouter } from 'next/router';
import TeamNavigation from './TeamNavigation';
import UserNavigation from './UserNavigation';
import CopyrightItem from './CopyrightItem';

const Navigation = () => {
  const { asPath, isReady, query } = useRouter();
  const activePathname = useMemo(() => {
    if (!isReady || !asPath) return null;
    return new URL(asPath, location.href).pathname;
  }, [asPath, isReady]);

  const { slug } = query as { slug: string };

  return (
    <nav className="flex flex-1 flex-col justify-between">
      <>
        {slug ? (
          <TeamNavigation slug={slug} activePathname={activePathname} />
        ) : (
          <UserNavigation activePathname={activePathname} />
        )}
        <CopyrightItem />
      </>
    </nav>
  );
};

export default Navigation;
