import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';

import { addToastAtom } from '../../../data/states/toastAtom';

import Input from '../../../components/common/Input';
import FormLayout from '../../../components/common/FormLayout.jsx';

import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';

import http from '../../../lib/axios/axios';

const AddDepartmentType = () => {
	const { id } = useParams();

	const navigate = useNavigate();

	const addToast = useSetAtom(addToastAtom);

	const [form, setForm] = useState({
		department_type_Name: '',
		department_type_Description: ''
	});

	const [loading, setLoading] = useState(false);

	const isEdit = Boolean(id);

	useEffect(() => {
		if (isEdit) {
			const fetchDepartmentType = async () => {
				try {
					const response = await http.post(API.DEPARTMENT_TYPES.GET(id));

					if (response?.data) {
						setForm({
							department_type_Name: response.data.department_type_Name || '',

							department_type_Description: response.data.department_type_Description || ''
						});
					}
				} catch (error) {
					console.error('Failed to fetch department type:', error);

					addToast({
						type: 'error',
						message: 'Failed to fetch department type details'
					});
				}
			};

			fetchDepartmentType();
		}
	}, [id, isEdit, addToast]);

	const onSubmit = async e => {
		e.preventDefault();

		if (loading) return;

		setLoading(true);

		try {
			if (isEdit) {
				const res = await http.post(API.DEPARTMENT_TYPES.UPDATE(id), form);

				addToast({
					type: 'success',
					message: res?.data?.msg || 'Department type updated successfully'
				});

				setTimeout(() => {
					navigate(-1);
				}, 500);
			} else {
				const res = await http.post(API.DEPARTMENT_TYPES.CREATE, {
					inputData: form
				});

				addToast({
					type: 'success',
					message: res?.data?.msg || 'Department type created successfully'
				});

				setForm({
					department_type_Name: '',
					department_type_Description: ''
				});
			}
		} catch (error) {
			console.error('Save failed:', error);

			addToast({
				type: 'error',
				message: error?.response?.data?.message || 'Failed to save department type'
			});
		} finally {
			setLoading(false);
		}
	};

	const set = key => e =>
		setForm(f => ({
			...f,
			[key]: e?.target ? e.target.value : e
		}));

	return (
		<FormLayout
			title={isEdit ? 'Edit Department Type' : 'Add Department Type'}
			backTo={ROUTES.DEPARTMENT_TYPES}
			subtitle={isEdit ? 'Update department type details.' : 'Add a new department type to the system.'}
			onSubmit={onSubmit}
			formId="department-type-form"
			loading={loading}
			isEdit={isEdit}
		>
			<div className="grid grid-cols-1 gap-[10px] xl:grid-cols-2">
				<Input
					label="Department Type Name"
					id="department_type_Name"
					placeholder="Enter Department Type Name"
					value={form.department_type_Name}
					onChange={set('department_type_Name')}
					required
				/>

				<Input
					label="Description"
					id="department_type_Description"
					placeholder="Enter Description"
					value={form.department_type_Description}
					onChange={set('department_type_Description')}
				/>
			</div>
		</FormLayout>
	);
};

export default AddDepartmentType;
