'use client';

import { redirect } from 'next/navigation';
import { useAppSelector } from '@/fleet/redux/hooks';
import { Loading } from '@/components/shared';

interface Props {
	children: React.ReactNode;
}

export default function RequireAuth({ children }: Props) {
	const { isLoading, isAuthenticated  } = useAppSelector(state => state.auth);

	if (isLoading) {
		return (
			<div className='flex h-screen items-center justify-center'>
				<Loading/>
			</div>
		);
	}

	if (!isAuthenticated) {
		redirect('/home');
	}

	if (!isLoading && isAuthenticated) {
		return <>{children}</>
	}
}
