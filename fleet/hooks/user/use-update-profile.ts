import { useState, FormEvent } from 'react';
import { useUpdateProfileMutation, useUpdateProfileImageMutation, useRetrieveProfileQuery, useRetrieveProfileImageQuery } from '@/redux/features/userApiSlice';
import { toast } from 'react-toastify';

export function useUpdateProfile() {
	const { data: profile, isLoading: profileLoading, isFetching} = useRetrieveProfileQuery();
	const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  	const [formDataProfile, setFormData] = useState(
		{
			bio: `${profile?.bio}`,
			phone_number: `${profile?.phone_number}`,
			website: `${profile?.website}`,
			location: `${profile?.location}`,
			date_of_birth: `${profile?.date_of_birth}`,
			language: `${profile?.language}`,
		}
	);
	
	const {
		bio,
		phone_number,
		website,
		location,
		date_of_birth,
		language,
	} = formDataProfile;

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, type, checked, value } = event.target;
		const newValue = type === 'checkbox' ? checked : value;
		if (type === 'date') {
			formDataProfile.date_of_birth = event.target.valueAsDate?.toISOString().split('T')[0] ?? '';
		}
		setFormData({...formDataProfile, [name]: newValue});
	};
	
	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		updateProfile({
			bio,
			phone_number,
			website,
			location,
			date_of_birth,
			language,
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
		bio,
		phone_number,
		website,
		location,
		date_of_birth,
		language,
		profileLoading,
		isFetching,
		isLoading,
		onChange,
		onSubmit,
	};
}


export function useUpdateImage() {
	const { data: profile, isLoading: profileLoading, isFetching} = useRetrieveProfileImageQuery();
	const [updateProfile, { isLoading }] = useUpdateProfileImageMutation();
	
	const initialFormData = {
		background_image: `${profile?.background_image}`,
		profile_picture: `${profile?.profile_picture}`,
		avatar: `${profile?.avatar}`,
	}

	const image = {
		background_image: `${profile?.background_image}`,
		profile_picture: `${profile?.profile_picture}`,
		avatar: `${profile?.avatar}`,
	}


  	const [formDataProfile, setFormData] = useState(initialFormData);
	
	const {
		background_image,
		profile_picture,
		avatar,
	} = formDataProfile;

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, type, checked, value } = event.target;
		const newValue = type === 'checkbox' ? checked : value;
		console.log(value)
		setFormData({...formDataProfile, [name]: newValue});
	};

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		updateProfile({
			background_image,
			profile_picture,
			avatar,
		})
			.unwrap()
			.then(() => {
				toast.success('Profile images updated successfully');
			})
			.catch(() => {
				toast.error('Profile images update failed!');
			});
	};
	
	return {
		background_image,
		image,
		profile_picture,
		avatar,
		profileLoading,
		isFetching,
		isLoading,
		onChange,
		onSubmit,
	};
}
