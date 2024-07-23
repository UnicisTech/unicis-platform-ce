import { useState, FormEvent } from 'react';
import { useResetPasswordMutation } from '@/fleet/redux/features/authApiSlice';

export default function useResetPassword() {
	const [resetPassword, { isLoading }] = useResetPasswordMutation();

	const [email, setEmail] = useState('');

	const onChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setEmail(event.target.value);
	};

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		resetPassword(email)
			.unwrap()
			.then(() => {
				// toast.success('Request sent, check your email for reset link');
			})
			.catch(() => {
				// toast.error('Failed to send request');
			});
	};

	return {
		email,
		isLoading,
		onChange,
		onSubmit,
	};
}
