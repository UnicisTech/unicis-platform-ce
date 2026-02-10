import app from '@/lib/app';

const Brand = () => {
  return (
    <div className="flex pt-6 shrink-0 items-center text-xl font-bold gap-2">
      <img src={app.logoUrl} alt={app.name} />
    </div>
  );
};

export default Brand;
