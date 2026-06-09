import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import Input from '../../../components/common/Input';
import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';
import http from '../../../lib/axios/axios';
import FormLayout from '../../../components/common/FormLayout.jsx';

const AddReportRole = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const [form, setForm] = useState({
		report_role_Name: '',
		report_role_Description: ''
	});
	const [loading, setLoading] = useState(false);
	const isEdit = Boolean(id);

	useEffect(() => {
		if (isEdit) {
			const fetchReportRole = async () => {
				try {
					const response = await http.post(API.REPORT_ROLES.GET(id));
					if (response?.data) {
						setForm({
							report_role_Name: response.data.report_role_Name || '',
							report_role_Description: response.data.report_role_Description || ''
						});
					}
				} catch (error) {
					console.error('Failed to fetch report role:', error);
					addToast({ type: 'error', message: 'Failed to fetch report role details' });
				}
			};
			fetchReportRole();
		}
	}, [id, isEdit, addToast]);

	const onSubmit = async e => {
		e.preventDefault();
		if (loading) return;
		setLoading(true);
		try {
			if (isEdit) {
				const res = await http.post(API.REPORT_ROLES.UPDATE(id), form);
				setLoading(false);
				addToast({ type: 'success', message: res?.data?.msg || 'Report role updated successfully' });
				setTimeout(() => {
					navigate(-1);
				}, 500);
			} else {
				const res = await http.post(API.REPORT_ROLES.CREATE, form);
				addToast({ type: 'success', message: res?.data?.msg || 'Report role created successfully' });
				setForm({ report_role_Name: '', report_role_Description: '' }); // Clear form
				setLoading(false);
				setTimeout(() => {
					navigate(-1);
				}, 500);
			}
		} catch (error) {
			console.error('Save failed:', error);
			addToast({ type: 'error', message: error?.response?.data?.message || 'Failed to save report role' });
			setLoading(false);
		}
	};

	const set = key => e => setForm(f => ({ ...f, [key]: e?.target ? e.target.value : e }));

	return (
		<FormLayout
			title={isEdit ? 'Edit Report Role' : 'Add Report Role'}
			backTo={ROUTES.REPORT_ROLES}
			subtitle={isEdit ? 'Update report role details.' : 'Add a new report role to the system.'}
			onSubmit={onSubmit}
			formId="report-role-form"
			loading={loading}
			isEdit={isEdit}
		>
			<div className="flex flex-col gap-[23px]">
				<div className="grid grid-cols-1 gap-[10px] xl:grid-cols-2">
					<Input
						label="Report Role Name"
						id="report_role_Name"
						placeholder="Enter Name"
						value={form.report_role_Name}
						onChange={set('report_role_Name')}
						required
					/>
					<Input
						label="Description"
						id="report_role_Description"
						placeholder="Enter Description"
						value={form.report_role_Description}
						onChange={set('report_role_Description')}
					/>
				</div>
			</div>
		</FormLayout>
	);
};

export default AddReportRole;
