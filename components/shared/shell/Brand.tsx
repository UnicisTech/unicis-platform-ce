import app from '@/lib/app';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Brand = () => {
  const { query } = useRouter();
  const slug = query.slug as string | undefined;

  if (!slug) {
    return (
      <div className="flex pt-6 shrink-0 items-center text-xl font-bold gap-2">
        <img src={app.logoUrl} alt={app.name} />
      </div>
    );
  }

  return (
    <Link href={`/teams/${slug}/dashboard`}>
      <div className="flex pt-6 shrink-0 items-center text-xl font-bold gap-2 cursor-pointer hover:opacity-80 transition-opacity">
        <img src={app.logoUrl} alt={app.name} />
      </div>
    </Link>
  );
};

export default Brand;
