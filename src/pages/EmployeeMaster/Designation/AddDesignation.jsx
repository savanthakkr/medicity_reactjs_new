import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';
import http from '../../../lib/axios/axios';
import { useAutoRevalidate } from '../../../hooks/useAutoRevalidate';
import FormLayout from '../../../components/common/FormLayout.jsx';
import Unauthorized from '../../Unauthorized';
import { usePermissions } from '../../../hooks/usePermissions';
import { PERM } from '../../../utils/constants/permissionKeys';

const emptyForm = {
	designation_Name: '',
	designation_Description: '',
	department_Id: ''
};

const AddDesignation = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const { canAll } = usePermissions();
	const [form, setForm] = useState(emptyForm);
	const [loading, setLoading] = useState(false);
	const isEdit = Boolean(id);

	const canAdd = canAll(PERM.DESIGNATION.LIST, PERM.DESIGNATION.ADD);
	const canEdit = canAll(PERM.DESIGNATION.LIST, PERM.DESIGNATION.EDIT);

	// Fetch all departments for the dropdown
	const { data: departmentsData } = useAutoRevalidate(API.DEPARTMENTS.LIST, { limit: 1000, is_active: 1 });
	const departmentOptions = (departmentsData?.list || []).map(d => ({
		value: d.department_Id,
		label: d.department_Name
	}));

	useEffect(() => {
		if (isEdit) {
			const fetchDesig = async () => {
				try {
					const response = await http.post(API.DESIGNATIONS.GET(id));
					if (response?.data) {
						setForm({
							designation_Name: response.data.designation_Name || '',
							designation_Description: response.data.designation_Description || '',
							department_Id: response.data.department_Id || ''
						});
					}
				} catch (error) {
					console.error('Failed to fetch designation:', error);
					addToast({ type: 'error', message: 'Failed to fetch designation details' });
				}
			};
			fetchDesig();
		}
	}, [id, isEdit, addToast]);

	if (isEdit && !canEdit) {
		return <Unauthorized />;
	}

	if (!isEdit && !canAdd) {
		return <Unauthorized />;
	}

	const set = key => e => setForm(f => ({ ...f, [key]: e?.target ? e.target.value : e }));

	const onSubmit = async e => {
		e.preventDefault();
		if (loading) return;
		setLoading(true);
		try {
			if (isEdit) {
				await http.post(API.DESIGNATIONS.UPDATE(id), form);
				setLoading(false);
				addToast({ type: 'success', message: 'Designation updated successfully' });
				setTimeout(() => {
					navigate(-1);
				}, 500);
			} else {
				await http.post(API.DESIGNATIONS.CREATE, form);
				addToast({ type: 'success', message: 'Designation created successfully' });
				setForm(emptyForm);
				setLoading(false);
			}
		} catch (error) {
			console.error('Save failed:', error);
			addToast({ type: 'error', message: 'Failed to save designation' });
			setLoading(false);
		}
	};

	return (
		<FormLayout
			title={isEdit ? 'Edit Designation' : 'Add Designation'}
			backTo={ROUTES.DESIGNATIONS}
			subtitle={isEdit ? 'Update designation details.' : 'Add a new designation to the system.'}
			onSubmit={onSubmit}
			formId="desig-form"
			loading={loading}
			isEdit={isEdit}
		>
			<div className="flex flex-col gap-[23px]">
				<div className="grid grid-cols-1 gap-[10px] xl:grid-cols-2">
					<Input
						label="Designation Name"
						id="designation_Name"
						placeholder="Enter Designation Name"
						value={form.designation_Name}
						onChange={set('designation_Name')}
						required
					/>
					<Select
						label="Department"
						id="department_Id"
						value={form.department_Id}
						onChange={set('department_Id')}
						options={departmentOptions}
						placeholder="Select Department"
					/>
					<Input
						label="Description"
						id="designation_Description"
						placeholder="Enter Description"
						value={form.designation_Description}
						onChange={set('designation_Description')}
					/>
				</div>
			</div>
		</FormLayout>
	);
};

export default AddDesignation;
