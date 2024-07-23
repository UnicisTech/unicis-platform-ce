import { useState, FormEvent } from 'react';
import { useUpdateAddressMutation, useRetrieveAddressQuery, useRetrieveSocialAccountQuery, useUpdateSocialMutation } from '@/redux/features/userApiSlice';
import { toast } from 'react-toastify';

export function useUpdateAddress() {
	const { data: address, isLoading: addressLoading, isFetching} = useRetrieveAddressQuery();
	const [updateProfile, { isLoading }] = useUpdateAddressMutation();
	
	const initialFormData = {
		street: `${address?.street}`, 
		city: `${address?.city}`,
        state: `${address?.state}`,
		postal_code: `${address?.postal_code}`,
        country: `${address?.country}`
	}

  	const [formDataProfile, setFormData] = useState(initialFormData);
	
	const {
		street, 
		city,
        state,
		postal_code,
        country
	} = formDataProfile;

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, type, checked, value } = event.target;
		const newValue = type === 'checkbox' ? checked : value;
		setFormData({...formDataProfile, [name]: newValue});
	};

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		updateProfile({
			street,
            city,
            state,
            postal_code,
            country
		})
			.unwrap()
			.then(() => {
				toast.success('Profile updated successfully');
			})
			.catch(() => {
				toast.error('Profile update failed');
			});
	};
	
	return {
		street,
		city,
        state,
		postal_code,
        country,
		addressLoading,
		isFetching,
		isLoading,
		onChange,
		onSubmit,
	};
}


export function useUpdateSocial() {
	const { data: social, isLoading: socialLoading, isFetching} = useRetrieveSocialAccountQuery();
	const [updateSocial, { isLoading }] = useUpdateSocialMutation();
	
	const initialFormData = {
		platform: '',
		username: '', 
		link: '',
	}

  	const [formDataProfile, setFormData] = useState(initialFormData);
	
	const {
		platform,
		username, 
		link,
	} = formDataProfile;

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, type, checked, value } = event.target;
		const newValue = type === 'checkbox' ? checked : value;
		setFormData({...formDataProfile, [name]: newValue});
	};

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		updateSocial({
			platform,
            username,
            link,
		})
			.unwrap()
			.then(() => {
				toast.success('Successfully Created Social Link.');
			})
			.catch(() => {
				toast.error('Social Link failed to create.');
			});
	};
	
	return {
		platform,
		username, 
		link,
		socialLoading,
		isFetching,
		isLoading,
		social,
		onChange,
		onSubmit,
	};
}

