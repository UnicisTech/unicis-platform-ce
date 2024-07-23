import { useState, FormEvent } from 'react';
import { useUpdateUserMutation, useUpdateUsernameMutation } from '@/redux/features/userApiSlice';
import { useRetrieveUserQuery } from '@/redux/features/authApiSlice';

import { toast } from 'react-toastify';

export function useUpdateUsername() {
	const { data: user } = useRetrieveUserQuery();
	const [updateUsername, { isLoading }] = useUpdateUsernameMutation();

	const [formData, setFormData] = useState({
		username: `${user?.username}`,
	});

	const { username } = formData;

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setFormData({ ...formData, [name]: value });
	};

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		updateUsername({username})
			.unwrap()
			.then(() => {
				toast.success('Your username is updated');
			})
			.catch(() => {
				toast.error('Username update failed');
			});
	};

	return {
		username,
		isLoading,
		onChange,
		onSubmit,
	};
}


export function useUpdateUser() {
	const { data: user } = useRetrieveUserQuery();
	const [updateUser, { isLoading }] = useUpdateUserMutation();

	const [formDataUsername, setFormData] = useState({
		first_name: `${user?.first_name}`,
		last_name: `${user?.last_name}`,
		other_name: `${user?.other_name}`,
	});

	const { first_name, last_name, other_name, } = formDataUsername;

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;

		setFormData({ ...formDataUsername, [name]: value });
	};

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		updateUser({ first_name, last_name, other_name})
			.unwrap()
			.then(() => {
				toast.success('User updated successfully');
			})
			.catch(() => {
				toast.error('User update failed');
			});
	};

	return {
		first_name,
		last_name,
		other_name,
		isLoading,
		onChange,
		onSubmit,
	};
}

