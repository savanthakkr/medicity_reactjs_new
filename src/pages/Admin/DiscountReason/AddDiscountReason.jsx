import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import Input from '../../../components/common/Input';
import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';
import http from '../../../lib/axios/axios';
import FormLayout from '../../../components/common/FormLayout.jsx';

const AddDiscountReason = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const [form, setForm] = useState({
		discount_reason_Name: '',
		discount_reason_Description: ''
	});
	const [loading, setLoading] = useState(false);
	const isEdit = Boolean(id);

	useEffect(() => {
		if (isEdit) {
			const fetchDiscountReason = async () => {
				try {
					const response = await http.post(API.DISCOUNT_REASONS.GET(id));
					if (response?.data) {
						setForm({
							discount_reason_Name: response.data.discount_reason_Name || '',
							discount_reason_Description: response.data.discount_reason_Description || ''
						});
					}
				} catch (error) {
					console.error('Failed to fetch discount reason:', error);
					addToast({ type: 'error', message: 'Failed to fetch discount reason details' });
				}
			};
			fetchDiscountReason();
		}
	}, [id, isEdit, addToast]);

	const onSubmit = async e => {
		e.preventDefault();
		if (loading) return;
		setLoading(true);
		try {
			if (isEdit) {
				const res = await http.post(API.DISCOUNT_REASONS.UPDATE(id), form);
				setLoading(false);
				addToast({ type: 'success', message: res?.data?.msg || 'Discount reason updated successfully' });
				setTimeout(() => {
					navigate(-1);
				}, 500);
			} else {
				const res = await http.post(API.DISCOUNT_REASONS.CREATE, form);
				addToast({ type: 'success', message: res?.data?.msg || 'Discount reason created successfully' });
				setForm({ discount_reason_Name: '', discount_reason_Description: '' }); // Clear form
				setLoading(false);
				setTimeout(() => {
					navigate(-1);
				}, 500);
			}
		} catch (error) {
			console.error('Save failed:', error);
			addToast({ type: 'error', message: error?.response?.data?.message || 'Failed to save discount reason' });
			setLoading(false);
		}
	};

	const set = key => e => setForm(f => ({ ...f, [key]: e?.target ? e.target.value : e }));

	return (
		<FormLayout
			title={isEdit ? 'Edit Discount Reason' : 'Add Discount Reason'}
			backTo={ROUTES.DISCOUNT_REASONS}
			subtitle={isEdit ? 'Update discount reason details.' : 'Add a new discount reason to the system.'}
			onSubmit={onSubmit}
			formId="discount-reason-form"
			loading={loading}
			isEdit={isEdit}
		>
			<div className="flex flex-col gap-[23px]">
				<div className="grid grid-cols-1 gap-[10px] xl:grid-cols-2">
					<Input
						label="Discount Reason Name"
						id="discount_reason_Name"
						placeholder="Enter Name"
						value={form.discount_reason_Name}
						onChange={set('discount_reason_Name')}
						required
					/>
					<Input
						label="Description"
						id="discount_reason_Description"
						placeholder="Enter Description"
						value={form.discount_reason_Description}
						onChange={set('discount_reason_Description')}
					/>
				</div>
			</div>
		</FormLayout>
	);
};

export default AddDiscountReason;
