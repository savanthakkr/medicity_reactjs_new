import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import Input from '../../../components/common/Input';
import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';
import http from '../../../lib/axios/axios';
import FormLayout from '../../../components/common/FormLayout.jsx';
import Unauthorized from '../../Unauthorized';
import { usePermissions } from '../../../hooks/usePermissions';
import { PERM } from '../../../utils/constants/permissionKeys';

const AddDepartment = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const { canAll } = usePermissions();
	const [form, setForm] = useState({ department_Name: '', department_Description: '' });
	const [loading, setLoading] = useState(false);
	const isEdit = Boolean(id);

	const canAdd = canAll(PERM.DEPARTMENT.LIST, PERM.DEPARTMENT.ADD);
	const canEdit = canAll(PERM.DEPARTMENT.LIST, PERM.DEPARTMENT.EDIT);

	useEffect(() => {
		if (isEdit) {
			const fetchDept = async () => {
				try {
					const response = await http.post(API.DEPARTMENTS.GET(id));
					if (response?.data) {
						setForm({
							department_Name: response.data.department_Name || '',
							department_Description: response.data.department_Description || ''
						});
					}
				} catch (error) {
					console.error('Failed to fetch department:', error);
					addToast({ type: 'error', message: 'Failed to fetch department details' });
				}
			};
			fetchDept();
		}
	}, [id, isEdit, addToast]);

	if (isEdit && !canEdit) {
		return <Unauthorized />;
	}

	if (!isEdit && !canAdd) {
		return <Unauthorized />;
	}

	const onSubmit = async e => {
		e.preventDefault();
		if (loading) return;
		setLoading(true);
		try {
			if (isEdit) {
				await http.post(API.DEPARTMENTS.UPDATE(id), form);
				setLoading(false);
				addToast({ type: 'success', message: 'Department updated successfully' });
				setTimeout(() => {
					navigate(-1);
				}, 500);
			} else {
				await http.post(API.DEPARTMENTS.CREATE, form);
				addToast({ type: 'success', message: 'Department created successfully' });
				setForm({ department_Name: '', department_Description: '' }); // Clear form
				setLoading(false);
			}
		} catch (error) {
			console.error('Save failed:', error);
			addToast({ type: 'error', message: 'Failed to save department' });
			setLoading(false);
		}
	};

	const set = key => e => setForm(f => ({ ...f, [key]: e?.target ? e.target.value : e }));

	return (
		<FormLayout
			title={isEdit ? 'Edit Department' : 'Add Department'}
			backTo={ROUTES.DEPARTMENTS}
			subtitle={isEdit ? 'Update department details.' : 'Add a new department to the system.'}
			onSubmit={onSubmit}
			formId="dept-form"
			loading={loading}
			isEdit={isEdit}
		>
			<div className="flex flex-col gap-[23px]">
				<div className="grid grid-cols-1 gap-[10px] xl:grid-cols-2">
					<Input
						label="Department Name"
						id="department_Name"
						placeholder="Enter Department Name"
						value={form.department_Name}
						onChange={set('department_Name')}
						required
					/>
					<Input
						label="Description"
						id="department_Description"
						placeholder="Enter Description"
						value={form.department_Description}
						onChange={set('department_Description')}
					/>
				</div>
			</div>
		</FormLayout>
	);
};

export default AddDepartment;
