import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import Input from '../../../components/common/Input';
import TextArea from '../../../components/common/TextArea';
import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';
import http from '../../../lib/axios/axios';
import FormLayout from '../../../components/common/FormLayout.jsx';
import { usePermissions } from '../../../hooks/usePermissions';
import { PERM } from '../../../utils/constants/permissionKey2';
import Unauthorized from '../../Unauthorized';

const emptyForm = {
	degree_Name: '',
	degree_Description: ''
};

const AddDegree = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const { canAll } = usePermissions();
	const isEdit = Boolean(id);

	const canAdd = canAll(PERM.DEGREE.LIST, PERM.DEGREE.ADD);
	const canEdit = canAll(PERM.DEGREE.LIST, PERM.DEGREE.EDIT);

	const [form, setForm] = useState(emptyForm);
	const [loading, setLoading] = useState(false);

	if (isEdit && !canEdit) {
		return <Unauthorized />;
	}

	if (!isEdit && !canAdd) {
		return <Unauthorized />;
	}

	useEffect(() => {
		if (isEdit) {
			const fetchDegree = async () => {
				try {
					const response = await http.post(API.DEGREES.GET(id));
					if (response?.data) {
						setForm({
							degree_Name: response.data.degree_Name || '',
							degree_Description: response.data.degree_Description || ''
						});
					}
				} catch (error) {
					console.error('Failed to fetch degree:', error);
					const apiMessage = error?.response?.data?.msg || error?.response?.data?.message;
					addToast({ type: 'error', message: apiMessage || 'Failed to fetch degree details' });
				}
			};
			fetchDegree();
		}
	}, [id, isEdit, addToast]);

	const onSubmit = async e => {
		e.preventDefault();
		if (loading) return;
		setLoading(true);
		try {
			if (isEdit) {
				const res = await http.post(API.DEGREES.UPDATE(id), form);
				addToast({ type: 'success', message: res?.data?.msg || 'Degree updated successfully' });
				setTimeout(() => {
					navigate(-1);
				}, 500);
			} else {
				const res = await http.post(API.DEGREES.CREATE, form);
				addToast({ type: 'success', message: res?.data?.msg || 'Degree created successfully' });
				setForm(emptyForm);
				setTimeout(() => {
					navigate(-1);
				}, 500);
			}
		} catch (error) {
			console.error('Save failed:', error);
			addToast({
				type: 'error',
				message: error?.response?.data?.msg || error?.response?.data?.message || 'Failed to save degree'
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<FormLayout
			title={isEdit ? 'Edit Degree' : 'Add Degree'}
			backTo={ROUTES.DOCTOR_MASTER_DEGREE}
			subtitle={isEdit ? 'Update degree details.' : 'Add a new degree to the system.'}
			onSubmit={onSubmit}
			formId="degree-form"
			loading={loading}
			isEdit={isEdit}
			>
			<div className="flex flex-col gap-[23px]">
				<div className="grid grid-cols-1 gap-[10px] xl:grid-cols-2">
					<Input
						label="Degree Name"
						id="degreeName"
						placeholder="Enter Degree Name"
						value={form.degree_Name}
						onChange={e => setForm(prev => ({ ...prev, degree_Name: e.target.value }))}
						required
					/>
					<TextArea
						label="Description"
						id="degree_Description"
						placeholder="Enter Description"
						value={form.degree_Description}
						onChange={e => setForm(prev => ({ ...prev, degree_Description: e.target.value }))}
						rows={3}
					/>
				</div>
			</div>
		</FormLayout>
	);
};

export default AddDegree;
