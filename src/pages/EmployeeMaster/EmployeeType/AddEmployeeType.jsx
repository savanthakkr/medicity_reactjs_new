import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';
import http from '../../../lib/axios/axios';
import Input from '../../../components/common/Input.jsx';
import FormLayout from '../../../components/common/FormLayout.jsx';

const AddEmployeeType = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const [fetching, setFetching] = useState(false);
	const [loading, setLoading] = useState(false);

	const [form, setForm] = useState({
		employee_type_Name: '',
		employee_type_Description: ''
	});

	useEffect(() => {
		if (id) {
			const fetchEmployeeType = async () => {
				setFetching(true);
				try {
					const response = await http.post(API.EMPLOYEE_TYPES.GET(id));
					if (response.data) {
						setForm({
							employee_type_Name: response.data.employee_type_Name || '',
							employee_type_Description: response.data.employee_type_Description || ''
						});
					}
				} catch (error) {
					console.error('Fetch failed:', error);
					addToast({ type: 'error', message: 'Failed to fetch details' });
				} finally {
					setFetching(false);
				}
			};
			fetchEmployeeType();
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
				await http.post(API.EMPLOYEE_TYPES.UPDATE(id), form);
				setLoading(false);
				addToast({ type: 'success', message: 'Employee Type updated successfully' });
				setTimeout(() => {
					navigate(-1);
				}, 500);
			} else {
				await http.post(API.EMPLOYEE_TYPES.CREATE, form);
				addToast({ type: 'success', message: 'Employee Type created successfully' });
				navigate(ROUTES.EMPLOYEE_TYPES);
				setLoading(false);
			}
		} catch (error) {
			console.error('Save failed:', error);
			addToast({ type: 'error', message: 'Operation failed' });
			setLoading(false);
		}
	};

	if (fetching) return <div className="p-10 text-center text-text-2 font-medium">Loading details...</div>;

	return (
		<FormLayout
			title={id ? 'Edit Employee Type' : 'Add Employee Type'}
			backTo={ROUTES.EMPLOYEE_TYPES}
			subtitle={id ? 'Update employee type details.' : 'Add a new employee type to the system.'}
			onSubmit={handleSubmit}
			formId="employee-type-form"
			loading={loading}
			isEdit={Boolean(id)}
		>
			<div className="flex flex-col gap-[23px]">
				<Input
					label="Employee Type Name"
					name="employee_type_Name"
					id="employee_type_Name"
					value={form.employee_type_Name}
					onChange={handleChange}
					placeholder="e.g. Full-Time, Contract"
					required
				/>

				<div className="flex flex-col gap-[8px]">
					<label htmlFor="employee_type_Description" className="text-p2 font-semibold text-text-2">
						Description
					</label>
					<textarea
						id="employee_type_Description"
						name="employee_type_Description"
						value={form.employee_type_Description}
						onChange={handleChange}
						rows={4}
						className="w-full rounded-[6px] border border-divider bg-card p-[10px] text-p1 text-text-1 outline-none focus:border-brand-light placeholder:text-text-disabled"
						placeholder="Provide a brief description of the employee type..."
					/>
				</div>
			</div>
		</FormLayout>
	);
};

export default AddEmployeeType;
