import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../data/states/toastAtom';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
import SearchableSelect from '../../components/common/SearchableSelect.jsx';
import { API } from '../../data/apis/endpoints';
import ROUTES from '../../utils/constants/routes';
import http from '../../lib/axios/axios';
import FormLayout from '../../components/common/FormLayout.jsx';
import dayjs from 'dayjs';
import { usePermissions } from '../../hooks/usePermissions';
import Unauthorized from '../Unauthorized';
import { PERM } from '../../utils/constants/permissionKey2';

const EditCommission = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const { canAll } = usePermissions();

	const [form, setForm] = useState({
		doc_Id: '',
		doc_commission_Type: '',
		doc_commission_Value: '',
		doc_commission_Effective_From: '',
		approval_status: 'Pending'
	});

	const [loading, setLoading] = useState(false);
	const [initialLoading, setInitialLoading] = useState(true);
	const [doctors, setDoctors] = useState([]);

	const canEdit = canAll(PERM.COMMISSION.LIST, PERM.COMMISSION.EDIT);

	useEffect(() => {
		fetchData();
	}, [id]);

	const fetchData = async () => {
		try {
			const [docRes, commRes] = await Promise.all([
				http.post(API.DOCTORS.LIST, { limit: 1000, is_active: 1 }),
				http.get(API.DOC_COMMISSIONS.GET(id))
			]);

			const doctorList = docRes?.list || docRes?.data?.list;
			if (doctorList) {
				setDoctors(doctorList.map(d => ({ value: d.doc_Id, label: d.doc_Name })));
			}

			const commData = commRes?.data || commRes;
			if (commData) {
				setForm({
					doc_Id: commData.doc_Id,
					doc_commission_Type: commData.doc_commission_Type,
					doc_commission_Value: commData.doc_commission_Value,
					doc_commission_Effective_From: dayjs(commData.doc_commission_Effective_From).format('YYYY-MM-DD'),
					approval_status:
						commData.approval_status_Name ||
						(commData.doc_commission_status_Id === 14
							? 'Approved'
							: commData.doc_commission_status_Id === 15
								? 'Rejected'
								: 'Pending')
				});
			}
		} catch (error) {
			console.error('Failed to fetch commission details:', error);
			addToast({ type: 'error', message: 'Failed to load commission configuration details' });
			navigate(ROUTES.DOCTOR_COMMISSIONS);
		} finally {
			setInitialLoading(false);
		}
	};

	const set = key => e => setForm(f => ({ ...f, [key]: e?.target ? e.target.value : e }));

	const onSubmit = async e => {
		e.preventDefault();
		if (loading) return;
		setLoading(true);
		try {
			const updateEndpoint = API.DOC_COMMISSIONS.UPDATE(id);
			await http.post(updateEndpoint, form);
			addToast({ type: 'success', message: 'Commission configuration updated successfully' });
			setLoading(false);
			navigate(ROUTES.DOCTOR_COMMISSIONS);
		} catch (error) {
			console.error('Save failed:', error);
			addToast({
				type: 'error',
				message: error?.response?.data?.msg || error?.response?.data?.message || 'Failed to update commission setup'
			});
			setLoading(false);
		}
	};

	if (!canEdit) return <Unauthorized />;

	if (initialLoading) {
		return <div className="p-8 text-center text-text-3">Loading...</div>;
	}

	return (
		<FormLayout
			title="Edit Doctor Commission Setup"
			backTo={ROUTES.DOCTOR_COMMISSIONS}
			subtitle="Update the commission rule details for the doctor."
			onSubmit={onSubmit}
			formId="edit-commission-form"
			loading={loading}
			isEdit={true}
		>
			<div className="flex flex-col gap-[23px]">
				<div className="grid grid-cols-1 gap-[10px] xl:grid-cols-2">
					<SearchableSelect
						label="Doctor"
						id="doc_Id"
						options={doctors}
						value={form.doc_Id}
						onChange={val => setForm(f => ({ ...f, doc_Id: val }))}
						placeholder="Search and select Doctor..."
						disabled
						required
					/>
					<Select
						label="Commission Rule Type"
						id="doc_commission_Type"
						options={[
							{ value: 'Percentage', label: 'Percentage (%)' },
							{ value: 'Fixed', label: 'Fixed Amount (₹)' }
						]}
						value={form.doc_commission_Type}
						onChange={set('doc_commission_Type')}
						autoComplete="off"
						required
					/>
					<Input
						label={form.doc_commission_Type === 'Percentage' ? 'Percentage (%)' : 'Amount (₹)'}
						id="doc_commission_Value"
						type="number"
						min="0"
						step="0.01"
						placeholder={form.doc_commission_Type === 'Percentage' ? 'e.g. 15.00' : 'e.g. 500'}
						value={form.doc_commission_Value}
						onChange={set('doc_commission_Value')}
						autoComplete="off"
						required
					/>
					<Input
						label="Effective From"
						id="doc_commission_Effective_From"
						type="date"
						value={form.doc_commission_Effective_From}
						onChange={set('doc_commission_Effective_From')}
						autoComplete="off"
						required
					/>
					<Select
						label="Approval Status"
						id="approval_status"
						options={[
							{ value: 'Approved', label: 'Approved' },
							{ value: 'Pending', label: 'Pending' },
							{ value: 'Rejected', label: 'Rejected' }
						]}
						value={form.approval_status}
						onChange={set('approval_status')}
						placeholder="Select Status"
						autoComplete="off"
						required
					/>
				</div>
			</div>
		</FormLayout>
	);
};

export default EditCommission;
