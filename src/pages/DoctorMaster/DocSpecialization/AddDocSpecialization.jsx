import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import Input from '../../../components/common/Input';
import AutoComplete from '../../../components/dropdown/AutoComplete.jsx';
import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';
import http from '../../../lib/axios/axios';
import { useAutoRevalidate } from '../../../hooks/useAutoRevalidate';
import FormLayout from '../../../components/common/FormLayout.jsx';
import { usePermissions } from '../../../hooks/usePermissions';
import { PERM } from '../../../utils/constants/permissionKey2';
import Unauthorized from '../../Unauthorized';

const emptyForm = {
	doc_specialization_master_Code: '',
	doc_specialization_master_Name: '',
	doc_specialization_master_Description: '',
	department_Id: ''
};

const generateSpecializationCode = name => {
	const cleaned = String(name || '')
		.replace(/[^A-Za-z0-9]/g, '')
		.toUpperCase();

	return cleaned.substring(0, 10);
};

const AddDocSpecialization = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const { canAll } = usePermissions();
	const [form, setForm] = useState(emptyForm);
	const [loading, setLoading] = useState(false);
	const [codeTouched, setCodeTouched] = useState(false);
	const isEdit = Boolean(id);

	const canAdd = canAll(PERM.SPECIALIZATION.LIST, PERM.SPECIALIZATION.ADD);
	const canEdit = canAll(PERM.SPECIALIZATION.LIST, PERM.SPECIALIZATION.EDIT);

	if (isEdit && !canEdit) {
		return <Unauthorized />;
	}

	if (!isEdit && !canAdd) {
		return <Unauthorized />;
	}

	// Fetch all departments for the dropdown
	const { data: departmentsData } = useAutoRevalidate(API.DEPARTMENTS.LIST, { limit: 1000, is_active: 1 });
	const departmentOptions = (departmentsData?.list || []).map(d => ({
		value: String(d.department_Id),
		label: d.department_Name
	}));

	useEffect(() => {
		if (isEdit) {
			const fetchSpecialization = async () => {
				try {
					const response = await http.post(API.DOC_SPECIALIZATION_MASTER.GET(id));
					if (response?.data) {
						setForm({
							doc_specialization_master_Code: response.data.doc_specialization_master_Code || '',
							doc_specialization_master_Name: response.data.doc_specialization_master_Name || '',
							doc_specialization_master_Description: response.data.doc_specialization_master_Description || '',
							department_Id: response.data.department_Id || ''
						});
					}
				} catch (error) {
					console.error('Failed to fetch specialization:', error);
					addToast({ type: 'error', message: 'Failed to fetch specialization details' });
				}
			};
			fetchSpecialization();
		}
	}, [id, isEdit, addToast]);

	useEffect(() => {
		if (isEdit || codeTouched) return;

		setForm(prev => ({
			...prev,
			doc_specialization_master_Code: generateSpecializationCode(prev.doc_specialization_master_Name)
		}));
	}, [form.doc_specialization_master_Name, codeTouched, isEdit]);

	const set = key => e => setForm(f => ({ ...f, [key]: e?.target ? e.target.value : e }));

	const onSubmit = async e => {
		e.preventDefault();
		if (loading) return;
		setLoading(true);
		try {
			if (isEdit) {
				await http.post(API.DOC_SPECIALIZATION_MASTER.UPDATE(id), form);
				setLoading(false);
				addToast({ type: 'success', message: 'Specialization updated successfully' });
				setTimeout(() => {
					navigate(-1);
				}, 500);
			} else {
				await http.post(API.DOC_SPECIALIZATION_MASTER.CREATE, form);
				addToast({ type: 'success', message: 'Specialization created successfully' });
				setForm(emptyForm);
				setLoading(false);
				navigate(ROUTES.DOCTOR_MASTER_SPECIALIZATION);
			}
		} catch (error) {
			console.error('Save failed:', error);
			addToast({
				type: 'error',
				message: error?.response?.data?.msg || error?.response?.data?.message || 'Failed to save specialization'
			});
			setLoading(false);
		}
	};

	return (
		<FormLayout
			title={isEdit ? 'Edit Specialization' : 'Add Specialization'}
			backTo={ROUTES.DOCTOR_MASTER_SPECIALIZATION}
			subtitle={isEdit ? 'Update specialization details.' : 'Add a new specialization to the system.'}
			onSubmit={onSubmit}
			formId="specialization-form"
			loading={loading}
			isEdit={isEdit}
		>
			<div className="flex flex-col gap-[23px]">
				<div className="grid grid-cols-1 gap-[10px] xl:grid-cols-2">
					<Input
						label="Specialization Code"
						id="doc_specialization_master_Code"
						placeholder="Auto-generated from name"
						value={form.doc_specialization_master_Code}
						onChange={e => {
							setCodeTouched(true);
							set('doc_specialization_master_Code')(e);
						}}
						required
						disabled={isEdit}
					/>
					<Input
						label="Specialization Name"
						id="doc_specialization_master_Name"
						placeholder="e.g. Cardiology, Neurology"
						value={form.doc_specialization_master_Name}
						onChange={set('doc_specialization_master_Name')}
						required
					/>
					<div className="flex flex-col">
						<label className="form-label">
							Department <span className="text-red-500 ml-0.5">*</span>
						</label>
						<AutoComplete
							options={departmentOptions}
							value={departmentOptions.find(option => option.value === String(form.department_Id)) || null}
							placeholder="Select Department"
							onChange={(_, selectedOption) => {
								setForm(prev => ({
									...prev,
									department_Id: selectedOption?.value || ''
								}));
							}}
						/>
					</div>
					<Input
						label="Description"
						id="doc_specialization_master_Description"
						placeholder="Enter Description"
						value={form.doc_specialization_master_Description}
						onChange={set('doc_specialization_master_Description')}
					/>
				</div>
			</div>
		</FormLayout>
	);
};

export default AddDocSpecialization;
