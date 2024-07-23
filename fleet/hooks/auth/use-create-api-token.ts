import { useState, FormEvent } from 'react';
import { useCreateAPITokenMutation } from '@/fleet/redux/features/authApiSlice';


export default function useCreateAPIToken() {
	const [setAPITokenPlan, { isLoading }] = useCreateAPITokenMutation();

	const [formData, setFormData] = useState({
		token_name: '',
	});

	const { token_name } = formData;

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, type, value, checked } = event.target;
		console.log(value)

		setFormData({ ...formData, [name]: value });
	};

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		setAPITokenPlan({token_name})
			.unwrap()
			.then(() => {
				// toast.success('API Token Generated Successfully');
			})
			.catch(() => {
				// toast.error('API Token Generation Failed');
			});
	};

	return {
		token_name,
		isLoading,
		onChange,
		onSubmit,
	};
}

