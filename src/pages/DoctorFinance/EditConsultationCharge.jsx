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

const EditConsultationCharge = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const { canAll } = usePermissions();

	const [form, setForm] = useState({
		doc_Id: '',
		doc_charge_service_type_Id: '',
		doc_charge_Amount: '',
		doc_charge_Effective_From: '',
		approval_status: 'Approved'
	});

	const [loading, setLoading] = useState(false);
	const [initialLoading, setInitialLoading] = useState(true);

	const [doctors, setDoctors] = useState([]);
	const [serviceTypes, setServiceTypes] = useState([]);

	const canEdit = canAll(PERM.CONSULTATION_CHARGE.LIST, PERM.CONSULTATION_CHARGE.EDIT);

	useEffect(() => {
		fetchData();
	}, [id]);

	const fetchData = async () => {
		try {
			const [docRes, stRes, chargeRes] = await Promise.all([
				http.post(API.DOCTORS.LIST, { limit: 1000, is_active: 1 }),
				http.post(API.DOC_CHARGE_SERVICE_TYPE.LIST, { limit: 100, is_active: 1 }),
				http.get(API.DOC_CHARGES.GET(id)) // Using standard get endpoint
			]);

			const doctorList = docRes?.list || docRes?.data?.list;
			if (doctorList) {
				setDoctors(doctorList.map(d => ({ value: d.doc_Id, label: d.doc_Name })));
			}

			const serviceTypeList = stRes?.data?.list || stRes?.list;
			if (serviceTypeList) {
				setServiceTypes(
					serviceTypeList.map(s => ({ value: s.doc_charge_service_type_Id, label: s.doc_charge_service_type_Name }))
				);
			}

			const chargeData = chargeRes?.data || chargeRes;
			if (chargeData) {
				setForm({
					doc_Id: chargeData.doc_Id,
					doc_charge_service_type_Id: chargeData.doc_charge_service_type_Id,
					doc_charge_Amount: chargeData.doc_charge_Amount,
					doc_charge_Effective_From: dayjs(chargeData.doc_charge_Effective_From).format('YYYY-MM-DD'),
					approval_status: chargeData.is_active ? 'Approved' : 'Pending'
				});
			}
		} catch (error) {
			console.error('Failed to fetch data:', error);
			addToast({ type: 'error', message: 'Failed to load charge details' });
			navigate(ROUTES.DOCTOR_CONSULTATION_CHARGES);
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
			// For now, since they wanted to edit, we can use the add-single which basically overrides/creates a new effective date.
			// Or we need a true "Update" endpoint. Since add-single handles active/future logic properly, we can call it.
			// Fallback for Vite HMR cache issues where UPDATE might be undefined temporarily
			const updateEndpoint = API.DOC_CHARGES.UPDATE ? API.DOC_CHARGES.UPDATE(id) : `doc-charges/update/${id}`;
			await http.post(updateEndpoint, form);
			addToast({ type: 'success', message: 'Consultation charge updated successfully' });
			setLoading(false);
			navigate(ROUTES.DOCTOR_CONSULTATION_CHARGES);
		} catch (error) {
			console.error('Save failed:', error);
			addToast({
				type: 'error',
				message: error?.response?.data?.msg || error?.response?.data?.message || 'Failed to update consultation charge'
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
			title="Edit Consultation Charge"
			backTo={ROUTES.DOCTOR_CONSULTATION_CHARGES}
			subtitle="Update the specific consultation charge details."
			onSubmit={onSubmit}
			formId="edit-consultation-charge-form"
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
						disabled // Cannot change doctor on edit typically
						required
					/>
					<SearchableSelect
						label="Charge Service Type"
						id="doc_charge_service_type_Id"
						options={serviceTypes}
						value={form.doc_charge_service_type_Id}
						onChange={val => setForm(f => ({ ...f, doc_charge_service_type_Id: val }))}
						placeholder="Search and select Service Type..."
						disabled // Cannot change service type on edit typically
						required
					/>
					<Input
						label="Amount (₹)"
						id="doc_charge_Amount"
						type="number"
						min="0"
						step="0.01"
						placeholder="e.g. 500"
						value={form.doc_charge_Amount}
						onChange={set('doc_charge_Amount')}
						required
					/>
					<Input
						label="Effective From"
						id="doc_charge_Effective_From"
						type="date"
						value={form.doc_charge_Effective_From}
						onChange={set('doc_charge_Effective_From')}
						required
					/>
					<Select
						label="Approval Status"
						id="approval_status"
						options={[
							{ value: 'Approved', label: 'Approved' },
							{ value: 'Pending', label: 'Pending' }
						]}
						value={form.approval_status}
						onChange={set('approval_status')}
						placeholder="Select Status"
						required
					/>
				</div>
			</div>
		</FormLayout>
	);
};

export default EditConsultationCharge;
