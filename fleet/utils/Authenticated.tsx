'use client';

import { useAppSelector } from '@/fleet/redux/hooks';
import { Loading } from '@/components/shared';
import { useRouter } from 'next/navigation';

interface Props {
	children: React.ReactNode;
}

export default function RequireAuth({ children }: Props) {
	const router = useRouter();
	const { isLoading, isAuthenticated } = useAppSelector(state => state.auth);

	if (isLoading) {
		return (
			<div className='flex h-full justify-center my-8'>
				<Loading/>
			</div>
		);
	}

	if (isAuthenticated) {
		router.push('/');
	}

	if (!isLoading && !isAuthenticated) {
		return <>{children}</>
	}
}
