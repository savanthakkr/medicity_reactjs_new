import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import AutoComplete from '../../../components/dropdown/AutoComplete';
import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';
import http from '../../../lib/axios/axios';
import { useAutoRevalidate } from '../../../hooks/useAutoRevalidate';
import FormLayout from '../../../components/common/FormLayout.jsx';

const AddAssignReportRole = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const [form, setForm] = useState({
		employee_Id: '',
		report_role_Id: ''
	});
	const [loading, setLoading] = useState(false);
	const isEdit = Boolean(id);

	const { data: employeesData } = useAutoRevalidate(API.EMPLOYEES.LIST, { limit: 1000, is_active: 1 });
	const employeeOptions = (employeesData?.list || []).map(e => ({ value: e.employee_Id, label: e.employee_Name }));

	const { data: reportRolesData } = useAutoRevalidate(API.REPORT_ROLES.LIST, { limit: 1000 });
	const reportRoleOptions = (reportRolesData?.list || []).map(r => ({
		value: r.report_role_Id,
		label: r.report_role_Name
	}));

	useEffect(() => {
		if (isEdit) {
			const fetchAssignment = async () => {
				try {
					const response = await http.post(API.ASSIGN_REPORT_ROLES.GET(id));
					if (response?.data) {
						setForm({
							employee_Id: response.data.employee_Id || '',
							report_role_Id: response.data.report_role_Id || ''
						});
					}
				} catch (error) {
					console.error('Failed to fetch assignment:', error);
					addToast({ type: 'error', message: 'Failed to fetch assignment details' });
				}
			};
			fetchAssignment();
		}
	}, [id, isEdit, addToast]);

	const onSubmit = async e => {
		e.preventDefault();
		if (loading) return;
		setLoading(true);
		try {
			if (isEdit) {
				const res = await http.post(API.ASSIGN_REPORT_ROLES.UPDATE(id), form);
				setLoading(false);
				addToast({ type: 'success', message: res?.data?.msg || 'Assignment updated successfully' });
				setTimeout(() => {
					navigate(-1);
				}, 500);
			} else {
				const res = await http.post(API.ASSIGN_REPORT_ROLES.CREATE, form);
				addToast({ type: 'success', message: res?.data?.msg || 'Report role assigned successfully' });
				setForm({ employee_Id: '', report_role_Id: '' }); // Clear form
				setLoading(false);
				setTimeout(() => {
					navigate(-1);
				}, 500);
			}
		} catch (error) {
			console.error('Save failed:', error);
			addToast({ type: 'error', message: error?.response?.data?.message || 'Failed to save assignment' });
			setLoading(false);
		}
	};

	return (
		<FormLayout
			title={isEdit ? 'Edit Assign Report Role' : 'Assign Report Role'}
			backTo={ROUTES.ASSIGN_REPORT_ROLES}
			subtitle={isEdit ? 'Update report role assignment.' : 'Assign a report role to an employee.'}
			onSubmit={onSubmit}
			formId="assign-report-role-form"
			loading={loading}
			isEdit={isEdit}
		>
			<div className="flex flex-col gap-[23px]">
				<div className="grid grid-cols-1 gap-[10px] xl:grid-cols-2">
					<div className="flex flex-col">
						<label className="form-label">
							Employee <span className="text-red-500 ml-0.5">*</span>
						</label>
						<AutoComplete
							options={employeeOptions}
							value={employeeOptions.find(o => o.value === form.employee_Id) || null}
							placeholder="Select Employee"
							onChange={(_, selectedOption) => {
								setForm(prev => ({ ...prev, employee_Id: selectedOption?.value || '' }));
							}}
						/>
					</div>
					<div className="flex flex-col">
						<label className="form-label">
							Report Role <span className="text-red-500 ml-0.5">*</span>
						</label>
						<AutoComplete
							options={reportRoleOptions}
							value={reportRoleOptions.find(o => o.value === form.report_role_Id) || null}
							placeholder="Select Report Role"
							onChange={(_, selectedOption) => {
								setForm(prev => ({ ...prev, report_role_Id: selectedOption?.value || '' }));
							}}
						/>
					</div>
				</div>
			</div>
		</FormLayout>
	);
};

export default AddAssignReportRole;
