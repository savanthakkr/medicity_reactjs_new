import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import Input from '../../../components/common/Input';
import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';
import http from '../../../lib/axios/axios';
import FormLayout from '../../../components/common/FormLayout.jsx';

const AddCollectionType = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const [form, setForm] = useState({
		collection_type_Name: '',
		collection_type_Description: ''
	});
	const [loading, setLoading] = useState(false);
	const isEdit = Boolean(id);

	useEffect(() => {
		if (isEdit) {
			const fetchCollectionType = async () => {
				try {
					const response = await http.post(API.COLLECTION_TYPES.GET(id));
					if (response?.data) {
						setForm({
							collection_type_Name: response.data.collection_type_Name || '',
							collection_type_Description: response.data.collection_type_Description || ''
						});
					}
				} catch (error) {
					console.error('Failed to fetch collection type:', error);
					addToast({ type: 'error', message: 'Failed to fetch collection type details' });
				}
			};
			fetchCollectionType();
		}
	}, [id, isEdit, addToast]);

	const onSubmit = async e => {
		e.preventDefault();
		if (loading) return;
		setLoading(true);
		try {
			if (isEdit) {
				const res = await http.post(API.COLLECTION_TYPES.UPDATE(id), form);
				setLoading(false);
				addToast({ type: 'success', message: res?.data?.msg || 'Collection type updated successfully' });
				setTimeout(() => {
					navigate(-1);
				}, 500);
			} else {
				const res = await http.post(API.COLLECTION_TYPES.CREATE, form);
				addToast({ type: 'success', message: res?.data?.msg || 'Collection type created successfully' });
				setForm({ collection_type_Name: '', collection_type_Description: '' }); // Clear form
				setLoading(false);
				setTimeout(() => {
					navigate(-1);
				}, 500);
			}
		} catch (error) {
			console.error('Save failed:', error);
			addToast({ type: 'error', message: error?.response?.data?.message || 'Failed to save collection type' });
			setLoading(false);
		}
	};

	const set = key => e => setForm(f => ({ ...f, [key]: e?.target ? e.target.value : e }));

	return (
		<FormLayout
			title={isEdit ? 'Edit Collection Type' : 'Add Collection Type'}
			backTo={ROUTES.COLLECTION_TYPES}
			subtitle={isEdit ? 'Update collection type details.' : 'Add a new collection type to the system.'}
			onSubmit={onSubmit}
			formId="collection-type-form"
			loading={loading}
			isEdit={isEdit}
		>
			<div className="flex flex-col gap-[23px]">
				<div className="grid grid-cols-1 gap-[10px] xl:grid-cols-2">
					<Input
						label="Collection Type Name"
						id="collection_type_Name"
						placeholder="Enter Name"
						value={form.collection_type_Name}
						onChange={set('collection_type_Name')}
						required
					/>
					<Input
						label="Description"
						id="collection_type_Description"
						placeholder="Enter Description"
						value={form.collection_type_Description}
						onChange={set('collection_type_Description')}
					/>
				</div>
			</div>
		</FormLayout>
	);
};

export default AddCollectionType;
