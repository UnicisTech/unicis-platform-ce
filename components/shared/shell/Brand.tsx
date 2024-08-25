import app from '@/lib/app';

const Brand = () => {
  return (
    <div className="flex pt-6 shrink-0 items-center text-xl font-bold gap-2">
<<<<<<< HEAD
      <img src={app.logoUrl} alt={app.name} />
=======
      <img 
        // className="h-7 w-auto" 
        src={app.logoUrl} 
        alt={app.name}
       />
>>>>>>> community-edition
      {/* {app.name} */}
    </div>
  );
};

export default Brand;
