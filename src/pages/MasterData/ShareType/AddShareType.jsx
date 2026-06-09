import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';
import http from '../../../lib/axios/axios';
import Input from '../../../components/common/Input.jsx';
import TextArea from '../../../components/common/TextArea.jsx';
import FormLayout from '../../../components/common/FormLayout.jsx';

const AddShareType = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const [fetching, setFetching] = useState(false);
	const [loading, setLoading] = useState(false);

	const [form, setForm] = useState({
		share_type_Name: '',
		share_type_Description: ''
	});

	useEffect(() => {
		if (id) {
			const fetchShareType = async () => {
				setFetching(true);
				try {
					const response = await http.post(API.SHARE_TYPES.GET(id));
					if (response.data) {
						setForm({
							share_type_Name: response.data.share_type_Name || '',
							share_type_Description: response.data.share_type_Description || ''
						});
					}
				} catch (error) {
					console.error('Fetch failed:', error);
					addToast({ type: 'error', message: 'Failed to fetch details' });
				} finally {
					setFetching(false);
				}
			};
			fetchShareType();
		}
	}, [id, addToast]);

	const handleChange = e => {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async e => {
		e.preventDefault();
		setLoading(true);
		try {
			if (id) {
				const res = await http.post(API.SHARE_TYPES.UPDATE(id), form);
				setLoading(false);
				addToast({ type: 'success', message: res?.data?.msg || 'Share type updated successfully' });
				setTimeout(() => {
					navigate(-1);
				}, 500);
			} else {
				const res = await http.post(API.SHARE_TYPES.CREATE, form);
				addToast({ type: 'success', message: res?.data?.msg || 'Share type created successfully' });
				setLoading(false);
				setTimeout(() => {
					navigate(-1);
				}, 500);
			}
		} catch (error) {
			console.error('Save failed:', error);
			addToast({
				type: 'error',
				message: error?.response?.data?.msg || error?.response?.data?.message || 'Operation failed'
			});
			setLoading(false);
		}
	};

	if (fetching) return <div className="p-10 text-center text-text-2 font-medium">Loading details...</div>;

	return (
		<FormLayout
			title={id ? 'Edit Share Type' : 'Add Share Type'}
			backTo={ROUTES.SHARE_TYPE_LIST}
			subtitle={id ? 'Update share type details.' : 'Add a new share type to the system.'}
			onSubmit={handleSubmit}
			formId="share-type-form"
			loading={loading}
			isEdit={Boolean(id)}
		>
			<div className="flex flex-col gap-[23px]">
				<Input
					label="Share Type Name"
					name="share_type_Name"
					id="share_type_Name"
					value={form.share_type_Name}
					onChange={handleChange}
					placeholder="Enter share type"
					required
				/>

				<TextArea
					label="Description"
					id="share_type_Description"
					name="share_type_Description"
					value={form.share_type_Description}
					onChange={handleChange}
					rows={4}
					placeholder="Provide a brief description..."
				/>
			</div>
		</FormLayout>
	);
};

export default AddShareType;
