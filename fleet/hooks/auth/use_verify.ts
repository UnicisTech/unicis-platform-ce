import { useEffect } from 'react';
import { useAppDispatch } from '@/fleet/redux/hooks';
import { setAuth, finishInitialLoad } from '@/fleet/redux/features/reducers/authSlice';
import { setUID, setRole, setUser } from '@/fleet/redux/features/reducers/userSlice';

import { useVerifyMutation } from '@/fleet/redux/features/authApiSlice';


export default function useVerify() {
	const dispatch = useAppDispatch();

	const [verify] = useVerifyMutation();

	useEffect(() => {
		async function verifyUser() {
			verify(undefined)
				.unwrap()
				.then((data) => {
					if (data) {
						dispatch(setAuth());
						dispatch(setUser(data));
						dispatch(setUID(data?.id))
						dispatch(setRole(data?.role))
					}
				})
				.catch((error) => {
                    console.error('Error verifying user:', error);
                })
				.finally(() => {
					dispatch(finishInitialLoad());
				});
		}

		verifyUser();
	}, [dispatch, verify]);
}
