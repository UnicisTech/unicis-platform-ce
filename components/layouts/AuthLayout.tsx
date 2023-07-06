import app from '@/lib/app';
import Image from 'next/image';

interface AuthLayoutProps {
  children: React.ReactNode;
  heading?: string;
  description?: string;
}

export default function AuthLayout({
  children,
  heading,
  description,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div style={{background: 'transparent'}}>
          <img
            src="/unicis-platform-logo-ver.png"
            className="mx-auto h-48 w-auto"
            alt="Unicis.App"
          />

          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {heading}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {description}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
