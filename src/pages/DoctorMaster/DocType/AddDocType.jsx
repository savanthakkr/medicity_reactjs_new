import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import Input from '../../../components/common/Input';
import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';
import http from '../../../lib/axios/axios';
import FormLayout from '../../../components/common/FormLayout.jsx';
import { usePermissions } from '../../../hooks/usePermissions';
import { PERM } from '../../../utils/constants/permissionKey2';
import Unauthorized from '../../Unauthorized';

const emptyForm = {
	doc_type_Name: '',
	doc_type_Description: ''
};

const AddDocType = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const { canAll } = usePermissions();
	const [form, setForm] = useState(emptyForm);
	const [loading, setLoading] = useState(false);
	const isEdit = Boolean(id);

	const canAdd = canAll(PERM.DOCTOR_TYPE.LIST, PERM.DOCTOR_TYPE.ADD);
	const canEdit = canAll(PERM.DOCTOR_TYPE.LIST, PERM.DOCTOR_TYPE.EDIT);

	if (isEdit && !canEdit) {
		return <Unauthorized />;
	}

	if (!isEdit && !canAdd) {
		return <Unauthorized />;
	}

	useEffect(() => {
		if (isEdit) {
			const fetchDocType = async () => {
				try {
					const response = await http.post(API.DOC_TYPE.GET(id));
					if (response?.data) {
						setForm({
							doc_type_Name: response.data.doc_type_Name || '',
							doc_type_Description: response.data.doc_type_Description || ''
						});
					}
				} catch (error) {
					console.error('Failed to fetch doctor type:', error);
					addToast({ type: 'error', message: 'Failed to fetch doctor type details' });
				}
			};
			fetchDocType();
		}
	}, [id, isEdit, addToast]);

	const set = key => e => setForm(f => ({ ...f, [key]: e?.target ? e.target.value : e }));

	const onSubmit = async e => {
		e.preventDefault();
		if (loading) return;
		setLoading(true);
		try {
			if (isEdit) {
				await http.post(API.DOC_TYPE.UPDATE(id), form);
				setLoading(false);
				addToast({ type: 'success', message: 'Doctor type updated successfully' });
				setTimeout(() => {
					navigate(-1);
				}, 500);
			} else {
				await http.post(API.DOC_TYPE.CREATE, form);
				addToast({ type: 'success', message: 'Doctor type created successfully' });
				setForm(emptyForm);
				setLoading(false);
				navigate(ROUTES.DOCTOR_MASTER_DOC_TYPE);
			}
		} catch (error) {
			console.error('Save failed:', error);
			addToast({
				type: 'error',
				message: error?.response?.data?.msg || error?.response?.data?.message || 'Failed to save doctor type'
			});
			setLoading(false);
		}
	};

	return (
		<FormLayout
			title={isEdit ? 'Edit Doctor Type' : 'Add Doctor Type'}
			backTo={ROUTES.DOCTOR_MASTER_DOC_TYPE}
			subtitle={isEdit ? 'Update doctor type details.' : 'Add a new doctor type to the system.'}
			onSubmit={onSubmit}
			formId="doctor-type-form"
			loading={loading}
			isEdit={isEdit}
		>
			<div className="flex flex-col gap-[23px]">
				<div className="grid grid-cols-1 gap-[10px] xl:grid-cols-2">
					<Input
						label="Name"
						id="doc_type_Name"
						placeholder="e.g. Visiting, Resident, Consultant"
						value={form.doc_type_Name}
						onChange={set('doc_type_Name')}
						required
					/>
					<Input
						label="Description"
						id="doc_type_Description"
						placeholder="Enter Description"
						value={form.doc_type_Description}
						onChange={set('doc_type_Description')}
					/>
				</div>
			</div>
		</FormLayout>
	);
};

export default AddDocType;
