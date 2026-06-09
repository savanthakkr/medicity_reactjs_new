import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import Input from '../../../components/common/Input';
import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';
import http from '../../../lib/axios/axios';
import FormLayout from '../../../components/common/FormLayout.jsx';

const AddFranchiseType = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const [form, setForm] = useState({
		franchise_type_Name: '',
		franchise_type_Description: ''
	});
	const [loading, setLoading] = useState(false);
	const isEdit = Boolean(id);

	useEffect(() => {
		if (isEdit) {
			const fetchFranchiseType = async () => {
				try {
					const response = await http.post(API.FRANCHISE_TYPES.GET(id));
					if (response?.data) {
						setForm({
							franchise_type_Name: response.data.franchise_type_Name || '',
							franchise_type_Description: response.data.franchise_type_Description || ''
						});
					}
				} catch (error) {
					console.error('Failed to fetch franchise type:', error);
					addToast({ type: 'error', message: 'Failed to fetch franchise type details' });
				}
			};
			fetchFranchiseType();
		}
	}, [id, isEdit, addToast]);

	const onSubmit = async e => {
		e.preventDefault();
		if (loading) return;
		setLoading(true);
		try {
			if (isEdit) {
				const res = await http.post(API.FRANCHISE_TYPES.UPDATE(id), form);
				setLoading(false);
				addToast({ type: 'success', message: res?.data?.msg || 'Franchise type updated successfully' });
				setTimeout(() => {
					navigate(-1);
				}, 500);
			} else {
				const res = await http.post(API.FRANCHISE_TYPES.CREATE, form);
				addToast({ type: 'success', message: res?.data?.msg || 'Franchise type created successfully' });
				setForm({ franchise_type_Name: '', franchise_type_Description: '' }); // Clear form
				setLoading(false);
				setTimeout(() => {
					navigate(-1);
				}, 500);
			}
		} catch (error) {
			console.error('Save failed:', error);
			addToast({ type: 'error', message: error?.response?.data?.message || 'Failed to save franchise type' });
			setLoading(false);
		}
	};

	const set = key => e => setForm(f => ({ ...f, [key]: e?.target ? e.target.value : e }));

	return (
		<FormLayout
			title={isEdit ? 'Edit Franchise Type' : 'Add Franchise Type'}
			backTo={ROUTES.FRANCHISE_TYPES}
			subtitle={isEdit ? 'Update franchise type details.' : 'Add a new franchise type to the system.'}
			onSubmit={onSubmit}
			formId="franchise-type-form"
			loading={loading}
			isEdit={isEdit}
		>
			<div className="flex flex-col gap-[23px]">
				<div className="grid grid-cols-1 gap-[10px] xl:grid-cols-2">
					<Input
						label="Franchise Type Name"
						id="franchise_type_Name"
						placeholder="Enter Franchise Type Name"
						value={form.franchise_type_Name}
						onChange={set('franchise_type_Name')}
						required
					/>
					<div className="col-span-1 xl:col-span-2 flex flex-col">
						<label htmlFor="franchise_type_Description" className="form-label mb-1">
							Description
						</label>
						<textarea
							id="franchise_type_Description"
							placeholder="Enter Description"
							className="form-input"
							rows={4}
							value={form.franchise_type_Description}
							onChange={set('franchise_type_Description')}
						/>
					</div>
				</div>
			</div>
		</FormLayout>
	);
};

export default AddFranchiseType;
