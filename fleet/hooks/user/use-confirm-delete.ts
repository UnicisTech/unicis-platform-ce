import { useState, FormEvent } from 'react';
import { useDeleteAccountMutation } from '@/redux/features/userApiSlice';
import { toast } from 'react-toastify';

export function useConfirmDelete() {
	const [deleteAccount, { isLoading }] = useDeleteAccountMutation();
	
	const initialFormData = {
		action: '',
		all: 'false',
	}

  	const [formData, setFormData] = useState(initialFormData);
	
	const {
		action,
		all
	} = formData;

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, type, checked, value } = event.target;
		const newValue = type === 'checkbox' ? checked : value;
		console.log(newValue)
		setFormData({...formData, [name]: newValue});
	};

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		deleteAccount({
			action,
			all,
		})
			.unwrap()
			.then(() => {
				toast.success('Successfully deleted your acount.');
			})
			.catch(() => {
				toast.error('Account deletion failed try again later.');
			});
	};
	
	return {
		action,
		all,
		isLoading,
		onChange,
		onSubmit,
	};
}